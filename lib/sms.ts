let cachedConfig: { apiKey: string; sender: string } | null | undefined

function getSmsConfig(): { apiKey: string; sender: string } | null {
  if (cachedConfig !== undefined) return cachedConfig
  const apiKey = process.env.SEMAPHORE_API_KEY ?? process.env.SMS_API_KEY ?? ""
  const sender = process.env.SMS_SENDER_NAME ?? process.env.SEMAPHORE_SENDER ?? "Sanctuary"
  if (!apiKey) {
    cachedConfig = null
    return cachedConfig
  }
  cachedConfig = { apiKey, sender }
  return cachedConfig
}

function normalizePhNumber(raw: string): string | null {
  let digits = raw.replace(/\D/g, "")
  if (!digits) return null
  if (digits.startsWith("0")) digits = `63${digits.slice(1)}`
  else if (digits.length === 10 && digits.startsWith("9")) digits = `63${digits}`
  return /^639\d{9}$/.test(digits) ? digits : null
}

export async function sendSms(to: string, message: string): Promise<{ delivered: boolean }> {
  const config = getSmsConfig()
  const normalized = normalizePhNumber(to)

  if (!normalized) {
    console.log(`[sms] skip - invalid number: ${to}`)
    return { delivered: false }
  }

  if (!config) {
    console.log(`[sms] (dev mode, SMS not configured) -> ${normalized}: ${message.slice(0, 80)}`)
    return { delivered: true }
  }

  try {
    const res = await fetch("https://api.semaphore.co/api/v4/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: config.apiKey,
        number: normalized,
        message,
        sendername: config.sender,
      }),
    })
    const data = (await res.json().catch(() => null)) as { status?: string } | null
    if (!res.ok) {
      console.error("[sms] Semaphore error:", res.status, data)
      return { delivered: false }
    }
    return { delivered: true }
  } catch (error) {
    console.error("[sms] send failed:", error)
    return { delivered: false }
  }
}

export function bookingConfirmedSms(bookingNumber: string, email: string): string {
  return `Sanctuary Resort: Your booking ${bookingNumber} is CONFIRMED! Your QR code was sent to ${email} — show it at check-in for easy entry. See you soon!`
}

export function bookingRejectedSms(bookingNumber: string, reason?: string | null): string {
  const reasonPart = reason?.trim() ? ` Reason: ${reason.trim()}` : ""
  return `Sanctuary Resort: Your booking ${bookingNumber} could not be verified.${reasonPart} Please check your email for details or contact us.`
}
