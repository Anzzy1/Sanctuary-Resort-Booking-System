"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { assertUnitsAvailable } from "@/lib/availability"
import { withBookingLock } from "@/lib/booking-lock"
import { isCheckInAllowed } from "@/lib/booking-time"
import { computePricing, hourlyRateOf } from "@/lib/money"
import { PAYMENT_METHOD_LABELS } from "@/lib/payment"

const safeMethodLabel = (method: string) => PAYMENT_METHOD_LABELS[method] ?? method
import {
  COOKIE_NAME,
  OTP_TTL_MS,
  OTP_MAX_ATTEMPTS,
  adminSessionCookieOptions,
  generateOtpCode,
  hashOtp,
  otpMatches,
  signSessionToken,
  verifySessionToken,
} from "@/lib/otp"
import { sendOtpEmail, sendBookingConfirmedEmail, sendPaymentRejectedEmail, sendAdminCheckInAlert, sendAdminCancellationAlert, sendAdminPaymentVerificationAlert } from "@/lib/mailer"
import { createNotification, NotificationType } from "@/lib/notifications"
import { auditLog } from "@/lib/audit"
import { buildReceiptForBooking } from "@/lib/receipt-pdf"
import { sendSms, bookingConfirmedSms, bookingRejectedSms } from "@/lib/sms"

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

function isAllowedAdmin(email: string): boolean {
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return allowed.includes(email)
}

type IssueOtpResult = { ok: true } | { ok: false; error: string }

async function issueOtp(email: string): Promise<IssueOtpResult> {
  const code = generateOtpCode()
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)

  try {
    await prisma.adminOtp.deleteMany({ where: { email } })
    await prisma.adminOtp.create({
      data: { email, codeHash: hashOtp(code), expiresAt },
    })
  } catch (error) {
    console.error("Failed to store OTP:", error)
    return { ok: false, error: "Something went wrong. Please try again." }
  }

  try {
    const { delivered } = await sendOtpEmail(email, code)
    if (!delivered) {
      return { ok: false, error: "Email service is not configured. Set up SMTP credentials first." }
    }
  } catch (error) {
    console.error("Failed to send OTP email:", error)
    return { ok: false, error: "Could not send the verification email. Check your SMTP settings." }
  }

  return { ok: true }
}

export type AdminRequestOtpState = { error: string | null; ok: boolean; email: string }

export async function adminRequestOtp(
  _prevState: AdminRequestOtpState,
  formData: FormData,
): Promise<AdminRequestOtpState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""))

  if (!isAllowedAdmin(email)) {
    return { error: "This email is not authorized for admin access.", ok: false, email }
  }

  const result = await issueOtp(email)
  if (!result.ok) {
    return { error: result.error, ok: false, email }
  }

  return { error: null, ok: true, email }
}

export type AdminCredentialsState = { error: string | null; ok: boolean; email: string }

export async function adminLoginCredentials(
  _prevState: AdminCredentialsState,
  formData: FormData,
): Promise<AdminCredentialsState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""))
  const password = String(formData.get("password") ?? "")

  if (!isAllowedAdmin(email)) {
    return { error: "This email is not authorized for admin access.", ok: false, email }
  }

  const expectedPassword = process.env.ADMIN_PASSWORD
  if (!expectedPassword || password !== expectedPassword) {
    return { error: "Incorrect email or password.", ok: false, email }
  }

  const result = await issueOtp(email)
  if (!result.ok) {
    return { error: result.error, ok: false, email }
  }

  return { error: null, ok: true, email }
}

export type AdminVerifyOtpState = { error: string | null; email: string }

