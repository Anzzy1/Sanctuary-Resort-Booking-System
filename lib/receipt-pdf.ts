import QRCode from "qrcode"
import { jsPDF } from "jspdf"

const INK = "#041920"
const MUTED = "#0a2a33"
const LINE = "#c9d4d8"

export type ReceiptPdfInput = {
  bookingNumber: string
  transactionId?: string
  issuedAt: string
  guestName: string
  email: string
  phone?: string
  items: { name: string; subtotal: number }[]
  checkInLabel: string
  checkOutLabel: string
  nights: number
  guestCount: number
  subtotal: number
  resortFee: number
  taxes: number
  total: number
  paymentLabel: string
  hours?: number
  bookingFee?: number
  balanceDue?: number
}

type BookingForReceipt = {
  bookingNumber: string
  guestName: string
  email: string
  phone: string | null
  createdAt: Date
  checkIn: Date
  checkOut: Date
  adults: number
  children: number
  infants: number
  subtotal: number
  resortFee: number
  taxes: number
  total: number
  bookingFee: number
  balanceDue: number
  items: { accommodation: { name: string }; subtotal: number; nights: number }[]
  payment: { method: string; transactionId: string | null } | null
}

const RECEIPT_DAY_MS = 24 * 60 * 60 * 1000

function formatReceiptDate(date: Date | null | undefined): string {
  if (!date) return ""
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const receiptMethodLabels: Record<string, string> = {
  mastercard: "Mastercard",
  visa: "Visa",
  paypal: "PayPal",
  gcash: "GCash",
  maya: "Maya",
}

export function buildReceiptForBooking(booking: BookingForReceipt): { pdf: ArrayBuffer; filename: string } {
  const nights = Math.max(1, Math.round((booking.checkOut.getTime() - booking.checkIn.getTime()) / RECEIPT_DAY_MS))
  const guestCount = booking.adults + booking.children + booking.infants
  const hours = booking.items[0]?.nights ?? nights
  const pdf = buildReceiptPdf({
    bookingNumber: booking.bookingNumber,
    transactionId: booking.payment?.transactionId ?? undefined,
    issuedAt: formatReceiptDate(booking.createdAt),
    guestName: booking.guestName,
    email: booking.email,
    phone: booking.phone ?? undefined,
    items: booking.items.map((item) => ({ name: item.accommodation.name, subtotal: item.subtotal })),
    checkInLabel: formatReceiptDate(booking.checkIn),
    checkOutLabel: formatReceiptDate(booking.checkOut),
    nights,
    guestCount,
    hours,
    subtotal: booking.subtotal,
    resortFee: booking.resortFee,
    taxes: booking.taxes,
    total: booking.total,
    paymentLabel: booking.payment ? receiptMethodLabels[booking.payment.method] ?? "Card" : "Card",
    bookingFee: booking.bookingFee,
    balanceDue: booking.balanceDue,
  })
  const filename = `${booking.bookingNumber.replace(/[^A-Z0-9-]/gi, "")}-receipt.pdf`
  return { pdf, filename }
}

function toMoney(value: number): string {
  return `₱${Math.round(value).toLocaleString("en-US")}`
}

function sectionLabel(doc: jsPDF, y: number, label: string): number {
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  doc.setTextColor(MUTED)
  doc.text(label.toUpperCase(), 20, y)
  return y + 3.5
}

function drawQrCode(doc: jsPDF, text: string, x: number, y: number, sizeMm: number): void {
  const qr = QRCode.create(text, { errorCorrectionLevel: "L" })
  const n = qr.modules.size
  const margin = 2
  const cell = sizeMm / (n + margin * 2)
  doc.setFillColor("#ffffff")
  doc.rect(x, y, sizeMm, sizeMm, "F")
  doc.setFillColor(INK)
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.modules.data[r * n + c]) {
        doc.rect(x + (c + margin) * cell, y + (r + margin) * cell, cell + 0.04, cell + 0.04, "F")
      }
    }
  }
}

