import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/otp"

export async function POST() {
  const admin = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await prisma.notification.updateMany({
    where: { read: false },
    data: { read: true },
  })

  return NextResponse.json({ success: true })
}