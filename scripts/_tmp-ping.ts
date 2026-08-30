import "dotenv/config"
import { prisma } from "../lib/prisma"
async function main(){
  const s=Date.now()
  const r=await prisma.$queryRawUnsafe(`SELECT 1 as one`)
  console.log('select1',Date.now()-s,'ms',r)
  await prisma.$disconnect()
}
main()