export function buildReceiptPdf(props: ReceiptPdfInput): ArrayBuffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const pageWidth = 210

  doc.setFillColor(INK)
  doc.rect(0, 0, pageWidth, 38, "F")
  doc.setTextColor("#ffffff")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(15)
  doc.text("SANCTUARY", 20, 16.5)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor("#9fb8c0")
  doc.text("Sanctuary Coastal Resort - Palawan", 20, 22.5)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.setTextColor("#ffffff")
  doc.text("Booking Receipt", 190, 16.5, { align: "right" })
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor("#9fb8c0")
  doc.text(props.bookingNumber, 190, 23, { align: "right" })
  doc.setTextColor("#7fd1c0")
  doc.text(`Issued ${props.issuedAt}`, 190, 29.5, { align: "right" })

  let y = 46
  doc.setDrawColor(LINE)
  doc.line(20, y, 190, y)

  y += 9
  y = sectionLabel(doc, y, "Digital Check-in Key")
  doc.setTextColor(INK)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text("Scan this code at the concierge desk to check in.", 20, y)
  y += 22
  drawQrCode(doc, props.bookingNumber, 20, y, 34)
  doc.setTextColor(INK)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text(props.transactionId ?? props.bookingNumber, 62, y + 12)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.setTextColor(MUTED)
  doc.text("Transaction ID", 62, y + 12 + 4.5)
  y += 45

  doc.setDrawColor(LINE)
  doc.line(20, y, 190, y)

  y += 9
  y = sectionLabel(doc, y, "Guest Details")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(INK)
  doc.text(props.guestName, 20, y)
  y += 6
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9.5)
  doc.setTextColor(MUTED)
  const phoneText = props.phone ? `  /  ${props.phone}` : ""
  doc.text(`${props.email}${phoneText}`, 20, y)
  y += 8

  y = sectionLabel(doc, y, "Stay Details")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(INK)
  doc.text(props.items.map((i) => i.name).join(" + "), 20, y)
  y += 5.5
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9.5)
  doc.setTextColor(MUTED)
  doc.text(`${props.checkInLabel}  -  ${props.checkOutLabel}`, 20, y)
  y += 5
  const durationText = props.hours !== undefined
    ? `${props.hours} ${props.hours === 1 ? "hour" : "hours"}`
    : `${props.nights} ${props.nights === 1 ? "night" : "nights"}`
  doc.text(`${durationText}  /  ${props.guestCount} ${props.guestCount === 1 ? "guest" : "guests"}`, 20, y)
  y += 8

  doc.setDrawColor(LINE)
  doc.line(20, y, 190, y)

  y += 9
  y = sectionLabel(doc, y, "Price Breakdown")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9.5)
  doc.setTextColor(INK)
  for (const item of props.items) {
    doc.text(item.name, 20, y)
    doc.text(toMoney(item.subtotal), 190, y, { align: "right" })
    y += 4.8
  }
  doc.text("Subtotal", 20, y)
  doc.text(toMoney(props.subtotal), 190, y, { align: "right" })
  y += 4.8
  doc.text("Resort Fee", 20, y)
  doc.text(toMoney(props.resortFee), 190, y, { align: "right" })
  y += 4.8
  doc.text("Taxes and Fees (12%)", 20, y)
  doc.text(toMoney(props.taxes), 190, y, { align: "right" })
  y += 6.5

  doc.setDrawColor(INK)
  doc.setLineWidth(0.4)
  doc.line(20, y, 190, y)
  y += 6
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(INK)
  doc.text("TOTAL STAY COST", 20, y)
  doc.text(toMoney(props.total), 190, y, { align: "right" })
  y += 5
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(MUTED)
  doc.text(`Includes taxes and resort fees`, 20, y)
  y += 6.5

  if (props.balanceDue && props.balanceDue > 0) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(MUTED)
    doc.text(`Paid now via ${props.paymentLabel} (booking fee)`, 20, y)
    doc.text(toMoney(props.bookingFee ?? 0), 190, y, { align: "right" })
    y += 5.5
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10.5)
    doc.setTextColor(INK)
    doc.text("BALANCE DUE AT CHECK-IN", 20, y)
    doc.text(toMoney(props.balanceDue), 190, y, { align: "right" })
    y += 12
  } else {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(INK)
    doc.text(`Fully paid via ${props.paymentLabel}`, 20, y)
    y += 12
  }

  doc.setDrawColor(LINE)
  doc.line(20, y, 190, y)
  y += 8
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(MUTED)
  doc.text(
    "Thank you for choosing Sanctuary Coastal Resort. We look forward to welcoming you to your coastal retreat.",
    20,
    y,
    { maxWidth: 170 },
  )
  y += 5
  doc.setTextColor("#1fa08a")
  doc.text("sanctuaryresort.ph/questions  +63 900 000 0000", 20, y)

  return doc.output("arraybuffer")
}