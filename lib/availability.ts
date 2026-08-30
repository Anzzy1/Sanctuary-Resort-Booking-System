import { prisma } from "@/lib/prisma"
import type { Db } from "@/lib/booking-lock"

function timeToMinutes(t: string): number | null {
  if (!t) return null
  const match = t.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i)
  if (!match) return null
  let hour = parseInt(match[1], 10)
  const minute = match[2] ? parseInt(match[2], 10) : 0
  const meridiem = match[3].toLowerCase()
  if (meridiem === "am") hour = hour === 12 ? 0 : hour
  else hour = hour === 12 ? 12 : hour + 12
  return hour * 60 + minute
}

function slotBoundary(date: Date, time: string, isEnd: boolean): Date {
  const out = new Date(date)
  const minutes = timeToMinutes(time)
  out.setMinutes(minutes === null ? (isEnd ? 1440 : 0) : minutes, 0, 0)
  return out
}

function slotConflicts(
  booking: {
    checkIn: Date
    checkOut: Date
    checkInTime: string
    checkOutTime: string
  },
  checkIn: Date,
  checkOut: Date,
  checkInTime: string | null,
  checkOutTime: string | null,
): boolean {
  const reqStart = slotBoundary(checkIn, checkInTime ?? "", false)
  const reqEnd = slotBoundary(checkOut, checkOutTime ?? "", true)
  const bStart = slotBoundary(booking.checkIn, booking.checkInTime, false)
  const bEnd = slotBoundary(booking.checkOut, booking.checkOutTime, true)
  return reqStart < bEnd && reqEnd > bStart
}

const DAY_MS = 24 * 60 * 60 * 1000
const addDays = (date: Date, n: number) => new Date(date.getTime() + n * DAY_MS)
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

export type OccupiedSlot = {
  checkIn: Date
  checkInTime: string
  checkOut: Date
  checkOutTime: string
}

async function bookingItemsForRange(
  db: Db,
  checkIn: Date,
  checkOut: Date,
  checkInTime?: string,
  checkOutTime?: string,
) {
  // When times are given, query with the exact slot window (e.g. Aug 23 4:00 PM ->
  // Aug 24 12:00 PM) instead of midnight day boundaries so edge bookings aren't dropped.
  const rangeStart = checkInTime ? slotBoundary(checkIn, checkInTime, false) : checkIn
  const rangeEnd = checkOutTime ? slotBoundary(checkOut, checkOutTime, true) : checkOut
  return db.bookingItem.findMany({
    where: {
      booking: {
        status: { in: ["pending", "confirmed"] },
        checkIn: { lt: rangeEnd },
        checkOut: { gt: rangeStart },
      },
    },
    include: { booking: { select: { checkIn: true, checkOut: true, checkInTime: true, checkOutTime: true } } },
  })
}

export async function getOccupiedUnits(
  accommodationIds: string[],
  checkIn: Date,
  checkOut: Date,
  checkInTime?: string,
  checkOutTime?: string,
  db: Db = prisma,
): Promise<Map<string, number>> {
  const items = await bookingItemsForRange(db, checkIn, checkOut, checkInTime, checkOutTime)

  const map = new Map<string, number>()
  for (const item of items) {
    if (!accommodationIds.includes(item.accommodationId)) continue
    if (checkInTime && checkOutTime && !slotConflicts(item.booking, checkIn, checkOut, checkInTime, checkOutTime)) continue
    map.set(item.accommodationId, (map.get(item.accommodationId) ?? 0) + 1)
  }
  return map
}

export async function getConflictingSlots(
  accommodationIds: string[],
  checkIn: Date,
  checkOut: Date,
  checkInTime: string,
  checkOutTime: string,
  db: Db = prisma,
): Promise<Map<string, OccupiedSlot[]>> {
  const items = await bookingItemsForRange(db, checkIn, checkOut, checkInTime, checkOutTime)

  const map = new Map<string, OccupiedSlot[]>()
  for (const item of items) {
    if (!accommodationIds.includes(item.accommodationId)) continue
    if (!slotConflicts(item.booking, checkIn, checkOut, checkInTime, checkOutTime)) continue
    const list = map.get(item.accommodationId) ?? []
    list.push({
      checkIn: item.booking.checkIn,
      checkInTime: item.booking.checkInTime,
      checkOut: item.booking.checkOut,
      checkOutTime: item.booking.checkOutTime,
    })
    map.set(item.accommodationId, list)
  }
  return map
}

export async function getNightlyOccupancy(
  accommodationIds: string[],
  from: Date,
  to: Date,
  checkInTime?: string,
  checkOutTime?: string,
  db: Db = prisma,
): Promise<Map<string, Map<string, number>>> {
  const items = await bookingItemsForRange(db, from, addDays(to, 1), checkInTime, checkOutTime)

  const byAccommodation = new Map<string, Map<string, number>>()
  for (let d = from; d <= to; d = addDays(d, 1)) {
    for (const item of items) {
      if (!accommodationIds.includes(item.accommodationId)) continue
      if (checkInTime && checkOutTime && !slotConflicts(item.booking, d, addDays(d, 1), checkInTime, checkOutTime)) continue
      const map = byAccommodation.get(item.accommodationId) ?? new Map<string, number>()
      map.set(dateKey(d), (map.get(dateKey(d)) ?? 0) + 1)
      byAccommodation.set(item.accommodationId, map)
    }
  }
  return byAccommodation
}

export async function assertUnitsAvailable(
  accommodationIds: string[],
  checkIn: Date,
  checkOut: Date,
  checkInTime?: string,
  checkOutTime?: string,
  db: Db = prisma,
) {
  const occupied = await getOccupiedUnits(accommodationIds, checkIn, checkOut, checkInTime, checkOutTime, db)
  const accommodationById = new Map<string, { name: string; units: number }>()
  const where = { id: { in: accommodationIds } }
  for (const acc of await db.accommodation.findMany({ where, select: { id: true, name: true, units: true } })) {
    accommodationById.set(acc.id, acc)
  }

  for (const id of accommodationIds) {
    const acc = accommodationById.get(id)
    if (!acc) continue
    const used = occupied.get(id) ?? 0
    if (used >= acc.units) {
      throw new Error(
        `${acc.name} is already taken for that time. Only ${acc.units} ${acc.units === 1 ? "unit" : "units"} available.`,
      )
    }
  }
}