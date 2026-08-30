"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

function buildHref(basePath: string, base: Record<string, string>, page: number): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(base)) {
    if (value) params.set(key, value)
  }
  if (page > 1) params.set("page", String(page))
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

function getPageItems(page: number, totalPages: number): (number | "skip-start" | "skip-end")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const items: (number | "skip-start" | "skip-end")[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)
  if (start > 2) items.push("skip-start")
  for (let p = start; p <= end; p++) items.push(p)
  if (end < totalPages - 1) items.push("skip-end")
  items.push(totalPages)
  return items
}

export function PaginationBar({
  page,
  totalPages,
  base,
  basePath = "/admin/bookings",
}: {
  page: number
  totalPages: number
  base: Record<string, string>
  basePath?: string
}) {
  const navItem =
    "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-lg border border-outline-variant/40 px-2 font-medium transition"
  const navItemMuted = `${navItem} pointer-events-none opacity-50`
  const activeItem = `${navItem} pointer-events-none border-primary bg-primary text-white`
  const items = getPageItems(page, totalPages)

  if (totalPages <= 1) return null

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/20 pt-4 text-sm" aria-label="Reservation pages">
      <div className="flex items-center gap-1">
        {page > 1 ? (
          <Link href={buildHref(basePath, base, 1)} className={`${navItem} hover:bg-surface-container-low`} aria-label="First page">
            <ChevronsLeft className="size-4" />
          </Link>
        ) : (
          <span className={navItemMuted} aria-hidden>
            <ChevronsLeft className="size-4" />
          </span>
        )}
        {page > 1 ? (
          <Link href={buildHref(basePath, base, page - 1)} className={`${navItem} hover:bg-surface-container-low`}>
            <ChevronLeft className="size-4" />
            Previous
          </Link>
        ) : (
          <span className={navItemMuted}>
            <ChevronLeft className="size-4" />
            Previous
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {items.map((item) =>
          item === "skip-start" || item === "skip-end" ? (
            <span key={item} className="inline-flex h-8 min-w-6 items-end justify-center pb-1.5 text-on-surface-variant" title="Skipped pages">
              …
            </span>
          ) : item === page ? (
            <span key={item} className={activeItem} aria-current="page">
              {item}
            </span>
          ) : (
            <Link key={item} href={buildHref(basePath, base, item)} className={`${navItem} hover:bg-surface-container-low`} aria-label={`Page ${item}`}>
              {item}
            </Link>
          ),
        )}
      </div>

      <div className="flex items-center gap-1">
        {page < totalPages ? (
          <Link href={buildHref(basePath, base, page + 1)} className={`${navItem} hover:bg-surface-container-low`}>
            Next
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <span className={navItemMuted}>
            Next
            <ChevronRight className="size-4" />
          </span>
        )}
        {page < totalPages ? (
          <Link href={buildHref(basePath, base, totalPages)} className={`${navItem} hover:bg-surface-container-low`} aria-label="Last page">
            <ChevronsRight className="size-4" />
          </Link>
        ) : (
          <span className={navItemMuted} aria-hidden>
            <ChevronsRight className="size-4" />
          </span>
        )}
      </div>
    </nav>
  )
}
