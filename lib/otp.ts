import { createHash, createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

const AUTH_SECRET = () => process.env.AUTH_SECRET ?? "insecure-dev-secret"

const COOKIE_NAME = "admin_auth"
const SESSION_MAX_AGE = 60 * 60 * 8
const OTP_TTL_MS = 10 * 60 * 1000
const OTP_MAX_ATTEMPTS = 5

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function hashOtp(code: string): string {
  return createHash("sha256").update(`${code}:${AUTH_SECRET()}`).digest("hex")
}

export function otpMatches(code: string, hash: string): boolean {
  const candidate = Buffer.from(hashOtp(code))
  const stored = Buffer.from(hash)
  if (candidate.length !== stored.length) return false
  return timingSafeEqual(candidate, stored)
}

export function signSessionToken(email: string): string {
  const payload = Buffer.from(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE })).toString(
    "base64url",
  )
  const sig = createHmac("sha256", AUTH_SECRET()).update(payload).digest("base64url")
  return `${payload}.${sig}`
}

export function verifySessionToken(token: string): string | null {
  const [payload, sig] = token.split(".")
  if (!payload || !sig) return null
  const expected = createHmac("sha256", AUTH_SECRET()).update(payload).digest("base64url")
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email: string; exp: number }
    if (!parsed.email || parsed.exp < Math.floor(Date.now() / 1000)) return null
    return parsed.email
  } catch {
    return null
  }
}

export function adminSessionCookieOptions(): {
  httpOnly: boolean
  sameSite: "lax"
  path: string
  maxAge: number
} {
  return { httpOnly: true, sameSite: "lax", path: "/", maxAge: SESSION_MAX_AGE }
}

export async function verifyAdmin(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export { COOKIE_NAME, OTP_TTL_MS, OTP_MAX_ATTEMPTS }