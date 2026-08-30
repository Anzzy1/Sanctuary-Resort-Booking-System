import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { buildReceiptForBooking } from "@/lib/receipt-pdf"

export const dynamic = "force-dynamic"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      items: { include: { accommodation: true } },
      payment: true,
    },
  })

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 })
  }

  const { pdf, filename } = buildReceiptForBooking(booking)

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
