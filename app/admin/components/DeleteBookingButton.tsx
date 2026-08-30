"use client"

import { deleteBooking } from "../actions"

export function DeleteBookingButton({ id }: { id: string }) {
  return (
    <form
      action={deleteBooking}
      onSubmit={(e) => {
        if (!window.confirm("Delete this booking permanently?")) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        className="px-4 py-2 rounded-lg border border-rose-300 text-rose-700 text-sm font-medium hover:bg-rose-50 transition-colors"
        type="submit"
      >
        Delete
      </button>
    </form>
  )
}
