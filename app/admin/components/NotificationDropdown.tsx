"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Circle, LogIn, XCircle, CreditCard, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"

const typeConfig: Record<string, { icon: string; color: string }> = {
  new_booking: { icon: "add_circle", color: "#3b82f6" },
  check_in: { icon: "login", color: "#10b981" },
  open_checkin: { icon: "login", color: "#0ea5e9" },
  cancellation: { icon: "cancel", color: "#ef4444" },
  payment_verification: { icon: "payment", color: "#f59e0b" },
  payment_confirmed: { icon: "check_circle", color: "#10b981" },
  payment_failed: { icon: "error", color: "#ef4444" },
}
function getNotificationUI(type: string) {
  return typeConfig[type] ?? { icon: "notifications", color: "#6b7280" }
}

type NotificationType = 
  | "new_booking"
  | "check_in"
  | "cancellation"
  | "payment_verification"
  | "payment_confirmed"
  | "payment_failed"

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  bookingId: string | null
  read: boolean
  createdAt: string
}

function getNotificationLink(type: string, bookingId: string | null) {
  switch (type) {
    case "new_booking":
    case "cancellation":
    case "payment_confirmed":
    case "payment_failed":
      return bookingId ? `/admin/bookings?highlight=${bookingId}` : "/admin/bookings"
    case "payment_verification":
      return bookingId ? `/admin/bookings?filter=verifying&highlight=${bookingId}` : "/admin/bookings"
    case "check_in":
    case "open_checkin":
      return bookingId ? `/admin/checkin?highlight=${bookingId}` : "/admin/checkin"
    default:
      return "/admin/bookings"
  }
}

export function NotificationDropdown() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const prevRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  function playRingtone() {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      if (ctx.state === "suspended") ctx.resume()
      const now = ctx.currentTime
      ;[0, 0.18].forEach((off) => {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = "sine"
        o.frequency.value = 880
        o.connect(g)
        g.connect(ctx.destination)
        g.gain.setValueAtTime(0, now + off)
        g.gain.linearRampToValueAtTime(0.18, now + off + 0.02)
        g.gain.exponentialRampToValueAtTime(0.001, now + off + 0.28)
        o.start(now + off)
        o.stop(now + off + 0.3)
      })
      setTimeout(() => ctx.close(), 600)
    } catch {}
    try {
      if (!audioRef.current) {
        const a = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==")
        a.volume = 0.5
        audioRef.current = a
      }
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    } catch {}
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [notifs, count] = await Promise.all([
        fetch("/api/admin/notifications?limit=20").then(r => r.json()),
        fetch("/api/admin/notifications/count").then(r => r.json()),
      ])
      setNotifications(Array.isArray(notifs) ? notifs : notifs.notifications ?? [])
      const c = typeof count === "number" ? count : count.count ?? count.unreadCount ?? 0
      if (prevRef.current !== null && c > prevRef.current) playRingtone()
      prevRef.current = c
      setUnreadCount(c)
    } catch (e) {
      console.error("Failed to fetch notifications", e)
    } finally {
      setLoading(false)
    }
  }

  const timeAgo = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return "Just now"
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="relative">
      <button
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
        className="relative flex size-10 items-center justify-center rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface transition hover:bg-surface-container-low"
        onClick={() => setOpen(!open)}
      >
        <Bell className="size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-[11px] font-bold text-white flex items-center justify-center leading-none border-2 border-surface-container-lowest">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-surface rounded-xl border border-outline-variant/30 shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/30">
            <h3 className="font-headline-sm text-on-surface">Notifications</h3>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-surface-container-low transition text-on-surface-variant"
              aria-label="Refresh"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant">No notifications yet</div>
            ) : (
              <ul className="divide-y divide-outline-variant/30">
                {notifications.map((n) => {
                  const { icon, color } = getNotificationUI(n.type as NotificationType)
                  const href = getNotificationLink(n.type, n.bookingId)
                  return (
                    <li
                      key={n.id}
                      onClick={() => {
                        if (!n.read) {
                          fetch(`/api/admin/notifications/${n.id}/read`, { method: "POST" })
                          setUnreadCount((c) => Math.max(0, c - 1))
                          setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
                        }
                        setOpen(false)
                        router.push(href)
                      }}
                      className={`relative px-4 py-3 hover:bg-surface-container-low transition cursor-pointer ${!n.read ? "bg-primary/5" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 text-white ${n.read ? "opacity-60" : ""}`}
                          style={{ backgroundColor: color }}
                        >
                          {icon === "add_circle" && <Circle className="size-4" />}
                          {icon === "login" && <LogIn className="size-4" />}
                          {icon === "cancel" && <XCircle className="size-4" />}
                          {icon === "payment" && <CreditCard className="size-4" />}
                          {icon === "check_circle" && <CheckCircle2 className="size-4" />}
                          {icon === "error" && <AlertCircle className="size-4" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${!n.read ? "text-on-surface" : "text-on-surface-variant"}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-on-surface-variant mt-0.5 truncate">{n.message}</p>
                          <p className="text-[10px] text-on-surface-variant/60 mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              fetch(`/api/admin/notifications/${n.id}/read`, { method: "POST" })
                              setNotifications(notifications.map(notif => notif.id === n.id ? { ...notif, read: true } : notif))
                              setUnreadCount(c => Math.max(0, c - 1))
                            }}
                            className="p-1 rounded hover:bg-surface-container-high transition text-on-surface-variant opacity-0 group-hover:opacity-100"
                            aria-label="Mark as read"
                          >
                            <RefreshCw className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}