import nodemailer from "nodemailer"

type Mailer = nodemailer.Transporter | null

let cachedMailer: Mailer = null

function getTransport(): Mailer {
  if (cachedMailer) return cachedMailer
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? "465")
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (host && user && pass) {
    cachedMailer = nodemailer.createTransport({
      host,
      port,
      secure: true,
      auth: { user, pass },
    })
  }
  return cachedMailer
}

export async function sendOtpEmail(to: string, code: string): Promise<{ delivered: boolean }> {
  const transport = getTransport()

  if (!transport) {
    if (process.env.NODE_ENV === "development") {
      console.log("\n===== ADMIN OTP (dev mode, SMTP not configured) =====")
      console.log(`  ${to}  ->  code: ${code}`)
      console.log("=======================================================\n")
      return { delivered: true }
    }
    return { delivered: false }
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM ?? `Sanctuary Resort <${process.env.SMTP_USER}>`,
    replyTo: process.env.SMTP_USER,
    to,
    subject: "Your Sanctuary Admin verification code",
    text: `Your admin verification code is: ${code}\n\nThis code expires in 10 minutes. If you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="margin: 0 0 12px; color: #1f2937;">Sanctuary Admin</h2>
        <p style="color: #4b5563;">Use this verification code to sign in to your admin dashboard:</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f766e; padding: 16px 0;">${code}</div>
        <p style="color: #9ca3af; font-size: 13px;">This code expires in 10 minutes and can only be used once.</p>
      </div>
    `,
  })
  return { delivered: true }
}

const peso = (value: number) => `₱${Math.round(value).toLocaleString("en-US")}`
const longDate = (date: Date) =>
  date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })

function adminRecipients(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export async function sendPaymentReceivedEmail(
  to: string,
  details: { guestName: string; bookingNumber: string; amount: number; referenceNumber: string; balanceDue?: number },
): Promise<{ delivered: boolean }> {
  const transport = getTransport()
  const firstName = details.guestName.split(" ")[0]
  const balanceBlock =
    details.balanceDue !== undefined
      ? `<tr><td style="padding:4px 0;">Due at check-in</td><td align="right"><strong>${peso(details.balanceDue)}</strong></td></tr>`
      : ""

  if (!transport) {
    console.log(`[mail] payment-received -> ${to} (${details.bookingNumber})`)
    return { delivered: false }
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM ?? `Sanctuary Resort <${process.env.SMTP_USER}>`,
    replyTo: process.env.SMTP_USER,
    to,
    subject: `We received your booking fee · ${details.bookingNumber}`,
    text: `Hi ${firstName}, we received your booking fee of ${peso(details.amount)} for ${details.bookingNumber}. Reference: ${details.referenceNumber}.${details.balanceDue !== undefined ? ` Remaining balance of ${peso(details.balanceDue)} is payable at check-in.` : ""} Your slot is reserved while our team verifies the transfer (within 24 hours). We will email you once your booking is confirmed.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="margin: 0 0 12px; color: #041920;">Booking fee received — being verified</h2>
        <p style="color: #4b5563;">Hi ${firstName},</p>
        <p style="color: #4b5563;">We received your booking fee for reservation <strong>${details.bookingNumber}</strong>:</p>
        <table style="width:100%; color:#4b5563; font-size:14px; margin:12px 0;">
          <tr><td style="padding:4px 0;">Amount sent</td><td align="right"><strong>${peso(details.amount)}</strong></td></tr>
          <tr><td style="padding:4px 0;">Reference number</td><td align="right"><strong>${details.referenceNumber}</strong></td></tr>
          ${balanceBlock}
        </table>
        <p style="color: #4b5563;">Your dates are <strong>reserved</strong> while our team verifies the transfer — usually within 24 hours. We will email you the moment your stay is confirmed.</p>
        <p style="color: #9ca3af; font-size: 13px;">Sanctuary Coastal Resort · sanctuaryresort.ph</p>
      </div>
    `,
  })
  return { delivered: true }
}

