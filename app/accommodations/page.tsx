"use client"

import { useState } from "react"
import { RoomCard } from "../components/RoomCard"
import type { Room } from "../components/RoomCard"

const rooms: Room[] = [
  {
    id: "garden-room",
    category: "room",
    name: "Garden Room",
    price: 3500,
    description:
      "A peaceful retreat featuring warm wooden tones and a large window overlooking our lush resort gardens. Perfect for a restorative stay.",
    image: "/pavilion-water.png",
    alt: "Garden Room Interior",
    specs: [
      { icon: "bed", label: "King Bed" },
      { icon: "nature", label: "Garden View" },
      { icon: "square_foot", label: "35 sqm" },
    ],
  },
  {
    id: "poolside-suite",
    category: "cottage",
    name: "Poolside Suite",
    price: 7500,
    description:
      "Spacious and sunlit, with direct access to our infinity pool from your private terrace. Features a separate lounge area and soaking tub.",
    image: "/pavilion-water.png",
    alt: "Poolside Suite Interior",
    specs: [
      { icon: "bed", label: "King Bed" },
      { icon: "pool", label: "Pool Access" },
      { icon: "square_foot", label: "55 sqm" },
    ],
  },
  {
    id: "ocean-breeze-room",
    category: "room",
    name: "Ocean Breeze Room",
    price: 4200,
    description:
      "Wake up to the sound of waves and unobstructed views of the coastline. Designed with soft oceanic hues to bring the outside in.",
    image: "/pavilion-water.png",
    alt: "Ocean Breeze Room Interior",
    specs: [
      { icon: "bed", label: "Queen Bed" },
      { icon: "water", label: "Ocean View" },
      { icon: "square_foot", label: "40 sqm" },
    ],
  },
  {
    id: "family-studio",
    category: "room",
    name: "Family Studio",
    price: 6200,
    description:
      "Generously proportioned for family comfort without compromising on style. Includes a flexible living area and kitchenette setup.",
    image: "/pavilion-water.png",
    alt: "Family Studio Interior",
    specs: [
      { icon: "bed", label: "2 Beds" },
      { icon: "group", label: "Up to 4" },
      { icon: "square_foot", label: "65 sqm" },
    ],
  },
  {
    id: "sunrise-villa",
    category: "villa",
    name: "Sunrise Villa",
    price: 11500,
    description:
      "Experience breathtaking morning views from your private deck. Features an open-plan living space and luxurious outdoor shower.",
    image: "/pavilion-water.png",
    alt: "Sunrise Villa Interior",
    specs: [
      { icon: "bed", label: "King Bed" },
      { icon: "water", label: "Ocean View" },
      { icon: "square_foot", label: "75 sqm" },
    ],
  },
  {
    id: "sunset-loft",
    category: "room",
    name: "Sunset Loft",
    price: 4800,
    description:
      "An elevated sanctuary with expansive windows capturing the golden hour. Modern minimalist design with warm sunset hues.",
    image: "/pavilion-water.png",
    alt: "Sunset Loft Interior",
    specs: [
      { icon: "bed", label: "Queen Bed" },
      { icon: "balcony", label: "Balcony View" },
      { icon: "square_foot", label: "45 sqm" },
    ],
  },
  {
    id: "palm-grove-room",
    category: "room",
    name: "Palm Grove Room",
    price: 3200,
    description:
      "Nestled among swaying palms, offering unparalleled privacy and tranquility. Features handcrafted rattan furniture and botanical accents.",
    image: "/pavilion-water.png",
    alt: "Palm Grove Room Interior",
    specs: [
      { icon: "bed", label: "King Bed" },
      { icon: "nature", label: "Garden View" },
      { icon: "square_foot", label: "38 sqm" },
    ],
  },
  {
    id: "coral-suite",
    category: "room",
    name: "Coral Suite",
    price: 5500,
    description:
      "Vibrant and spacious, inspired by the colors of the reef. Includes a separate dressing area and a large freestanding bathtub.",
    image: "/pavilion-water.png",
    alt: "Coral Suite Interior",
    specs: [
      { icon: "bed", label: "King Bed" },
      { icon: "waves", label: "Partial Ocean" },
      { icon: "square_foot", label: "60 sqm" },
    ],
  },
  {
    id: "zen-retreat",
    category: "room",
    name: "Zen Retreat",
    price: 3700,
    description:
      "Designed for ultimate relaxation with a minimalist aesthetic, natural stone textures, and a private meditation courtyard.",
    image: "/pavilion-water.png",
    alt: "Zen Retreat Interior",
    specs: [
      { icon: "bed", label: "Queen Bed" },
      { icon: "spa", label: "Courtyard" },
      { icon: "square_foot", label: "42 sqm" },
    ],
  },
  {
    id: "horizon-terrace",
    category: "villa",
    name: "Horizon Terrace",
    price: 10500,
    description:
      "Seamless indoor-outdoor living with a sprawling terrace overlooking the horizon. Perfect for evening stargazing and morning coffees.",
    image: "/pavilion-water.png",
    alt: "Horizon Terrace Interior",
    specs: [
      { icon: "bed", label: "King Bed" },
      { icon: "landscape", label: "Panoramic" },
      { icon: "square_foot", label: "70 sqm" },
    ],
  },
  {
    id: "sandbar-studio",
    category: "room",
    name: "Sandbar Studio",
    price: 2800,
    description:
      "A cozy and stylish space steps away from the beach. Features light wood finishes, sandy tones, and a compact kitchenette.",
    image: "/pavilion-water.png",
    alt: "Sandbar Studio Interior",
    specs: [
      { icon: "bed", label: "Queen Bed" },
      { icon: "beach_access", label: "Beach Access" },
      { icon: "square_foot", label: "32 sqm" },
    ],
  },
  {
    id: "driftwood-cottage",
    category: "cottage",
    name: "Driftwood Cottage",
    price: 7900,
    description:
      "A standalone rustic-chic cottage offering complete seclusion. Features reclaimed wood beams, a fireplace, and a private plunge pool.",
    image: "/pavilion-water.png",
    alt: "Driftwood Cottage Interior",
    specs: [
      { icon: "bed", label: "King Bed" },
      { icon: "pool", label: "Pool & Garden" },
      { icon: "square_foot", label: "85 sqm" },
    ],
  },
]

const filters = [
  { label: "ALL STAYS", value: "all" },
  { label: "Rooms", value: "room" },
  { label: "Cottages", value: "cottage" },
  { label: "Villas", value: "villa" },
]

export default function AccommodationsPage() {
  const [activeFilter, setActiveFilter] = useState("all")

  const filteredRooms = activeFilter === "all" ? rooms : rooms.filter((room) => room.category === activeFilter)

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-24 pt-24">
      {/* Header */}
      <header className="py-24 md:py-32 text-center md:text-left max-w-3xl">
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-6">
          Our Accommodations
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
          Experience the perfect blend of coastal serenity and modern luxury. Each of our rooms is thoughtfully
          designed with premium comfort, bespoke furnishings, and natural textures to provide a tranquil retreat from
          the everyday.
        </p>
      </header>

      {/* Filters */}
      <section className="mb-12 flex flex-wrap gap-4 items-center">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`relative px-6 py-2 rounded-full font-label-caps uppercase tracking-widest transition-all ${
              activeFilter === filter.value
                ? "bg-primary text-on-primary"
                : "border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </section>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {filteredRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </main>
  )
}