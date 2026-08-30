import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const PENDING_TTL_HOURS = Number(process.env.PENDING_EXPIRY_HOURS ?? "24")

export async function GET(request: Request) {
  const auth = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    const url = new URL(request.url)
    if (url.searchParams.get("secret") !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const cutoff = new Date(Date.now() - PENDING_TTL_HOURS * 60 * 60 * 1000)

  const expired = await prisma.booking.findMany({
    where: {
      status: "pending",
      createdAt: { lt: cutoff },
      payment: { is: { status: { in: ["pending"] } } },
    },
    select: { id: true, bookingNumber: true },
    take: 100,
  })

  if (expired.length === 0) {
    return NextResponse.json({ ok: true, expired: 0, ttlHours: PENDING_TTL_HOURS })
  }

  const ids = expired.map((b) => b.id)
  const result = await prisma.$transaction([
    prisma.payment.updateMany({ where: { bookingId: { in: ids }, status: "pending" }, data: { status: "failed", rejectionReason: "Expired — unpaid beyond 24h" } }),
    prisma.booking.updateMany({ where: { id: { in: ids } }, data: { status: "cancelled" } }),
  ])

  for (const b of expired) {
    try {
      await prisma.notification.create({
        data: { type: "payment_failed", title: "Booking expired (unpaid)", message: `${b.bookingNumber} auto-cancelled after ${PENDING_TTL_HOURS}h unpaid`, bookingId: b.id },
      })
    } catch {}
  }

  return NextResponse.json({ ok: true, expired: expired.length, updated: result[1].count, ttlHours: PENDING_TTL_HOURS })
}
