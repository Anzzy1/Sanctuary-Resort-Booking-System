import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { computePricing, hourlyRateOf } from "@/lib/money"
import { createAdminBooking, verifyAdmin } from "../../actions"
import { Topbar } from "../../components/Topbar"

export const dynamic = "force-dynamic"

const inputClass =
  "w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3.5 font-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors duration-200 h-14"

const labelClass = "mb-2 block font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest"

const DAY_MS = 24 * 60 * 60 * 1000

function formatDate(date: Date | null | undefined): string {
  if (!date) return ""
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function toLocaleMoney(value: number): string {
  return `₱${Math.round(value).toLocaleString("en-US")}`
}

export default async function AdminBookConfirm({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  if (!(await verifyAdmin())) {
    notFound()
  }

  const params = await searchParams

  const roomSlugs = (params.rooms ?? "").split(",").map((slug) => slug.trim()).filter(Boolean)
  const checkIn = params.checkIn ? new Date(params.checkIn) : null
  const checkOut = params.checkOut ? new Date(params.checkOut) : null
  const checkInTime = params.checkInTime ?? "8:00 AM"
  const checkOutTime = params.checkOutTime ?? "8:00 PM"
  const adults = parseInt(params.adults ?? "2", 10)
  const children = parseInt(params.children ?? "0", 10)
  const infants = parseInt(params.infants ?? "0", 10)

  const rooms = roomSlugs.length
    ? await prisma.accommodation.findMany({
        where: { slug: { in: roomSlugs } },
      })
    : []

  const nights = checkIn && checkOut ? Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / DAY_MS)) : 0
  const { resortFee, taxes, total, balanceDue, hours } = computePricing(rooms, {
    checkIn: checkIn ?? new Date(),
    checkOut: checkOut ?? new Date(),
    checkInTime,
    checkOutTime,
  })
  const guestCount = adults + children + infants

  const valid = roomSlugs.length > 0 && checkIn && checkOut && checkIn.getTime() <= checkOut.getTime()
  const errorMessage = params.error ? String(params.error) : null

  return (
    <>
      <Topbar title="Confirm Booking" eyebrow="Guest details & booking summary" />
      <main className="flex flex-1 flex-col gap-6 p-5 lg:p-8">
        <Link
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-2 font-body-md text-body-md"
          href="/admin/book"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Booking
        </Link>

        {errorMessage && (
          <section className="mb-2 rounded-2xl border border-error/20 bg-error-container/50 p-6 flex items-start gap-3">
            <span className="material-symbols-outlined text-error mt-0.5">error</span>
            <div>
              <p className="font-body-md text-body-md font-medium text-on-error-container">
                The booking could not be created.
              </p>
              <p className="text-sm text-on-error-container mt-1">{errorMessage}</p>
            </div>
          </section>
        )}

        <form action={createAdminBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            {/* Guest Details Section */}
            <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 lg:p-8 shadow-ambient flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">Guest Details</h2>
                  <p className="text-sm text-on-surface-variant">Enter who this booking is for.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass} htmlFor="firstName">
                    First Name
                  </label>
                  <input className={inputClass} id="firstName" name="firstName" placeholder="e.g. Ana" required type="text" />
                </div>
                <div>
                  <label className={labelClass} htmlFor="lastName">
                    Last Name
                  </label>
                  <input className={inputClass} id="lastName" name="lastName" placeholder="e.g. Santos" required type="text" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass} htmlFor="email">
                    Email Address
                  </label>
                  <input className={inputClass} id="email" name="email" placeholder="ana.santos@example.com" required type="email" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass} htmlFor="phone">
                    Phone Number (Optional)
                  </label>
                  <input className={inputClass} id="phone" name="phone" placeholder="+63 (___) ___-____" type="tel" />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Booking Summary */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20">
            <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest overflow-hidden shadow-ambient flex flex-col">
              <div className="relative h-40 w-full">
                {rooms[0] ? (
                  <Image
                    alt={rooms[0].alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover"
                    src={rooms[0].image}
                  />
                ) : (
                  <div className="h-full w-full bg-surface-container-high" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
                <div className="absolute bottom-4 left-6 right-6">
                  <p className="font-label-caps text-label-caps text-white/80 uppercase tracking-widest mb-1">
                    {rooms.length} {rooms.length === 1 ? "Accommodation" : "Accommodations"} · {nights}{" "}
                    {nights === 1 ? "Night" : "Nights"}
                  </p>
                  <h3 className="font-headline-md text-headline-md text-white">
                    {rooms.map((room) => room.name).join(" + ") || "No accommodation selected"}
                  </h3>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-5">
                <div className="flex justify-between items-start pb-5 border-b border-outline-variant/30">
                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-1">
                      Check-in
                    </p>
                    <p className="font-body-lg text-body-lg text-primary font-medium">{formatDate(checkIn)}</p>
                    <p className="text-sm text-on-surface-variant">From {checkInTime}</p>
                  </div>
                  <div className="w-8 h-[1px] bg-outline-variant mt-6"></div>
                  <div className="text-right">
                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-1">
                      Check-out
                    </p>
                    <p className="font-body-lg text-body-lg text-primary font-medium">{formatDate(checkOut)}</p>
                    <p className="text-sm text-on-surface-variant">By {checkOutTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-primary">
                  <span className="material-symbols-outlined text-[18px]">group</span>
                  {guestCount} {guestCount === 1 ? "Guest" : "Guests"}
                </div>

                <div className="pb-5 border-b border-outline-variant/30">
                  {rooms.map((room) => {
                    const rate = hourlyRateOf(room.price)
                    return (
                      <div key={room.id} className="flex justify-between items-center mb-3">
                        <span className="font-body-md text-body-md text-on-surface-variant">
                          {room.name} · {toLocaleMoney(rate)}/hr × {hours} {hours === 1 ? "hour" : "hours"}
                        </span>
                        <span className="font-body-md text-body-md text-primary font-medium">
                          {toLocaleMoney(rate * hours)}
                        </span>
                      </div>
                    )
                  })}
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-body-md text-body-md text-on-surface-variant">Resort Fee</span>
                    <span className="font-body-md text-body-md text-primary font-medium">{toLocaleMoney(resortFee)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body-md text-body-md text-on-surface-variant">Taxes &amp; Fees</span>
                    <span className="font-body-md text-body-md text-primary font-medium">{toLocaleMoney(taxes)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="font-headline-md text-headline-md text-on-surface">Total</p>
                    <p className="text-sm text-on-surface-variant">No payment collected · {toLocaleMoney(balanceDue)} balance at check-in</p>
                  </div>
                  <p className="font-headline-md text-headline-md text-primary">{toLocaleMoney(total)}</p>
                </div>

                <div>
                  <input type="hidden" name="rooms" value={roomSlugs.join(",")} />
                  <input type="hidden" name="checkIn" value={params.checkIn ?? ""} />
                  <input type="hidden" name="checkOut" value={params.checkOut ?? ""} />
                  <input type="hidden" name="checkInTime" value={checkInTime} />
                  <input type="hidden" name="checkOutTime" value={checkOutTime} />
                  <input type="hidden" name="adults" value={String(adults)} />
                  <input type="hidden" name="children" value={String(children)} />
                  <input type="hidden" name="infants" value={String(infants)} />
                  <button
                    disabled={!valid}
                    type="submit"
                    className="w-full bg-primary-container text-white rounded-lg py-4 font-body-lg text-body-lg font-medium hover:bg-secondary transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-container"
                  >
                    Create Booking
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </button>
                </div>
                <p className="text-xs text-center text-on-surface-variant/70 mt-2">
                  No payment is collected for admin bookings.
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </>
  )
}