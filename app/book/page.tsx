import { Suspense } from "react"
import { BookingExperience } from "../components/BookingExperience"

export default function BookPage() {
  return (
    <Suspense>
      <BookingExperience />
    </Suspense>
  )
}
