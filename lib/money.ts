export function formatPeso(value: number): string {
  return `₱${Math.round(value).toLocaleString("en-US")}`
}

export type PricingRoom = { price: number }

// ─── Business pricing rules (adjust here) ────────────────────────────────
// Share of the total collected online at booking time; the rest is due at check-in.
export const BOOKING_FEE_PERCENT = 20
// Shortest stay we bill for, since guests can pick exact times.
export const MINIMUM_BILLED_HOURS = 8
// Flat facility fee per room.
export const RESORT_FEE_PER_ROOM = 500
export const VAT_RATE = 0.12

/**
 * Hourly rate derived from the nightly rate so overnight stays cost about
 * the same as before: nightly ÷ 24, rounded to the nearest ₱10.
 */
export function hourlyRateOf(nightlyPrice: number): number {
  return Math.round(nightlyPrice / 24 / 10) * 10
}

function parseTimeToMinutes(time: string): number {
  const match = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i)
  if (!match) return 0
  let hour = parseInt(match[1], 10)
  const minute = match[2] ? parseInt(match[2], 10) : 0
  const meridiem = match[3].toLowerCase()
  if (meridiem === "am") hour = hour === 12 ? 0 : hour
  else hour = hour === 12 ? 12 : hour + 12
  return hour * 60 + minute
}

function combineDateTime(date: Date, time: string): Date {
  const minutes = parseTimeToMinutes(time)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(minutes / 60), minutes % 60, 0, 0)
}

export type PricingBreakdown = {
  hours: number
  hourlyAppliedMinimum: boolean
  subtotal: number
  resortFee: number
  taxes: number
  total: number
  bookingFee: number
  balanceDue: number
}

export function computePricing(
  rooms: PricingRoom[],
  range: { checkIn: Date; checkOut: Date; checkInTime?: string; checkOutTime?: string },
): PricingBreakdown {
  const start = combineDateTime(range.checkIn, range.checkInTime ?? "")
  const end = combineDateTime(range.checkOut, range.checkOutTime ?? "")

  const rawHours = Math.max(0, (end.getTime() - start.getTime()) / (60 * 60 * 1000))
  const hours = Math.max(MINIMUM_BILLED_HOURS, Math.ceil(rawHours))

  const subtotal = rooms.reduce((sum, room) => sum + hourlyRateOf(room.price) * hours, 0)
  const resortFee = rooms.length * RESORT_FEE_PER_ROOM
  const taxes = Math.round(subtotal * VAT_RATE)
  const total = subtotal + resortFee + taxes

  const bookingFee = Math.round((total * BOOKING_FEE_PERCENT) / 100)
  const balanceDue = total - bookingFee

  return { hours, hourlyAppliedMinimum: rawHours < MINIMUM_BILLED_HOURS, subtotal, resortFee, taxes, total, bookingFee, balanceDue }
}
