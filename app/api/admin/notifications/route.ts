import { NextResponse } from "next/server"
import { getNotifications, getUnreadCount } from "@/lib/notifications"
import { verifyAdmin } from "@/lib/otp"
import { prisma } from "@/lib/prisma"
import { isCheckInAllowed, scheduledCheckOutMillis } from "@/lib/booking-time"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

export async function GET(request: Request) {
  const admin = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const rl = rateLimit(`notif:${getClientIp(request)}:${admin}`, 30, 60_000)
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } })

  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get("limit") ?? "20")

  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const candidates = await prisma.booking.findMany({
      where: {
        status: { in: ["pending", "confirmed"] },
        checkIn: { gte: new Date(today.getTime() - 24 * 60 * 60 * 1000), lte: tomorrow },
      },
      select: { id: true, bookingNumber: true, guestName: true, checkIn: true, checkOut: true, checkInTime: true, checkOutTime: true },
      take: 20,
      orderBy: { checkIn: "asc" },
    })
    const open = candidates.filter(
      (b) => isCheckInAllowed(b.checkIn, b.checkInTime, now) && scheduledCheckOutMillis(b.checkOut, b.checkOutTime) > now.getTime(),
    )
    for (const b of open) {
      const recent = await prisma.notification.findFirst({
        where: { bookingId: b.id, type: "open_checkin", createdAt: { gte: new Date(Date.now() - 12 * 60 * 60 * 1000) } },
      })
      if (!recent) {
        await prisma.notification.create({
          data: {
            type: "open_checkin",
            title: "Ready to check in",
            message: `${b.guestName} — ${b.bookingNumber} is now open for check-in (${b.checkInTime} today)`,
            bookingId: b.id,
          },
        })
      }
    }
  } catch {}

  const [notifications, count] = await Promise.all([getNotifications(limit), getUnreadCount()])

  return NextResponse.json({ notifications, unreadCount: count })
}