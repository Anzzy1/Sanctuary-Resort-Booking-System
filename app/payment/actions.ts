"use server"

import { prisma } from "@/lib/prisma"
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, generateTransactionId, isValidGcashReference, type PaymentMethod } from "@/lib/payment"
import { sendAdminPaymentAlert, sendPaymentReceivedEmail } from "@/lib/mailer"
import { createNotification, NotificationType } from "@/lib/notifications"

export type CompletePaymentState = { error: string | null; redirect?: string }

export async function completePayment(
  _prevState: CompletePaymentState,
  formData: FormData,
): Promise<CompletePaymentState> {
  const id = String(formData.get("id") ?? "").trim()
  const rawMethod = String(formData.get("method") ?? "")
  const method: PaymentMethod = PAYMENT_METHODS.includes(rawMethod as PaymentMethod)
    ? (rawMethod as PaymentMethod)
    : "gcash"

  if (!id) return { error: "Missing reservation reference." }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { payment: true },
  })

  if (!booking) return { error: "Reservation not found." }
  if (booking.status === "cancelled") {
    return { error: "This reservation has expired and is no longer available." }
  }
  if (booking.payment?.status === "paid") {
    return { error: null, redirect: `/confirmation?id=${id}` }
  }

  const transactionId = generateTransactionId()
  const paidAt = new Date()

  const data = { method, status: "paid" as const, transactionId, paidAt }

  if (booking.payment) {
    await prisma.payment.update({ where: { bookingId: id }, data })
  } else {
    await prisma.payment.create({ data: { bookingId: id, amount: booking.total, ...data } })
  }

  return { error: null, redirect: `/confirmation?id=${id}` }
}

export async function submitGcashReference(
  _prevState: CompletePaymentState,
  formData: FormData,
): Promise<CompletePaymentState> {
  const id = String(formData.get("id") ?? "").trim()
  const rawMethod = String(formData.get("method") ?? "gcash")
  const method: PaymentMethod = rawMethod === "maya" ? "maya" : "gcash"
  const referenceNumber = String(formData.get("referenceNumber") ?? "").trim()
  const senderName = String(formData.get("senderName") ?? "").trim()
  const rawProof = String(formData.get("proofImage") ?? "").trim()

  if (!id) return { error: "Missing reservation reference." }
  if (!isValidGcashReference(referenceNumber)) {
    return { error: `Enter the ${PAYMENT_METHOD_LABELS[method]} reference number from your receipt (6-20 letters or digits).` }
  }
  if (senderName.length < 2 || senderName.length > 60) {
    return { error: `Enter the name on the ${PAYMENT_METHOD_LABELS[method]} account that sent the payment.` }
  }

  let proofImage: string | null = null
  if (rawProof) {
    if (!/^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/.test(rawProof)) {
      return { error: "The screenshot must be a PNG, JPG, or WebP image." }
    }
    if (rawProof.length > 3_000_000) {
      return { error: "That screenshot is too large. Please attach an image under 2 MB." }
    }
    proofImage = rawProof
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { payment: true },
  })

  if (!booking) return { error: "Reservation not found." }
  if (booking.status === "cancelled") {
    return { error: "This reservation has expired and is no longer available." }
  }
  if (booking.payment?.status === "paid") {
    return { error: null, redirect: `/confirmation?id=${id}` }
  }

  const data = {
    method,
    status: "verifying" as const,
    referenceNumber,
    senderName,
    proofImage,
  }

  if (booking.payment) {
    await prisma.payment.update({ where: { bookingId: id }, data })
  } else {
    await prisma.payment.create({ data: { bookingId: id, amount: booking.total, ...data } })
  }

  // Notify the guest that their booking fee is being verified, and alert the
  // admin to check their e-wallet inbox. Email failures never block the flow.
  const methodLabel = PAYMENT_METHOD_LABELS[method]
  try {
    await Promise.allSettled([
      sendPaymentReceivedEmail(booking.email, {
        guestName: booking.guestName,
        bookingNumber: booking.bookingNumber,
        amount: booking.bookingFee,
        referenceNumber,
        balanceDue: booking.balanceDue,
      }),
      sendAdminPaymentAlert({
        bookingNumber: booking.bookingNumber,
        guestName: booking.guestName,
        email: booking.email,
        amount: booking.bookingFee,
        referenceNumber,
        senderName,
        methodLabel,
      }),
      createNotification({
        type: "payment_verification" as NotificationType,
        title: "Payment submitted for verification",
        message: `${booking.guestName} — ${booking.bookingNumber} submitted ${methodLabel} reference: ${referenceNumber}`,
        bookingId: booking.id,
      }),
    ])
  } catch (error) {
    console.error("Payment notification emails failed:", error)
  }

  return { error: null, redirect: `/confirmation?id=${id}` }
}