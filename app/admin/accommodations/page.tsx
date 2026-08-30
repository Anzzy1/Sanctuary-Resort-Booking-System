import Image from "next/image"
import { Check } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { verifyAdmin } from "../actions"
import { Topbar } from "../components/Topbar"
import { UnitOccupancyBoard, type OccupiedGuest, type UnitTile } from "../components/UnitOccupancyBoard"
import { scheduledCheckOutMillis } from "@/lib/booking-time"

export const dynamic = "force-dynamic"

const categoryMeta: Record<string, { title: string; features: string[] }> = {
  room: {
    title: "Rooms",
    features: ["Ocean or garden views", "En-suite bathroom", "Daily housekeeping"],
  },
  cottage: {
    title: "Cottages",
    features: ["Private coastal cottage", "Outdoor lounge deck", "Butler service on request"],
  },
  villa: {
    title: "Villas",
    features: ["Spacious waterfront villa", "Private plunge deck", "Full kitchen & dining"],
  },
}

function toLocaleMoney(value: number): string {
  return `₱${Math.round(value).toLocaleString("en-US")}`
}

export default async function AdminAccommodations() {
  if (!(await verifyAdmin())) {
    notFound()
  }

  const accommodations = await prisma.accommodation.findMany({
    orderBy: { createdAt: "asc" },
  })

  // Live occupancy: bookings overlapping today, counted in units
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const todayEnd = new Date(todayStart.getTime() + 86400000)
  const items = await prisma.bookingItem.findMany({
    include: { booking: true },
  })

  const unitInfo = new Map<string, { used: number; cleaning: number }>()
  for (const acc of accommodations) {
    unitInfo.set(acc.id, { used: 0, cleaning: 0 })
  }
  const occupiedByUnit = new Map<string, OccupiedGuest[]>()
  for (const item of items) {
    const booking = item.booking
    if (booking.status === "cancelled") continue
    const overlapping = booking.checkIn < todayEnd && booking.checkOut > todayStart
    const departingToday = booking.checkIn < todayEnd && booking.checkOut >= todayStart && booking.checkOut <= todayEnd
    const info = unitInfo.get(item.accommodationId)
    if (!info) continue
    // Occupied = checked-in (confirmed) guests in-house now; pending reservations
    // reserve a slot but do not occupy it (managed under Reservations).
    if (booking.status === "confirmed" && overlapping) {
      info.used += 1
      const list = occupiedByUnit.get(item.accommodationId) ?? []
      list.push({
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        guestName: booking.guestName,
        status: booking.status,
        checkIn: booking.checkIn.toISOString(),
        checkOut: booking.checkOut.toISOString(),
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
      })
      occupiedByUnit.set(item.accommodationId, list)
    } else if (
      booking.status === "completed" &&
      departingToday &&
      today.getTime() < scheduledCheckOutMillis(booking.checkOut, booking.checkOutTime)
    ) {
      // Guest already left but their scheduled check-out hasn't passed yet — unit is in turnover.
      info.cleaning += 1
    }
  }

  const unitTiles: UnitTile[] = accommodations.map((acc) => {
    const info = unitInfo.get(acc.id) ?? { used: 0, cleaning: 0 }
    const used = Math.min(info.used, acc.units)
    const available = Math.max(0, acc.units - used - info.cleaning)
    const full = used >= acc.units
    const partially = !full && used > 0
    const pct = Math.round((used / acc.units) * 100)
    const chip = full
      ? "bg-primary/10 text-primary"
      : partially
        ? "bg-amber-100 text-amber-700"
        : "bg-secondary/10 text-secondary"
    const label = full ? `Occupied ${used}/${acc.units}` : `Available ${available}/${acc.units}`
    return {
      id: acc.id,
      name: acc.name,
      units: acc.units,
      used,
      cleaning: info.cleaning,
      available,
      full,
      partially,
      chip,
      label,
      pct,
      occupants: occupiedByUnit.get(acc.id) ?? [],
    }
  })

  // Category snapshot cards (units based)
  const categoryCards = (["room", "cottage", "villa"] as const)
    .filter((cat) => accommodations.some((a) => a.category === cat))
    .map((cat) => {
      const group = accommodations.filter((a) => a.category === cat)
      const totalUnits = group.reduce((s, a) => s + a.units, 0)
      const occupiedUnits = group.reduce((s, a) => s + (unitInfo.get(a.id)?.used ?? 0), 0)
      const pct = totalUnits ? Math.round((Math.min(occupiedUnits, totalUnits) / totalUnits) * 100) : 0
      return {
        ...categoryMeta[cat],
        cat,
        image: group[0].image,
        rate: Math.min(...group.map((a) => a.price)),
        occupiedUnits,
        totalUnits,
        pct,
      }
    })

  // Overall summary numbers (in units)
  const occupiedUnits = accommodations.reduce((s, a) => s + (unitInfo.get(a.id)?.used ?? 0), 0)
  const cleaningUnits = accommodations.reduce((s, a) => s + (unitInfo.get(a.id)?.cleaning ?? 0), 0)
  const totalUnits = accommodations.reduce((s, a) => s + a.units, 0)
  const availableUnits = Math.max(0, totalUnits - occupiedUnits - cleaningUnits)

  return (
    <>
      <Topbar title="Accommodations" eyebrow="Villas, suites & pavilions" />
      <main className="flex flex-1 flex-col gap-6 p-5 lg:p-8">
        {/* Overall snapshot */}
        <section className="grid grid-cols-2 gap-4 xl:grid-cols-3">
          {[
            { label: "Occupied now", value: `${occupiedUnits}/${totalUnits}`, note: "units in-house" },
            { label: "Cleaning", value: String(cleaningUnits), note: "turnovers in progress" },
            { label: "Available", value: String(availableUnits), note: "ready to book" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-ambient">
              <p className="text-sm text-on-surface-variant">{stat.label}</p>
              <p className="mt-3 font-headline-md text-3xl text-primary">{stat.value}</p>
              <p className="mt-2 text-xs text-on-surface-variant">{stat.note}</p>
            </div>
          ))}
        </section>

        {/* Category cards */}
        <section aria-label="Accommodation types" className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {categoryCards.map((type) => (
            <article key={type.title} className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-ambient transition hover:shadow-coastal">
              <div className="relative h-40 w-full">
                <Image
                  src={type.image || "/placeholder.svg"}
                  alt={`${type.title} accommodation`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute right-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium text-on-surface backdrop-blur">
                  {type.totalUnits} {type.totalUnits === 1 ? "unit" : "units"}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-headline-md text-lg text-on-surface">{type.title}</h3>
                  <p className="text-sm font-medium text-on-surface">
                    From {toLocaleMoney(type.rate)}
                    <span className="text-xs font-normal text-on-surface-variant"> / night</span>
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-on-surface-variant">
                  <span>{type.pct}% occupied tonight</span>
                  <span>
                    {type.occupiedUnits}/{type.totalUnits} units booked
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${type.pct}%` }} />
                </div>

                <ul className="mt-4 space-y-2">
                  {type.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <Check className="size-4 text-secondary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </section>

        {/* Availability board */}
        <section aria-label="Unit availability" className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 lg:p-6 shadow-ambient">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-headline-md text-xl text-on-surface">Availability per unit</h2>
              <p className="mt-1 text-sm text-on-surface-variant">Units occupied now, per accommodation</p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-secondary" />
                Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-amber-500" />
                Partially booked
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-primary" />
                Full
              </span>
            </div>
          </div>

          {accommodations.length === 0 ? (
            <p className="mt-5 text-sm text-on-surface-variant">No accommodations yet.</p>
          ) : (
            <UnitOccupancyBoard units={unitTiles} />
          )}
        </section>
      </main>
    </>
  )
}