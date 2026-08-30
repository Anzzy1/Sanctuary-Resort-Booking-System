"use client"

import Image from "next/image"
import Link from "next/link"
import { startTransition, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { getNightlyAvailability, getRoomAvailability } from "../actions"
import { computePricing, formatPeso, hourlyRateOf, BOOKING_FEE_PERCENT } from "../../lib/money"

const rooms = [
  {
    slug: "garden-room",
    name: "Garden Room",
    category: "room",
    price: 3500,
    badge: null,
    description:
      "A peaceful retreat featuring warm wooden tones and a large window overlooking our lush resort gardens. Perfect for a restorative stay.",
    image:
      "/pavilion-water.png",
    specs: [
      { icon: "bed", text: "King Bed" },
      { icon: "nature", text: "Garden View" },
      { icon: "square_foot", text: "35 sqm" },
    ],
  },
  {
    slug: "poolside-suite",
    name: "Poolside Suite",
    category: "cottage",
    price: 7500,
    badge: "Popular",
    description:
      "Spacious and sunlit, with direct access to our infinity pool from your private terrace. Features a separate lounge area and soaking tub.",
    image:
      "/pavilion-water.png",
    specs: [
      { icon: "bed", text: "King Bed" },
      { icon: "pool", text: "Pool Access" },
      { icon: "square_foot", text: "55 sqm" },
    ],
  },
  {
    slug: "ocean-breeze-room",
    name: "Ocean Breeze Room",
    category: "room",
    price: 4200,
    badge: null,
    description:
      "Wake up to the sound of waves and unobstructed views of the coastline. Designed with soft oceanic hues to bring the outside in.",
    image:
      "/pavilion-water.png",
    specs: [
      { icon: "bed", text: "Queen Bed" },
      { icon: "water", text: "Ocean View" },
      { icon: "square_foot", text: "40 sqm" },
    ],
  },
  {
    slug: "family-studio",
    name: "Family Studio",
    category: "room",
    price: 6200,
    badge: null,
    description:
      "Generously proportioned for family comfort without compromising on style. Includes a flexible living area and kitchenette setup.",
    image:
      "/pavilion-water.png",
    specs: [
      { icon: "bed", text: "2 Beds" },
      { icon: "group", text: "Up to 4" },
      { icon: "square_foot", text: "65 sqm" },
    ],
  },
  {
    slug: "sunrise-villa",
    name: "Sunrise Villa",
    category: "villa",
    price: 11500,
    badge: null,
    description:
      "Experience breathtaking morning views from your private deck. Features an open-plan living space and luxurious outdoor shower.",
    image:
      "/pavilion-water.png",
    specs: [
      { icon: "bed", text: "King Bed" },
      { icon: "water", text: "Ocean View" },
      { icon: "square_foot", text: "75 sqm" },
    ],
  },
  {
    slug: "sunset-loft",
    name: "Sunset Loft",
    category: "room",
    price: 4800,
    badge: null,
    description:
      "An elevated sanctuary with expansive windows capturing the golden hour. Modern minimalist design with warm sunset hues.",
    image:
      "/pavilion-water.png",
    specs: [
      { icon: "bed", text: "Queen Bed" },
      { icon: "balcony", text: "Balcony View" },
      { icon: "square_foot", text: "45 sqm" },
    ],
  },
  {
    slug: "palm-grove-room",
    name: "Palm Grove Room",
    category: "room",
    price: 3200,
    badge: null,
    description:
      "Nestled among swaying palms, offering unparalleled privacy and tranquility. Features handcrafted rattan furniture and botanical accents.",
    image:
      "/pavilion-water.png",
    specs: [
      { icon: "bed", text: "King Bed" },
      { icon: "nature", text: "Garden View" },
      { icon: "square_foot", text: "38 sqm" },
    ],
  },
  {
    slug: "coral-suite",
    name: "Coral Suite",
    category: "room",
    price: 5500,
    badge: null,
    description:
      "Vibrant and spacious, inspired by the colors of the reef. Includes a separate dressing area and a large freestanding bathtub.",
    image:
      "/pavilion-water.png",
    specs: [
      { icon: "bed", text: "King Bed" },
      { icon: "waves", text: "Partial Ocean" },
      { icon: "square_foot", text: "60 sqm" },
    ],
  },
  {
    slug: "zen-retreat",
    name: "Zen Retreat",
    category: "room",
    price: 3700,
    badge: null,
    description:
      "Designed for ultimate relaxation with a minimalist aesthetic, natural stone textures, and a private meditation courtyard.",
    image:
      "/pavilion-water.png",
    specs: [
      { icon: "bed", text: "Queen Bed" },
      { icon: "spa", text: "Courtyard" },
      { icon: "square_foot", text: "42 sqm" },
    ],
  },
  {
    slug: "horizon-terrace",
    name: "Horizon Terrace",
    category: "villa",
    price: 10500,
    badge: null,
    description:
      "Seamless indoor-outdoor living with a sprawling terrace overlooking the horizon. Perfect for evening stargazing and morning coffees.",
    image:
      "/pavilion-water.png",
    specs: [
      { icon: "bed", text: "King Bed" },
      { icon: "landscape", text: "Panoramic" },
      { icon: "square_foot", text: "70 sqm" },
    ],
  },
  {
    slug: "sandbar-studio",
    name: "Sandbar Studio",
    category: "room",
    price: 2800,
    badge: null,
    description:
      "A cozy and stylish space steps away from the beach. Features light wood finishes, sandy tones, and a compact kitchenette.",
    image:
      "/pavilion-water.png",
    specs: [
      { icon: "bed", text: "Queen Bed" },
      { icon: "beach_access", text: "Beach Access" },
      { icon: "square_foot", text: "32 sqm" },
    ],
  },
  {
    slug: "driftwood-cottage",
    name: "Driftwood Cottage",
    category: "cottage",
    price: 7900,
    badge: "Exclusive",
    description:
      "A standalone rustic-chic cottage offering complete seclusion. Features reclaimed wood beams, a fireplace, and a private plunge pool.",
    image:
      "/pavilion-water.png",
    specs: [
      { icon: "bed", text: "King Bed" },
      { icon: "pool", text: "Pool & Garden" },
      { icon: "square_foot", text: "85 sqm" },
    ],
  },
]

const filters = [
  { label: "ALL STAYS", value: "all" },
  { label: "Rooms", value: "room" },
  { label: "Cottages", value: "cottage" },
  { label: "Villas", value: "villa" },
]

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"]
const lightIcon = { fontVariationSettings: '"wght" 200' }

const DAY_MS = 24 * 60 * 60 * 1000

function formatDate(date: Date | null): string {
  if (!date) return ""
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

const addDay = (date: Date, n: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n)

const monthLabel = (month: Date) => month.toLocaleDateString("en-US", { month: "long", year: "numeric" })

export function BookingExperience({ admin = false }: { admin?: boolean }) {
  const searchParams = useSearchParams()
  const [viewMonth, setViewMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [guests, setGuests] = useState({ adults: 2, children: 0, infants: 0 })
  const [selectedRoomNames, setSelectedRoomNames] = useState<string[]>(() => {
    const roomsParam = searchParams.get("rooms")
    if (!roomsParam) return []
    const roomSlugs = roomsParam.split(",")
    return rooms.filter((room) => roomSlugs.includes(room.slug)).map((room) => room.name)
  })
  const [activeFilter, setActiveFilter] = useState("all")
  const [checkInTime, setCheckInTime] = useState({ value: "8", period: "AM" })
  const [checkOutTime, setCheckOutTime] = useState({ value: "8", period: "PM" })
  const [openPicker, setOpenPicker] = useState<"checkin" | "checkout" | null>(null)
  const [availability, setAvailability] = useState<
    Record<string, { units: number; occupied: number; conflicts: { checkIn: string; checkInTime: string; checkOut: string; checkOutTime: string }[] }>
  >({})
  const [nightly, setNightly] = useState<Record<string, { units: number; nights: Record<string, number> }>>({})

  const checkInHour = checkInTime.value === "" ? "8" : checkInTime.value
  const checkInPeriod = checkInTime.value === "" ? "AM" : checkInTime.period
  const checkOutHour = checkOutTime.value === "" ? "8" : checkOutTime.value
  const checkOutPeriod = checkOutTime.value === "" ? "PM" : checkOutTime.period

  useEffect(() => {
    let cancelled = false
    startTransition(async () => {
      const now = new Date()
      const from = checkIn ?? new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const to = checkOut ?? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      const data = await getRoomAvailability(
        from.toISOString(),
        to.toISOString(),
        `${checkInHour}:00 ${checkInPeriod}`,
        `${checkOutHour}:00 ${checkOutPeriod}`,
      )
      if (cancelled) return
      const map: Record<string, { units: number; occupied: number; conflicts: typeof data[number]["conflicts"] }> = {}
      for (const row of data) map[row.slug] = { units: row.units, occupied: row.occupied, conflicts: row.conflicts }
      setAvailability(map)
    })
    return () => {
      cancelled = true
    }
  }, [checkIn, checkOut, checkInHour, checkInPeriod, checkOutHour, checkOutPeriod])

  useEffect(() => {
    let cancelled = false
    startTransition(async () => {
      const start = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
      const end = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0)
      const data = await getNightlyAvailability(
        start.toISOString(),
        end.toISOString(),
        `${checkInHour}:00 ${checkInPeriod}`,
        `${checkOutHour}:00 ${checkOutPeriod}`,
      )
      if (cancelled) return
      const map: Record<string, { units: number; nights: Record<string, number> }> = {}
      for (const row of data) map[row.slug] = { units: row.units, nights: row.nights }
      setNightly(map)
    })
    return () => {
      cancelled = true
    }
  }, [viewMonth, checkInHour, checkInPeriod, checkOutHour, checkOutPeriod])

  const unitStatus = (slug: string) => {
    const info = availability[slug]
    if (!info) return null
    return { units: info.units, occupied: info.occupied, available: info.units - info.occupied }
  }

  const firstConflict = (slug: string) => {
    const c = availability[slug]?.conflicts?.[0]
    if (!c) return null
    const start = new Date(c.checkIn)
    const end = new Date(c.checkOut)
    const fmtDay = (d: Date) => `${d.toLocaleDateString("en-US", { month: "short" })} ${d.getDate()}`
    const range =
      start.toDateString() === end.toDateString()
        ? `${fmtDay(start)}, ${start.getFullYear()}`
        : `${fmtDay(start)} – ${fmtDay(end)}, ${end.getFullYear()}`
    return `${range}, ${c.checkInTime} to ${c.checkOutTime}`
  }

  const datesInvalid = !!(checkIn && checkOut && checkIn.getTime() > checkOut.getTime())
  const hasSelectedDates = !!checkIn && !!checkOut

  const selectedRooms = rooms.filter((room) => selectedRoomNames.includes(room.name))
  const hasFullSelected = selectedRooms.some((room) => {
    const status = unitStatus(room.slug)
    return !!status && status.available <= 0
  })
  const { resortFee, taxes, total, bookingFee, balanceDue, hours } = computePricing(selectedRooms, {
    checkIn: checkIn ?? new Date(),
    checkOut: checkOut ?? new Date(),
    checkInTime: `${checkInHour}:00 ${checkInPeriod}`,
    checkOutTime: `${checkOutHour}:00 ${checkOutPeriod}`,
  })

  const todayStart = (() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })()

  const isNightBlocked = (date: Date) => {
    const key = dateKey(date)
    return selectedRooms.some((room) => {
      const info = nightly[room.slug]
      return !!info && (info.nights[key] ?? 0) >= info.units
    })
  }

  const isCheckInDayDisabled = (day: Date) => day < todayStart || isNightBlocked(day)

  const isCheckOutDayDisabled = (day: Date) => {
    if (day < (checkIn ?? todayStart)) return true
    if (!checkIn) return isNightBlocked(addDay(day, -1))
    for (let d = checkIn; d < day; d = addDay(d, 1)) {
      if (isNightBlocked(d)) return true
    }
    return false
  }

  const toggleRoom = (name: string) =>
    setSelectedRoomNames((current) =>
      current.includes(name) ? current.filter((n) => n !== name) : [...current, name],
    )

  const prevMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
  const nextMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))

  const pickDate = (field: "checkin" | "checkout", date: Date) => {
    if (field === "checkin") setCheckIn(date)
    else setCheckOut(date)
    setOpenPicker(null)
  }

  const decrement = (key: keyof typeof guests) => {
    if (guests[key] > 0) setGuests((prev) => ({ ...prev, [key]: prev[key] - 1 }))
  }

  const increment = (key: keyof typeof guests) => setGuests((prev) => ({ ...prev, [key]: prev[key] + 1 }))

  const handleHourChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 2)
    if (digits === "") return ""
    const num = parseInt(digits, 10)
    if (num > 12) return String(num).slice(0, 1)
    return String(num)
  }

  const timeToMinutes = (hourVal: string, period: string) => {
    const hour = (parseInt(hourVal || "8", 10) % 12) + (period === "PM" ? 12 : 0)
    return hour * 60
  }

  const sameDayStay = checkIn && checkOut && isSameDay(checkIn, checkOut)

  const updateCheckInTime = (partial: Partial<{ value: string; period: string }>) =>
    setCheckInTime((prev) => ({ ...prev, ...partial }))

  const updateCheckOutTime = (partial: Partial<{ value: string; period: string }>) =>
    setCheckOutTime((prev) => ({ ...prev, ...partial }))

  const timesInvalid =
    sameDayStay &&
    timeToMinutes(checkInTime.value, checkInTime.period) >= timeToMinutes(checkOutTime.value, checkOutTime.period)

  const filteredRooms = activeFilter === "all" ? rooms : rooms.filter((room) => room.category === activeFilter)

  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days: (Date | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d))

  return (
    <main
      className={`flex-grow w-full mx-auto ${
        admin
          ? "p-5 lg:p-8 max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-gutter"
          : "pt-[120px] pb-24 px-margin-mobile md:px-margin-desktop max-w-[1140px] grid grid-cols-1 lg:grid-cols-12 gap-gutter"
      }`}
    >
      {/* Header */}
      <div className={admin ? "col-span-1 lg:col-span-12 mb-8" : "col-span-1 lg:col-span-12 mb-8"}>
        <Link
          className="flex items-center gap-2 text-secondary font-medium text-sm mb-6 transition-all duration-300 group"
          href={admin ? "/admin" : "/accommodations"}
        >
          <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">chevron_left</span>
          <span className="group-hover:underline">{admin ? "Back to Admin" : "Back to Search"}</span>
        </Link>
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-2">
          {admin ? "New Booking" : "Complete Your Selection"}
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          {admin
            ? "Create a reservation for a guest directly. No payment is collected."
            : "Refine your dates and discover the perfect accommodation for your coastal retreat."}
        </p>
      </div>

      {admin && (
        <p className="col-span-1 lg:col-span-12 mb-6 rounded-xl border border-secondary/30 bg-secondary/5 px-4 py-3 text-sm text-secondary">
          Admin booking — this reservation is created without a payment. The guest&apos;s stay will be recorded in the system once confirmed.
        </p>
      )}

      {/* Left Column: Configuration & Listings */}
      <div className="col-span-1 lg:col-span-8 flex flex-col gap-12">
        {/* Dates & Guests Configurator */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient border border-surface-container-high grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Date Picker Area */}
          <div className="flex flex-col gap-4 border-r-0 md:border-r border-surface-container-high pr-0 md:pr-8">
            <div className="flex items-center justify-between">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Dates</h3>
              <button
                className="text-secondary text-sm cursor-pointer hover:underline"
                onClick={() => {
                  setCheckIn(null)
                  setCheckOut(null)
                }}
              >
                Clear
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                <label className="absolute text-[10px] uppercase font-semibold text-on-surface-variant left-4 top-2 transition-all">Check-in</label>
                <input
                  className={`w-full bg-surface-container-low border rounded-xl pt-6 pb-2 px-4 pr-10 font-body-md text-sm text-on-surface focus:outline-none cursor-pointer transition-colors truncate ${
                    openPicker === "checkin"
                      ? "border-secondary ring-1 ring-secondary"
                      : "border-surface-container-high focus:border-secondary focus:ring-1 focus:ring-secondary"
                  }`}
                  onClick={() => setOpenPicker(openPicker === "checkin" ? null : "checkin")}
                  readOnly
                  type="text"
                  value={formatDate(checkIn) || "Select"}
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={lightIcon}>calendar_today</span>
                {openPicker === "checkin" && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-surface rounded-xl p-4 border border-surface-container-high shadow-ambient">
                    <div className="flex justify-between items-center mb-4">
                      <button
                        className="material-symbols-outlined cursor-pointer hover:text-secondary text-sm"
                        onClick={prevMonth}
                        aria-label="Previous month"
                      >
                        chevron_left
                      </button>
                      <span className="font-body-md font-medium text-sm">{monthLabel(viewMonth)}</span>
                      <button
                        className="material-symbols-outlined cursor-pointer hover:text-secondary text-sm"
                        onClick={nextMonth}
                        aria-label="Next month"
                      >
                        chevron_right
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-on-surface-variant mb-2 font-label-caps">
                      {WEEKDAYS.map((day, i) => (
                        <div key={`${day}-${i}`}>{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm">
                      {days.map((day, i) => {
                        if (!day) return <div key={`blank-${i}`} className="p-1" />
                        const isSelected = checkIn ? isSameDay(day, checkIn) : false
                        const isDisabled = isCheckInDayDisabled(day)
                        return (
                          <button
                            key={day.toISOString()}
                            disabled={isDisabled}
                            onClick={() => pickDate("checkin", day)}
                            className={`p-1 rounded-full transition-colors ${
                              isSelected
                                ? "bg-secondary text-white"
                                : isDisabled
                                  ? "text-surface-dim cursor-not-allowed"
                                  : "hover:bg-surface-container-high text-on-surface"
                            }`}
                          >
                            {day.getDate()}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <label className="absolute text-[10px] uppercase font-semibold text-on-surface-variant left-4 top-2 transition-all">Check-out</label>
                <input
                  className={`w-full bg-surface-container-low border rounded-xl pt-6 pb-2 px-4 pr-10 font-body-md text-sm text-on-surface focus:outline-none cursor-pointer transition-colors truncate ${
                    openPicker === "checkout"
                      ? "border-secondary ring-1 ring-secondary"
                      : "border-surface-container-high focus:border-secondary focus:ring-1 focus:ring-secondary"
                  }`}
                  onClick={() => setOpenPicker(openPicker === "checkout" ? null : "checkout")}
                  readOnly
                  type="text"
                  value={formatDate(checkOut) || "Select"}
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={lightIcon}>calendar_today</span>
                {openPicker === "checkout" && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-surface rounded-xl p-4 border border-surface-container-high shadow-ambient">
                    <div className="flex justify-between items-center mb-4">
                      <button
                        className="material-symbols-outlined cursor-pointer hover:text-secondary text-sm"
                        onClick={prevMonth}
                        aria-label="Previous month"
                      >
                        chevron_left
                      </button>
                      <span className="font-body-md font-medium text-sm">{monthLabel(viewMonth)}</span>
                      <button
                        className="material-symbols-outlined cursor-pointer hover:text-secondary text-sm"
                        onClick={nextMonth}
                        aria-label="Next month"
                      >
                        chevron_right
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-on-surface-variant mb-2 font-label-caps">
                      {WEEKDAYS.map((day, i) => (
                        <div key={`${day}-${i}`}>{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm">
                      {days.map((day, i) => {
                        if (!day) return <div key={`blank-${i}`} className="p-1" />
                        const isSelected = checkOut ? isSameDay(day, checkOut) : false
                        const inRange =
                          checkIn && checkOut && day.getTime() > checkIn.getTime() && day.getTime() < checkOut.getTime()
                        const isDisabled = isCheckOutDayDisabled(day)
                        return (
                          <button
                            key={day.toISOString()}
                            disabled={isDisabled}
                            onClick={() => pickDate("checkout", day)}
                            className={`p-1 rounded-full transition-colors ${
                              isSelected
                                ? "bg-secondary text-white"
                                : isDisabled
                                  ? "text-surface-dim cursor-not-allowed"
                                  : inRange
                                    ? "bg-secondary-fixed text-on-secondary-fixed"
                                    : "hover:bg-surface-container-high text-on-surface"
                            }`}
                          >
                            {day.getDate()}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {datesInvalid && (
              <div className="mt-2 flex items-start gap-2 bg-error-container/50 border border-error/20 rounded-lg px-4 py-3">
                <span className="material-symbols-outlined text-error text-[18px] mt-0.5">error</span>
                <p className="text-sm text-on-error-container">
                  Check-in date cannot be after the check-out date. Please choose a valid stay period.
                </p>
              </div>
            )}
          </div>

          {/* Guests Area */}
          <div className="flex flex-col gap-6">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Guests</h3>
            <div className="flex flex-col gap-4">
              {[
                { key: "adults" as const, label: "Adults", sub: "Ages 13 or above" },
                { key: "children" as const, label: "Children", sub: "Ages 2-12" },
                { key: "infants" as const, label: "Infants", sub: "Under 2" },
              ].map((counter) => (
                <div key={counter.key} className="flex justify-between items-center pb-4 border-b border-surface-container-high">
                  <div>
                    <div className="font-body-md text-on-surface font-medium">{counter.label}</div>
                    <div className="text-sm text-on-surface-variant">{counter.sub}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => decrement(counter.key)}
                      className={`w-8 h-8 rounded-full border border-surface-container-high flex items-center justify-center transition-colors ${
                        guests[counter.key] === 0
                          ? "text-surface-dim cursor-not-allowed"
                          : "text-on-surface-variant hover:border-secondary hover:text-secondary"
                      }`}
                      aria-label={`Decrease ${counter.label}`}
                    >
                      <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span className="font-body-md w-4 text-center">{guests[counter.key]}</span>
                    <button
                      onClick={() => increment(counter.key)}
                      className="w-8 h-8 rounded-full border border-surface-container-high flex items-center justify-center text-on-surface-variant hover:border-secondary hover:text-secondary transition-colors"
                      aria-label={`Increase ${counter.label}`}
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Times */}
            <div className="flex flex-col gap-4">
              <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Hours</h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
                    Check-in
                  </label>
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center bg-surface-container-low border border-surface-container-high rounded-xl px-4 py-3 text-sm focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary transition-colors">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        value={checkInTime.value}
                        onChange={(e) => updateCheckInTime({ value: handleHourChange(e.target.value) })}
                        onBlur={() =>
                          setCheckInTime((prev) => (prev.value === "" ? { value: "8", period: "AM" } : prev))
                        }
                        placeholder="e.g. 3"
                        className="w-full bg-transparent text-on-surface focus:outline-none placeholder:text-on-surface-variant/50"
                      />
                      <span className="text-on-surface-variant pointer-events-none whitespace-nowrap">:00</span>
                    </label>
                    <select
                      value={checkInTime.period}
                      onChange={(e) => updateCheckInTime({ period: e.target.value })}
                      className="bg-surface-container-low border border-surface-container-high rounded-xl px-3 py-3 text-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary cursor-pointer transition-colors"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
                    Check-out
                  </label>
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center bg-surface-container-low border border-surface-container-high rounded-xl px-4 py-3 text-sm focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary transition-colors">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        value={checkOutTime.value}
                        onChange={(e) => updateCheckOutTime({ value: handleHourChange(e.target.value) })}
                        onBlur={() =>
                          setCheckOutTime((prev) => (prev.value === "" ? { value: "8", period: "PM" } : prev))
                        }
                        placeholder="e.g. 11"
                        className="w-full bg-transparent text-on-surface focus:outline-none placeholder:text-on-surface-variant/50"
                      />
                      <span className="text-on-surface-variant pointer-events-none whitespace-nowrap">:00</span>
                    </label>
                    <select
                      value={checkOutTime.period}
                      onChange={(e) => updateCheckOutTime({ period: e.target.value })}
                      className="bg-surface-container-low border border-surface-container-high rounded-xl px-3 py-3 text-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary cursor-pointer transition-colors"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
              {timesInvalid && (
                <p className="flex items-center gap-1.5 text-xs text-error">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  Check-out time must be after check-in time.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Accommodations List */}
        <div className="flex flex-col gap-6">
          <h2 className="font-headline-md text-headline-md text-primary font-medium border-b border-surface-container-high pb-4">
            Available Accommodations
          </h2>
          <div className="flex flex-wrap gap-4 items-center">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`relative px-6 py-2 rounded-full font-label-caps uppercase tracking-widest transition-all ${
                  activeFilter === filter.value
                    ? "bg-primary text-on-primary"
                    : "border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          {filteredRooms.map((room) => {
            const isSelected = selectedRoomNames.includes(room.name)
            const status = unitStatus(room.slug)
            const isFull = hasSelectedDates && !!status && status.available <= 0
            return (
            <div
              key={room.name}
              onClick={() => {
                if (isFull) return
                toggleRoom(room.name)
              }}
              className={`bg-surface-container-lowest rounded-2xl p-4 shadow-ambient border border-surface-container-high flex flex-col md:flex-row gap-6 transition-all hover:shadow-ambient-lg cursor-pointer group ${isSelected ? "border-secondary ring-1 ring-secondary" : ""} ${isFull ? "opacity-80" : ""}`}
            >
              <div className="w-full md:w-1/3 h-48 md:h-auto rounded-xl overflow-hidden relative">
                <Image
                  alt={room.name}
                  fill
                  sizes="(min-width: 768px) 300px, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  src={room.image}
                />
                {room.badge && (
                  <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary uppercase tracking-wider">
                    {room.badge}
                  </div>
                )}
                {isFull && (
                  <div className="absolute top-3 left-3 bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                    Fully Booked
                  </div>
                )}
                {isSelected && (
                  <>
                    <div className="absolute inset-0 border-2 border-secondary rounded-xl pointer-events-none"></div>
                    <div className="absolute top-3 left-3 bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Selected
                    </div>
                  </>
                )}
              </div>
              <div className="w-full md:w-2/3 flex flex-col py-2 pr-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-headline-md text-headline-md text-primary">{room.name}</h3>
                  <div className="text-right">
                    <span className="font-display-lg-mobile text-primary text-2xl">{formatPeso(room.price)}</span>
                    <span className="text-sm text-on-surface-variant block">/ night</span>
                  </div>
                </div>
                <p className="font-body-md text-sm text-on-surface-variant mb-4 line-clamp-2">{room.description}</p>
                <div className="flex gap-4 mb-4">
                  {room.specs.map((spec) => (
                    <div key={spec.text} className="flex items-center gap-1 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]" style={lightIcon}>{spec.icon}</span>
                      {spec.text}
                    </div>
                  ))}
                </div>
                {hasSelectedDates && status && !isFull && (
                  <div
                    className={`mb-4 inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-xs font-medium ${
                      status.available <= 1
                        ? "bg-amber-100 text-amber-700"
                        : "bg-secondary/10 text-secondary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {status.available <= 1 ? "warning" : "check_circle"}
                    </span>
                    {status.available <= 1 ? `Only ${status.available} of ${status.units} left` : `${status.available} of ${status.units} available`}
                  </div>
                )}
                <div className="mt-auto">
                  <div className="flex justify-between items-center">
                    <button className="text-secondary font-medium text-sm flex items-center gap-1 group">
                      <span className="group-hover:underline">View details</span>
                      <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                    </button>
                    {isFull ? (
                      <button
                        disabled
                        className="px-6 py-2 border border-surface-container-high text-surface-dim rounded-lg text-sm font-medium cursor-not-allowed"
                      >
                        Sold out
                      </button>
                    ) : isSelected ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleRoom(room.name)
                        }}
                        className="px-6 py-2 border border-secondary text-secondary rounded-lg text-sm font-medium hover:bg-surface-container-low transition-colors duration-300"
                      >
                        Unselect
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleRoom(room.name)
                        }}
                        className="px-6 py-2 bg-primary-container text-white rounded-lg text-sm font-medium hover:bg-secondary transition-colors duration-300"
                      >
                        Select
                      </button>
                    )}
                  </div>
                  {hasSelectedDates && status && isFull && (
                    <p className="mt-3 text-right text-xs font-medium text-rose-600">
                      {firstConflict(room.slug)
                        ? `Already taken for that time: ${firstConflict(room.slug)}`
                        : "Fully booked for these dates. Choose different dates or another unit."}
                    </p>
                  )}
                </div>
              </div>
            </div>
            )
          })}
        </div>
      </div>

      {/* Right Column: Reservation Sidebar */}
      <div className="col-span-1 lg:col-span-4 mt-8 lg:mt-0">
        <div className="bg-surface-container-lowest rounded-2xl shadow-ambient border border-surface-container-high overflow-hidden flex flex-col">
          {/* Sidebar Header */}
          <div className="bg-primary text-white p-6 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-secondary rounded-full opacity-20 blur-2xl"></div>
            <h2 className="font-headline-md text-headline-md mb-1 relative z-10">Your Reservation</h2>
            <p className="text-sm text-surface-container-high opacity-80 relative z-10">
              {admin ? "Admin · No payment" : "Summary &amp; Checkout"}
            </p>
          </div>
          <div className="p-6 flex flex-col gap-6">
            {/* Selected Rooms */}
            <div className="flex flex-col gap-4 pb-6 border-b border-surface-container-high">
              {selectedRooms.length > 0 ? (
                selectedRooms.map((room) => {
                  const status = unitStatus(room.slug)
                  const roomFull = !!status && status.available <= 0
                  return (
                    <div key={room.name} className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 relative">
                        <Image
                          alt={`${room.name} Thumbnail`}
                          fill
                          sizes="64px"
                          className="object-cover"
                          src={room.image}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-headline-md text-lg text-primary leading-tight">{room.name}</h4>
                        <span className="text-sm text-on-surface-variant mt-1 inline-block">
                          {formatPeso(room.price)} / night
                        </span>
                        {hasSelectedDates && roomFull && (
                          <span className="block mt-1 text-xs font-medium text-rose-600">
                            {firstConflict(room.slug)
                              ? `Taken: ${firstConflict(room.slug)}`
                              : "No availability for these dates"}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleRoom(room.name)}
                        className="text-secondary text-sm hover:underline"
                        aria-label={`Remove ${room.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  )
                })
              ) : (
                <div>
                  <h4 className="font-headline-md text-lg text-primary leading-tight">No room selected</h4>
                  <span className="text-sm text-on-surface-variant mt-1 inline-block">
                    Select an accommodation to continue.
                  </span>
                </div>
              )}
              {selectedRooms.length > 0 && (
                <span className="text-sm text-secondary font-medium">
                  {selectedRooms.length} {selectedRooms.length === 1 ? "Room" : "Rooms"} Selected
                </span>
              )}
            </div>
            {/* Stay Details */}
            <div className="flex flex-col gap-4 pb-6 border-b border-surface-container-high">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">Check-in</span>
                  <span className="font-medium text-primary text-sm mt-1">{formatDate(checkIn) || "Select"}</span>
                  <span className="text-xs text-on-surface-variant">{checkInHour}:00 {checkInPeriod}</span>
                </div>
                <div className="flex flex-col items-center justify-center px-4">
                  <div className="w-12 h-[1px] bg-surface-container-high relative">
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-container-lowest px-2 text-xs text-secondary font-medium">
                      {hours} {hours === 1 ? "Hour" : "Hours"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">Check-out</span>
                  <span className="font-medium text-primary text-sm mt-1">{formatDate(checkOut) || "Select"}</span>
                  <span className="text-xs text-on-surface-variant">{checkOutHour}:00 {checkOutPeriod}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary mt-2">
                <span className="material-symbols-outlined text-[18px]" style={lightIcon}>group</span>
                {guests.adults + guests.children + guests.infants} Guests
              </div>
            </div>
            {/* Price Breakdown */}
            <div className="flex flex-col gap-3 pb-6 border-b border-surface-container-high text-sm">
              {selectedRooms.length > 0 ? (
                selectedRooms.map((room) => {
                  const rate = hourlyRateOf(room.price)
                  return (
                    <div key={room.name} className="flex justify-between text-on-surface">
                      <span>
                        {room.name} · {formatPeso(rate)}/hr × {hours} {hours === 1 ? "hour" : "hours"}
                      </span>
                      <span>{formatPeso(rate * hours)}</span>
                    </div>
                  )
                })
              ) : (
                <div className="flex justify-between text-on-surface">
                  <span>No accommodation</span>
                  <span>{formatPeso(0)}</span>
                </div>
              )}
              <div className="flex justify-between text-on-surface">
                <span>Resort Fee</span>
                <span>{formatPeso(resortFee)}</span>
              </div>
              <div className="flex justify-between text-on-surface">
                <span>Taxes</span>
                <span>{formatPeso(taxes)}</span>
              </div>
            </div>
            {/* Total */}
            <div className="flex flex-col gap-2 pt-2 mb-6">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="font-label-caps text-on-surface-variant uppercase">Total</span>
                  <span className="text-xs text-on-surface-variant">Includes all taxes and fees</span>
                </div>
                <span className="font-display-lg-mobile text-primary text-3xl">
                  {formatPeso(total)}
                </span>
              </div>
              <div className="h-[1px] bg-surface-container-high"></div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary font-medium">Pay now ({BOOKING_FEE_PERCENT}% booking fee)</span>
                <span className="font-bold text-secondary">{formatPeso(bookingFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Balance at check-in</span>
                <span className="font-medium">{formatPeso(balanceDue)}</span>
              </div>
            </div>
            {/* Invalid dates/time warning */}
            {(datesInvalid || timesInvalid) && (
              <div className="flex items-start gap-2 bg-error-container/50 border border-error/20 rounded-lg px-4 py-3 mb-6">
                <span className="material-symbols-outlined text-error text-[18px] mt-0.5">error</span>
                <p className="text-sm text-on-error-container">
                  {datesInvalid
                    ? "Check-in date is after check-out. Choose a valid stay period to continue."
                    : "Check-out time must be after check-in time to continue."}
                </p>
              </div>
            )}
            {/* Checkout Button */}
            {selectedRooms.length > 0 && checkIn && checkOut && !datesInvalid && !timesInvalid && !hasFullSelected ? (
              <Link
                href={`${admin ? "/admin/book/confirm" : "/checkout"}?rooms=${encodeURIComponent(selectedRooms.map((r) => r.slug).join(","))}&checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}&checkInTime=${encodeURIComponent(`${checkInHour}:00 ${checkInPeriod}`)}&checkOutTime=${encodeURIComponent(`${checkOutHour}:00 ${checkOutPeriod}`)}&adults=${guests.adults}&children=${guests.children}&infants=${guests.infants}`}
                className="inline-block"
              >
                <button className="w-full py-4 bg-primary-container text-white rounded-lg font-body-lg text-body-lg hover:bg-secondary transition-colors duration-300 shadow-ambient flex justify-center items-center gap-2">
                  {admin ? "Continue to Guest Details" : "Proceed to Payment"}
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              </Link>
            ) : (
              <button
                disabled
                className="w-full py-4 bg-surface-container-high text-surface-dim rounded-lg font-body-lg text-body-lg shadow-ambient flex justify-center items-center gap-2 cursor-not-allowed"
              >
                {admin ? "Continue to Guest Details" : "Proceed to Payment"}
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            )}
            {selectedRooms.length === 0 || !checkIn || !checkOut || datesInvalid || timesInvalid || hasFullSelected ? (
              <p className="flex items-start justify-center gap-1.5 text-xs text-on-surface-variant mt-3 text-center">
                <span className="material-symbols-outlined text-[14px] text-error mt-px">info</span>
                {!selectedRooms.length
                  ? "Select at least one accommodation to continue."
                  : !checkIn || !checkOut
                    ? "Select your check-in and check-out dates to continue."
                    : datesInvalid
                      ? "Choose a valid stay period to continue."
                      : hasFullSelected
                        ? "One of your selected accommodations is fully booked for these dates. Remove it or change dates to continue."
                        : "Set a valid check-in and check-out time to continue."}
              </p>
            ) : null}
            <p className="text-xs text-center text-on-surface-variant mt-2">
              {admin ? "No payment is collected for admin bookings." : "You won&apos;t be charged yet."}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