export async function sendAdminPaymentAlert(details: {
  bookingNumber: string
  guestName: string
  email: string
  amount: number
  referenceNumber: string
  senderName: string
  methodLabel?: string
}): Promise<{ delivered: boolean }> {
  const transport = getTransport()
  const recipients = adminRecipients()
  const label = details.methodLabel ?? "GCash"

  if (!transport || recipients.length === 0) {
    console.log(`[mail] admin-payment-alert -> ${recipients.join(", ") || "(none)"} (${details.bookingNumber})`)
    return { delivered: false }
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM ?? `Sanctuary Resort <${process.env.SMTP_USER}>`,
    replyTo: process.env.SMTP_USER,
    to: recipients.join(", "),
    subject: `${label} payment to verify - Booking ${details.bookingNumber}`,
    text: `New ${label} payment needs verification. Booking: ${details.bookingNumber}. Guest: ${details.guestName} (${details.email}). Amount: ${peso(details.amount)}. Reference: ${details.referenceNumber}. Sender: ${details.senderName}. Open Admin > Reservations and click "Confirm payment" after checking your ${label} inbox.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #f59e0b; border-radius: 12px;">
        <h2 style="margin: 0 0 12px; color: #b45309;">${label} payment needs verification</h2>
        <table style="width:100%; color:#4b5563; font-size:14px;">
          <tr><td style="padding:4px 0;">Booking</td><td align="right"><strong>${details.bookingNumber}</strong></td></tr>
          <tr><td style="padding:4px 0;">Guest</td><td align="right">${details.guestName}</td></tr>
          <tr><td style="padding:4px 0;">Email</td><td align="right">${details.email}</td></tr>
          <tr><td style="padding:4px 0;">Amount</td><td align="right"><strong>${peso(details.amount)}</strong></td></tr>
          <tr><td style="padding:4px 0;">Reference no.</td><td align="right"><strong>${details.referenceNumber}</strong></td></tr>
          <tr><td style="padding:4px 0;">Sender name</td><td align="right">${details.senderName}</td></tr>
        </table>
        <p style="color:#4b5563; margin-top:16px;">Check this amount/reference in your ${label} inbox, then open <strong>Admin → Reservations</strong> and press "Confirm payment".</p>
      </div>
    `,
  })
  return { delivered: true }
}

export async function sendPaymentRejectedEmail(
  to: string,
  details: { guestName: string; bookingNumber: string; amount: number; referenceNumber: string; reason?: string | null; methodLabel?: string },
): Promise<{ delivered: boolean }> {
  const transport = getTransport()
  const firstName = details.guestName.split(" ")[0]
  const label = details.methodLabel ?? "GCash"
  const reasonBlock = details.reason?.trim()
    ? `<div style="margin:12px 0; padding:12px 16px; background:#fef2f2; border-left:4px solid #ef4444; border-radius:8px;">
         <p style="margin:0 0 4px; font-size:12px; text-transform:uppercase; letter-spacing:1px; color:#b91c1c;">Reason</p>
         <p style="margin:0; color:#4b5563;">${details.reason.trim()}</p>
       </div>`
    : ""

  if (!transport) {
    console.log(`[mail] payment-rejected -> ${to} (${details.bookingNumber}) reason=${details.reason ?? "(none)"}`)
    return { delivered: false }
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM ?? `Sanctuary Resort <${process.env.SMTP_USER}>`,
    replyTo: process.env.SMTP_USER,
    to,
    subject: `We could not verify your payment · ${details.bookingNumber}`,
    text: `Hi ${firstName}, we could not verify the ${label} payment (Ref: ${details.referenceNumber}, Amount: ${peso(details.amount)}) for ${details.bookingNumber}.${details.reason?.trim() ? `\n\nReason: ${details.reason.trim()}` : ""}\n\nThe reservation has been released. If you believe this is a mistake or would like a refund, please contact us at ${process.env.SMTP_USER}.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #f87171; border-radius: 12px;">
        <h2 style="margin: 0 0 12px; color: #b91c1c;">Payment could not be verified</h2>
        <p style="color: #4b5563;">Hi ${firstName},</p>
        <p style="color: #4b5563;">Unfortunately we could not verify your ${label} payment for reservation <strong>${details.bookingNumber}</strong>:</p>
        <table style="width:100%; color:#4b5563; font-size:14px; margin:12px 0;">
          <tr><td style="padding:4px 0;">Amount claimed</td><td align="right"><strong>${peso(details.amount)}</strong></td></tr>
          <tr><td style="padding:4px 0;">Reference provided</td><td align="right">${details.referenceNumber}</td></tr>
        </table>
        ${reasonBlock}
        <p style="color: #4b5563;">The dates have been released. If you already sent this payment or believe this is a mistake, please reply to this email or contact us directly so we can sort it out and rebook you.</p>
        <p style="color: #9ca3af; font-size: 13px;">Sanctuary Coastal Resort · sanctuaryresort.ph</p>
      </div>
    `,
  })
  return { delivered: true }
}

