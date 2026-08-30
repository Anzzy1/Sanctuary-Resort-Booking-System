const buckets = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const b = buckets.get(key)
  if (!b || now > b.resetAt) {
    const resetAt = now + windowMs
    buckets.set(key, { count: 1, resetAt })
    return { ok: true, remaining: limit - 1, resetAt }
  }
  if (b.count >= limit) return { ok: false, remaining: 0, resetAt: b.resetAt }
  b.count++
  return { ok: true, remaining: limit - b.count, resetAt: b.resetAt }
}

export function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for")
  if (fwd) return fwd.split(",")[0].trim()
  return request.headers.get("x-real-ip") ?? "unknown"
}
