import { NextResponse } from "next/server"
import { getUnreadCount } from "@/lib/notifications"
import { verifyAdmin } from "@/lib/otp"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

export async function GET(request: Request) {
  const admin = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const rl = rateLimit(`notif-count:${getClientIp(request)}:${admin}`, 60, 60_000)
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  const count = await getUnreadCount()
  return NextResponse.json({ count })
}