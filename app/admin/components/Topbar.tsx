import { Search, Plus, CalendarDays } from "lucide-react"
import Link from "next/link"
import { NotificationDropdown } from "./NotificationDropdown"

type TopbarProps = {
  title?: string
  eyebrow?: string
}

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
})

export function Topbar({ title = "Good morning, Admin", eyebrow }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-outline-variant/30 bg-background/90 px-5 py-5 backdrop-blur md:flex-row md:items-center md:justify-between lg:px-8">
      <div>
        <p className="flex items-center gap-2 text-sm text-on-surface-variant">
          <CalendarDays className="size-4" />
          {eyebrow ?? today}
        </p>
        <h1 className="mt-1 font-headline-md text-2xl text-on-surface md:text-3xl">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="search"
            placeholder="Search guests, rooms…"
            aria-label="Search"
            className="h-10 w-56 rounded-lg border border-outline-variant/40 bg-surface-container-lowest pl-9 pr-3 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
          />
        </div>
        <NotificationDropdown />
        <Link
          className="flex h-10 items-center gap-2 rounded-lg bg-secondary px-4 text-sm font-medium text-white transition hover:opacity-90"
          href="/admin/book"
        >
          <Plus className="size-4" />
          New booking
        </Link>
      </div>
    </header>
  )
}