import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const payment = await prisma.payment.findUnique({
    where: { bookingId: id },
    select: { proofImage: true },
  })

  const dataUrl = payment?.proofImage
  if (!dataUrl) {
    return new Response("Not found", { status: 404 })
  }

  const match = dataUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+)$/)
  if (!match) {
    return new Response("Invalid image", { status: 415 })
  }

  const buffer = Buffer.from(match[2], "base64")
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": match[1],
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, max-age=300",
    },
  })
}