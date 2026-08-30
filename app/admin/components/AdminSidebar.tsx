"use client"

import { LayoutDashboard, CalendarDays, ClipboardCheck, BedDouble, Users, BarChart3, LogOut, Waves } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ComponentProps } from "react"

const nav = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin" },
  { label: "Reservations", icon: CalendarDays, href: "/admin/bookings" },
  { label: "Check-in", icon: ClipboardCheck, href: "/admin/checkin" },
  { label: "Accommodations", icon: BedDouble, href: "/admin/accommodations" },
  { label: "Guests", icon: Users, href: "/admin/guests" },
  { label: "Reports", icon: BarChart3, href: "/admin/reports" },
]

export function AdminSidebar({
  email,
  onLogout,
}: {
  email: string
  onLogout: ComponentProps<"form">["action"]
}) {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 hidden h-screen overflow-hidden lg:flex lg:w-64 shrink-0 flex-col gap-6 bg-primary dark:bg-tertiary-container px-4 py-6 text-white">
      <div className="flex shrink-0 items-center gap-3 px-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
          <Waves className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="font-headline-md text-lg text-white">Sanctuary</p>
          <p className="text-xs text-white/60">Admin Suite</p>
        </div>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-white/50">Manage</p>
        {nav.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-secondary text-white font-medium"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="size-4.5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="shrink-0 rounded-xl bg-white/10 p-4">
        <p className="font-headline-md text-sm text-white">Seasonal occupancy peak</p>
        <p className="mt-1 text-xs text-white/60">
          Rates auto-adjust for the monsoon retreat season starting September.
        </p>
      </div>

      <form action={onLogout} className="shrink-0 rounded-xl bg-white/5">
        <div className="px-4 pt-3">
          <p className="text-xs text-white/50">Signed in as</p>
          <p className="truncate text-sm text-white/90" title={email}>
            {email}
          </p>
        </div>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          type="submit"
        >
          <LogOut className="size-4.5" />
          Sign out
        </button>
      </form>
    </aside>
  )
}