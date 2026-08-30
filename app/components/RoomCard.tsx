import Image from "next/image"
import Link from "next/link"
import { formatPeso } from "@/lib/money"

export type RoomSpec = {
  icon: string
  label: string
}

export type Room = {
  id: string
  name: string
  price: number
  description: string
  image: string
  alt: string
  specs: RoomSpec[]
  category?: "room" | "cottage" | "villa"
}

export function RoomCard({ room }: { room: Room }) {
  return (
    <article className="group flex flex-col">
      <div className="relative overflow-hidden rounded-lg mb-6 aspect-[4/3] bg-surface-container-low">
        <Image
          alt={room.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          src={room.image}
        />
      </div>
      <div className="flex justify-between items-start mb-2">
        <h2 className="font-headline-md text-headline-md text-primary">{room.name}</h2>
        <div className="text-right">
          <span className="block font-headline-md text-headline-md text-primary">{formatPeso(room.price)}</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant">/ NIGHT</span>
        </div>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant mb-6 line-clamp-2 flex-1">
        {room.description}
      </p>
      <div className="flex gap-4 mb-8 text-on-surface-variant font-label-caps text-label-caps">
        {room.specs.map((spec) => (
          <div key={spec.label} className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">{spec.icon}</span>
            {spec.label}
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        <Link className="btn-secondary flex-1 py-3 font-label-caps uppercase text-center" href={`/accommodations/${room.id}`}>View Details</Link>
        <Link className="btn-primary flex-1 py-3 font-label-caps uppercase text-center" href={`/book?rooms=${room.id}`}>Book Now</Link>
      </div>
    </article>
  )
}