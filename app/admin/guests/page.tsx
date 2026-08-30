import { BedDouble, User, Clock } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { verifyAdmin } from "../actions"
import { Topbar } from "../components/Topbar"
import { CheckOutButton } from "../components/CheckOutButton"
import { GuestDetailButton, type GuestBookingInfo, type GuestDetail } from "../components/GuestDetailButton"
import { PaginationBar } from "../components/PaginationBar"

export const dynamic = "force-dynamic"

const PAGE_SIZE = 10

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
  "In-house": "bg-secondary/10 text-secondary",
  Past: "bg-surface-container-high text-on-surface-variant",
}

function guestKeyOf(booking: { email: string | null; guestName: string }): string {
  const email = booking.email?.trim().toLowerCase()
  const nameKey = booking.guestName.trim().toLowerCase()
  return email ? `${email}|${nameKey}` : `name:${nameKey}`
}

export default async function AdminGuests({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  if (!(await verifyAdmin())) {
    notFound()
  }

  const { page: pageParam } = await searchParams

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      guestName: true,
      email: true,
      total: true,
      checkIn: true,
      checkOut: true,
      checkInTime: true,
      checkOutTime: true,
      bookingNumber: true,
      status: true,
      adults: true,
      children: true,
      infants: true,
      items: { select: { accommodation: { select: { name: true } } } },
    },
  })

  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const todayEnd = new Date(todayStart.getTime() + 86400000)

  // Checked-in (confirmed) guests whose stay covers today = physically in-house now
  const onSite = bookings
    .filter((b) => b.status === "confirmed" && b.checkIn < todayEnd && b.checkOut > todayStart)
    .sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime())

  type GuestRow = {
    name: string
    email: string
    stays: number
    ltv: number
    lastStay: Date | null
    inHouse: boolean
    detail: GuestDetail
  }

  const byKey = new Map<string, GuestRow>()
  for (const booking of bookings) {
    // Guests = people who actually checked in. Pending reservations have not
    // arrived yet, and cancelled ones were released — neither belongs here.
    if (booking.status !== "confirmed" && booking.status !== "completed") continue
    const key = guestKeyOf(booking)
    const stayEnd = booking.checkOut.getTime()
    const inHouse = booking.status === "confirmed" && booking.checkIn < todayEnd && booking.checkOut > todayStart
    const info: GuestBookingInfo = {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      status: booking.status as GuestBookingInfo["status"],
      checkIn: booking.checkIn.toISOString(),
      checkOut: booking.checkOut.toISOString(),
      checkInTime: booking.checkInTime,
      checkOutTime: booking.checkOutTime,
      nights: Math.max(1, Math.round((booking.checkOut.getTime() - booking.checkIn.getTime()) / 86400000)),
      total: booking.total,
      guests: booking.adults + booking.children + booking.infants,
      accommodations: booking.items.map((item) => item.accommodation.name),
    }
    const existing = byKey.get(key)
    if (existing) {
      existing.stays += 1
      existing.ltv += booking.total
      if (!existing.lastStay || stayEnd > existing.lastStay.getTime()) existing.lastStay = booking.checkOut
      if (inHouse) existing.inHouse = true
      existing.detail.bookings.push(info)
    } else {
      byKey.set(key, {
        name: booking.guestName,
        email: booking.email ?? "",
        stays: 1,
        ltv: booking.total,
        lastStay: booking.checkOut,
        inHouse,
        detail: {
          guestKey: key,
          name: booking.guestName,
          email: booking.email ?? "",
          stays: 1,
          ltv: booking.total,
          bookings: [info],
        },
      })
    }
  }

  const guests = [...byKey.values()].sort((a, b) => b.ltv - a.ltv)

  const guestTotalPages = Math.max(1, Math.ceil(guests.length / PAGE_SIZE))
  let guestPageNum = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)
  if (guestPageNum > guestTotalPages) guestPageNum = guestTotalPages
  const visibleGuests = guests.slice((guestPageNum - 1) * PAGE_SIZE, guestPageNum * PAGE_SIZE)

  return (
    <>
      <Topbar title="Guests" eyebrow="Check-outs and guest directory" />
      <main className="flex flex-1 flex-col gap-6 p-5 lg:p-8">
        <section aria-label="Currently checked in" className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 lg:p-6 shadow-ambient">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-md text-xl text-on-surface">Currently checked in</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Guests occupying rooms now. Click check out and their accommodation becomes available again.
              </p>
            </div>
            <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary">
              {onSite.length} in-house
            </span>
          </div>

          {onSite.length === 0 ? (
            <p className="mt-6 text-sm text-on-surface-variant">No guests checked in right now.</p>
          ) : (
            <ol className="mt-5 space-y-3">
              {onSite.map((booking) => {
                const row = byKey.get(guestKeyOf(booking))
                const body = (
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate font-medium text-on-surface">
                      <User className="size-4 shrink-0 text-secondary" />
                      {booking.guestName}
                    </p>
                    <p className="mt-1 flex items-center gap-2 truncate text-sm text-on-surface-variant">
                      <BedDouble className="size-4 shrink-0 text-secondary" />
                      {booking.items.map((item) => item.accommodation.name).join(" + ")} · {booking.bookingNumber}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-on-surface-variant">
                      <Clock className="size-3.5 shrink-0 text-secondary" />
                      In {booking.checkInTime} · until {booking.checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric" })} {booking.checkOutTime}
                    </p>
                  </div>
                )
                return (
                  <li key={booking.id} className="flex items-center justify-between gap-3 rounded-xl border border-outline-variant/30 p-4">
                    {row ? <GuestDetailButton guest={row.detail}>{body}</GuestDetailButton> : body}
                    <CheckOutButton id={booking.id} />
                  </li>
                )
              })}
            </ol>
          )}
        </section>

        <section aria-label="Guest directory" className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-ambient">
          <div className="flex items-center justify-between p-5 lg:p-6">
            <div>
              <h2 className="font-headline-md text-xl text-on-surface">Guest directory</h2>
              <p className="mt-1 text-sm text-on-surface-variant">Checked-in guests only · stays and lifetime value — click a guest for their history</p>
            </div>
            <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-xs font-medium text-on-surface-variant">
              {guests.length} {guests.length === 1 ? "guest" : "guests"}
            </span>
          </div>

          {guests.length === 0 ? (
              <p className="px-6 pb-8 text-sm text-on-surface-variant">No checked-in guests yet. Guests appear here once they have actually checked in.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-y border-outline-variant/30 text-left text-xs uppercase tracking-wide text-on-surface-variant">
                    <th className="px-6 py-3 font-medium">Guest</th>
                    <th className="px-6 py-3 font-medium">Stays</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 text-right font-medium">Lifetime value</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleGuests.map((g) => {
                    const status = g.inHouse ? "In-house" : "Past"
                    return (
                      <tr key={g.email + "|" + g.name} className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low/60">
                        <td className="px-6 py-4">
                          <GuestDetailButton guest={g.detail}>
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary-container text-xs font-medium text-on-secondary-container">
                              {initialsOf(g.name)}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-on-surface">{g.name}</span>
                              <span className="block truncate text-xs text-on-surface-variant">
                                Last stay {g.lastStay ? g.lastStay.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                              </span>
                            </span>
                          </GuestDetailButton>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">{g.stays}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}>{status}</span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-on-surface">{toLocaleMoney(g.ltv)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {guests.length > 0 && (
            <div className="px-6 pb-6">
              <PaginationBar page={guestPageNum} totalPages={guestTotalPages} base={{}} basePath="/admin/guests" />
            </div>
          )}
        </section>
      </main>
    </>
  )
}