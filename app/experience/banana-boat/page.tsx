import Image from "next/image"

const gallery = [
  {
    alt: "Primary image of banana boat adventure",
    src: "/pavilion-water.png",
  },
  {
    alt: "A detailed view of a yellow banana boat cutting through bright turquoise tropical water, splashing white foam, under a clear blue sky. The image has a bright, modern, high-key light-mode aesthetic, emphasizing the vibrant yellow of the boat against the deep ocean blue and pristine whites, capturing a mood of exhilarating coastal adventure.",
    src: "/pavilion-water.png",
  },
  {
    alt: "Close up of a group of laughing friends wearing bright orange life jackets on a yellow banana boat, with a sleek white speed boat towing them in the background. The scene is set in a minimalist, serene tropical lagoon with a soft sand beach in the distance. The lighting is sunny and atmospheric, reflecting a high-end luxury resort experience.",
    src: "/pavilion-water.png",
  },
]

const highlights = [
  { icon: "fort", label: "Life Jackets" },
  { icon: "group", label: "Group Activity" },
  { icon: "shield_person", label: "Safety Guide" },
  { icon: "waves", label: "Clear Waters" },
  { icon: "photo_camera", label: "Photo Packages" },
  { icon: "calendar_today", label: "Daily Sessions" },
]

const notes = [
  "Suitable for all ages above 6 years.",
  "Sessions run for approximately 20 minutes.",
  "Weather permitting. See concierge for daily updates.",
]

export default function BananaBoatPage() {
  return (
    <main className="flex-grow max-w-[1140px] w-full mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-20 flex flex-col gap-12 md:gap-20">
      {/* Header */}
      <header className="text-center md:text-left space-y-4">
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary">
          Banana Boat Adventure
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">High-Energy Ocean Fun</p>
      </header>

      {/* Gallery Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[600px]">
        <div className="md:col-span-8 h-full rounded-xl overflow-hidden ambient-shadow relative">
          <Image
            alt={gallery[0].alt}
            fill
            sizes="(min-width: 768px) 66vw, 100vw"
            className="object-cover"
            src={gallery[0].src}
          />
        </div>
        <div className="hidden md:grid md:col-span-4 grid-rows-2 gap-4 h-full">
          {gallery.slice(1).map((img) => (
            <div key={img.src} className="rounded-xl overflow-hidden ambient-shadow relative">
              <Image
                alt={img.alt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
                src={img.src}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Description & Details Layout */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20">
        {/* Main Description */}
        <div className="md:col-span-7 space-y-8">
          <div>
            <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
              Gather your friends and family for the ultimate aquatic thrill. Our banana boat rides take you across the
              crystal-clear turquoise waters of the lagoon for a high-speed adventure that promises laughter and
              excitement. A must-do for every island guest seeking an unforgettable memory against the backdrop of our
              coastal paradise.
            </p>
          </div>
          <hr className="border-surface-variant" />

          {/* Highlights Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-3 p-6 bg-surface rounded-xl ambient-shadow border border-surface-variant/50"
              >
                <span className="material-symbols-outlined text-primary text-3xl">{item.icon}</span>
                <span className="font-label-caps text-label-caps text-on-surface uppercase">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contextual Sidebar */}
        <div className="hidden md:block md:col-span-5 relative">
          <div className="sticky top-32 p-8 bg-surface-container-low rounded-xl ambient-shadow border border-surface-variant/30 space-y-6">
            <h3 className="font-headline-md text-headline-md text-primary">Need to know</h3>
            <ul className="space-y-4 font-body-md text-body-md text-on-surface-variant">
              {notes.map((note) => (
                <li key={note} className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-secondary text-xl mt-1">check_circle</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}