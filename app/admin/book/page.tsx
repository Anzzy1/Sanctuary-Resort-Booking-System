import { notFound } from "next/navigation"
import { verifyAdmin } from "../actions"
import { Topbar } from "../components/Topbar"
import { BookingExperience } from "../../components/BookingExperience"

export const dynamic = "force-dynamic"

export default async function AdminBook() {
  if (!(await verifyAdmin())) {
    notFound()
  }

  return (
    <>
      <Topbar title="New Booking" eyebrow="Create a reservation for a guest" />
      <BookingExperience admin />
    </>
  )
}