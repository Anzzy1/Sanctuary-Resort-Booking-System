import Link from "next/link"
import QRCode from "qrcode"
import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DownloadReceiptButton } from "../components/DownloadReceiptButton"

const DAY_MS = 24 * 60 * 60 * 1000

function formatDate(date: Date | null | undefined): string {
  if (!date) return ""
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function toLocaleMoney(value: number): string {
  return `₱${Math.round(value).toLocaleString("en-US")}`
}

const methodLabels: Record<string, string> = {
  mastercard: "Mastercard",
  visa: "Visa",
  paypal: "PayPal",
  gcash: "GCash",
  maya: "Maya",
}

export const dynamic = "force-dynamic"

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams

  if (!id) {
    notFound()
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          accommodation: true,
        },
      },
      payment: true,
    },
  })

  if (!booking) {
    notFound()
  }

  if (booking.status === "cancelled" || !booking.payment) {
    redirect(`/payment/${id}`)
  }

  const isVerifying = booking.payment.status === "verifying"

  if (!isVerifying && booking.payment.status !== "paid") {
    redirect(`/payment/${id}`)
  }

  const transactionId = booking.payment.transactionId ?? booking.bookingNumber
  const nights = Math.max(1, Math.round((booking.checkOut.getTime() - booking.checkIn.getTime()) / DAY_MS))
  const guestCount = booking.adults + booking.children + booking.infants
  const paymentLabel = booking.payment ? methodLabels[booking.payment.method] ?? "Card" : "Card"

  if (isVerifying) {
    return (
      <main className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-[680px] mx-auto min-h-screen">
        <div className="bg-surface-container-lowest border border-surface-dim rounded-lg shadow-sm p-8 md:p-12 flex flex-col items-center text-center gap-6">
          <span className="material-symbols-outlined text-secondary text-5xl" style={{ fontVariationSettings: '"FILL" 1' }}>
            hourglass_top
          </span>
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary">
            Payment Under Verification
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
            Thank you, {booking.guestName.split(" ")[0]}! We received your {paymentLabel} payment details for{" "}
            <span className="font-bold text-primary">{toLocaleMoney(booking.payment.amount ?? booking.bookingFee)}</span> (Ref:{" "}
            <span className="font-bold text-primary">{booking.payment.referenceNumber}</span>). Your dates are{" "}
            <strong>reserved</strong> while we verify the transfer — usually within 24 hours.
          </p>
          <p className="text-sm text-on-surface-variant max-w-md">
            We emailed you a receipt of this submission, and we&apos;ll send a second email the moment your stay is
            confirmed. Keep this link to check your status anytime.
          </p>
          <div className="w-full bg-surface-container-low rounded-xl p-6 text-left">
            <h2 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-3">
              Reservation Summary
            </h2>
            <p className="font-body-md text-body-md text-primary font-medium">{booking.bookingNumber}</p>
            <p className="font-body-md text-body-md text-primary font-medium">
              {booking.items.map((item) => item.accommodation.name).join(" + ")}
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)} · {nights}{" "}
              {nights === 1 ? "Night" : "Nights"}
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Total sent via {paymentLabel}: <span className="font-bold text-primary">{toLocaleMoney(booking.payment?.amount ?? booking.bookingFee)}</span>
            </p>
          </div>
          <Link
            className="w-full border border-primary-container text-primary-container px-6 py-4 rounded-lg font-body-md text-body-md font-medium hover:bg-surface-container-low transition-colors duration-300 text-center block"
            href="/"
          >
            Return to Home
          </Link>
        </div>
      </main>
    )
  }

  const qrDataUrl = await QRCode.toDataURL(booking.bookingNumber, {
    width: 512,
    margin: 1,
    color: { dark: "#041920", light: "#ffffff" },
  })

  return (
    <main className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-[1140px] mx-auto min-h-screen">
      <div className="text-center mb-16">
        <span
          className="material-symbols-outlined text-secondary-container text-5xl mb-6"
          style={{ fontVariationSettings: '"FILL" 1' }}
        >
          check_circle
        </span>
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4">
          Your Sanctuary Awaits.
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Your reservation at Sanctuary Coastal Resort is confirmed. We look forward to welcoming you to your coastal
          retreat.
        </p>
      </div>

      <div className="grid-cols-1 gap-gutter">
        {/* Receipt Card */}
        <div className="bg-surface-container-lowest border border-surface-dim rounded-lg shadow-sm p-8 md:p-12 max-w-[600px] mx-auto flex flex-col gap-8">
          <div className="text-center border-b border-surface-dim pb-8">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Booking Receipt</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Transaction ID: {transactionId}</p>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              {formatDate(booking.createdAt)} • Paid via {paymentLabel}
            </p>
          </div>

          <div className="flex flex-col items-center text-center gap-4">
            <h3 className="font-headline-md text-headline-md text-primary">Digital Check-in Key</h3>
            <div className="bg-surface p-6 rounded-xl shadow-sm border border-surface-dim">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Digital check-in QR code"
                className="w-64 h-64 object-contain rounded-lg"
                height={256}
                src={qrDataUrl}
                width={256}
              />
            </div>
            <p className="text-xs text-on-surface-variant font-medium tracking-wider">{booking.bookingNumber}</p>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">lock</span>
              <span className="font-label-caps text-label-caps">Secure Digital Ticket</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
              Scan this code at the concierge desk for a seamless arrival.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 py-8 border-y border-surface-dim">
            <div>
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-2">
                Guest Details
              </h3>
              <p className="font-body-md text-body-md text-primary font-medium">{booking.guestName}</p>
              <p className="font-body-md text-body-md text-on-surface-variant">{booking.email}</p>
              {booking.phone && <p className="font-body-md text-body-md text-on-surface-variant">{booking.phone}</p>}
            </div>
            <div>
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-2">
                Stay Details
              </h3>
              <p className="font-body-md text-body-md text-primary font-medium">
                {booking.items.map((item) => item.accommodation.name).join(" + ")}
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {nights} {nights === 1 ? "Night" : "Nights"}, {guestCount}{" "}
                {guestCount === 1 ? "Guest" : "Guests"}
              </p>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-lg">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-4">
              Price Breakdown
            </h3>
            <div className="space-y-3">
              {booking.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="font-body-md text-body-md text-on-surface-variant">{item.accommodation.name}</span>
                  <span className="font-body-md text-body-md text-primary">{toLocaleMoney(item.subtotal)}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="font-body-md text-body-md text-on-surface-variant">Resort Fee</span>
                <span className="font-body-md text-body-md text-primary">{toLocaleMoney(booking.resortFee)}</span>
              </div>
              <div className="flex justify-between border-b border-surface-dim pb-3">
                <span className="font-body-md text-body-md text-on-surface-variant">Taxes &amp; Fees (12%)</span>
                <span className="font-body-md text-body-md text-primary">{toLocaleMoney(booking.taxes)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-headline-md text-headline-md text-primary">Total Paid</span>
                <span className="font-headline-md text-headline-md text-primary">{toLocaleMoney(booking.total)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <DownloadReceiptButton id={booking.id} />
            <Link
              className="w-full border border-primary-container text-primary-container px-6 py-4 rounded-lg font-body-md text-body-md font-medium hover:bg-surface-container-low transition-colors duration-300 text-center block"
              href="/"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}