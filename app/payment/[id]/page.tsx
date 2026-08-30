import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/payment"
import { PaymentPanel } from "./PaymentPanel"

export const dynamic = "force-dynamic"

function formatDate(date: Date | null | undefined): string {
  if (!date) return ""
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function toLocaleMoney(value: number): string {
  return `₱${Math.round(value).toLocaleString("en-US")}`
}

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      items: { include: { accommodation: true } },
      payment: true,
    },
  })

  if (!booking) notFound()

  if (booking.status === "cancelled") {
    return (
      <main className="flex-grow pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-[680px] mx-auto w-full">
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-coastal border border-surface-variant/20 text-center flex flex-col items-center gap-6">
          <span className="material-symbols-outlined text-[56px] text-error">event_busy</span>
          <h1 className="font-headline-lg text-headline-lg text-primary">This reservation was cancelled</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            {booking.bookingNumber} was cancelled. Please check the guest&apos;s email or phone number
            to verify the booking status and decide whether to rebook or contact the guest.
          </p>
          <Link
            className="inline-flex items-center gap-2 bg-primary-container text-white px-6 py-4 rounded-lg font-body-md text-body-md font-medium hover:bg-secondary transition-colors"
            href="/book"
          >
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            Book Again
          </Link>
        </div>
      </main>
    )
  }

  if (booking.payment?.status === "paid") {
    redirect(`/confirmation?id=${id}`)
  }

  if (booking.payment?.status === "verifying") {
    const paymentLabel = PAYMENT_METHOD_LABELS[booking.payment.method] ?? booking.payment.method
    return (
      <main className="flex-grow pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-[680px] mx-auto w-full">
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-coastal border border-surface-variant/20 text-center flex flex-col items-center gap-6">
          <span className="material-symbols-outlined text-[56px] text-secondary">hourglass_top</span>
          <h1 className="font-headline-lg text-headline-lg text-primary">Payment under verification</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            We received your {paymentLabel} payment details for {booking.bookingNumber}. Our team is verifying the transfer of{" "}
            <span className="font-bold text-primary">{toLocaleMoney(booking.payment.amount ?? booking.bookingFee)}</span> with reference{" "}
            <span className="font-bold text-primary">{booking.payment.referenceNumber}</span>.
          </p>
          <div className="w-full bg-surface-container-low rounded-xl p-5 text-left text-sm text-on-surface-variant flex flex-col gap-2">
            <p className="flex items-start gap-2">
              <span className="material-symbols-outlined text-secondary text-[18px]">lock</span>
              Your dates are reserved — no one else can book this room while we verify.
            </p>
            <p className="flex items-start gap-2">
              <span className="material-symbols-outlined text-secondary text-[18px]">schedule</span>
              Verification usually takes less than 24 hours.
            </p>
            <p className="flex items-start gap-2">
              <span className="material-symbols-outlined text-secondary text-[18px]">mail</span>
              We&apos;ll email {booking.email} the moment your stay is confirmed. You can also revisit this page anytime
              to check the status.
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-2 bg-primary-container text-white px-6 py-4 rounded-lg font-body-md text-body-md font-medium hover:bg-secondary transition-colors"
            href="/"
          >
            Back to Home
            <span className="material-symbols-outlined text-[20px]">home</span>
          </Link>
        </div>
      </main>
    )
  }

  const stayHours = booking.items[0]?.nights ?? 1
  const guestCount = booking.adults + booking.children + booking.infants
  const rawMethod = booking.payment?.method
  const method: PaymentMethod = rawMethod && (["mastercard", "visa", "gcash", "maya"] as const).includes(rawMethod as PaymentMethod)
    ? (rawMethod as PaymentMethod)
    : "gcash"

  return (
    <main className="flex-grow pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
      <div className="mb-12">
        <Link
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 font-body-md text-body-md"
          href="/book"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Selection
        </Link>
        <h1 className="font-headline-lg text-headline-lg text-primary md:font-display-lg md:text-display-lg mb-4">
          Secure Checkout
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Complete your payment to finalize your stay at Sanctuary.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-gutter items-start">
        <div className="lg:col-span-7 xl:col-span-8">
          <PaymentPanel
            bookingId={booking.id}
            bookingNumber={booking.bookingNumber}
            amount={booking.payment?.amount ?? booking.total}
            createdAt={booking.createdAt.toISOString()}
            initialMethod={method}
          />
        </div>

        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-32">
          <div className="bg-surface-container-low rounded-[16px] overflow-hidden shadow-coastal border border-surface-variant/30 flex flex-col">
            <div className="relative h-48 w-full">
              {booking.items[0] ? (
                <Image
                  alt={booking.items[0].accommodation.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover"
                  src={booking.items[0].accommodation.image}
                />
              ) : (
                <div className="h-full w-full bg-surface-container-high" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
              <div className="absolute bottom-4 left-6 right-6">
                <p className="font-label-caps text-label-caps text-white/80 uppercase tracking-widest mb-1">
                  {booking.items.length} {booking.items.length === 1 ? "Accommodation" : "Accommodations"} · {stayHours}{" "}
                  {stayHours === 1 ? "Hour" : "Hours"}
                </p>
                <h3 className="font-headline-md text-headline-md text-white">
                  {booking.items.map((item) => item.accommodation.name).join(" + ")}
                </h3>
              </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col gap-6">
              <div className="flex justify-between items-start pb-6 border-b border-surface-variant">
                <div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-1">
                    Check-in
                  </p>
                  <p className="font-body-lg text-body-lg text-primary font-medium">{formatDate(booking.checkIn)}</p>
                  <p className="text-sm text-on-surface-variant">From {booking.checkInTime}</p>
                </div>
                <div className="w-8 h-[1px] bg-outline-variant mt-6"></div>
                <div className="text-right">
                  <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-1">
                    Check-out
                  </p>
                  <p className="font-body-lg text-body-lg text-primary font-medium">{formatDate(booking.checkOut)}</p>
                  <p className="text-sm text-on-surface-variant">By {booking.checkOutTime}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-primary">
                <span className="material-symbols-outlined text-[18px]">group</span>
                {guestCount} {guestCount === 1 ? "Guest" : "Guests"}
              </div>

              <div className="pb-6 border-b border-surface-variant">
                {booking.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center mb-3">
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      {item.accommodation.name} · {toLocaleMoney(item.pricePerNight)}/hr × {item.nights}{" "}
                      {item.nights === 1 ? "hour" : "hours"}
                    </span>
                    <span className="font-body-md text-body-md text-primary font-medium">
                      {toLocaleMoney(item.subtotal)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center mb-3">
                  <span className="font-body-md text-body-md text-on-surface-variant">Resort Fee</span>
                  <span className="font-body-md text-body-md text-primary font-medium">{toLocaleMoney(booking.resortFee)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body-md text-body-md text-on-surface-variant">Taxes &amp; Fees</span>
                  <span className="font-body-md text-body-md text-primary font-medium">{toLocaleMoney(booking.taxes)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-4 rounded-xl bg-surface-container-low p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-headline-md text-headline-md text-primary">Total stay cost</p>
                    <p className="text-sm text-on-surface-variant">Includes all taxes and fees</p>
                  </div>
                  <p className="text-lg text-primary font-medium">{toLocaleMoney(booking.total)}</p>
                </div>
                <div className="h-[1px] bg-surface-variant"></div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-secondary">Pay now (booking fee)</span>
                  <span className="font-bold text-secondary">{toLocaleMoney(booking.bookingFee)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Balance at check-in</span>
                  <span className="font-medium text-on-surface">{toLocaleMoney(booking.balanceDue)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}