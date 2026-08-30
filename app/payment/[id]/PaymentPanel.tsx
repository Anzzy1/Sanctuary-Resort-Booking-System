"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { completePayment, submitGcashReference } from "../actions"
import {
  EWALLET_METHODS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  isValidExpiry,
  isValidGcashReference,
  luhnCheck,
  type PaymentMethod,
} from "@/lib/payment"

const ewalletQrSrc: Record<(typeof EWALLET_METHODS)[number], string> = {
  gcash: "/gcash-qr.png?v=2",
  maya: "/maya-qr.png?v=2",
}

const methodShort: Record<PaymentMethod, string> = {
  mastercard: "MC",
  visa: "VISA",
  gcash: "G",
  maya: "M",
}

const inputClass =
  "w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3.5 font-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors duration-200 h-14"

const labelClass = "mb-2 block font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest"

function toLocaleMoney(value: number): string {
  return `₱${Math.round(value).toLocaleString("en-US")}`
}

export function PaymentPanel(props: {
  bookingId: string
  bookingNumber: string
  amount: number
  createdAt: string
  initialMethod: PaymentMethod
}) {
  const { bookingId, bookingNumber, amount, createdAt, initialMethod } = props
  const router = useRouter()

  const [method, setMethod] = useState<PaymentMethod>(initialMethod)
  const [processing, setProcessing] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const [cardName, setCardName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvv, setCvv] = useState("")
  const [gcashRef, setGcashRef] = useState("")
  const [gcashName, setGcashName] = useState("")
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)

  const isCard = method === "visa" || method === "mastercard"
  const isEwallet = (EWALLET_METHODS as readonly string[]).includes(method)

  function validate(): string | null {
    if (isEwallet) {
      if (!isValidGcashReference(gcashRef)) return `Enter the ${PAYMENT_METHOD_LABELS[method]} reference number from your receipt (6-20 letters or digits).`
      if (gcashName.trim().length < 2) return `Enter the name on the ${PAYMENT_METHOD_LABELS[method]} account that sent the payment.`
      if (proofFile && proofFile.size > 2 * 1024 * 1024) return "That screenshot is too large. Please attach an image under 2 MB."
      return null
    }
    if (!isCard) return null
    if (cardName.trim().length < 3) return "Please enter the full name on the card."
    const brand = detectCardBrand(cardNumber)
    if (!luhnCheck(cardNumber.replace(/\s+/g, ""))) return "That card number is invalid."
    if (brand && brand !== method) return `This card number does not match ${PAYMENT_METHOD_LABELS[method]}.`
    if (!isValidExpiry(expiry)) return "The expiration date is invalid or already expired."
    if (!/^\d{3,4}$/.test(cvv)) return "The CVV must be 3 or 4 digits."
    return null
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (processing) return
    const validationError = validate()
    if (validationError) {
      setFormError(validationError)
      return
    }
    setFormError(null)
    setServerError(null)
    setProcessing(true)
    const form = new FormData(event.currentTarget)
    try {
      if (isEwallet && proofFile) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result))
          reader.onerror = () => reject(new Error("read failed"))
          reader.readAsDataURL(proofFile)
        })
        form.set("proofImage", dataUrl)
      }
      const action = isEwallet ? submitGcashReference : completePayment
      const [result] = await Promise.all([
        action({ error: null }, form),
        new Promise<void>((resolve) => setTimeout(resolve, isEwallet ? 1200 : 2200)),
      ])
      if (result.error) {
        setServerError(result.error)
        return
      }
      if (result.redirect) {
        router.push(result.redirect)
      }
    } catch {
      setServerError("Something went wrong while processing your payment. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const deadlineLabel = new Date(new Date(createdAt).getTime() + 30 * 60 * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  return (
    <section className="bg-white p-8 md:p-10 rounded-2xl shadow-coastal border border-surface-variant/20 flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">lock</span>
        </div>
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">Payment Method</h2>
          <p className="text-sm text-on-surface-variant">Reservation {bookingNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {PAYMENT_METHODS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMethod(m)}
            aria-pressed={method === m}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors ${
              method === m
                ? "border-secondary bg-secondary/5 ring-1 ring-secondary"
                : "border-surface-variant/30 bg-surface-container-lowest hover:border-secondary"
            }`}
          >
            <div className="w-10 h-6 flex items-center justify-center overflow-hidden relative bg-surface-container-high rounded-md">
              <span className="text-[10px] font-bold tracking-tight text-on-surface">{methodShort[m]}</span>
            </div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
              {PAYMENT_METHOD_LABELS[m]}
            </span>
          </button>
        ))}
      </div>

      <div className="h-[1px] bg-surface-variant/30"></div>

      <form onSubmit={onSubmit} className="flex flex-col gap-8">
        <input type="hidden" name="id" value={bookingId} />
        <input type="hidden" name="method" value={method} />

        {/* Card */}
        {isCard && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="cardName">
                Name on Card
              </label>
              <input
                className={inputClass}
                id="cardName"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Jane Doe"
                autoComplete="cc-name"
                type="text"
              />
            </div>
            <div className="md:col-span-2 relative">
              <label className={labelClass} htmlFor="cardNumber">
                Card Number
              </label>
              <input
                className={`${inputClass} pr-12`}
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
                autoComplete="cc-number"
                type="text"
              />
              <span className="material-symbols-outlined absolute right-4 text-outline top-[42px]">credit_card</span>
            </div>
            <div>
              <label className={labelClass} htmlFor="expiry">
                Expiration Date
              </label>
              <input
                className={inputClass}
                id="expiry"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                inputMode="numeric"
                autoComplete="cc-exp"
                type="text"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="cvv">
                CVV
              </label>
              <input
                className={inputClass}
                id="cvv"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="123"
                inputMode="numeric"
                autoComplete="cc-csc"
                type="text"
              />
            </div>
            <div className="md:col-span-2 flex items-start gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-secondary text-[18px]">verified_user</span>
              <span>Card details are validated locally for this test checkout and are never stored.</span>
            </div>
          </div>
        )}

        {/* E-wallet (GCash/Maya): real QR + exact amount + reference number */}
        {isEwallet && (
          <div className="flex flex-col gap-6">
            <div className="p-6 rounded-2xl bg-[#0075f6]/5 border border-[#0075f6]/20 flex flex-col items-center text-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={`${PAYMENT_METHOD_LABELS[method]} QR code`} className="w-56 h-56 object-contain rounded-xl border border-surface-variant/40 bg-white" src={ewalletQrSrc[method as keyof typeof ewalletQrSrc]} />
              <div>
                <p className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest">Send the exact amount</p>
                <p className="font-headline-lg text-headline-lg text-primary">{toLocaleMoney(amount)}</p>
              </div>
            </div>
            <ol className="flex flex-col gap-3 text-sm text-on-surface-variant">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xs font-bold">1</span>
                <span>Open your {PAYMENT_METHOD_LABELS[method]} app and scan the QR code above.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xs font-bold">2</span>
                <span>
                  Send <span className="font-bold text-primary">{toLocaleMoney(amount)}</span> — the exact booking fee. Payments
                  with a different amount cannot be verified.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xs font-bold">3</span>
                <span>Copy the reference number from your {PAYMENT_METHOD_LABELS[method]} receipt and enter it below.</span>
              </li>
            </ol>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass} htmlFor="referenceNumber">
                  {PAYMENT_METHOD_LABELS[method]} Reference Number
                </label>
                <input
                  className={inputClass}
                  id="referenceNumber"
                  name="referenceNumber"
                  value={gcashRef}
                  onChange={(e) => setGcashRef(e.target.value)}
                  placeholder="e.g. 904123456712"
                  autoComplete="off"
                  type="text"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="senderName">
                  Sender Name
                </label>
                <input
                  className={inputClass}
                  id="senderName"
                  name="senderName"
                  value={gcashName}
                  onChange={(e) => setGcashName(e.target.value)}
                  placeholder={`Name on your ${PAYMENT_METHOD_LABELS[method]} account`}
                  autoComplete="name"
                  type="text"
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="proofInput">
                Receipt Screenshot <span className="normal-case tracking-normal text-on-surface-variant/70">· optional, speeds up verification</span>
              </label>
              {proofPreview ? (
                <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={`${PAYMENT_METHOD_LABELS[method]} receipt preview`} className="h-20 w-20 rounded-lg border border-surface-variant/40 object-cover" src={proofPreview} />
                  <div className="flex-1 text-sm text-on-surface-variant">
                    <p className="font-medium text-on-surface">{proofFile?.name}</p>
                    <p>{proofFile ? (proofFile.size / 1024).toFixed(0) : 0} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProofFile(null)
                      setProofPreview(null)
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/40 px-3 py-1.5 text-xs font-medium text-on-surface-variant transition hover:bg-surface-container-low"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                    Remove
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="proofInput"
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low px-4 py-6 text-center transition hover:border-secondary hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-secondary text-[28px]">add_photo_alternate</span>
                  <span className="text-sm font-medium text-on-surface">Attach a screenshot of your {PAYMENT_METHOD_LABELS[method]} receipt</span>
                  <span className="text-xs text-on-surface-variant">PNG, JPG, or WebP · up to 2 MB</span>
                  <input
                    className="hidden"
                    id="proofInput"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null
                      if (file && file.size > 2 * 1024 * 1024) {
                        setFormError("That screenshot is too large. Please attach an image under 2 MB.")
                        e.target.value = ""
                        return
                      }
                      setFormError(null)
                      setProofFile(file)
                      setProofPreview(file ? URL.createObjectURL(file) : null)
                    }}
                    type="file"
                  />
                </label>
              )}
            </div>
          </div>
        )}

        {(formError || serverError) && (
          <p className="rounded-xl bg-error-container/60 border border-error/20 px-4 py-3 text-sm text-on-error-container flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {formError ?? serverError}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={processing}
            className="w-full bg-primary-container text-white rounded-lg py-4 font-body-lg text-body-lg font-medium hover:bg-secondary transition-colors duration-300 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <span className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                {isEwallet ? "Submitting payment proof…" : "Processing payment…"}
              </>
            ) : isCard ? (
              <>
                Pay {toLocaleMoney(amount)}
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">lock</span>
              </>
            ) : isEwallet ? (
              <>
                I&apos;ve Sent the Payment
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </>
            ) : (
              <>
                I&apos;ve Completed the Payment
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </>
            )}
          </button>
          <p className="text-xs text-center text-on-surface-variant/70 flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            Please complete payment before <span className="font-medium">{deadlineLabel}</span>. Unpaid reservations are
            released automatically after 30 minutes.
          </p>
        </div>
      </form>
    </section>
  )
}