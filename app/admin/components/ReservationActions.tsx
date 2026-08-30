"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { Eye, X } from "lucide-react"
import { updateBookingStatus, deleteBooking, checkInReservation, verifyGcashPayment, rejectGcashPayment } from "../actions"
import { scheduledCheckInMillis } from "@/lib/booking-time"
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/payment"

function formatMinutes(minutes: number): string {
  if (minutes <= 0) return "now"
  const h = Math.floor(minutes / 60)
  const m = Math.floor(minutes % 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

const peso = (value: number) => `₱${Math.round(value).toLocaleString("en-US")}`

const statusBannerStyles: Record<string, string> = {
  verifying: "bg-amber-50 border-amber-300 text-amber-800",
  paid: "bg-emerald-50 border-emerald-300 text-emerald-800",
  failed: "bg-rose-50 border-rose-300 text-rose-800",
}
const statusBannerLabel: Record<string, string> = {
  verifying: "Awaiting verification",
  paid: "✔ Payment confirmed",
  failed: "✕ Payment rejected",
}

export function ReservationActions({
  id,
  status,
  bookingNumber,
  checkIn,
  checkInTime,
  guestEmail,
  guestPhone,
  paymentStatus,
  paymentMethod,
  paymentReference,
  paymentSender,
  paymentRejectionReason,
  paymentAmount,
  hasProof,
}: {
  id: string
  status: string
  bookingNumber: string
  checkIn: string
  checkInTime: string
  guestEmail?: string
  guestPhone?: string | null
  paymentStatus?: string
  paymentMethod?: string
  paymentReference?: string | null
  paymentSender?: string | null
  paymentRejectionReason?: string | null
  paymentAmount?: number
  hasProof?: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [now, setNow] = useState(() => Date.now())
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [showRejectStep, setShowRejectStep] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const allowedAt = useMemo(() => scheduledCheckInMillis(new Date(checkIn), checkInTime) - 2 * 60 * 60 * 1000, [checkIn, checkInTime])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(timer)
  }, [])

  const minsUntilAllowed = Math.round((allowedAt - now) / 60000)
  const checkInAllowed = now >= allowedAt

  const isVerifying = paymentStatus === "verifying"

  const closeVerifyModal = () => {
    setShowVerifyModal(false)
    setShowRejectStep(false)
    setRejectReason("")
  }

  useEffect(() => {
    if (!showVerifyModal) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeVerifyModal()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showVerifyModal])

  const setStatus = (next: string) => {
    const data = new FormData()
    data.set("id", id)
    data.set("status", next)
    startTransition(async () => {
      await updateBookingStatus(data)
    })
  }

  const handleCheckIn = () => {
    if (!checkInAllowed) return
    const data = new FormData()
    data.set("id", id)
    startTransition(async () => {
      await checkInReservation(data)
    })
  }

  const handleDelete = () => {
    if (!window.confirm(`Delete booking ${bookingNumber} permanently?`)) return
    const data = new FormData()
    data.set("id", id)
    startTransition(async () => {
      await deleteBooking(data)
    })
  }

  const handleConfirmPayment = () => {
    if (!window.confirm(`Confirm GCash payment of ${peso(paymentAmount ?? 0)} for ${bookingNumber}?`)) return
    setShowVerifyModal(false)
    setShowRejectStep(false)
    setRejectReason("")
    const data = new FormData()
    data.set("id", id)
    startTransition(async () => {
      await verifyGcashPayment(data)
    })
  }

  const handleRejectPayment = () => {
    if (!window.confirm(`Reject this payment and release ${bookingNumber}? The guest will be emailed.`)) return
    setShowVerifyModal(false)
    setShowRejectStep(false)
    setRejectReason("")
    const data = new FormData()
    data.set("id", id)
    data.set("reason", rejectReason)
    startTransition(async () => {
      await rejectGcashPayment(data)
    })
  }

  const reviewButtonLabel =
    paymentStatus === "verifying"
      ? `Review GCash payment${paymentReference ? ` · ${paymentReference}` : ""}`
      : paymentStatus === "paid"
        ? `View confirmed payment${paymentReference ? ` · ${paymentReference}` : ""}`
        : paymentStatus === "failed"
          ? `View rejected payment${paymentReference ? ` · ${paymentReference}` : ""}`
          : null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {reviewButtonLabel && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => setShowVerifyModal(true)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-50 ${
            paymentStatus === "verifying" ? "bg-emerald-600 hover:bg-emerald-700" : "border border-outline-variant/40 bg-surface-container-lowest !text-on-surface hover:bg-surface-container-low"
          }`}
        >
          {(paymentStatus === "verifying" || hasProof) && <Eye className="size-3.5" />}
          {reviewButtonLabel}
        </button>
      )}

      {showVerifyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="GCash payment details"
          onClick={closeVerifyModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-surface-variant/30 p-5">
              <div>
                <h2 className="font-headline-md text-lg text-on-surface">GCash Payment Details</h2>
                <p className="text-xs text-on-surface-variant">{bookingNumber}</p>
              </div>
              <button
                type="button"
                onClick={closeVerifyModal}
                aria-label="Close"
                className="rounded-lg p-1.5 text-on-surface-variant transition hover:bg-surface-container-low"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4 p-5">
              {paymentStatus && (
                <div className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${statusBannerStyles[paymentStatus] ?? ""}`}>
                  {statusBannerLabel[paymentStatus] ?? paymentStatus}
                </div>
              )}

              {paymentStatus === "failed" && (
                <div className="rounded-xl border-l-4 border-rose-400 bg-rose-50/60 px-4 py-3 text-sm">
                  <p className="mb-1 text-xs uppercase tracking-wider text-rose-700">Your response</p>
                  <p className="text-on-surface">{paymentRejectionReason || "(no reason recorded)"}</p>
                </div>
              )}

              <p className="text-center font-headline-md text-3xl text-primary">{peso(paymentAmount ?? 0)}</p>

              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-xl bg-surface-container-low p-4 text-sm">
                <dt className="text-on-surface-variant">Reference no.</dt>
                <dd className="break-all text-right font-medium text-on-surface">{paymentReference ?? "—"}</dd>
                <dt className="text-on-surface-variant">Sender name</dt>
                <dd className="text-right font-medium text-on-surface">{paymentSender ?? "—"}</dd>
              </dl>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Contact guest
                </p>
                <div className="flex flex-col gap-2 rounded-xl bg-surface-container-low p-4 text-sm">
                  {guestEmail ? (
                    <a
                      href={`mailto:${guestEmail}`}
                      className="flex items-center gap-2 font-medium text-secondary group"
                    >
                      <span className="material-symbols-outlined text-[18px]">mail</span>
                      <span className="group-hover:underline">{guestEmail}</span>
                    </a>
                  ) : (
                    <span className="text-on-surface-variant">No email on file</span>
                  )}
                  {guestPhone ? (
                    <a href={`tel:${guestPhone}`} className="flex items-center gap-2 font-medium text-secondary group">
                      <span className="material-symbols-outlined text-[18px]">call</span>
                      <span className="group-hover:underline">{guestPhone}</span>
                    </a>
                  ) : (
                    <span className="text-on-surface-variant">No phone on file</span>
                  )}
                </div>
              </div>

              {hasProof ? (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Receipt screenshot
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={`Payment proof for ${bookingNumber}`}
                    className="max-h-72 w-full rounded-xl border border-outline-variant/30 object-contain"
                    src={`/api/payment-proof/${id}`}
                  />
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-outline-variant/40 px-4 py-3 text-center text-sm text-on-surface-variant">
                  No screenshot attached — verify against your GCash inbox using the reference number above.
                </p>
              )}

              {isVerifying ? (
                showRejectStep ? (
                  <div className="flex flex-col gap-3">
                    <div>
                      <label htmlFor={`reject-reason-${id}`} className="mb-2 block text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                        Why is this payment being rejected?
                      </label>
                      <textarea
                        id={`reject-reason-${id}`}
                        value={rejectReason}
                        onChange={(event) => setRejectReason(event.target.value.slice(0, 500))}
                        rows={3}
                        placeholder="e.g. Reference number not found in GCash records · Amount sent does not match the total"
                        className="w-full resize-none rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-secondary focus:ring-1 focus:ring-secondary"
                      />
                      <p className="mt-1 text-right text-xs text-on-surface-variant">{rejectReason.length}/500</p>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      This message will be included in the email we send to the guest, together with the booking and
                      payment details.
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => setShowRejectStep(false)}
                        className="flex-1 rounded-lg border border-outline-variant/40 px-4 py-2.5 text-sm font-medium text-on-surface transition hover:bg-surface-container-low disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={handleRejectPayment}
                        className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-50"
                      >
                        Reject &amp; notify guest
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setShowRejectStep(true)}
                      className="flex-1 rounded-lg border border-rose-300 px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={handleConfirmPayment}
                      className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Confirm payment
                    </button>
                  </div>
                )
              ) : (
                <button
                  type="button"
                  onClick={closeVerifyModal}
                  className="w-full rounded-lg border border-outline-variant/40 px-4 py-2.5 text-sm font-medium text-on-surface transition hover:bg-surface-container-low"
                >
                  Close
                </button>
              )}
              {isPending && <p className="text-center text-xs text-on-surface-variant">Working…</p>}
            </div>
          </div>
        </div>
      )}

      {status === "pending" &&
        (checkInAllowed ? (
          <button
            type="button"
            disabled={isPending}
            onClick={handleCheckIn}
            className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            Check in
          </button>
        ) : (
          <span className="flex items-center gap-1.5 rounded-lg border border-outline-variant/40 px-3 py-1.5 text-xs font-medium text-on-surface-variant">
            <span className="size-1.5 animate-pulse rounded-full bg-tertiary" />
            Check in opens in {formatMinutes(minsUntilAllowed)}
          </span>
        ))}
      {status === "cancelled" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => setStatus("pending")}
          className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          Uncancel
        </button>
      )}
      {status === "pending" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (!window.confirm(`Cancel reservation ${bookingNumber}?`)) return
            setStatus("cancelled")
          }}
          className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
        >
          Cancel
        </button>
      )}
      {status !== "cancelled" && status !== "pending" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => setStatus("cancelled")}
          className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
        >
          Cancel
        </button>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        className="rounded-lg border border-outline-variant/40 px-3 py-1.5 text-xs font-medium text-on-surface-variant transition hover:bg-surface-container-low disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  )
}
