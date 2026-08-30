import Link from "next/link"
import { LayoutDashboard, CalendarDays, ClipboardCheck, BedDouble, Users, BarChart3 } from "lucide-react"
import { adminLogout, verifyAdmin } from "./actions"
import { AdminSidebar } from "./components/AdminSidebar"
import { AdminLoginPage } from "./components/AdminLoginPage"

export const dynamic = "force-dynamic"

const mobileNav = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin" },
  { label: "Reservations", icon: CalendarDays, href: "/admin/bookings" },
  { label: "Check-in", icon: ClipboardCheck, href: "/admin/checkin" },
  { label: "Accommodations", icon: BedDouble, href: "/admin/accommodations" },
  { label: "Guests", icon: Users, href: "/admin/guests" },
  { label: "Reports", icon: BarChart3, href: "/admin/reports" },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adminEmail = await verifyAdmin()

  if (!adminEmail) {
    return <AdminLoginPage />
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar email={adminEmail} onLogout={adminLogout} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto border-b border-outline-variant/30 bg-surface-container-lowest px-3 py-2">
          {mobileNav.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                href={item.href}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
          <form action={adminLogout} className="ml-auto shrink-0">
            <button className="px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface" type="submit">
              Sign out
            </button>
          </form>
        </div>
        {children}
      </div>
    </div>
  )
}