"use client"

import { useTransition } from "react"
import { LogOut } from "lucide-react"
import { updateBookingStatus } from "../actions"

export function CheckOutButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  const checkOut = () => {
    const data = new FormData()
    data.set("id", id)
    data.set("status", "completed")
    startTransition(async () => {
      await updateBookingStatus(data)
    })
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={checkOut}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
    >
      <LogOut className="size-3.5" />
      {isPending ? "Checking out..." : "Check out"}
    </button>
  )
}