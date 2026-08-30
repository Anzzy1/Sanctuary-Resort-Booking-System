# Sanctuary Resort Booking System

Modern coastal resort booking platform — guests can browse accommodations, check real-time availability, and pay via GCash/Maya, while admins manage reservations, check-ins, and payments from a dedicated dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![Prisma](https://img.shields.io/badge/Prisma-7-2D3748) ![Postgres](https://img.shields.io/badge/Postgres-Supabase-336791) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)

**Live stack:** Next.js 16 (App Router, Turbopack) • Prisma 7 + Supabase Postgres (PgBouncer) • Tailwind CSS • Nodemailer • Lucide Icons

---

## ✨ Features

**Guest**
- Browse rooms/cottages/villas with filter + real-time `1 of 3 available` badges
- Date & hourly stay picker (check-in/out times) with fully-booked dates auto-disabled
- Instant pricing (hourly rate × hours + resort fee + taxes, booking fee %, balance due)
- Checkout → payment (GCash/Maya reference + proof upload) → confirmation + PDF receipt
- Fully responsive, image-optimized (local fallback `/pavilion-water.png`)

**Admin (`/admin`)**
- OTP email login (`ADMIN_EMAILS` + `AUTH_SECRET`)
- Overview, Reservations, Check-in (who's on-site today), Accommodations, Guests, Reports
- Create booking as admin (no payment), verify/reject GCash payments, check-in with 2h window
- Real-time notification bell (🔔) with FB-style count + ringtone: new booking, payment verification, ready-to-check-in, check-in, cancellation, expired
- Auto-expire pending unpaid bookings after 24h via `api/cron/expire-pending`
- Audit log (`AuditLog`) for status changes, check-ins, deletes, payment actions
- Rate-limited notification APIs

---

## 🚀 Quick Start

```bash
git clone https://github.com/Anzzy1/Sanctuary-Resort-Booking-System.git
cd "Resort Booking Website and System/resort-booking"

npm install
cp .env.example .env.local  # set DATABASE_URL, AUTH_SECRET, ADMIN_EMAILS, SMTP_*
npx prisma generate
npx prisma migrate dev
npm run dev  # http://localhost:3000
npm run build -- --webpack  # prod check (Turbopack has known panic, use webpack)
```

**Env (`.env.local`)**
```
DATABASE_URL="postgresql://...?pgbouncer=true"
AUTH_SECRET="random-32+"
ADMIN_EMAILS="admin@sanctuary.ph"
ADMIN_PASSWORD="..."
SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM
CRON_SECRET="..." # for /api/cron/expire-pending
PENDING_EXPIRY_HOURS="24"
```

---

## 📁 Structure

```
app/
  (guest) page.tsx, accommodations/, book/ → BookingExperience.tsx, checkout/, payment/[id]/
  admin/ layout, page, bookings/, checkin/, accommodations/, guests/, reports/, book/
  api/admin/notifications/, api/cron/expire-pending, api/receipt/[id]
lib/
  availability.ts, booking-lock.ts (pg_advisory_xact_lock), booking-time.ts,
  money.ts, mailer.ts, notifications.ts, audit.ts, rate-limit.ts, prisma.ts
prisma/
  schema.prisma (Booking, Payment, Accommodation, Notification, AuditLog, AdminOtp)
  migrations/
```

---

## 🔒 Booking Correctness

- Availability via `getOccupiedUnits`/`getNightlyOccupancy` + `slotConflicts` (hourly granularity)
- Race-safe `withBookingLock(roomIds, tx => assertUnitsAvailable(...,tx) + create)` — 8s lock_timeout, 3 retries
- Cron `GET /api/cron/expire-pending` (add `?secret=` or `Authorization: Bearer`) — set up via Vercel Cron / GitHub Actions hourly

---

## 🔔 Notifications

DB table `Notification` + `lib/notifications.ts`. Poll 60s from `Topbar` bell (Bell icon). Types: `new_booking`, `payment_verification`, `open_checkin` (auto-created when `isCheckInAllowed`), `check_in`, `cancellation`, `payment_confirmed/failed`. Click → `/admin/bookings?highlight=ID` or `/admin/checkin`. Sound via Web Audio double 880Hz beep.

---

## 📝 Scripts

- `npm run dev` — dev with Turbopack
- `npm run build` — production (use `--webpack` until Turbopack stable)
- `npx prisma studio` — DB GUI
- `npx prisma migrate dev --name <name>` — new migration

---

## 👤 Author

**Anzzy1** — https://github.com/Anzzy1

Built for Sanctuary Coastal Resort, Philippines.
