import "dotenv/config"
import { prisma } from "../lib/prisma"

const PHPMap: Record<string, number> = {
  "sandbar-studio": 2800,
  "palm-grove-room": 3200,
  "garden-room": 3500,
  "zen-retreat": 3700,
  "ocean-breeze-room": 4200,
  "sunset-loft": 4800,
  "coral-suite": 5500,
  "family-studio": 6200,
  "beachside-cottage": 6800,
  "poolside-suite": 7500,
  "driftwood-cottage": 7900,
  "horizon-terrace": 10500,
  "sunrise-villa": 11500,
}

async function main() {
  for (const [slug, price] of Object.entries(PHPMap)) {
    const res = await prisma.accommodation.updateMany({
      where: { slug },
      data: { price },
    })
    console.log(slug, `->`, price, res.count)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())