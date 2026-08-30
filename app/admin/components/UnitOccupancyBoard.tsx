"use client"

import { useEffect, useState } from "react"
import { BedDouble, Clock, DoorOpen, X } from "lucide-react"

export type OccupiedGuest = {
  id: string
  bookingNumber: string
  guestName: string
  status: string
  checkIn: string
  checkOut: string
  checkInTime: string
  checkOutTime: string
}

export type UnitTile = {
  id: string
  name: string
  units: number
  used: number
  cleaning: number
  available: number
  full: boolean
  partially: boolean
  chip: string
  label: string
  pct: number
  occupants: OccupiedGuest[]
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function statusPill(status: string) {
  return status === "confirmed" ? "bg-secondary/10 text-secondary" : "bg-amber-100 text-amber-700"
}

export function UnitOccupancyBoard({ units }: { units: UnitTile[] }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const openUnit = units.find((u) => u.id === openId) ?? null

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {units.map((unit) => (
          <button
            key={unit.id}
            type="button"
            aria-label={`${unit.name} — ${unit.label}`}
            onClick={() => setOpenId(unit.id)}
            className="rounded-xl border border-outline-variant/30 p-4 text-left transition hover:border-secondary/60 hover:shadow-ambient focus:outline-none focus:ring-2 focus:ring-secondary/40"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-medium text-on-surface">{unit.name}</p>
              <span className={`ml-2 inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${unit.chip}`}>
                {unit.label}
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
              <div className="h-full rounded-full bg-primary" style={{ width: `${unit.pct}%` }} />
            </div>
            <p className="mt-2 truncate text-xs text-on-surface-variant">
              {unit.used} of {unit.units} occupied now
              {unit.cleaning > 0 ? ` · ${unit.cleaning} cleaning` : ""}
              {unit.occupants.length > 0 ? ` · ${unit.occupants.length} ${unit.occupants.length === 1 ? "guest" : "guests"}` : ""}
            </p>
          </button>
        ))}
      </div>

      {openUnit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setOpenId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-coastal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-outline-variant/30 bg-primary px-5 py-4">
              <div>
                <h3 className="font-headline-md text-lg text-white">{openUnit.name}</h3>
                <p className="mt-0.5 text-xs text-white/70">
                  {openUnit.label} · {openUnit.units} {openUnit.units === 1 ? "unit" : "units"}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpenId(null)}
                className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {openUnit.occupants.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <DoorOpen className="size-8 text-on-surface-variant/50" />
                  <p className="text-sm text-on-surface-variant">No one is checked in right now.</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {openUnit.occupants.map((guest) => (
                    <li key={guest.id} className="rounded-xl border border-outline-variant/30 bg-surface-container-low/60 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-9 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                            <BedDouble className="size-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-on-surface">{guest.guestName}</p>
                            <p className="text-xs text-on-surface-variant">{guest.bookingNumber}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusPill(guest.status)}`}>
                          {guest.status}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                        <div className="flex items-center gap-2 rounded-lg bg-surface-container-lowest px-3 py-2">
                          <Clock className="size-4 shrink-0 text-secondary" />
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Checked in</p>
                            <p className="text-xs font-medium text-on-surface">
                              {formatDate(guest.checkIn)} · {guest.checkInTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-surface-container-lowest px-3 py-2">
                          <Clock className="size-4 shrink-0 text-secondary" />
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Until</p>
                            <p className="text-xs font-medium text-on-surface">
                              {formatDate(guest.checkOut)} · {guest.checkOutTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}