export async function sendAdminNewBookingAlert(details: {
  bookingNumber: string
  guestName: string
  email: string
  phone: string | null
  checkIn: Date
  checkOut: Date
  checkInTime: string
  checkOutTime: string
  roomNames: string[]
  total: number
  balanceDue: number
  paymentMethod: string
}): Promise<{ delivered: boolean }> {
  const transport = getTransport()
  const recipients = adminRecipients()

  if (!transport || recipients.length === 0) {
    console.log(`[mail] admin-new-booking -> ${recipients.join(", ") || "(none)"} (${details.bookingNumber})`)
    return { delivered: false }
  }

  const shortDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  await transport.sendMail({
    from: process.env.SMTP_FROM ?? `Sanctuary Resort <${process.env.SMTP_USER}>`,
    replyTo: process.env.SMTP_USER,
    to: recipients.join(", "),
    subject: `🔔 New reservation - ${details.bookingNumber}`,
    text: `New booking received: ${details.bookingNumber}
Guest: ${details.guestName} (${details.email}${details.phone ? `, ${details.phone}` : ""})
Rooms: ${details.roomNames.join(", ")}
Stay: ${shortDate(details.checkIn)} ${details.checkInTime} to ${shortDate(details.checkOut)} ${details.checkOutTime}
Total: ${peso(details.total)} | Balance due: ${peso(details.balanceDue)}
Payment: ${details.paymentMethod}
Open Admin → Reservations to review.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #3b82f6; border-radius: 12px;">
        <h2 style="margin: 0 0 12px; color: #1e40af;">🔔 New reservation received</h2>
        <table style="width:100%; color:#4b5563; font-size:14px;">
          <tr><td style="padding:4px 0;">Booking</td><td align="right"><strong>${details.bookingNumber}</strong></td></tr>
          <tr><td style="padding:4px 0;">Guest</td><td align="right">${details.guestName}</td></tr>
          <tr><td style="padding:4px 0;">Email</td><td align="right">${details.email}</td></tr>
          <tr><td style="padding:4px 0;">Phone</td><td align="right">${details.phone ?? "—"}</td></tr>
          <tr><td style="padding:4px 0;">Rooms</td><td align="right">${details.roomNames.join(", ")}</td></tr>
          <tr><td style="padding:4px 0;">Check-in</td><td align="right">${shortDate(details.checkIn)} · ${details.checkInTime}</td></tr>
          <tr><td style="padding:4px 0;">Check-out</td><td align="right">${shortDate(details.checkOut)} · ${details.checkOutTime}</td></tr>
          <tr><td style="padding:4px 0;">Total</td><td align="right"><strong>${peso(details.total)}</strong></td></tr>
          <tr><td style="padding:4px 0;">Balance due</td><td align="right"><strong>${peso(details.balanceDue)}</strong></td></tr>
          <tr><td style="padding:4px 0;">Payment method</td><td align="right">${details.paymentMethod}</td></tr>
        </table>
        <p style="color:#4b5563; margin-top:16px;">Open <strong>Admin → Reservations</strong> to review and manage this booking.</p>
      </div>
    `,
  })
  return { delivered: true }
}

