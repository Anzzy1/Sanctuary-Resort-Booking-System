export type RoomHighlight = {
  icon: string
  title: string
  sub: string
}

export type RoomDetail = {
  slug: string
  name: string
  price: number
  location: string
  guests: number
  bedrooms: number
  rating: number
  reviews: number
  image: string
  gallery: string[]
  alt: string
  about: [string, string]
  highlights: RoomHighlight[]
  cleaningFee: number
  resortFee: number
  badge?: string
}

export const rooms: RoomDetail[] = [
  {
    slug: "beachside-cottage",
    name: "The Beachside Cottage",
    price: 6800,
    location: "Private Cove, North Shore",
    guests: 2,
    bedrooms: 1,
    rating: 4.98,
    reviews: 124,
    image:
      "/pavilion-water.png",
    gallery: [
      "/pavilion-water.png",
      "/pavilion-water.png",
      "/pavilion-water.png",
    ],
    alt: "The Beachside Cottage primary interior view",
    about: [
      "Nestled at the edge of the shoreline, the Beachside Cottage offers an unparalleled connection to the ocean. Designed with a minimalist ethos that allows the natural surroundings to take center stage, the space is flooded with natural light and the constant, soothing sound of waves.",
      "Every detail has been curated to foster relaxation. From the organic linens to the bespoke local artwork, the cottage is a study in understated luxury. Step out onto your private deck to witness spectacular sunsets, or retreat indoors to a sanctuary designed for absolute peace.",
    ],
    highlights: [
      { icon: "king_bed", title: "King Bed", sub: "Premium Linens" },
      { icon: "water", title: "Ocean View", sub: "Direct Access" },
      { icon: "pool", title: "Infinity Pool", sub: "Private Deck" },
      { icon: "shower", title: "Outdoor Shower", sub: "Rain Showerhead" },
      { icon: "restaurant", title: "Breakfast", sub: "Complimentary" },
      { icon: "wifi", title: "High-Speed WiFi", sub: "Starlink" },
    ],
    cleaningFee: 120,
    resortFee: 85,
    badge: "Popular",
  },
  {
    slug: "garden-room",
    name: "Garden Room",
    price: 3500,
    location: "Resort Gardens, East Wing",
    guests: 2,
    bedrooms: 1,
    rating: 4.9,
    reviews: 98,
    image:
      "/pavilion-water.png",
    gallery: [
      "/pavilion-water.png",
      "/pavilion-water.png",
      "/pavilion-water.png",
    ],
    alt: "Garden Room interior",
    about: [
      "Tucked among swaying palms and flowering frangipani, the Garden Room is the resort's most tranquil hideaway. Warm wooden accents, a plush queen bed, and soft natural light create a calm, grounded space.",
      "Step onto your private balcony to watch hummingbirds work the gardens as your mornings unfold, then drift between the pool and a shaded daybed for a day that follows the rhythm of the resort.",
    ],
    highlights: [
      { icon: "bed", title: "Queen Bed", sub: "Premium Linens" },
      { icon: "local_florist", title: "Garden View", sub: "Private Balcony" },
      { icon: "shower", title: "Rain Shower", sub: "Glass Enclosure" },
      { icon: "coffee", title: "Espresso", sub: "In-Room Coffee" },
      { icon: "restaurant", title: "Breakfast", sub: "Complimentary" },
      { icon: "wifi", title: "High-Speed WiFi", sub: "Starlink" },
    ],
    cleaningFee: 90,
    resortFee: 70,
  },
  {
    slug: "poolside-suite",
    name: "Poolside Suite",
    price: 7500,
    location: "Main Pool Deck",
    guests: 3,
    bedrooms: 1,
    rating: 4.92,
    reviews: 142,
    image:
      "/pavilion-water.png",
    gallery: [
      "/pavilion-water.png",
      "/pavilion-water.png",
      "/pavilion-water.png",
    ],
    alt: "Poolside Suite interior",
    about: [
      "Slide open the glass and dive straight into the resort's main infinity pool. The Poolside Suite pairs a sun-drenched lounge and bedroom with a shaded terrace, soaking tub, and effortless indoor-outdoor living.",
      "It's the perfect base for guests who want the resort's heartbeats right at their door — the pool, the bar, and the beach are never more than a few steps away.",
    ],
    highlights: [
      { icon: "pool", title: "Infinity Pool", sub: "Direct Access" },
      { icon: "bathtub", title: "Soaking Tub", sub: "Freestanding" },
      { icon: "king_bed", title: "King Bed", sub: "Premium Linens" },
      { icon: "balcony", title: "Private Terrace", sub: "Poolside" },
      { icon: "restaurant", title: "Breakfast", sub: "Complimentary" },
      { icon: "wifi", title: "High-Speed WiFi", sub: "Starlink" },
    ],
    cleaningFee: 150,
    resortFee: 95,
  },
  {
    slug: "family-studio",
    name: "Family Studio",
    price: 6200,
    location: "Central Resort, Family Wing",
    guests: 4,
    bedrooms: 2,
    rating: 4.85,
    reviews: 87,
    image:
      "/pavilion-water.png",
    gallery: [
      "/pavilion-water.png",
      "/pavilion-water.png",
      "/pavilion-water.png",
    ],
    alt: "Family Studio interior",
    about: [
      "Built for families, the Family Studio pairs distinct living and sleeping zones with panoramic resort views. A flexible layout, kitchenette, and two queen beds give everyone room to breathe.",
      "While the kids take the swing chairs on the terrace, you can stretch out in the lounge with a book and the afternoon breeze — a rare mix of space and calm for a family stay.",
    ],
    highlights: [
      { icon: "bed", title: "Two Queen Beds", sub: "Sleeps 4" },
      { icon: "group", title: "Family Layout", sub: "Living & Sleep Zones" },
      { icon: "restaurant", title: "Kitchenette", sub: "Compact Setup" },
      { icon: "bathtub", title: "Family Bath", sub: "Rain Shower" },
      { icon: "deck", title: "Terrace", sub: "Garden Views" },
      { icon: "wifi", title: "High-Speed WiFi", sub: "Starlink" },
    ],
    cleaningFee: 160,
    resortFee: 100,
  },
  {
    slug: "ocean-breeze-room",
    name: "Ocean Breeze Room",
    price: 4200,
    location: "Oceanfront, North Tower",
    guests: 2,
    bedrooms: 1,
    rating: 4.88,
    reviews: 110,
    image:
      "/pavilion-water.png",
    gallery: [
      "/pavilion-water.png",
      "/pavilion-water.png",
      "/pavilion-water.png",
    ],
    alt: "Ocean Breeze Room interior",
    about: [
      "North-facing and open to the sea breeze, the Ocean Breeze Room frames restless water from the moment you wake. Soft oceanic hues, linen textures, and floor-to-ceiling windows bring the coastline inside.",
      "A shaded daybed is made for slow afternoons, and sunsets paint the room in rose and gold every evening without fail.",
    ],
    highlights: [
      { icon: "water", title: "Ocean View", sub: "North Facing" },
      { icon: "king_bed", title: "Queen Bed", sub: "Premium Linens" },
      { icon: "shower", title: "Rain Shower", sub: "Glass Enclosure" },
      { icon: "coffee", title: "Espresso", sub: "In-Room Coffee" },
      { icon: "restaurant", title: "Breakfast", sub: "Complimentary" },
      { icon: "wifi", title: "High-Speed WiFi", sub: "Starlink" },
    ],
    cleaningFee: 95,
    resortFee: 75,
  },
  {
    slug: "sunrise-villa",
    name: "Sunrise Villa",
    price: 11500,
    location: "East Cliff, Sunrise Point",
    guests: 2,
    bedrooms: 1,
    rating: 4.96,
    reviews: 76,
    image:
      "/pavilion-water.png",
    gallery: [
      "/pavilion-water.png",
      "/pavilion-water.png",
      "/pavilion-water.png",
    ],
    alt: "Sunrise Villa deck",
    about: [
      "Perched to greet the sun, the Sunrise Villa is a celebration of first light. An open-plan living space flows onto a private deck where coffee tastes better, and a luxurious outdoor shower makes the daily routine feel like a ritual.",
      "Return in the evenings to a soft glow of lanterns and the scent of frangipani, with the horizon still glowing beyond the railing.",
    ],
    highlights: [
      { icon: "deck", title: "Private Deck", sub: "Sunrise Facing" },
      { icon: "water", title: "Ocean View", sub: "Panoramic" },
      { icon: "shower", title: "Outdoor Shower", sub: "Rain Showerhead" },
      { icon: "king_bed", title: "King Bed", sub: "Premium Linens" },
      { icon: "coffee", title: "Espresso", sub: "In-Room Coffee" },
      { icon: "wifi", title: "High-Speed WiFi", sub: "Starlink" },
    ],
    cleaningFee: 140,
    resortFee: 90,
  },
  {
    slug: "sunset-loft",
    name: "Sunset Loft",
    price: 4800,
    location: "West Terrace, Sunset Wing",
    guests: 2,
    bedrooms: 1,
    rating: 4.91,
    reviews: 89,
    image:
      "/pavilion-water.png",
    gallery: [
      "/pavilion-water.png",
      "/pavilion-water.png",
      "/pavilion-water.png",
    ],
    alt: "Sunset Loft interior",
    about: [
      "Rising above the treeline, the Sunset Loft trades walls for glass. Expansive windows turn the evening sky into a shifting canvas of gold, coral, and rose.",
      "Modern minimalist lines and warm hues keep the focus exactly where it should be — on the horizon and the slow descent of the day.",
    ],
    highlights: [
      { icon: "landscape", title: "Sunset View", sub: "Floor-to-Ceiling Glass" },
      { icon: "balcony", title: "Private Balcony", sub: "West Facing" },
      { icon: "king_bed", title: "Queen Bed", sub: "Premium Linens" },
      { icon: "shower", title: "Rain Shower", sub: "Glass Enclosure" },
      { icon: "restaurant", title: "Breakfast", sub: "Complimentary" },
      { icon: "wifi", title: "High-Speed WiFi", sub: "Starlink" },
    ],
    cleaningFee: 100,
    resortFee: 80,
  },
  {
    slug: "palm-grove-room",
    name: "Palm Grove Room",
    price: 3200,
    location: "Palm Grove, Botanical Path",
    guests: 2,
    bedrooms: 1,
    rating: 4.87,
    reviews: 95,
    image:
      "/pavilion-water.png",
    gallery: [
      "/pavilion-water.png",
      "/pavilion-water.png",
      "/pavilion-water.png",
    ],
    alt: "Palm Grove Room interior",
    about: [
      "Half-hidden in a grove of coconut palms, the Palm Grove Room is the resort's most private, most grounded choice. Handcrafted rattan, botanical prints, and dappled green light create a space that feels less like a room and more like a treehouse.",
      "Mornings arrive soft and filtered through fronds, and the only soundtrack is birdsong and the distant sea.",
    ],
    highlights: [
      { icon: "local_florist", title: "Garden View", sub: "Private Entrance" },
      { icon: "spa", title: "Botanical Calm", sub: "Rattan & Linen" },
      { icon: "shower", title: "Rain Shower", sub: "Glass Enclosure" },
      { icon: "king_bed", title: "King Bed", sub: "Premium Linens" },
      { icon: "coffee", title: "Espresso", sub: "In-Room Coffee" },
      { icon: "wifi", title: "High-Speed WiFi", sub: "Starlink" },
    ],
    cleaningFee: 90,
    resortFee: 70,
  },
  {
    slug: "coral-suite",
    name: "Coral Suite",
    price: 5500,
    location: "Reef View, Coral Wing",
    guests: 2,
    bedrooms: 1,
    rating: 4.94,
    reviews: 118,
    image:
      "/pavilion-water.png",
    gallery: [
      "/pavilion-water.png",
      "/pavilion-water.png",
      "/pavilion-water.png",
    ],
    alt: "Coral Suite interior",
    about: [
      "The Coral Suite channels the energy of the reef into a palette of turquoise, blush, and sun-baked coral. A separate dressing area, large freestanding bathtub, and breezy ocean-facing bedroom make it as indulgent as it is inspiring.",
      "Watch boats drift across the reef from your window, then soak the day away in a tub framed by warm stone.",
    ],
    highlights: [
      { icon: "waves", title: "Reef View", sub: "Partial Ocean" },
      { icon: "bathtub", title: "Freestanding Tub", sub: "Warm Stone" },
      { icon: "king_bed", title: "King Bed", sub: "Premium Linens" },
      { icon: "shower", title: "Rain Shower", sub: "Glass Enclosure" },
      { icon: "restaurant", title: "Breakfast", sub: "Complimentary" },
      { icon: "wifi", title: "High-Speed WiFi", sub: "Starlink" },
    ],
    cleaningFee: 130,
    resortFee: 85,
  },
  {
    slug: "zen-retreat",
    name: "Zen Retreat",
    price: 3700,
    location: "Meditation Garden",
    guests: 2,
    bedrooms: 1,
    rating: 4.95,
    reviews: 64,
    image:
      "/pavilion-water.png",
    gallery: [
      "/pavilion-water.png",
      "/pavilion-water.png",
      "/pavilion-water.png",
    ],
    alt: "Zen Retreat meditation courtyard",
    about: [
      "A retreat within the retreat. The Zen Retreat strips everything back to natural stone, soft light, and silence. A private meditation courtyard, cool minimalist interiors, and a cedar rain shower make this the go-to for guests seeking a genuine reset.",
      "Start the day with floor work and breath in the courtyard, and end it with a long soak under the stars.",
    ],
    highlights: [
      { icon: "spa", title: "Meditation Courtyard", sub: "Private" },
      { icon: "shower", title: "Cedar Rain Shower", sub: "Natural Stone" },
      { icon: "self_improvement", title: "Restorative Calm", sub: "Minimal Design" },
      { icon: "king_bed", title: "Queen Bed", sub: "Premium Linens" },
      { icon: "coffee", title: "Espresso", sub: "In-Room Coffee" },
      { icon: "wifi", title: "High-Speed WiFi", sub: "Starlink" },
    ],
    cleaningFee: 90,
    resortFee: 70,
  },
  {
    slug: "horizon-terrace",
    name: "Horizon Terrace",
    price: 10500,
    location: "Horizon Ridge",
    guests: 2,
    bedrooms: 1,
    rating: 4.93,
    reviews: 133,
    image:
      "/pavilion-water.png",
    gallery: [
      "/pavilion-water.png",
      "/pavilion-water.png",
      "/pavilion-water.png",
    ],
    alt: "Horizon Terrace interior",
    about: [
      "The Horizon Terrace blurs every boundary between architecture and sky. A sprawling terrace runs the length of the room for morning coffees and evening stargazing, while sliding glass walls transform the space with the passing hours.",
      "By night, the ceiling lanterns echo a canopy of constellations.",
    ],
    highlights: [
      { icon: "deck", title: "Sprawling Terrace", sub: "Panoramic" },
      { icon: "landscape", title: "Horizon View", sub: "Open Plan" },
      { icon: "king_bed", title: "King Bed", sub: "Premium Linens" },
      { icon: "shower", title: "Rain Shower", sub: "Glass Enclosure" },
      { icon: "pool", title: "Shared Pool", sub: "Deck Access" },
      { icon: "wifi", title: "High-Speed WiFi", sub: "Starlink" },
    ],
    cleaningFee: 140,
    resortFee: 90,
  },
  {
    slug: "sandbar-studio",
    name: "Sandbar Studio",
    price: 2800,
    location: "Beachfront, Sandbar Walk",
    guests: 2,
    bedrooms: 1,
    rating: 4.86,
    reviews: 71,
    image:
      "/pavilion-water.png",
    gallery: [
      "/pavilion-water.png",
      "/pavilion-water.png",
      "/pavilion-water.png",
    ],
    alt: "Sandbar Studio interior",
    about: [
      "The Sandbar Studio is proof that small can feel expansive. Light wood, sandy tones, and clever built-in storage create a smart, sun-soaked base for beach lovers.",
      "A compact kitchenette means you can brew coffee before breakfast and unpack the day's market finds for dinner.",
    ],
    highlights: [
      { icon: "beach_access", title: "Beach Access", sub: "Steps Away" },
      { icon: "restaurant", title: "Kitchenette", sub: "Compact Setup" },
      { icon: "shower", title: "Rain Shower", sub: "Glass Enclosure" },
      { icon: "king_bed", title: "Queen Bed", sub: "Premium Linens" },
      { icon: "coffee", title: "Espresso", sub: "In-Room Coffee" },
      { icon: "wifi", title: "High-Speed WiFi", sub: "Starlink" },
    ],
    cleaningFee: 85,
    resortFee: 65,
  },
  {
    slug: "driftwood-cottage",
    name: "Driftwood Cottage",
    price: 7900,
    location: "Secluded Forest Edge",
    guests: 2,
    bedrooms: 1,
    rating: 4.99,
    reviews: 56,
    image:
      "/pavilion-water.png",
    gallery: [
      "/pavilion-water.png",
      "/pavilion-water.png",
      "/pavilion-water.png",
    ],
    alt: "Driftwood Cottage exterior",
    about: [
      "Our standalone showpiece. The Driftwood Cottage is built from reclaimed timber and stone, wrapped in a tangle of foliage, and crowned with a private plunge pool.",
      "Inside, a fireplace anchors the living room while a four-poster bed waits under high thatched ceilings. Seclusion, elevated.",
    ],
    highlights: [
      { icon: "fireplace", title: "Fireplace", sub: "Reclaimed Timber" },
      { icon: "pool", title: "Plunge Pool", sub: "Private" },
      { icon: "king_bed", title: "Four-Poster Bed", sub: "Premium Linens" },
      { icon: "shower", title: "Outdoor Shower", sub: "Rain Showerhead" },
      { icon: "spa", title: "Forest Calm", sub: "Total Seclusion" },
      { icon: "wifi", title: "High-Speed WiFi", sub: "Starlink" },
    ],
    cleaningFee: 180,
    resortFee: 110,
  },
]

export function getRoomBySlug(slug: string) {
  return rooms.find((room) => room.slug === slug)
}