export async function adminVerifyOtp(
  _prevState: AdminVerifyOtpState,
  formData: FormData,
): Promise<AdminVerifyOtpState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""))
  const code = String(formData.get("code") ?? "").trim()

  if (!isAllowedAdmin(email)) {
    return { error: "This email is not authorized for admin access.", email }
  }
  if (!/^\d{6}$/.test(code)) {
    return { error: "Enter the 6-digit verification code.", email }
  }

  const otp = await prisma.adminOtp.findFirst({ where: { email }, orderBy: { createdAt: "desc" } })
  if (!otp) {
    return { error: "No verification code was requested for this email.", email }
  }

  if (otp.usedAt) {
    return { error: "This code has already been used. Request a new one.", email }
  }
  if (otp.expiresAt.getTime() < Date.now()) {
    return { error: "This code has expired. Request a new one.", email }
  }
  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    return { error: "Too many failed attempts. Request a new code.", email }
  }
  if (!otpMatches(code, otp.codeHash)) {
    await prisma.adminOtp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    })
    const remaining = OTP_MAX_ATTEMPTS - otp.attempts - 1
    return { error: `Incorrect code. ${Math.max(0, remaining)} attempt(s) left.`, email }
  }

  await prisma.adminOtp.update({ where: { id: otp.id }, data: { usedAt: new Date() } })

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, signSessionToken(email), adminSessionCookieOptions())
  redirect("/admin")
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  redirect("/admin")
}

export async function verifyAdmin(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySessionToken(token)
}

async function requireAdmin() {
  if (!(await verifyAdmin())) {
    throw new Error("Unauthorized.")
  }
}

export async function updateBookingStatus(formData: FormData) {
  await requireAdmin()
  const actor = (await verifyAdmin()) ?? "unknown"
  const id = String(formData.get("id") ?? "")
  const status = String(formData.get("status") ?? "")

  const validStatuses = ["pending", "confirmed", "cancelled", "completed"] as const
  if (!validStatuses.includes(status as (typeof validStatuses)[number])) {
    throw new Error("Invalid booking status.")
  }

  await prisma.booking.update({
    where: { id },
    data: { status: status as (typeof validStatuses)[number] },
  })
  await auditLog({ action: `booking.status->${status}`, actor, targetId: id, targetType: "Booking", detail: status })

  revalidatePath("/admin/bookings")
  revalidatePath("/admin")
  revalidatePath("/admin/guests")
  revalidatePath("/admin/checkin")
  revalidatePath("/admin/accommodations")
}

export async function checkInReservation(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get("id") ?? "")
  if (!id) throw new Error("Missing booking id.")

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { items: { include: { accommodation: true } } },
  })
  if (!booking) throw new Error("Booking not found.")
  if (!isCheckInAllowed(booking.checkIn, booking.checkInTime)) {
    throw new Error("Check-in opens 2 hours before the scheduled time.")
  }

  const actorCI = (await verifyAdmin()) ?? "unknown"
  await prisma.booking.update({
    where: { id },
    data: { status: "confirmed", checkInTime: formatTime12h(new Date()) },
  })
  await auditLog({ action: "booking.checkin", actor: actorCI, targetId: id, targetType: "Booking", detail: booking.bookingNumber })

  await Promise.allSettled([
    sendAdminCheckInAlert({
      bookingNumber: booking.bookingNumber,
      guestName: booking.guestName,
      email: booking.email,
      phone: booking.phone,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      roomNames: booking.items.map((item) => item.accommodation.name),
      checkInTime: formatTime12h(new Date()),
    }),
    createNotification({
      type: "check_in" as NotificationType,
      title: "Guest checked in",
      message: `${booking.guestName} checked in to ${booking.items.map((i) => i.accommodation.name).join(", ")}`,
      bookingId: booking.id,
    }),
  ])

  revalidatePath("/admin/bookings")
  revalidatePath("/admin")
  revalidatePath("/admin/guests")
  revalidatePath("/admin/checkin")
  revalidatePath("/admin/accommodations")
}

