"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { assertUnitsAvailable, getConflictingSlots, getNightlyOccupancy, getOccupiedUnits } from "@/lib/availability"
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/payment"
import { computePricing, hourlyRateOf } from "@/lib/money"
import { sendAdminNewBookingAlert } from "@/lib/mailer"
import { createNotification, NotificationType } from "@/lib/notifications"
import { withBookingLock } from "@/lib/booking-lock"

export type ConflictingSlot = { checkIn: string; checkInTime: string; checkOut: string; checkOutTime: string }
export type RoomAvailability = { slug: string; units: number; occupied: number; conflicts: ConflictingSlot[] }
export type NightlyAvailability = { slug: string; units: number; nights: Record<string, number> }

export async function getRoomAvailability(
  checkIn: string,
  checkOut: string,
  checkInTime?: string,
  checkOutTime?: string,
): Promise<RoomAvailability[]> {
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) return []

  const accommodations = await prisma.accommodation.findMany({ select: { id: true, slug: true, units: true } })
  const [occupiedMap, conflictMap] = await Promise.all([
    getOccupiedUnits(
      accommodations.map((acc) => acc.id),
      checkInDate,
      checkOutDate,
      checkInTime,
      checkOutTime,
    ),
    getConflictingSlots(
      accommodations.map((acc) => acc.id),
      checkInDate,
      checkOutDate,
      checkInTime ?? "",
      checkOutTime ?? "",
    ),
  ])

  return accommodations.map((acc) => ({
    slug: acc.slug,
    units: acc.units,
    occupied: occupiedMap.get(acc.id) ?? 0,
    conflicts: (conflictMap.get(acc.id) ?? []).map((slot) => ({
      checkIn: slot.checkIn.toISOString(),
      checkInTime: slot.checkInTime,
      checkOut: slot.checkOut.toISOString(),
      checkOutTime: slot.checkOutTime,
    })),
  }))
}

export async function getNightlyAvailability(
  from: string,
  to: string,
  checkInTime?: string,
  checkOutTime?: string,
): Promise<NightlyAvailability[]> {
  const fromDate = new Date(from)
  const toDate = new Date(to)
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) return []

  const accommodations = await prisma.accommodation.findMany({ select: { id: true, slug: true, units: true } })
  const occupied = await getNightlyOccupancy(
    accommodations.map((acc) => acc.id),
    fromDate,
    toDate,
    checkInTime,
    checkOutTime,
  )

  return accommodations.map((acc) => ({
    slug: acc.slug,
    units: acc.units,
    nights: Object.fromEntries(occupied.get(acc.id) ?? new Map<string, number>()),
  }))
}

const PAYMENT_METHODS_FALLBACK: PaymentMethod = "gcash"

function generateBookingNumber() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"
  const rand = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `#SAN-${rand(4)}-${rand(2)}`
}

function checkoutRedirect(formData: FormData, message: string): never {
  const params = new URLSearchParams()
  for (const key of ["rooms", "checkIn", "checkOut", "checkInTime", "checkOutTime", "adults", "children", "infants"]) {
    const value = String(formData.get(key) ?? "")
    if (value) params.set(key, value)
  }
  params.set("error", message)
  redirect(`/checkout?${params.toString()}`)
}

export async function createBooking(formData: FormData) {
  const rawRooms = String(formData.get("rooms") ?? "")
  const roomSlugs = rawRooms.split(",").map((slug) => slug.trim()).filter(Boolean)

  const checkIn = String(formData.get("checkIn") ?? "")
  const checkOut = String(formData.get("checkOut") ?? "")
  const checkInTime = String(formData.get("checkInTime") ?? "")
  const checkOutTime = String(formData.get("checkOutTime") ?? "")

  const firstName = String(formData.get("firstName") ?? "").trim()
  const lastName = String(formData.get("lastName") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const phone = String(formData.get("phone") ?? "").trim()

  const adults = parseInt(String(formData.get("adults") ?? "0"), 10)
  const children = parseInt(String(formData.get("children") ?? "0"), 10)
  const infants = parseInt(String(formData.get("infants") ?? "0"), 10)

  const rawPaymentMethod = String(formData.get("paymentMethod") ?? "")
  const paymentMethod: PaymentMethod = PAYMENT_METHODS.includes(rawPaymentMethod as PaymentMethod)
    ? (rawPaymentMethod as PaymentMethod)
    : PAYMENT_METHODS_FALLBACK

  const invalid =
    roomSlugs.length === 0 ||
    !checkIn ||
    !checkOut ||
    !checkInTime ||
    !checkOutTime ||
    !firstName ||
    !lastName ||
    !email

  if (invalid) {
    checkoutRedirect(formData, "Missing required booking details.")
  }

  const accommodations = await prisma.accommodation.findMany({
    where: { slug: { in: roomSlugs } },
  })

  if (accommodations.length !== roomSlugs.length) {
    checkoutRedirect(formData, "One or more accommodations are no longer available.")
  }

  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)

  const { subtotal, resortFee, taxes, total, bookingFee, balanceDue, hours } = computePricing(accommodations, {
    checkIn: checkInDate,
    checkOut: checkOutDate,
    checkInTime,
    checkOutTime,
  })

  const roomIds = accommodations.map((room) => room.id)

  let booking: { id: string; bookingNumber: string }

  try {
    booking = await withBookingLock(roomIds, async (tx) => {
      await assertUnitsAvailable(roomIds, checkInDate, checkOutDate, checkInTime, checkOutTime, tx)
      return tx.booking.create({
        data: {
          bookingNumber: generateBookingNumber(),
          guestName: `${firstName} ${lastName}`.trim(),
          email,
          phone: phone || null,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          checkInTime,
          checkOutTime,
          adults,
          children,
          infants,
          subtotal,
          resortFee,
          taxes,
          total,
          bookingFee,
          balanceDue,
          items: {
            create: accommodations.map((room) => {
              const rate = hourlyRateOf(room.price)
              return {
                accommodationId: room.id,
                pricePerNight: rate,
                nights: hours,
                subtotal: rate * hours,
              }
            }),
          },
          payment: {
            create: {
              method: paymentMethod,
              amount: bookingFee,
              status: "pending",
            },
          },
        },
      })
    })
  } catch (error) {
    checkoutRedirect(
      formData,
      error instanceof Error ? error.message : "One or more accommodations are already taken for those dates.",
    )
  }

  await sendAdminNewBookingAlert({
    bookingNumber: booking.bookingNumber,
    guestName: `${firstName} ${lastName}`.trim(),
    email,
    phone: phone || null,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    checkInTime,
    checkOutTime,
    roomNames: accommodations.map((r) => r.name),
    total,
    balanceDue,
    paymentMethod,
  })

  await createNotification({
    type: "new_booking" as NotificationType,
    title: "New reservation",
    message: `${firstName} ${lastName} — ${booking.bookingNumber} (${accommodations.map((r) => r.name).join(", ")})`,
    bookingId: booking.id,
  })

  redirect(`/payment/${booking.id}`)
}