import "dotenv/config"
import { prisma } from "../lib/prisma"
import { Pool } from "pg"
async function main(){
  const s=Date.now()
  const r=await prisma.accommodation.findMany({where:{slug:{in:['garden-room']}}})
  console.log('prisma findMany:',Date.now()-s,'ms rows:',r.length)
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 })
  const s2=Date.now()
  const r2=await pool.query('SELECT 1 as one')
  console.log('pg direct:',Date.now()-s2,'ms',r2.rows[0])
  await pool.end()
  await prisma.$disconnect()
  process.exit(0)
}
main().catch(e=>{console.error('ERR:',e.message);process.exit(1)})
