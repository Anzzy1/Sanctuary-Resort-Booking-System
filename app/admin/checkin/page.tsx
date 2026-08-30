import { BedDouble, User, Clock } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { verifyAdmin } from "../actions"
import { Topbar } from "../components/Topbar"
import { CheckInPanel } from "../components/CheckInPanel"

export const dynamic = "force-dynamic"

function toLocaleMoney(value: number): string {
  return `₱${Math.round(value).toLocaleString("en-US")}`
}

export default async function AdminCheckIn() {
  if (!(await verifyAdmin())) {
    notFound()
  }

  const accommodations = await prisma.accommodation.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, category: true, price: true },
  })

  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const todayEnd = new Date(todayStart.getTime() + 86400000)

  // Bookings whose stay covers today (i.e. the guest is physically on-site now)
  const onSite = await prisma.booking.findMany({
    where: {
      status: { in: ["confirmed", "pending"] },
      checkIn: { lt: todayEnd },
      checkOut: { gt: todayStart },
    },
    orderBy: { checkIn: "asc" },
    include: { items: { include: { accommodation: true } } },
  })

  const occupiedCount = onSite.filter((b) => b.status === "confirmed").length
  const awaitingCount = onSite.filter((b) => b.status === "pending").length
  const outstandingBalance = onSite.reduce((sum, b) => sum + b.balanceDue, 0)

  return (
    <>
      <Topbar title="Check-in" eyebrow="Who is on-site right now" />
      <main className="flex flex-1 flex-col gap-6 p-5 lg:p-8">
        <section className="grid grid-cols-2 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-ambient">
            <p className="text-sm text-on-surface-variant">Occupied now</p>
            <p className="mt-3 font-headline-md text-3xl text-primary">{occupiedCount}</p>
            <p className="mt-2 text-xs text-on-surface-variant">{occupiedCount === 1 ? "guest" : "guests"} checked in today</p>
          </div>
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-ambient">
            <p className="text-sm text-on-surface-variant">Awaiting check-in</p>
            <p className="mt-3 font-headline-md text-3xl text-primary">{awaitingCount}</p>
            <p className="mt-2 text-xs text-on-surface-variant">reservations for today</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Occupied now board */}
          <section aria-label="Rooms occupied now" className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 lg:p-6 shadow-ambient">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-xl text-on-surface">Rooms occupied now</h2>
              <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary">
                {onSite.length} on-site
              </span>
            </div>

            {onSite.length === 0 ? (
              <p className="mt-6 text-sm text-on-surface-variant">No guests on-site right now.</p>
            ) : (
              <ol className="mt-5 space-y-3">
                {onSite.map((booking) => {
                  const occupied = booking.status === "confirmed"
                  return (
                    <li key={booking.id} className="flex items-center justify-between gap-3 rounded-xl border border-outline-variant/30 p-4">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 truncate font-medium text-on-surface">
                          <User className="size-4 shrink-0 text-secondary" />
                          {booking.guestName}
                        </p>
                        <p className="mt-1 flex items-center gap-2 truncate text-sm text-on-surface-variant">
                          <BedDouble className="size-4 shrink-0 text-secondary" />
                          {booking.items.map((item) => item.accommodation.name).join(" + ")}
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-xs text-on-surface-variant">
                          <Clock className="size-3.5 shrink-0 text-secondary" />
                          In {booking.checkInTime} · until {booking.checkOutTime}{" "}
                          {booking.checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            occupied ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {occupied ? "Occupied" : "Awaiting"}
                        </span>
                        {booking.balanceDue > 0 && (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              occupied ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
                            }`}
                            title={occupied ? "Collect this balance from the guest" : "Collect this balance upon check-in"}
                          >
                            Collect {toLocaleMoney(booking.balanceDue)}
                          </span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </section>

          {/* Check-in panel */}
          <section aria-label="Check in a guest" className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 lg:p-6 shadow-ambient">
            <div className="mb-5">
              <h2 className="font-headline-md text-xl text-on-surface">Check in a guest</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Scan the receipt QR, enter the receipt number, or check in a walk-in guest.
              </p>
            </div>
            <CheckInPanel accommodations={accommodations} />
          </section>
        </div>

        {onSite.length > 0 && (
          <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 lg:p-6 shadow-ambient">
            <h2 className="font-headline-md text-xl text-on-surface">Today&apos;s on-site value</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Confirmed guests currently in-house: <span className="font-medium text-on-surface">{toLocaleMoney(onSite.filter((b) => b.status === "confirmed").reduce((s, b) => s + b.total, 0))}</span>{" "}
              in confirmed reservations.
            </p>
            {outstandingBalance > 0 && (
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                💰 <span className="font-bold">{toLocaleMoney(outstandingBalance)}</span> in balances still to collect
                from guests on-site today.
              </p>
            )}
          </section>
        )}
      </main>
    </>
  )
}