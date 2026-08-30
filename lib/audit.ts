import { prisma } from "@/lib/prisma"

export async function auditLog(data: { action: string; actor: string; targetId?: string; targetType?: string; detail?: string }) {
  try {
    await prisma.auditLog.create({ data: { action: data.action, actor: data.actor, targetId: data.targetId, targetType: data.targetType, detail: data.detail } })
  } catch {}
}