export async function sendAdminCheckInAlert(details: {
  bookingNumber: string
  guestName: string
  email: string
  phone: string | null
  checkIn: Date
  checkOut: Date
  roomNames: string[]
  checkInTime: string
}): Promise<{ delivered: boolean }> {
  const transport = getTransport()
  const recipients = adminRecipients()

  if (!transport || recipients.length === 0) {
    console.log(`[mail] admin-checkin -> ${recipients.join(", ") || "(none)"} (${details.bookingNumber})`)
    return { delivered: false }
  }

  const shortDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  await transport.sendMail({
    from: process.env.SMTP_FROM ?? `Sanctuary Resort <${process.env.SMTP_USER}>`,
    replyTo: process.env.SMTP_USER,
    to: recipients.join(", "),
    subject: `🚪 Guest checked in - ${details.bookingNumber}`,
    text: `Guest checked in: ${details.bookingNumber}
Guest: ${details.guestName} (${details.email}${details.phone ? `, ${details.phone}` : ""})
Rooms: ${details.roomNames.join(", ")}
Check-in: ${shortDate(details.checkIn)} at ${details.checkInTime}
Check-out: ${shortDate(details.checkOut)}
Open Admin → Check-in to verify.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #10b981; border-radius: 12px;">
        <h2 style="margin: 0 0 12px; color: #047857;">🚪 Guest checked in</h2>
        <table style="width:100%; color:#4b5563; font-size:14px;">
          <tr><td style="padding:4px 0;">Booking</td><td align="right"><strong>${details.bookingNumber}</strong></td></tr>
          <tr><td style="padding:4px 0;">Guest</td><td align="right">${details.guestName}</td></tr>
          <tr><td style="padding:4px 0;">Email</td><td align="right">${details.email}</td></tr>
          <tr><td style="padding:4px 0;">Phone</td><td align="right">${details.phone ?? "—"}</td></tr>
          <tr><td style="padding:4px 0;">Rooms</td><td align="right">${details.roomNames.join(", ")}</td></tr>
          <tr><td style="padding:4px 0;">Check-in time</td><td align="right">${shortDate(details.checkIn)} · ${details.checkInTime}</td></tr>
          <tr><td style="padding:4px 0;">Check-out</td><td align="right">${shortDate(details.checkOut)}</td></tr>
        </table>
        <p style="color:#4b5563; margin-top:16px;">Open <strong>Admin → Check-in</strong> to verify guest arrival.</p>
      </div>
    `,
  })
  return { delivered: true }
}

export async function sendAdminCancellationAlert(details: {
  bookingNumber: string
  guestName: string
  email: string
  reason: string
}): Promise<{ delivered: boolean }> {
  const transport = getTransport()
  const recipients = adminRecipients()

  if (!transport || recipients.length === 0) {
    console.log(`[mail] admin-cancellation -> ${recipients.join(", ") || "(none)"} (${details.bookingNumber})`)
    return { delivered: false }
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM ?? `Sanctuary Resort <${process.env.SMTP_USER}>`,
    replyTo: process.env.SMTP_USER,
    to: recipients.join(", "),
    subject: `⚠️ Booking cancelled - ${details.bookingNumber}`,
    text: `Booking cancelled: ${details.bookingNumber}
Guest: ${details.guestName} (${details.email})
Reason: ${details.reason}
Open Admin → Reservations to review.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #ef4444; border-radius: 12px;">
        <h2 style="margin: 0 0 12px; color: #b91c1c;">⚠️ Booking cancelled</h2>
        <table style="width:100%; color:#4b5563; font-size:14px;">
          <tr><td style="padding:4px 0;">Booking</td><td align="right"><strong>${details.bookingNumber}</strong></td></tr>
          <tr><td style="padding:4px 0;">Guest</td><td align="right">${details.guestName}</td></tr>
          <tr><td style="padding:4px 0;">Email</td><td align="right">${details.email}</td></tr>
          <tr><td style="padding:4px 0;">Reason</td><td align="right">${details.reason}</td></tr>
        </table>
        <p style="color:#4b5563; margin-top:16px;">Open <strong>Admin → Reservations</strong> to review.</p>
      </div>
    `,
  })
  return { delivered: true }
}

