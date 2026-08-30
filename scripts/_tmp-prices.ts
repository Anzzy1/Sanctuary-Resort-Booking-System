import "dotenv/config"
import { prisma } from "../lib/prisma"
async function main() {
  const accs = await prisma.accommodation.findMany({ select: { slug: true, name: true, category: true, price: true, units: true }, orderBy: { price: "asc" } })
  console.log(JSON.stringify(accs, null, 2))
}
main().finally(() => prisma.$disconnect())
