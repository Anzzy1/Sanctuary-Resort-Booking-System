"use client"

import { useActionState, useRef, useState, useTransition } from "react"
import { QrCode, ScanLine, Search, UserPlus, RotateCcw, CheckCircle2, User, BedDouble } from "lucide-react"
import { checkInGuest, lookupBookingByNumber, type BookingLookup } from "../actions"

type AccommodationOption = { id: string; name: string; category: string; price: number }

function formatTime12h(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function defaultUntilDate(): string {
  const now = new Date()
  now.setDate(now.getDate() + 1)
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

export function CheckInPanel({ accommodations }: { accommodations: AccommodationOption[] }) {
  const [mode, setMode] = useState<"receipt" | "walkin">("receipt")
  const [number, setNumber] = useState("")
  const [found, setFound] = useState<BookingLookup | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [scanning, setScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null)
  const [receiptActionState, receiptFormAction] = useActionState(checkInGuest, { error: null })
  const [walkinActionState, walkinFormAction] = useActionState(checkInGuest, { error: null })

  const defaultNow = formatTime12h(new Date())

  const handleLookup = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    setError(null)
    startTransition(async () => {
      const result = await lookupBookingByNumber(trimmed)
      if (result) {
        setFound(result)
        setMode("receipt")
      } else {
        setError("No booking found with that receipt number.")
      }
    })
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch {
        // ignore
      }
      scannerRef.current = null
    }
    setScanning(false)
  }

  const startScanner = async () => {
    setCameraError(null)
    try {
      const { Html5Qrcode } = await import("html5-qrcode")
      const element = document.getElementById("qr-reader")
      if (!element) return
      const scanner = new Html5Qrcode("qr-reader")
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        (decodedText) => {
          setNumber(decodedText)
          handleLookup(decodedText)
          void stopScanner()
        },
        () => {
          // ignore individual frame errors
        },
      )
      setScanning(true)
    } catch {
      setCameraError("Camera not available. Type the receipt number below instead.")
      setScanning(false)
    }
  }

  const reset = () => {
    setFound(null)
    setNumber("")
    setError(null)
    setMode("receipt")
    void stopScanner()
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-container-high p-1">
        <button
          type="button"
          onClick={() => setMode("receipt")}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            mode === "receipt" ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant"
          }`}
        >
          <QrCode className="size-4" />
          With receipt
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("walkin")
            setFound(null)
            setError(null)
          }}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            mode === "walkin" ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant"
          }`}
        >
          <UserPlus className="size-4" />
          Walk-in (no receipt)
        </button>
      </div>

      {mode === "receipt" && !found && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
              Scan receipt QR
            </label>
            <button
              type="button"
              onClick={scanning ? stopScanner : startScanner}
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-secondary px-4 py-8 text-sm font-medium text-secondary transition hover:bg-secondary/5 disabled:opacity-50"
            >
              {scanning ? (
                <>
                  <RotateCcw className="size-5" />
                  Stop scanning
                </>
              ) : (
                <>
                  <ScanLine className="size-5" />
                  Start QR scanner
                </>
              )}
            </button>
            {cameraError && <p className="mt-2 text-xs text-rose-700">{cameraError}</p>}
          </div>

          {scanning && (
            <div id="qr-reader" className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest" />
          )}

          <div>
            <label className="mb-1.5 block font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
              Or enter receipt number
            </label>
            <div className="flex gap-2">
              <input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleLookup(number)
                  }
                }}
                placeholder="#SAN-XXXX-XX"
                className="h-11 w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
              />
              <button
                type="button"
                onClick={() => handleLookup(number)}
                disabled={isPending || !number.trim()}
                className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-secondary px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                <Search className="size-4" />
                Look up
              </button>
            </div>
          </div>

          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        </div>
      )}

      {mode === "receipt" && found && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-on-surface">{found.guestName}</p>
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                {found.bookingNumber}
              </span>
            </div>
            <p className="mt-1 text-xs text-on-surface-variant">{found.email}</p>

            <div className="mt-3 space-y-1.5 text-sm text-on-surface-variant">
              {found.items.map((item) => (
                <p key={item.accommodationId} className="flex items-center gap-2">
                  <BedDouble className="size-4 text-secondary" />
                  {item.name}
                  <span className="text-xs">· {item.nights} nights</span>
                </p>
              ))}
              <p className="flex items-center gap-2">
                <User className="size-4 text-secondary" />
                Check-in {formatDate(found.checkIn)} {found.checkInTime} — until {formatDate(found.checkOut)}{" "}
                {found.checkOutTime}
              </p>
            </div>

            {found.status !== "confirmed" && (
              <p className="mt-2 text-xs text-amber-700">Status: {found.status} — will be marked occupied on confirm.</p>
            )}
          </div>

          <form action={receiptFormAction}>
            <input type="hidden" name="bookingId" value={found.id} />
            <input type="hidden" name="checkInTime" value={defaultNow} />
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white transition hover:bg-secondary disabled:opacity-50"
            >
              <CheckCircle2 className="size-4" />
              Confirm check-in — mark occupied
            </button>
            {receiptActionState.error && (
              <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {receiptActionState.error}
              </p>
            )}
          </form>

          <button
            type="button"
            onClick={reset}
            className="flex items-center justify-center gap-2 rounded-xl border border-outline-variant/40 px-4 py-2 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-low"
          >
            <RotateCcw className="size-4" />
            Use a different booking
          </button>
        </div>
      )}

      {mode === "walkin" && (
        <form action={walkinFormAction} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="wi-room">
              Room / cottage
            </label>
            <select
              id="wi-room"
              name="accommodationId"
              required
              className="h-11 w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
            >
              <option value="">Select a unit…</option>
              {accommodations.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} — ₱{Math.round(acc.price).toLocaleString("en-US")}/night
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="wi-guest">
              Guest name
            </label>
            <input
              id="wi-guest"
              name="guestName"
              required
              placeholder="e.g. Juan Dela Cruz"
              className="h-11 w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="wi-in-time">
                Check-in time
              </label>
              <input
                id="wi-in-time"
                name="checkInTime"
                required
                defaultValue={defaultNow}
                placeholder="2:00 PM"
                className="h-11 w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="wi-until">
                Until time
              </label>
              <input
                id="wi-until"
                name="untilTime"
                required
                defaultValue="11:00 AM"
                placeholder="11:00 AM"
                className="h-11 w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest" htmlFor="wi-until-date">
              Until date
            </label>
            <input
              id="wi-until-date"
              name="untilDate"
              type="date"
              required
              defaultValue={defaultUntilDate()}
              className="h-11 w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white transition hover:bg-secondary disabled:opacity-50"
          >
            <CheckCircle2 className="size-4" />
            Confirm walk-in check-in
          </button>
          {walkinActionState.error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {walkinActionState.error}
            </p>
          )}
        </form>
      )}
    </div>
  )
}