export async function sendAdminPaymentVerificationAlert(details: {
  bookingNumber: string
  guestName: string
  email: string
  amount: number
  referenceNumber: string
  methodLabel: string
}): Promise<{ delivered: boolean }> {
  const transport = getTransport()
  const recipients = adminRecipients()

  if (!transport || recipients.length === 0) {
    console.log(`[mail] admin-payment-verify -> ${recipients.join(", ") || "(none)"} (${details.bookingNumber})`)
    return { delivered: false }
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM ?? `Sanctuary Resort <${process.env.SMTP_USER}>`,
    replyTo: process.env.SMTP_USER,
    to: recipients.join(", "),
    subject: `💳 Payment awaiting verification - ${details.bookingNumber}`,
    text: `New payment needs verification: ${details.bookingNumber}
Guest: ${details.guestName} (${details.email})
Amount: ${peso(details.amount)}
Reference: ${details.referenceNumber}
Method: ${details.methodLabel}
Open Admin → Reservations to verify.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #f59e0b; border-radius: 12px;">
        <h2 style="margin: 0 0 12px; color: #b45309;">💳 Payment awaiting verification</h2>
        <table style="width:100%; color:#4b5563; font-size:14px;">
          <tr><td style="padding:4px 0;">Booking</td><td align="right"><strong>${details.bookingNumber}</strong></td></tr>
          <tr><td style="padding:4px 0;">Guest</td><td align="right">${details.guestName}</td></tr>
          <tr><td style="padding:4px 0;">Email</td><td align="right">${details.email}</td></tr>
          <tr><td style="padding:4px 0;">Amount</td><td align="right"><strong>${peso(details.amount)}</strong></td></tr>
          <tr><td style="padding:4px 0;">Reference</td><td align="right"><strong>${details.referenceNumber}</strong></td></tr>
          <tr><td style="padding:4px 0;">Method</td><td align="right">${details.methodLabel}</td></tr>
        </table>
        <p style="color:#4b5563; margin-top:16px;">Open <strong>Admin → Reservations</strong> and click "Confirm payment" after verifying the ${details.methodLabel} transaction.</p>
      </div>
    `,
  })
  return { delivered: true }
}

export async function sendAdminDailySummary(summary: {
  date: string
  newBookings: number
  checkIns: number
  checkOuts: number
  pendingPayments: number
  totalRevenue: number
}): Promise<{ delivered: boolean }> {
  const transport = getTransport()
  const recipients = adminRecipients()

  if (!transport || recipients.length === 0) {
    console.log(`[mail] admin-daily-summary -> ${recipients.join(", ") || "(none)"}`)
    return { delivered: false }
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM ?? `Sanctuary Resort <${process.env.SMTP_USER}>`,
    replyTo: process.env.SMTP_USER,
    to: recipients.join(", "),
    subject: `📊 Daily summary - ${summary.date}`,
    text: `Daily summary for ${summary.date}
New bookings: ${summary.newBookings}
Check-ins today: ${summary.checkIns}
Check-outs today: ${summary.checkOuts}
Pending payments: ${summary.pendingPayments}
Total revenue: ${peso(summary.totalRevenue)}
Open Admin dashboard for details.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #6366f1; border-radius: 12px;">
        <h2 style="margin: 0 0 12px; color: #312e81;">📊 Daily summary - ${summary.date}</h2>
        <table style="width:100%; color:#4b5563; font-size:14px;">
          <tr><td style="padding:4px 0;">New bookings</td><td align="right"><strong>${summary.newBookings}</strong></td></tr>
          <tr><td style="padding:4px 0;">Check-ins today</td><td align="right"><strong>${summary.checkIns}</strong></td></tr>
          <tr><td style="padding:4px 0;">Check-outs today</td><td align="right"><strong>${summary.checkOuts}</strong></td></tr>
          <tr><td style="padding:4px 0;">Pending payments</td><td align="right"><strong>${summary.pendingPayments}</strong></td></tr>
          <tr><td style="padding:4px 0;">Total revenue</td><td align="right"><strong>${peso(summary.totalRevenue)}</strong></td></tr>
        </table>
        <p style="color:#4b5563; margin-top:16px;">Open <strong>Admin Dashboard</strong> for full details.</p>
      </div>
    `,
  })
  return { delivered: true }
}

