import "dotenv/config"
import { prisma } from "../lib/prisma"

async function main() {
  const total = await prisma.booking.count()
  const byStatus = await prisma.booking.groupBy({ by: ["status"], _count: true })
  console.log("total bookings:", total)
  console.log(JSON.stringify(byStatus.map((s) => ({ status: s.status, count: s._count }))))
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())