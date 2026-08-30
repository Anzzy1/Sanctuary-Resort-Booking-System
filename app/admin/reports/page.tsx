import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { verifyAdmin } from "../actions"
import { Topbar } from "../components/Topbar"
import { OccupancyChart } from "../components/dashboard/occupancy-chart"

export const dynamic = "force-dynamic"

function toLocaleMoney(value: number): string {
  return `₱${Math.round(value).toLocaleString("en-US")}`
}

function toLocaleMoney0(value: number): string {
  return `₱${Math.round(value).toLocaleString("en-US")}`
}

const barColors = ["#1f6868", "#8ed2d1", "#aaefed", "#041920", "#73787a"]

export default async function AdminReports() {
  if (!(await verifyAdmin())) {
    notFound()
  }

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [bookings, accommodationCount, currentAgg, prevAgg, pendingValue] = await Promise.all([
    prisma.booking.findMany({
      select: { total: true, createdAt: true, status: true, items: { include: { accommodation: true } } },
    }),
    prisma.accommodation.count(),
    prisma.booking.aggregate({ _sum: { total: true }, where: { createdAt: { gte: monthStart, lt: monthEnd } } }),
    prisma.booking.aggregate({ _sum: { total: true }, where: { createdAt: { gte: prevStart, lt: monthStart } } }),
    prisma.booking.aggregate({ _sum: { total: true }, where: { status: "pending" } }),
  ])

  const current = currentAgg._sum.total ?? 0
  const prev = prevAgg._sum.total ?? 0
  const totalRevenue = bookings.reduce((s, b) => s + b.total, 0)
  const pendingTotal = pendingValue._sum.total ?? 0
  const avgValue = bookings.length ? totalRevenue / bookings.length : 0

  const currentDelta = prev > 0 ? Math.round(((current - prev) / prev) * 100) : 0
  const totalDelta = bookings.length > 0 ? 100 : 0

  // Last 8 months with real revenue + occupancy
  const months: { month: string; occupancy: number; revenue: number; bookings: number }[] = []
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    const monthBookings = bookings.filter((b) => b.createdAt >= d && b.createdAt < next)
    const revenue = monthBookings.reduce((s, b) => s + b.total, 0)
    const occupancy = accommodationCount ? Math.min(100, Math.round((monthBookings.length / accommodationCount) * 100)) : 0
    months.push({ month: d.toLocaleDateString("en-US", { month: "short" }), occupancy, revenue, bookings: monthBookings.length })
  }

  // Revenue by category
  const byCategory = { Room: 0, Cottage: 0, Villa: 0 } as Record<string, number>
  for (const b of bookings) {
    for (const item of b.items) {
      const name = item.accommodation.category.charAt(0).toUpperCase() + item.accommodation.category.slice(1)
      byCategory[name] = (byCategory[name] ?? 0) + item.subtotal
    }
  }
  const segmentItems = (Object.entries(byCategory) as [string, number][])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name,
      value: totalRevenue ? Math.round((value / totalRevenue) * 100) : 0,
      raw: value,
    }))
  const maxSegment = Math.max(1, ...segmentItems.map((s) => s.value))

  const kpis = [
    {
      label: "Revenue (MTD)",
      value: toLocaleMoney(current),
      delta: `${currentDelta > 0 ? "+" : ""}${currentDelta}%`,
      trend: (currentDelta > 0 ? "up" : currentDelta < 0 ? "down" : "neutral") as "up" | "down" | "neutral",
      note: "vs. last month",
    },
    {
      label: "Total revenue",
      value: toLocaleMoney(totalRevenue),
      delta: `${totalDelta}%`,
      trend: "up" as const,
      note: "all time",
    },
    {
      label: "Average booking",
      value: toLocaleMoney(avgValue),
      delta: "0%",
      trend: "neutral" as const,
      note: "per booking",
    },
    {
      label: "Pending value",
      value: toLocaleMoney(pendingTotal),
      delta: "Unconfirmed",
      trend: "neutral" as const,
      note: "awaiting approval",
    },
  ]

  const trendIcon = { up: TrendingUp, down: TrendingDown, neutral: Minus }

  return (
    <>
      <Topbar title="Reports" eyebrow="Performance analytics" />
      <main className="flex flex-1 flex-col gap-6 p-5 lg:p-8">
        <section aria-label="Report metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = trendIcon[kpi.trend]
            return (
              <div key={kpi.label} className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-ambient">
                <p className="text-sm text-on-surface-variant">{kpi.label}</p>
                <p className="mt-3 font-headline-md text-3xl text-primary">{kpi.value}</p>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
                      kpi.trend === "up"
                        ? "bg-secondary/10 text-secondary"
                        : kpi.trend === "down"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    <Icon className="size-3" />
                    {kpi.delta}
                  </span>
                  <span className="text-on-surface-variant">{kpi.note}</span>
                </div>
              </div>
            )
          })}
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <OccupancyChart data={months} />
          </div>

          <section aria-label="Revenue by segment" className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 lg:p-6 shadow-ambient">
            <h2 className="font-headline-md text-xl text-on-surface">Revenue by segment</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Share of total by property type</p>

            {segmentItems.length === 0 ? (
              <p className="mt-6 text-sm text-on-surface-variant">No revenue yet.</p>
            ) : (
              <ul className="mt-5 space-y-4">
                {segmentItems.map((item, i) => (
                  <li key={item.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-on-surface">{item.name}</span>
                      <span className="text-on-surface-variant tabular-nums">{toLocaleMoney0(item.raw)}</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, (item.value / maxSegment) * 100)}%`, background: barColors[i % barColors.length] }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </>
  )
}