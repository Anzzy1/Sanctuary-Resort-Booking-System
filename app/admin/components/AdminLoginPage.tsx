"use client"

import { useState } from "react"
import { useActionState } from "react"
import Image from "next/image"
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Waves } from "lucide-react"
import {
  adminLoginCredentials,
  adminRequestOtp,
  adminVerifyOtp,
  type AdminCredentialsState,
  type AdminRequestOtpState,
  type AdminVerifyOtpState,
} from "../actions"

const credInit: AdminCredentialsState = { error: null, ok: false, email: "" }
const verifyInit: AdminVerifyOtpState = { error: null, email: "" }
const resendInit: AdminRequestOtpState = { error: null, ok: false, email: "" }

export function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  const [credState, credAction, credPending] = useActionState(adminLoginCredentials, credInit)
  const [verifyState, verifyAction, verifyPending] = useActionState(adminVerifyOtp, verifyInit)
  const [resendState, resendAction, resendPending] = useActionState(adminRequestOtp, resendInit)

  const email = credState.ok && credState.email ? credState.email : resendState.email
  const showVerify = credState.ok

  return (
    <main className="flex min-h-screen bg-background">
      <section className="relative hidden min-h-screen flex-1 overflow-hidden bg-primary lg:flex lg:max-w-[53%]">
        <Image
          src="/pavilion-water.png"
          alt="A tranquil sanctuary pavilion over still water"
          fill
          priority
          sizes="(min-width: 1024px) 53vw, 100vw"
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-primary/55" />
        <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
          <div className="flex items-center gap-3 text-on-primary">
            <span className="flex size-10 items-center justify-center rounded-full border border-on-primary/30">
              <Waves className="size-5" />
            </span>
            <span className="font-display-lg text-xl tracking-wide">Sanctuary</span>
          </div>
          <div className="max-w-lg pb-4">
            <p className="mb-5 font-label-caps text-label-caps uppercase tracking-[0.24em] text-on-primary/70">
              Sanctuary operations
            </p>
            <h1 className="font-headline-lg text-4xl leading-[1.1] text-on-primary xl:text-5xl text-balance">
              A quieter way to care for every stay.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-on-primary/75">
              Your private view into arrivals, reservations, guests, and the living landscape that makes Sanctuary feel
              like home.
            </p>
          </div>
        </div>
      </section>

      <section className="flex w-full flex-col items-center justify-center px-6 py-10 sm:px-10 lg:w-[47%] lg:px-16 xl:px-24">
        <div className="w-full max-w-md">
          <div className="mb-12 flex items-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary font-display-lg text-xl text-on-primary">
              <Waves className="size-5" />
            </span>
            <span className="font-display-lg text-xl tracking-wide text-on-background">Sanctuary</span>
          </div>

          {!showVerify ? (
            <>
              <div className="mb-9">
                <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-secondary text-on-primary">
                  <LockKeyhole className="size-5" />
                </div>
                <p className="mb-3 font-label-caps text-label-caps uppercase tracking-[0.2em] text-on-surface-variant">
                  Admin portal
                </p>
                <h2 className="font-headline-lg text-4xl text-on-background text-balance">Welcome back.</h2>
                <p className="mt-3 text-sm leading-6 text-on-surface-variant">Sign in to manage the sanctuary with intention.</p>
              </div>

              <form action={credAction} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-on-surface">Work email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      id="email"
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      placeholder="you@sanctuary.com"
                      className="h-12 w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest pl-11 pr-4 text-sm text-on-background outline-none transition placeholder:text-on-surface-variant/65 focus:border-secondary focus:ring-2 focus:ring-secondary/15"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-on-surface">Password</label>
                  </div>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="h-12 w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest pl-11 pr-12 text-sm text-on-background outline-none transition placeholder:text-on-surface-variant/65 focus:border-secondary focus:ring-2 focus:ring-secondary/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-background"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                {credState.error && (
                  <p className="text-sm text-error bg-error-container/30 border border-error/20 rounded-lg px-4 py-3">
                    {credState.error}
                  </p>
                )}
                <button
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-on-primary transition hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-secondary/30 disabled:opacity-60 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={credPending}
                >
                  {credPending ? "Signing in…" : "Continue"} <ArrowRight className="size-4" />
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-9">
                <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-secondary text-on-primary">
                  <ShieldCheck className="size-5" />
                </div>
                <p className="mb-3 font-label-caps text-label-caps uppercase tracking-[0.2em] text-on-surface-variant">
                  One more step
                </p>
                <h2 className="font-headline-lg text-4xl text-on-background text-balance">Check your inbox.</h2>
                <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                  We sent a six-digit verification code to{" "}
                  <span className="font-medium text-on-background">{email}</span>.
                </p>
              </div>
              <form action={verifyAction} className="space-y-5">
                <input type="hidden" name="email" value={email ?? ""} />
                <div className="space-y-2">
                  <label htmlFor="code" className="text-sm font-medium text-on-surface">Verification code</label>
                  <input
                    id="code"
                    name="code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    autoFocus
                    required
                    placeholder="000000"
                    className="h-14 w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-center font-mono text-2xl tracking-[0.45em] text-on-background outline-none transition placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-2 focus:ring-secondary/15"
                  />
                </div>
                {verifyState.error && (
                  <p className="text-sm text-error bg-error-container/30 border border-error/20 rounded-lg px-4 py-3">
                    {verifyState.error}
                  </p>
                )}
                <button
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-on-primary transition hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-secondary/30 disabled:opacity-60 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={verifyPending}
                >
                  {verifyPending ? "Verifying…" : "Verify and enter"} <Check className="size-4" />
                </button>
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="font-medium text-on-surface-variant hover:text-on-background"
                  >
                    Use a different account
                  </button>
                  <button
                    formAction={resendAction}
                    className="font-medium text-secondary hover:text-primary disabled:opacity-60"
                    type="submit"
                    disabled={resendPending}
                  >
                    {resendPending ? "Sending…" : "Resend code"}
                  </button>
                </div>
                {resendState.error && (
                  <p className="text-sm text-error bg-error-container/30 border border-error/20 rounded-lg px-4 py-3">
                    {resendState.error}
                  </p>
                )}
              </form>
            </>
          )}

          <p className="mt-12 text-center text-xs leading-5 text-on-surface-variant">
            Protected access for Sanctuary team members.
            <br />
            If you need help, contact your property administrator.
          </p>
        </div>
      </section>
    </main>
  )
}