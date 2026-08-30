"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, SearchX } from "lucide-react"

export type ReservationFilterValues = {
  q: string
  guest: string
  room: string
  status: string
  date: string
}

export function ReservationFilters({ filters }: { filters: ReservationFilterValues }) {
  const router = useRouter()
  const qRef = useRef<HTMLInputElement>(null)
  const guestRef = useRef<HTMLInputElement>(null)
  const roomRef = useRef<HTMLInputElement>(null)
  const statusRef = useRef<HTMLSelectElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const buildUrl = () => {
    const params = new URLSearchParams()
    const set = (key: string, val?: string) => {
      if (val) params.set(key, val)
    }
    set("q", qRef.current?.value.trim())
    set("guest", guestRef.current?.value.trim())
    set("room", roomRef.current?.value.trim())
    set("status", statusRef.current?.value)
    set("date", dateRef.current?.value)
    const qs = params.toString()
    router.replace(qs ? `/admin/bookings?${qs}` : "/admin/bookings", { scroll: false })
  }

  const sync = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(buildUrl, 250)
  }

  const clearAll = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    for (const ref of [qRef, guestRef, roomRef, dateRef]) {
      if (ref.current) ref.current.value = ""
    }
    if (statusRef.current) statusRef.current.value = ""
    router.replace("/admin/bookings", { scroll: false })
  }

  const inputClass =
    "w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/40"

  const hasFilters = Boolean(filters.q || filters.guest || filters.room || filters.status || filters.date)

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            ref={qRef}
            name="q"
            defaultValue={filters.q}
            onChange={sync}
            placeholder="Receipt code…"
            autoComplete="off"
            className={`${inputClass} py-2 pl-9 pr-3`}
          />
        </div>
        <input
          ref={guestRef}
          name="guest"
          defaultValue={filters.guest}
          onChange={sync}
          placeholder="Guest name…"
          autoComplete="off"
          className={`${inputClass} px-3 py-2`}
        />
        <input
          ref={roomRef}
          name="room"
          defaultValue={filters.room}
          onChange={sync}
          placeholder="Accommodation…"
          autoComplete="off"
          className={`${inputClass} px-3 py-2`}
        />
        <select
          ref={statusRef}
          name="status"
          defaultValue={filters.status}
          onChange={sync}
          className={`${inputClass} px-3 py-2`}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          ref={dateRef}
          name="date"
          type="date"
          defaultValue={filters.date}
          onChange={sync}
          aria-label="Check-in date"
          className={`${inputClass} px-3 py-2`}
        />
      </div>
      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant transition hover:text-on-surface"
        >
          <SearchX className="size-3.5" />
          Clear filters
        </button>
      )}
    </div>
  )
}