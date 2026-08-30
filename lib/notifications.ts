import { prisma } from "@/lib/prisma"

export type NotificationType =
  | "new_booking"
  | "check_in"
  | "open_checkin"
  | "cancellation"
  | "payment_verification"
  | "payment_confirmed"
  | "payment_failed"

export async function createNotification(data: {
  type: NotificationType
  title: string
  message: string
  bookingId?: string
}) {
  return prisma.notification.create({
    data: {
      type: data.type,
      title: data.title,
      message: data.message,
      bookingId: data.bookingId,
    },
  })
}

export async function getUnreadCount() {
  return prisma.notification.count({ where: { read: false } })
}

export async function getNotifications(limit = 20) {
  return prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export async function markAsRead(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { read: true },
  })
}

export async function markAllAsRead() {
  return prisma.notification.updateMany({
    where: { read: false },
    data: { read: true },
  })
}

const typeConfig: Record<NotificationType, { icon: string; color: string }> = {
  new_booking: { icon: "add_circle", color: "#3b82f6" },
  check_in: { icon: "login", color: "#10b981" },
  open_checkin: { icon: "login", color: "#0ea5e9" },
  cancellation: { icon: "cancel", color: "#ef4444" },
  payment_verification: { icon: "payment", color: "#f59e0b" },
  payment_confirmed: { icon: "check_circle", color: "#10b981" },
  payment_failed: { icon: "error", color: "#ef4444" },
}

export function getNotificationUI(type: NotificationType) {
  return typeConfig[type] ?? { icon: "notifications", color: "#6b7280" }
}