import { MapPin, Users, Moon } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import type { Prisma } from "@/src/generated/prisma/client"
import { verifyAdmin } from "../actions"
import { Topbar } from "../components/Topbar"
import { ReservationActions } from "../components/ReservationActions"
import { ReservationFilters } from "../components/ReservationFilters"
import { PaginationBar } from "../components/PaginationBar"

export const dynamic = "force-dynamic"

const PAGE_SIZE = 5

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function toLocaleMoney(value: number): string {
  return `₱${Math.round(value).toLocaleString("en-US")}`
}

const statusStyles: Record<string, string> = {
  pending: "bg-tertiary/10 text-tertiary",
  cancelled: "bg-rose-100 text-rose-700",
}

const statusLabel: Record<string, string> = {
  pending: "Pending",
  cancelled: "Cancelled",
}

export default async function AdminBookings({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; guest?: string; room?: string; status?: string; date?: string; page?: string }>
}) {
  if (!(await verifyAdmin())) {
    notFound()
  }

  const params = await searchParams
  const query = params.q?.trim()
  const guest = params.guest?.trim()
  const room = params.room?.trim()
  const statusFilter = params.status?.trim()
  const date = params.date?.trim()

  const statusWhere: Prisma.BookingWhereInput["status"] =
    statusFilter === "pending" || statusFilter === "cancelled"
      ? statusFilter
      : { in: ["pending", "cancelled"] }

  const dateWhere = date
    ? (() => {
        const start = new Date(`${date}T00:00:00`)
        const end = new Date(start.getTime() + 86400000)
        return { checkIn: { gte: start, lt: end } }
      })()
    : {}

  const where: Prisma.BookingWhereInput = {
    status: statusWhere,
    ...(query ? { bookingNumber: { contains: query, mode: "insensitive" } } : {}),
    ...(guest ? { guestName: { contains: guest, mode: "insensitive" } } : {}),
    ...(room ? { items: { some: { accommodation: { name: { contains: room, mode: "insensitive" } } } } } : {}),
    ...dateWhere,
  }

  const total = await prisma.booking.count({ where })
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  let pageNum = Math.max(1, parseInt(params.page ?? "1", 10) || 1)
  if (pageNum > totalPages) pageNum = totalPages

  // Reservations only — pending reservations reserve a slot (not yet occupied);
  // checked-in (confirmed) guests and check-outs are managed under Guests.
  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (pageNum - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      items: { include: { accommodation: true } },
      payment: true,
    },
  })

  const statsRows = await prisma.booking.findMany({
    where: { status: { in: ["pending", "cancelled"] } },
    select: { status: true, total: true },
  })
  const pendingCount = statsRows.filter((b) => b.status === "pending").length
  const cancelledCount = statsRows.filter((b) => b.status === "cancelled").length
  const revenue = statsRows.reduce((s, b) => s + b.total, 0)

  const stats = [
    { label: "Pending", value: String(pendingCount), note: "slot reserved, awaiting check-in" },
    { label: "Cancelled", value: String(cancelledCount), note: "reservations cancelled" },
    { label: "Reservations", value: String(pendingCount + cancelledCount), note: "pending + cancelled" },
    { label: "Total value", value: toLocaleMoney(revenue), note: "reservation totals" },
  ]

  const hasFilters = Boolean(query || guest || room || statusFilter || date)
  const pageUrlBase: Record<string, string> = {
    ...(query ? { q: query } : {}),
    ...(guest ? { guest } : {}),
    ...(room ? { room } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(date ? { date } : {}),
  }

  return (
    <>
      <Topbar title="Reservations" eyebrow="Booking management" />
      <main className="flex flex-1 flex-col gap-6 p-5 lg:p-8">
        <section aria-label="Booking metrics" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-ambient">
              <p className="text-sm text-on-surface-variant">{stat.label}</p>
              <p className="mt-3 font-headline-md text-3xl text-primary">{stat.value}</p>
              <p className="mt-2 text-xs text-on-surface-variant">{stat.note}</p>
            </div>
          ))}
        </section>

        <section aria-label="Reservations list" className="space-y-4">
          <ReservationFilters
            filters={{ q: query ?? "", guest: guest ?? "", room: room ?? "", status: statusFilter ?? "", date: date ?? "" }}
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-on-surface-variant">
              {total} {total === 1 ? "reservation" : "reservations"}
              {hasFilters && <span className="opacity-80"> (filtered)</span>}
              {total > 0 && (
                <span className="ml-1 opacity-80">
                  · showing {(pageNum - 1) * PAGE_SIZE + 1}–{Math.min(pageNum * PAGE_SIZE, total)} · page {pageNum} of {totalPages}
                </span>
              )}
            </p>
          </div>

          {bookings.length === 0 ? (
            <p className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-8 text-sm text-on-surface-variant">
              {hasFilters ? (
                <>No reservations match your filters. Try adjusting them.</>
              ) : (
                <>No reservations yet. Bookings appear here once a guest reserves a slot — checked-in guests are managed under Guests.</>
              )}
            </p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const nights = Math.max(1, Math.round((booking.checkOut.getTime() - booking.checkIn.getTime()) / 86400000))
                const sameDayStay = booking.checkIn.toDateString() === booking.checkOut.toDateString()
                return (
                  <article key={booking.id} className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-ambient lg:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex size-11 items-center justify-center rounded-full bg-secondary-container text-sm font-medium text-on-secondary-container">
                          {initialsOf(booking.guestName)}
                        </span>
                        <div>
                          <p className="font-medium text-on-surface">{booking.guestName}</p>
                          <p className="text-xs text-on-surface-variant">{booking.bookingNumber}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-on-surface-variant">
                        <span>
                          {booking.checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {booking.checkInTime} →{" "}
                          {booking.checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {booking.checkOutTime}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Moon className="size-4" />
                          {sameDayStay ? "Same day (day use)" : `${nights} ${nights === 1 ? "night" : "nights"}`}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="size-4" />
                          {booking.adults + booking.children + booking.infants} guests
                        </span>
                      </div>

                      <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[booking.status]}`}>
                        {statusLabel[booking.status]}
                      </span>
                      {booking.payment?.status === "verifying" && (
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                          <span className="size-1.5 animate-pulse rounded-full bg-amber-500" />
                          GCash verifying
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex flex-col gap-3 border-t border-outline-variant/20 pt-4 text-sm md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        {booking.items.map((item) => (
                          <p key={item.id} className="flex items-center gap-2 text-on-surface-variant">
                            <MapPin className="size-4 text-secondary" />
                            <span className="font-medium text-on-surface">{item.accommodation.name}</span>
                            <span className="text-xs text-on-surface-variant">{sameDayStay ? "day use" : `${item.nights} ${item.nights === 1 ? "night" : "nights"}`}</span>
                          </p>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="text-right">
                          <p className="font-headline-md text-lg text-on-surface">{toLocaleMoney(booking.total)}</p>
                          {booking.payment?.status === "paid" && booking.balanceDue > 0 ? (
                            <p className="text-xs text-on-surface-variant">
                              <span className="font-medium text-secondary">{toLocaleMoney(booking.bookingFee)} paid</span>
                              {" · "}
                              <span className="font-medium text-amber-700">{toLocaleMoney(booking.balanceDue)} due at check-in</span>
                            </p>
                          ) : (
                            <p className="text-xs text-on-surface-variant">
                              {toLocaleMoney(booking.bookingFee)} booking fee · {toLocaleMoney(booking.balanceDue)} due
                            </p>
                          )}
                        </div>
                        <ReservationActions
                          id={booking.id}
                          status={booking.status}
                          bookingNumber={booking.bookingNumber}
                          checkIn={booking.checkIn.toISOString()}
                          checkInTime={booking.checkInTime}
                          guestEmail={booking.email}
                          guestPhone={booking.phone}
                          paymentStatus={booking.payment?.status}
                          paymentMethod={booking.payment?.method}
                          paymentReference={booking.payment?.referenceNumber}
                          paymentSender={booking.payment?.senderName}
                          paymentRejectionReason={booking.payment?.rejectionReason}
                          paymentAmount={booking.total}
                          hasProof={Boolean(booking.payment?.proofImage)}
                        />
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <PaginationBar page={pageNum} totalPages={totalPages} base={pageUrlBase} />
        </section>
      </main>
    </>
  )
}