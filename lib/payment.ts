export const PAYMENT_METHODS = ["mastercard", "visa", "gcash", "maya"] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  mastercard: "Mastercard",
  visa: "Visa",
  gcash: "GCash",
  maya: "Maya",
  paypal: "PayPal",
}

/** E-wallets that use the real-QR + reference-number verification flow. */
export const EWALLET_METHODS = ["gcash", "maya"] as const
export type EwalletMethod = (typeof EWALLET_METHODS)[number]

export function generateTransactionId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"
  const rand = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `SAN-${rand(6)}`
}

export function luhnCheck(digits: string): boolean {
  if (!/^\d{12,19}$/.test(digits)) return false
  let sum = 0
  let double = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i])
    if (double) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
    double = !double
  }
  return sum % 10 === 0
}

export function detectCardBrand(number: string): "visa" | "mastercard" | null {
  const digits = number.replace(/\s+/g, "")
  if (/^4/.test(digits)) return "visa"
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard"
  return null
}

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16)
  return digits.replace(/(.{4})/g, "$1 ").trim()
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export function isValidExpiry(value: string): boolean {
  const match = value.match(/^(\d{2})\/(\d{2})$/)
  if (!match) return false
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  if (month < 1 || month > 12) return false
  const now = new Date()
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)
}

export function isValidGcashReference(value: string): boolean {
  return /^[A-Za-z0-9]{6,20}$/.test(value.trim())
}