import Image from "next/image"
import Link from "next/link"
import { createBooking } from "../actions"
import { prisma } from "@/lib/prisma"
import { computePricing, hourlyRateOf, BOOKING_FEE_PERCENT } from "@/lib/money"

const paymentMethods = [
  {
    name: "Mastercard",
    value: "mastercard",
    src: "/pavilion-water.png",
  },
  {
    name: "Visa",
    value: "visa",
    src: "/pavilion-water.png",
  },
  {
    name: "GCash",
    value: "gcash",
    src: "/pavilion-water.png",
  },
  {
    name: "Maya",
    value: "maya",
    src: "/pavilion-water.png",
  },
]

const inputClass =
  "w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3.5 font-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors duration-200 h-14"

const labelClass = "mb-2 block font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest"

function formatDate(date: Date | null | undefined): string {
  if (!date) return ""
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function toLocaleMoney(value: number): string {
  return `₱${Math.round(value).toLocaleString("en-US")}`
}

// Force dynamic rendering so searchParams and DB reads happen per-request.
export const dynamic = "force-dynamic"

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
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

  const { subtotal, resortFee, taxes, total, bookingFee, balanceDue, hours } = computePricing(rooms, {
    checkIn: checkIn ?? new Date(),
    checkOut: checkOut ?? new Date(),
    checkInTime,
    checkOutTime,
  })
  const guestCount = adults + children + infants

  const valid = roomSlugs.length > 0 && checkIn && checkOut && checkIn.getTime() <= checkOut.getTime()
  const errorMessage = params.error ? String(params.error) : null

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
          Complete your reservation
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Enter your details below to finalize your stay at Sanctuary. You&apos;ll complete payment on the next secure
          step.
        </p>
      </div>

      {errorMessage && (
        <section className="mb-8 bg-error-container/50 border border-error/20 rounded-2xl p-6 flex items-start gap-3">
          <span className="material-symbols-outlined text-error mt-0.5">error</span>
          <div>
            <p className="font-body-md text-body-md font-medium text-on-error-container">
              Your reservation could not be completed.
            </p>
            <p className="text-sm text-on-error-container mt-1">
              {errorMessage}{" "}
              <Link className="underline hover:text-primary" href="/book">
                Adjust your dates or accommodation selection
              </Link>{" "}
              and try again.
            </p>
          </div>
        </section>
      )}

      <form action={createBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-gutter items-start">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-10">
          {/* Guest Details Section */}
          <section className="bg-white p-8 md:p-10 rounded-2xl shadow-coastal border border-surface-variant/20 flex flex-col gap-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">person</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-primary">Guest Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass} htmlFor="firstName">
                  First Name
                </label>
                <input className={inputClass} id="firstName" name="firstName" placeholder="e.g. Jane" required type="text" />
              </div>
              <div>
                <label className={labelClass} htmlFor="lastName">
                  Last Name
                </label>
                <input className={inputClass} id="lastName" name="lastName" placeholder="e.g. Doe" required type="text" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass} htmlFor="email">
                  Email Address
                </label>
                <input className={inputClass} id="email" name="email" placeholder="jane.doe@example.com" required type="email" />
                <p className="mt-2 text-sm text-on-surface-variant">Your booking confirmation will be sent here.</p>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass} htmlFor="phone">
                  Phone Number (Optional)
                </label>
                <input className={inputClass} id="phone" name="phone" placeholder="+63 (___) ___-____" type="tel" />
              </div>
            </div>
          </section>

          {/* Payment Section */}
          <section className="bg-white p-8 md:p-10 rounded-2xl shadow-coastal border border-surface-variant/20 flex flex-col gap-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">credit_card</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-primary">Payment Method</h2>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low flex items-start gap-3 border border-surface-container-high/50">
              <span className="material-symbols-outlined text-secondary mt-0.5">verified_user</span>
              <div>
                <p className="font-body-md text-body-md font-medium text-primary">Secure Encrypted Transaction</p>
                <p className="text-sm text-on-surface-variant mt-1">
                  Your payment information is processed securely. We do not store credit card details.
                </p>
              </div>
            </div>

            <div>
              <p className="mb-4 block font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest">
                Digital Wallets &amp; Local Transfers
              </p>
              <div className="grid grid-cols-3 gap-4">
                {paymentMethods.map((method) => (
                  <label
                    key={method.value}
                    className="relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-surface-variant/30 bg-surface-container-lowest cursor-pointer hover:border-secondary transition-colors group shadow-sm"
                  >
                    <input
                      className="absolute top-3 right-3 w-4 h-4 text-secondary focus:ring-secondary border-outline-variant"
                      defaultChecked={method.value === "gcash"}
                      name="paymentMethod"
                      type="radio"
                      value={method.value}
                    />
                    <div className="w-16 h-10 flex items-center justify-center overflow-hidden relative">
                      <Image alt={method.name} fill sizes="64px" className="object-contain" src={method.src} />
                    </div>
                    <span className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest">
                      {method.name}
                    </span>
                  </label>
                ))}
              </div>
              <div className="h-[1px] bg-surface-variant/30 my-8"></div>
              <p className="text-sm text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">lock_open</span>
                Card or e-wallet details will be entered on our secure payment page after you continue.
              </p>
            </div>
          </section>

          {!valid && (
            <section className="bg-error-container/50 border border-error/20 rounded-2xl p-6 flex items-start gap-3">
              <span className="material-symbols-outlined text-error mt-0.5">error</span>
              <div>
                <p className="font-body-md text-body-md font-medium text-on-error-container">
                  Your selection is incomplete or invalid.
                </p>
                <p className="text-sm text-on-error-container mt-1">
                  Please <Link className="underline hover:text-primary" href="/book">go back</Link> and select your
                  accommodation and stay dates before completing your reservation.
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Booking Summary */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-32">
          <div className="bg-surface-container-low rounded-[16px] overflow-hidden shadow-coastal border border-surface-variant/30 flex flex-col">
            {/* Image Header */}
            <div className="relative h-48 w-full">
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
                  {rooms.length} {rooms.length === 1 ? "Accommodation" : "Accommodations"} · {hours}{" "}
                  {hours === 1 ? "Hour" : "Hours"}
                </p>
                <h3 className="font-headline-md text-headline-md text-white">
                  {rooms.map((room) => room.name).join(" + ") || "No accommodation selected"}
                </h3>
              </div>
            </div>

            {/* Details */}
            <div className="p-6 md:p-8 flex flex-col gap-6">
              <div className="flex justify-between items-start pb-6 border-b border-surface-variant">
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

              <div className="pb-6 border-b border-surface-variant">
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

              <div className="flex flex-col gap-2 mb-4 rounded-xl bg-surface-container-low p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-headline-md text-headline-md text-primary">Total</p>
                    <p className="text-sm text-on-surface-variant">Includes all taxes and fees</p>
                  </div>
                  <p className="text-headline-lg text-primary font-body-lg">{toLocaleMoney(total)}</p>
                </div>
                <div className="h-[1px] bg-surface-variant"></div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Pay now ({BOOKING_FEE_PERCENT}% booking fee)</span>
                  <span className="font-bold text-secondary">{toLocaleMoney(bookingFee)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Balance at check-in</span>
                  <span className="font-medium text-on-surface">{toLocaleMoney(balanceDue)}</span>
                </div>
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
                  className="w-full bg-primary-container text-white rounded-lg py-4 font-body-lg text-body-lg font-medium hover:bg-secondary transition-colors duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-container"
                >
                  Continue to Payment
                  <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
              <p className="text-xs text-center text-on-surface-variant/70 mt-2">
                By confirming, you agree to our <a className="underline hover:text-primary" href="#">Terms of Service</a>{" "}
                and <a className="underline hover:text-primary" href="#">Cancellation Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </form>
    </main>
  )
}