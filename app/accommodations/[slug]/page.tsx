import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getRoomBySlug, rooms } from "../../../lib/rooms"
import { computePricing, formatPeso, hourlyRateOf } from "../../../lib/money"

type Params = { slug: string }

export function generateStaticParams(): Params[] {
  return rooms.map((room) => ({ slug: room.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const room = getRoomBySlug(slug)
  if (!room) return { title: "Room Not Found" }
  return {
    title: `${room.name} | Sanctuary Resort`,
    description: room.about[0],
  }
}

const NIGHTS = 5

export default async function RoomPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const room = getRoomBySlug(slug)
  if (!room) notFound()

  // Sample stay for the estimate widget: 5 days, noon-to-noon.
  const sampleIn = new Date(2024, 9, 12, 12, 0, 0, 0)
  const sampleOut = new Date(2024, 9, 17, 12, 0, 0, 0)
  const pricing = computePricing([room], {
    checkIn: sampleIn,
    checkOut: sampleOut,
    checkInTime: "12:00 PM",
    checkOutTime: "12:00 PM",
  })
  const subtotal = pricing.subtotal
  const resortFee = pricing.resortFee
  const taxes = pricing.taxes
  const total = pricing.total
  const bookingFee = pricing.bookingFee
  const balanceDue = pricing.balanceDue
  const hours = pricing.hours

  return (
    <main className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4">{room.name}</h1>
        <div className="flex items-center text-on-surface-variant space-x-4">
          <span className="flex items-center"><span className="material-symbols-outlined mr-1 text-sm">location_on</span> {room.location}</span>
          <span>•</span>
          <span>{room.guests} Guest{room.guests > 1 ? "s" : ""}</span>
          <span>•</span>
          <span>{room.bedrooms} Bedroom{room.bedrooms > 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter relative">
        {/* Left Column: Imagery & Details */}
        <div className="lg:col-span-8 space-y-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden relative shadow-sm" style={{ boxShadow: "0 4px 20px rgba(26, 46, 53, 0.05)" }}>
              <Image alt={room.alt} fill priority sizes="(min-width: 1024px) 66vw, 100vw" className="object-cover" src={room.image} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {room.gallery.map((src, index) => (
                <div key={index} className="h-40 md:h-48 rounded-lg overflow-hidden relative">
                  <Image alt={`${room.name} view ${index + 1}`} fill sizes="(min-width: 768px) 25vw, 33vw" className="object-cover" src={src} />
                  {index === room.gallery.length - 1 && (
                    <div className="absolute inset-0 bg-primary/40 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="text-on-primary font-headline-md text-headline-md">+3 more</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description Section */}
          <section>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-6">A Private Sanctuary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-on-surface-variant font-body-lg text-body-lg">
              {room.about.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>

          {/* Highlights Section */}
          <section className="border-t border-surface-variant pt-12">
            <h3 className="font-headline-md text-headline-md text-primary mb-8">Cottage Highlights</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {room.highlights.map((highlight) => (
                <div key={highlight.title} className="flex items-start space-x-3 p-4 rounded-lg bg-surface-container-low border border-surface-variant/50">
                  <span className="material-symbols-outlined text-secondary font-light">{highlight.icon}</span>
                  <div>
                    <h4 className="font-body-md text-body-md font-medium text-primary">{highlight.title}</h4>
                    <p className="font-label-caps text-label-caps text-outline mt-1">{highlight.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Booking Widget */}
        <div className="lg:col-span-4 mt-12 lg:mt-0 relative">
          <div className="sticky top-32 bg-surface-container-lowest rounded-xl p-8 border border-surface-variant" style={{ boxShadow: "0 12px 40px rgba(26, 46, 53, 0.08)" }}>
            <div className="mb-6 flex items-end justify-between border-b border-surface-variant pb-6">
              <div>
                <span className="font-headline-lg text-headline-lg text-primary">{formatPeso(room.price)}</span>
                <span className="font-body-md text-body-md text-on-surface-variant"> / night</span>
              </div>
              <div className="flex items-center text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-sm mr-1">star</span>
                <span>{room.rating} ({room.reviews} reviews)</span>
              </div>
            </div>

            <form className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="font-label-caps text-label-caps text-primary uppercase tracking-wider">Dates</label>
                <div className="grid grid-cols-2 gap-2">
                  <input className="w-full border border-surface-variant bg-surface rounded p-3 text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors" type="text" value="Oct 12, 2024" readOnly />
                  <input className="w-full border border-surface-variant bg-surface rounded p-3 text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors" type="text" value="Oct 17, 2024" readOnly />
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <label className="font-label-caps text-label-caps text-primary uppercase tracking-wider">Guests</label>
                <div className="relative">
                  <select className="w-full border border-surface-variant bg-surface rounded p-3 text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors appearance-none">
                    <option>{room.guests} Guests</option>
                    <option>{room.guests - 1} Guest</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-outline">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>
              <Link
                href={`/book?rooms=${room.slug}`}
                className="w-full bg-primary-container text-on-primary font-headline-md text-body-md py-4 rounded-lg mt-6 hover:bg-secondary transition-colors duration-300 flex items-center justify-center"
              >
                Reserve
              </Link>
              <p className="text-center font-label-caps text-label-caps text-outline mt-2">You won&apos;t be charged yet</p>
            </form>

            <div className="mt-8 space-y-3 font-body-md text-body-md text-on-surface-variant border-t border-surface-variant pt-6">
              <div className="flex justify-between">
                <span className="underline decoration-surface-variant underline-offset-4">{formatPeso(hourlyRateOf(room.price))}/hr × {hours} hours</span>
                <span>{formatPeso(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="underline decoration-surface-variant underline-offset-4">Resort fee</span>
                <span>{formatPeso(resortFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="underline decoration-surface-variant underline-offset-4">Taxes (12%)</span>
                <span>{formatPeso(taxes)}</span>
              </div>
              <div className="flex justify-between font-medium text-primary text-lg pt-4 border-t border-surface-variant border-dashed mt-4">
                <span>Total</span>
                <span>{formatPeso(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}