export async function deleteBooking(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get("id") ?? "")
  const reason = String(formData.get("reason") ?? "Cancelled by admin").trim()

  const booking = await prisma.booking.findUnique({ where: { id } })
  const actorDel = (await verifyAdmin()) ?? "unknown"
  if (booking) {
    await auditLog({ action: "booking.delete", actor: actorDel, targetId: id, targetType: "Booking", detail: `${booking.bookingNumber} reason=${reason}` })
    await Promise.allSettled([
      sendAdminCancellationAlert({
        bookingNumber: booking.bookingNumber,
        guestName: booking.guestName,
        email: booking.email,
        reason,
      }),
      createNotification({
        type: "cancellation" as NotificationType,
        title: "Booking cancelled",
        message: `${booking.guestName} — ${booking.bookingNumber} cancelled: ${reason}`,
        bookingId: booking.id,
      }),
    ])
  }

  await prisma.booking.delete({ where: { id } })
  revalidatePath("/admin/bookings")
  revalidatePath("/admin")
  revalidatePath("/admin/guests")
  revalidatePath("/admin/accommodations")
}

export async function verifyGcashPayment(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get("id") ?? "")
  if (!id) throw new Error("Missing booking id.")

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { payment: true, items: { include: { accommodation: true } } },
  })
  if (!booking?.payment) throw new Error("Payment not found.")
  if (booking.payment.status !== "verifying") throw new Error("This payment is not awaiting verification.")

  const transactionId = booking.payment.referenceNumber ?? booking.bookingNumber
  await prisma.payment.update({
    where: { bookingId: id },
    data: {
      status: "paid",
      transactionId,
      paidAt: new Date(),
    },
  })

  // Tell the guest their stay is officially confirmed, with the receipt PDF
  // attached. Also text them - mention the QR code was sent to email.
  // Email/SMS failures never block the verification itself.
  try {
    const { pdf, filename } = buildReceiptForBooking(booking)
    const emailPromise = sendBookingConfirmedEmail(
      booking.email,
      {
        guestName: booking.guestName,
        bookingNumber: booking.bookingNumber,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        roomNames: booking.items.map((item) => item.accommodation.name),
        nights: Math.max(
          1,
          Math.round((booking.checkOut.getTime() - booking.checkIn.getTime()) / (24 * 60 * 60 * 1000)),
        ),
        amount: booking.total,
        transactionId,
        bookingFee: booking.bookingFee,
        balanceDue: booking.balanceDue,
        methodLabel: safeMethodLabel(booking.payment.method),
      },
      { filename, content: pdf },
    )
    const smsPromise = booking.phone
      ? sendSms(booking.phone, bookingConfirmedSms(booking.bookingNumber, booking.email))
      : Promise.resolve({ delivered: false })
    await Promise.allSettled([emailPromise, smsPromise])
  } catch (error) {
    console.error("Booking confirmed notifications failed:", error)
  }

  const actorPay = (await verifyAdmin()) ?? "unknown"
  await auditLog({ action: "payment.confirmed", actor: actorPay, targetId: id, targetType: "Payment", detail: `${booking.bookingNumber} ${safeMethodLabel(booking.payment.method)}` })
  await createNotification({
    type: "payment_confirmed" as NotificationType,
    title: "Payment verified",
    message: `${booking.guestName} — ${booking.bookingNumber} payment confirmed (${safeMethodLabel(booking.payment.method)})`,
    bookingId: booking.id,
  })

  revalidatePath("/admin/bookings")
  revalidatePath("/admin")
  revalidatePath("/admin/guests")
  revalidatePath("/admin/checkin")
  revalidatePath("/admin/accommodations")
}

