import "dotenv/config"
import { prisma } from "../lib/prisma"
async function main(){
  const s=Date.now()
  const r=await prisma.accommodation.findMany({where:{slug:{in:['garden-room']}}})
  console.log('findMany',Date.now()-s,'ms',r.length)
  await prisma.$disconnect()
}
main()
