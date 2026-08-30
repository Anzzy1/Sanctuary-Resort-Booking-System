import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"
import { rooms } from "../lib/rooms"

const categoryBySlug: Record<string, "room" | "cottage" | "villa"> = {
  "beachside-cottage": "cottage",
  "garden-room": "room",
  "poolside-suite": "cottage",
  "family-studio": "room",
  "ocean-breeze-room": "room",
  "sunrise-villa": "villa",
  "sunset-loft": "room",
  "palm-grove-room": "room",
  "coral-suite": "room",
  "zen-retreat": "room",
  "horizon-terrace": "villa",
  "sandbar-studio": "room",
  "driftwood-cottage": "cottage",
}

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  })
  const prisma = new PrismaClient({ adapter })

  try {
    for (const room of rooms) {
      const category = categoryBySlug[room.slug] ?? "room"

      await prisma.accommodation.upsert({
        where: { slug: room.slug },
        update: {
          name: room.name,
          category,
          price: room.price,
          location: room.location,
          guests: room.guests,
          bedrooms: room.bedrooms,
          rating: room.rating,
          reviews: room.reviews,
          image: room.image,
          gallery: room.gallery,
          alt: room.alt,
          about: room.about,
          highlights: room.highlights,
          cleaningFee: room.cleaningFee,
          resortFee: room.resortFee,
          badge: room.badge ?? null,
        },
        create: {
          slug: room.slug,
          name: room.name,
          category,
          price: room.price,
          location: room.location,
          guests: room.guests,
          bedrooms: room.bedrooms,
          rating: room.rating,
          reviews: room.reviews,
          image: room.image,
          gallery: room.gallery,
          alt: room.alt,
          about: room.about,
          highlights: room.highlights,
          cleaningFee: room.cleaningFee,
          resortFee: room.resortFee,
          badge: room.badge ?? null,
        },
      })
    }

    const count = await prisma.accommodation.count()
    console.log(`Seeded ${count} accommodations.`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