export async function rejectGcashPayment(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get("id") ?? "")
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500)
  if (!id) throw new Error("Missing booking id.")

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { payment: true },
  })
  if (!booking?.payment) throw new Error("Payment not found.")
  if (booking.payment.status !== "verifying") throw new Error("This payment is not awaiting verification.")

  const referenceNumber = booking.payment.referenceNumber ?? booking.bookingNumber

  // Release the room and mark the payment as unverifiable, keeping the
  // reason on record so admins can revisit their decision later.
  await prisma.$transaction([
    prisma.payment.update({
      where: { bookingId: id },
      data: { status: "failed", rejectionReason: reason || null },
    }),
    prisma.booking.update({ where: { id }, data: { status: "cancelled" } }),
  ])

  // Tell the guest the payment could not be verified and how to reach us.
  // Also text them the reason if we have their number.
  try {
    const emailPromise = sendPaymentRejectedEmail(booking.email, {
      guestName: booking.guestName,
      bookingNumber: booking.bookingNumber,
      amount: booking.total,
      referenceNumber,
      reason,
      methodLabel: safeMethodLabel(booking.payment.method),
    })
    const smsPromise = booking.phone
      ? sendSms(booking.phone, bookingRejectedSms(booking.bookingNumber, reason))
      : Promise.resolve({ delivered: false })
    await Promise.allSettled([emailPromise, smsPromise])
  } catch (error) {
    console.error("Payment rejected notifications failed:", error)
  }

  const actorRej = (await verifyAdmin()) ?? "unknown"
  await auditLog({ action: "payment.rejected", actor: actorRej, targetId: id, targetType: "Payment", detail: `${booking.bookingNumber} reason=${reason}` })
  await createNotification({
    type: "payment_failed" as NotificationType,
    title: "Payment rejected",
    message: `${booking.guestName} — ${booking.bookingNumber} payment rejected: ${reason}`,
    bookingId: booking.id,
  })

  revalidatePath("/admin/bookings")
  revalidatePath("/admin")
  revalidatePath("/admin/guests")
  revalidatePath("/admin/checkin")
  revalidatePath("/admin/accommodations")
}

export type CheckInGuestState = { error: string | null }

export type BookingLookup = {
  id: string
  bookingNumber: string
  guestName: string
  email: string
  phone: string | null
  checkIn: string
  checkOut: string
  checkInTime: string
  checkOutTime: string
  status: string
  items: { accommodationId: string; name: string; nights: number }[]
}

export async function lookupBookingByNumber(bookingNumber: string): Promise<BookingLookup | null> {
  const booking = await prisma.booking.findUnique({
    where: { bookingNumber },
    include: { items: { include: { accommodation: true } } },
  })
  if (!booking) return null
  return {
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    guestName: booking.guestName,
    email: booking.email,
    phone: booking.phone,
    checkIn: booking.checkIn.toISOString(),
    checkOut: booking.checkOut.toISOString(),
    checkInTime: booking.checkInTime,
    checkOutTime: booking.checkOutTime,
    status: booking.status,
    items: booking.items.map((item) => ({
      accommodationId: item.accommodationId,
      name: item.accommodation.name,
      nights: item.nights,
    })),
  }
}

