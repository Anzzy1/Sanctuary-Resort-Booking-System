import Image from "next/image"

const gallery = [
  {
    alt: "A traditional wooden boat gliding through calm turquoise waters, with lush limestone cliffs rising in the distance under a bright sky.",
    src: "/pavilion-water.png",
  },
  {
    alt: "A close-up shot of vibrant coral reefs under crystal clear turquoise water, illuminated by bright sunlight, showcasing a modern coastal boutique aesthetic with deep ocean blues and bright whites. A single pristine white snorkel fin glides through the frame.",
    src: "/pavilion-water.png",
  },
  {
    alt: "A luxurious gourmet picnic spread on a pristine white sandbar, featuring artisanal cheeses, fresh tropical fruits, and elegant glassware. The deep blue ocean stretches to the horizon under a bright sky, conveying exclusivity and high-end relaxation in a minimalist setting.",
    src: "/pavilion-water.png",
  },
  {
    alt: "A sleek, traditional wooden boat gently gliding through calm, translucent waters toward a hidden limestone cove. The composition captures a minimalist, serene atmosphere with lush green cliffs rising vertically and soft white sand visible through the clear water.",
    src: "/pavilion-water.png",
  },
]

const highlights = [
  { icon: "sailing", label: "Private Charter Available" },
  { icon: "scuba_diving", label: "Snorkeling Gear Included" },
  { icon: "restaurant", label: "Gourmet Picnic Lunch" },
  { icon: "explore", label: "Local Expert Guides" },
  { icon: "landscape", label: "Hidden Cove Access" },
  { icon: "schedule", label: "Full Day Experience" },
]

export default function IslandTourPage() {
  return (
    <main className="pt-32 pb-32">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        {/* Page Header */}
        <header className="mb-12">
          <p className="font-label-caps text-label-caps text-secondary tracking-widest uppercase mb-4">
            Curated Excursions
          </p>
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary text-balance">
            Island Boat Tour
          </h1>
        </header>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-sm shadow-primary/5 border border-surface-container relative group">
              <Image
                alt={gallery[0].alt}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover hover:scale-105 transition-transform duration-700 ease-in-out"
                src={gallery[0].src}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {gallery.slice(1).map((img) => (
                <div
                  key={img.src}
                  className="h-32 md:h-48 rounded-xl overflow-hidden shadow-sm shadow-primary/5 border border-surface-container relative"
                >
                  <Image
                    alt={img.alt}
                    fill
                    sizes="(min-width: 1024px) 19vw, 33vw"
                    className="object-cover hover:scale-105 transition-transform duration-700 ease-in-out"
                    src={img.src}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Description & Highlights */}
          <div className="lg:col-span-5 lg:pl-8 lg:sticky lg:top-32 mt-8 lg:mt-0">
            <div className="mb-12">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-6">Discover Hidden Paradises</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant text-pretty leading-relaxed">
                Set sail on a traditional wooden boat to explore the most secluded corners of our archipelago. Visit
                hidden limestone coves, snorkel in vibrant coral gardens, and enjoy a gourmet picnic on a private
                sandbar. The ultimate island exploration.
              </p>
            </div>

            {/* Highlights Grid */}
            <div className="bg-surface-container-low/50 rounded-xl p-8 border border-surface-container">
              <h3 className="font-body-md text-body-md font-semibold text-primary mb-6">Experience Highlights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                {highlights.map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-secondary border border-surface-container shrink-0">
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    </div>
                    <span className="font-body-md text-body-md text-on-surface">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
