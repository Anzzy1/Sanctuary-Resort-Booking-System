"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/accommodations", label: "Accommodations" },
  { href: "/about", label: "About Us" },
  { href: "/facilities", label: "Facilities" },
  { href: "/experience", label: "Experience" },
  { href: "/contact", label: "Contact" },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300">
      <div className="w-full px-margin-mobile md:px-margin-desktop flex justify-between items-center h-16 bg-white border-b border-black/10">
        <Link className="font-headline-md text-headline-md tracking-tighter text-primary dark:text-primary-fixed hover:opacity-80 transition-opacity" href="/">
          Sanctuary
        </Link>
        <div className="hidden md:flex items-center gap-2">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/")
            return (
              <Link
                key={link.href}
                className={`px-4 py-2 font-label-caps text-label-caps uppercase tracking-widest rounded-full transition-all duration-300 ${
                  active
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:opacity-80"
                }`}
                href={link.href}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
        <div className="flex items-center space-x-4">
          <Link className="bg-black text-white px-5 py-2 font-label-caps text-label-caps tracking-wider hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-2 rounded-xl" href="/book">
            Book Now <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
