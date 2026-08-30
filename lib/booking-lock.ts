import { prisma } from "@/lib/prisma"
import { Prisma, type PrismaClient } from "@/src/generated/prisma/client"

export type Db = PrismaClient | Prisma.TransactionClient

const LOCK_ATTEMPTS = 3
// Fail each lock attempt after 8s instead of waiting out Postgres' 2-minute
// statement_timeout when a stale transaction holds the room lock.
const LOCK_TIMEOUT_MS = "8000"

export function isRetryableLockError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return (
    message.includes("57014") ||
    message.includes("55P03") ||
    message.includes("40P01") ||
    message.includes("statement timeout") ||
    message.includes("lock timeout") ||
    message.includes("canceling statement") ||
    message.includes("deadlock detected") ||
    message.includes("Transaction API timed out") ||
    message.includes("Transactions are serializable") ||
    message.includes("write conflict")
  )
}

export async function withBookingLock<T>(roomIds: string[], run: (db: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  const uniqueIds = [...new Set(roomIds)]

  let lastError: unknown
  for (let attempt = 1; attempt <= LOCK_ATTEMPTS; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          await tx.$executeRawUnsafe(`SELECT set_config('lock_timeout', '${LOCK_TIMEOUT_MS}', true)`)
          for (const id of uniqueIds) {
            await (tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`booking:${id}`}))` as Promise<unknown>)
          }
          return run(tx)
        },
        { timeout: 20000, maxWait: 10000 },
      )
    } catch (error) {
      lastError = error
      if (attempt < LOCK_ATTEMPTS && isRetryableLockError(error)) {
        await new Promise((resolve) => setTimeout(resolve, 400 * attempt))
        continue
      }
      throw error
    }
  }
  throw lastError
}