export type ParsedTime = { h: number; m: number }

export function parseTime12h(t: string): ParsedTime {
  const match = t.trim().toLowerCase().match(/^(\d{1,2}):?(\d{2})?\s*(am|pm)$/)
  if (!match) return { h: 12, m: 0 }
  let h = parseInt(match[1], 10)
  const minutes = match[2] ? parseInt(match[2], 10) : 0
  if (match[3] === "pm" && h !== 12) h += 12
  if (match[3] === "am" && h === 12) h = 0
  return { h, m: minutes }
}

export function scheduledCheckInMillis(checkIn: Date, checkInTime: string): number {
  const dt = new Date(checkIn)
  const { h, m } = parseTime12h(checkInTime)
  dt.setHours(h, m, 0, 0)
  return dt.getTime()
}

export function scheduledCheckOutMillis(checkOut: Date, checkOutTime: string): number {
  const dt = new Date(checkOut)
  const { h, m } = parseTime12h(checkOutTime)
  dt.setHours(h, m, 0, 0)
  return dt.getTime()
}

export function isCheckInAllowed(checkIn: Date, checkInTime: string, now: Date = new Date()): boolean {
  return now.getTime() >= scheduledCheckInMillis(checkIn, checkInTime) - 2 * 60 * 60 * 1000
}