export async function sendBookingConfirmedEmail(
  to: string,
  details: {
    guestName: string
    bookingNumber: string
    checkIn: Date
    checkOut: Date
    checkInTime: string
    checkOutTime: string
    roomNames: string[]
    nights: number
    amount: number
    transactionId: string
    bookingFee?: number
    balanceDue?: number
    methodLabel?: string
  },
  attachment?: { filename: string; content: ArrayBuffer },
): Promise<{ delivered: boolean }> {
  const transport = getTransport()
  const firstName = details.guestName.split(" ")[0]
  const paymentSplit =
    details.balanceDue !== undefined && details.balanceDue > 0
      ? `<tr><td style="padding:4px 0;">Paid now (booking fee)</td><td align="right">${peso(details.bookingFee ?? 0)}</td></tr>
         <tr><td style="padding:4px 0;"><strong>Due at check-in</strong></td><td align="right"><strong>${peso(details.balanceDue)}</strong></td></tr>`
      : ""

  if (!transport) {
    console.log(`[mail] booking-confirmed -> ${to} (${details.bookingNumber}) attachment=${attachment?.filename ?? "none"}`)
    return { delivered: false }
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM ?? `Sanctuary Resort <${process.env.SMTP_USER}>`,
    replyTo: process.env.SMTP_USER,
    to,
    subject: `Your Sanctuary stay is confirmed · ${details.bookingNumber}`,
    text: `Hi ${firstName}, your payment was verified and booking ${details.bookingNumber} is CONFIRMED. ${details.roomNames.join(" + ")}, ${longDate(details.checkIn)} (${details.checkInTime}) to ${longDate(details.checkOut)} (${details.checkOutTime}), ${details.nights} night(s). Total paid: ${peso(details.amount)} (Ref: ${details.transactionId}). Your official receipt is attached. See you at Sanctuary!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #10b981; border-radius: 12px;">
        <h2 style="margin: 0 0 12px; color: #047857;">✔ Payment verified — you're confirmed!</h2>
        <p style="color: #4b5563;">Hi ${firstName}, great news! We verified your ${details.methodLabel ?? "GCash"} payment and your reservation is officially confirmed.</p>
        <table style="width:100%; color:#4b5563; font-size:14px; margin:12px 0;">
          <tr><td style="padding:4px 0;">Booking</td><td align="right"><strong>${details.bookingNumber}</strong></td></tr>
          <tr><td style="padding:4px 0;">Accommodation</td><td align="right"><strong>${details.roomNames.join(" + ")}</strong></td></tr>
          <tr><td style="padding:4px 0;">Check-in</td><td align="right">${longDate(details.checkIn)} · ${details.checkInTime}</td></tr>
          <tr><td style="padding:4px 0;">Check-out</td><td align="right">${longDate(details.checkOut)} · ${details.checkOutTime}</td></tr>
          <tr><td style="padding:4px 0;">Total paid</td><td align="right"><strong>${peso(details.amount)}</strong></td></tr>
          ${paymentSplit}
          <tr><td style="padding:4px 0;">${details.methodLabel ?? "GCash"} reference</td><td align="right">${details.transactionId}</td></tr>
        </table>
        <p style="color: #4b5563;">📎 Your official <strong>Booking Receipt</strong> is attached to this email — keep it for your records and present your booking number at the concierge desk on arrival.</p>
        <p style="color: #9ca3af; font-size: 13px;">Sanctuary Coastal Resort · sanctuaryresort.ph</p>
      </div>
    `,
    attachments: attachment
      ? [{ filename: attachment.filename, content: Buffer.from(attachment.content), contentType: "application/pdf" }]
      : undefined,
  })
  return { delivered: true }
}