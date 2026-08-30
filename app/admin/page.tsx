import Image from "next/image"
import Link from "next/link"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { verifyAdmin } from "./actions"
import { Topbar } from "./components/Topbar"
import { OccupancyChart } from "./components/dashboard/occupancy-chart"
import { GuestMix } from "./components/dashboard/guest-mix"

export const dynamic = "force-dynamic"

function toLocaleMoney(value: number): string {
  return `₱${Math.round(value).toLocaleString("en-US")}`
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const statusStyles: Record<string, string> = {
  confirmed: "bg-secondary/10 text-secondary",
  completed: "bg-surface-container-high text-on-surface-variant",
  pending: "bg-tertiary/10 text-tertiary",
  cancelled: "bg-surface-container-high text-on-surface-variant",
}

const statusLabel: Record<string, string> = {
  confirmed: "Confirmed",
  completed: "Completed",
  pending: "Pending",
  cancelled: "Cancelled",
}

export default async function AdminDashboard() {
  if (!(await verifyAdmin())) {
    notFound()
  }

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const [
    totalBookings,
    pendingCount,
    monthlyRevenue,
    accommodationCount,
    recentBookings,
    todayArrivals,
    allBookings,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "pending" } }),
    prisma.booking.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: monthStart, lt: monthEnd } },
    }),
    prisma.accommodation.count(),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        items: { include: { accommodation: true } },
      },
    }),
    prisma.booking.findMany({
      where: {
        checkIn: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()), lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) },
      },
      take: 6,
      orderBy: { checkIn: "asc" },
      include: {
        items: { include: { accommodation: true } },
      },
    }),
    prisma.booking.findMany({
      select: { createdAt: true, total: true },
    }),
  ])

  // Revenue bars: last 8 months
  const months: { month: string; occupancy: number; revenue: number; bookings: number }[] = []
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    const monthBookings = allBookings.filter((b) => b.createdAt >= d && b.createdAt < next)
    const monthRevenue = monthBookings.reduce((s, b) => s + b.total, 0)
    const monthCount = monthBookings.length
    months.push({
      month: d.toLocaleDateString("en-US", { month: "short" }),
      occupancy: accommodationCount ? Math.min(100, Math.round((monthCount / accommodationCount) * 100)) : 0,
      revenue: monthRevenue,
      bookings: monthCount,
    })
  }

  const stats = [
    {
      label: "Occupancy",
      value: accommodationCount ? `${Math.min(100, Math.round((totalBookings / accommodationCount) * 100))}%` : "0%",
      delta: "+0%",
      trend: "neutral" as const,
      note: "vs. capacity",
    },
    {
      label: "Revenue (MTD)",
      value: toLocaleMoney(monthlyRevenue._sum.total ?? 0),
      delta: "+0%",
      trend: "neutral" as const,
      note: "this month",
    },
    {
      label: "Total bookings",
      value: String(totalBookings),
      delta: `${pendingCount} pending`,
      trend: pendingCount > 0 ? ("neutral" as const) : ("neutral" as const),
      note: "all time",
    },
    {
      label: "Accommodations",
      value: String(accommodationCount),
      delta: "Ready",
      trend: "neutral" as const,
      note: "rooms, cottages & villas",
    },
  ]

  const trendIcon = { up: TrendingUp, down: TrendingDown, neutral: Minus }

  // Group bookings by accommodation category for guest mix
  const allItems = await prisma.bookingItem.findMany({
    include: { accommodation: true },
  })
  const byCategory = { room: 0, cottage: 0, villa: 0 } as Record<string, number>
  for (const item of allItems) byCategory[item.accommodation.category] = (byCategory[item.accommodation.category] ?? 0) + 1
  const itemTotal = Object.values(byCategory).reduce((s, v) => s + v, 0)
  const mixData = (Object.entries(byCategory) as [string, number][])
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: itemTotal ? Math.round((value / itemTotal) * 100) : 0,
    }))
  if (mixData.length === 0) {
    mixData.push({ name: "Rooms", value: 100 })
  }

  // Availability: booked per type
  const accommodations = await prisma.accommodation.findMany({ orderBy: { name: "asc" } })
  const availability = accommodations.slice(0, 6).map((acc) => {
    const booked = allItems
      .filter((i) => i.accommodationId === acc.id)
      .reduce((s, i) => s + i.nights, 0)
    return { name: acc.name, image: acc.image, rate: toLocaleMoney(acc.price) + " / night", booked }
  })
  const maxBookedNights = Math.max(1, ...availability.map((a) => a.booked))

  return (
    <>
      <Topbar />
      <main className="flex flex-1 flex-col gap-6 p-5 lg:p-8">
        <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = trendIcon[stat.trend]
            return (
              <div key={stat.label} className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 transition hover:shadow-sm shadow-ambient">
                <p className="text-sm text-on-surface-variant">{stat.label}</p>
                <p className="mt-3 font-headline-md text-3xl text-primary">{stat.value}</p>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium bg-surface-container-high text-on-surface-variant">
                    <Icon className="size-3" />
                    {stat.delta}
                  </span>
                  <span className="text-on-surface-variant">{stat.note}</span>
                </div>
              </div>
            )
          })}
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <OccupancyChart data={months} />
          </div>
          <GuestMix data={mixData} />
        </div>

        <section aria-label="Accommodation availability" className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 lg:p-6 shadow-ambient">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-md text-xl text-on-surface">Availability</h2>
              <p className="mt-1 text-sm text-on-surface-variant">Property snapshot</p>
            </div>
            <Link className="text-sm font-medium text-secondary hover:underline" href="/admin/accommodations">
              Manage
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availability.map((item) => {
              const pct = Math.round((item.booked / maxBookedNights) * 100)
              return (
                <article key={item.name} className="overflow-hidden rounded-xl border border-outline-variant/30">
                  <div className="relative h-28 w-full bg-surface-container-low">
                    <Image src={item.image || "/placeholder.svg"} alt={`${item.name} accommodation`} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-on-surface">{item.name}</h3>
                      <span className="text-xs text-on-surface-variant">{item.rate}</span>
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                      <div className="h-full rounded-full bg-secondary" style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-on-surface-variant">
                      {item.booked} booked nights
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section aria-label="Recent guests" className="xl:col-span-2 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-ambient">
            <div className="flex items-center justify-between p-5 lg:p-6">
              <div>
                <h2 className="font-headline-md text-xl text-on-surface">Recent guests</h2>
                <p className="mt-1 text-sm text-on-surface-variant">Latest booking activity</p>
              </div>
              <Link className="text-sm font-medium text-secondary hover:underline" href="/admin/guests">
                View all
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <p className="px-6 pb-8 text-sm text-on-surface-variant">No bookings yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-y border-outline-variant/30 text-left text-xs uppercase tracking-wide text-on-surface-variant">
                      <th className="px-6 py-3 font-medium">Guest</th>
                      <th className="px-6 py-3 font-medium">Accommodation</th>
                      <th className="px-6 py-3 font-medium">Check-in</th>
                      <th className="px-6 py-3 font-medium">Nights</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((r) => {
                      const nights = Math.max(1, Math.round((r.checkOut.getTime() - r.checkIn.getTime()) / 86400000))
                      const statusKey = r.status === "cancelled" ? "cancelled" : r.status === "completed" ? "completed" : r.status === "pending" ? "pending" : "confirmed"
                      return (
                        <tr key={r.id} className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low/60">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex size-9 items-center justify-center rounded-full bg-secondary-container text-xs font-medium text-on-secondary-container">
                                {initialsOf(r.guestName)}
                              </span>
                              <div>
                                <p className="font-medium text-on-surface">{r.guestName}</p>
                                <p className="text-xs text-on-surface-variant">{r.bookingNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant">
                            {r.items.map((item) => item.accommodation.name).join(" + ")}
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant">
                            {r.checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant">{nights}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[statusKey]}`}>
                              {statusLabel[statusKey]}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-on-surface">{toLocaleMoney(r.total)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section aria-label="Today's arrivals" className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 lg:p-6 shadow-ambient">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-xl text-on-surface">Today&apos;s arrivals</h2>
              <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary">
                {todayArrivals.length} {todayArrivals.length === 1 ? "guest" : "guests"}
              </span>
            </div>

            {todayArrivals.length === 0 ? (
              <p className="mt-5 text-sm text-on-surface-variant">No check-ins scheduled today.</p>
            ) : (
              <ol className="mt-5 space-y-1">
                {todayArrivals.map((a, i) => (
                  <li key={a.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium text-on-surface tabular-nums">{a.checkInTime}</span>
                      {i < todayArrivals.length - 1 && <span className="mt-1 w-px flex-1 bg-outline-variant/40" />}
                    </div>
                    <div className="flex-1 pb-5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-on-surface">{a.guestName}</p>
                        <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-xs text-on-surface-variant">
                          {a.items.map((item) => item.accommodation.name).join(" + ")}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-on-surface-variant">{a.bookingNumber}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </main>
    </>
  )
}