function formatTime12h(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

export async function checkInGuest(_prevState: CheckInGuestState, formData: FormData): Promise<CheckInGuestState> {
  await requireAdmin()
  const bookingId = String(formData.get("bookingId") ?? "").trim()
  const accommodationId = String(formData.get("accommodationId") ?? "").trim()
  const guestName = String(formData.get("guestName") ?? "").trim()
  const checkInTime = String(formData.get("checkInTime") ?? "").trim()
  const untilDate = String(formData.get("untilDate") ?? "").trim()
  const untilTime = String(formData.get("untilTime") ?? "").trim()
  const isWalkIn = bookingId.length === 0

  if (isWalkIn) {
    if (!accommodationId || !guestName || !checkInTime || !untilDate || !untilTime) {
      return { error: "Missing walk-in check-in details." }
    }
    const accommodation = await prisma.accommodation.findUnique({ where: { id: accommodationId } })
    if (!accommodation) return { error: "Accommodation not found." }

    const now = new Date()
    const checkInDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const checkOut = new Date(`${untilDate}T12:00:00`)

    // Walk-ins follow the same hourly pricing as online bookings; the front
    // desk collects the whole amount on-site, so nothing is pre-paid.
    const { subtotal, resortFee, taxes, total, hours } = computePricing([accommodation], {
      checkIn: checkInDate,
      checkOut,
      checkInTime,
      checkOutTime: untilTime,
    })
    const rate = hourlyRateOf(accommodation.price)

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"
    const rand = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("")

    try {
      await assertUnitsAvailable([accommodationId], checkInDate, checkOut, undefined, undefined)
      await prisma.booking.create({
        data: {
          bookingNumber: `#SAN-WLK-${rand(4)}`,
          guestName,
          email: "walkin@sanctuary.local",
          checkIn: checkInDate,
          checkOut,
          checkInTime,
          checkOutTime: untilTime,
          adults: 1,
          children: 0,
          infants: 0,
          subtotal,
          resortFee,
          taxes,
          total,
          bookingFee: 0,
          balanceDue: total,
          status: "confirmed",
          items: {
            create: {
              accommodationId: accommodation.id,
              pricePerNight: rate,
              nights: hours,
              subtotal: rate * hours,
            },
          },
        },
      })
    } catch {
      return { error: `${accommodation.name} is already occupied or fully booked for those dates.` }
    }

    revalidatePath("/admin/checkin")
    revalidatePath("/admin")
    revalidatePath("/admin/accommodations")
    return { error: null }
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) return { error: "Booking not found." }

  // Set the actual check-in time; keep the receipt's check-out (until) unless overridden
  const data: { status: "confirmed"; checkInTime: string } = {
    status: "confirmed",
    checkInTime: checkInTime || formatTime12h(new Date()),
  }
  await prisma.booking.update({ where: { id: booking.id }, data })

  revalidatePath("/admin/checkin")
  revalidatePath("/admin")
  revalidatePath("/admin/bookings")
  revalidatePath("/admin/accommodations")
  return { error: null }
}

function generateAdminBookingNumber() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"
  const rand = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `#SAN-ADM-${rand(4)}`
}

function adminBookingRedirect(formData: FormData, message: string): never {
  const params = new URLSearchParams()
  for (const key of ["rooms", "checkIn", "checkOut", "checkInTime", "checkOutTime", "adults", "children", "infants"]) {
    const value = String(formData.get(key) ?? "")
    if (value) params.set(key, value)
  }
  params.set("error", message)
  redirect(`/admin/book/confirm?${params.toString()}`)
}

export async function createAdminBooking(formData: FormData) {
  await requireAdmin()

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

  const status = "pending"

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
    adminBookingRedirect(formData, "Missing required booking details.")
  }

  const accommodations = await prisma.accommodation.findMany({
    where: { slug: { in: roomSlugs } },
  })

  if (accommodations.length !== roomSlugs.length) {
    adminBookingRedirect(formData, "One or more accommodations are no longer available.")
  }

  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)

  // Admin-created bookings record the full pricing but collect nothing online —
  // the front desk settles payment at check-in.
  const { subtotal, resortFee, taxes, total, bookingFee, balanceDue, hours } = computePricing(accommodations, {
    checkIn: checkInDate,
    checkOut: checkOutDate,
    checkInTime,
    checkOutTime,
  })

  const roomIds = accommodations.map((room) => room.id)

  try {
    await withBookingLock(roomIds, async (tx) => {
      await assertUnitsAvailable(roomIds, checkInDate, checkOutDate, checkInTime, checkOutTime, tx)
      await tx.booking.create({
        data: {
          bookingNumber: generateAdminBookingNumber(),
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
          status,
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
      },
      })
    })
  } catch (error) {
    adminBookingRedirect(
      formData,
      error instanceof Error ? error.message : "One or more accommodations are already taken for those dates.",
    )
  }

  revalidatePath("/admin/bookings")
  revalidatePath("/admin")
  revalidatePath("/admin/guests")
  revalidatePath("/admin/checkin")
  revalidatePath("/admin/accommodations")
  revalidatePath("/admin/book")

  redirect("/admin/bookings")
}