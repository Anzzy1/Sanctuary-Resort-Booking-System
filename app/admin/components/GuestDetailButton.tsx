"use client"

import { useState, type ReactNode } from "react"
import { X, BedDouble, CalendarClock, Clock, Users } from "lucide-react"

export type GuestBookingInfo = {
  id: string
  bookingNumber: string
  status: "confirmed" | "completed" | "pending" | "cancelled"
  checkIn: string
  checkOut: string
  checkInTime: string
  checkOutTime: string
  nights: number
  total: number
  guests: number
  accommodations: string[]
}

export type GuestDetail = {
  guestKey: string
  name: string
  email: string
  stays: number
  ltv: number
  bookings: GuestBookingInfo[]
}

const statusPill: Record<string, { label: string; cls: string }> = {
  completed: { label: "Checked out", cls: "bg-surface-container-high text-on-surface-variant" },
  confirmed: { label: "In-house", cls: "bg-secondary/10 text-secondary" },
  pending: { label: "Reserved", cls: "bg-tertiary/10 text-tertiary" },
  cancelled: { label: "Cancelled", cls: "bg-rose-100 text-rose-700" },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

export function GuestDetailButton({ guest, children }: { guest: GuestDetail; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  if (guest.bookings.length === 0) return <>{children}</>

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex min-w-0 items-center gap-3 text-left transition">
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-coastal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-outline-variant/20 p-5">
              <div className="min-w-0">
                <h3 className="font-headline-md text-xl text-on-surface">Guest details</h3>
                <p className="mt-0.5 truncate text-sm text-on-surface-variant">{guest.name}</p>
                <p className="truncate text-xs text-on-surface-variant">{guest.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="shrink-0 rounded-lg p-1.5 text-on-surface-variant transition hover:bg-surface-container-high"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 px-5 py-3">
              <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-xs font-medium text-on-surface-variant">
                {guest.stays} {guest.stays === 1 ? "stay" : "stays"}
              </span>
              <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary">
                LTV ${guest.ltv.toLocaleString("en-US")}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-5 pt-1">
              {guest.bookings.map((b) => {
                const pill = statusPill[b.status] ?? statusPill.pending
                return (
                  <article key={b.id} className="rounded-xl border border-outline-variant/30 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-on-surface-variant">{b.bookingNumber}</p>
                      <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${pill.cls}`}>{pill.label}</span>
                    </div>

                    <div className="mt-3 space-y-2 text-sm text-on-surface-variant">
                      <p className="flex items-center gap-2">
                        <CalendarClock className="size-4 shrink-0 text-secondary" />
                        Checked in{" "}
                        <span className="font-medium text-on-surface">
                          {formatDate(b.checkIn)} at {b.checkInTime}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="size-4 shrink-0 text-secondary" />
                        {b.status === "completed" ? "Checked out" : "Until"}{" "}
                        <span className="font-medium text-on-surface">
                          {formatDate(b.checkOut)} at {b.checkOutTime}
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <BedDouble className="mt-0.5 size-4 shrink-0 text-secondary" />
                        <span>
                          {b.accommodations.map((a) => (
                            <span key={a} className="block">
                              <span className="font-medium text-on-surface">{a}</span>{" "}
                              <span className="text-xs">({b.nights} {b.nights === 1 ? "night" : "nights"})</span>
                            </span>
                          ))}
                        </span>
                      </p>
                      <div className="flex items-center justify-between border-t border-outline-variant/20 pt-2">
                        <span className="flex items-center gap-2">
                          <Users className="size-4 text-secondary" />
                          {b.guests} {b.guests === 1 ? "guest" : "guests"}
                        </span>
                        <span className="font-headline-md text-on-surface">{`₱${Math.round(b.total).toLocaleString("en-US")}`}</span>
                      </div>
                    </div>
                  </article>
                )
              })}

              {guest.bookings.length === 0 && (
                <p className="py-4 text-center text-sm text-on-surface-variant">No stays recorded.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}