import Image from "next/image"

const gallery = [
  {
    alt: "Main yoga image: a serene sunset yoga session on a wooden deck overlooking the ocean, silhouettes against a warm golden sky.",
    src: "/pavilion-water.png",
  },
  {
    alt: "Close up of a yoga mat on a wooden deck during sunset at a coastal resort. Soft, warm light. Modern boutique aesthetic. Minimalist.",
    src: "/pavilion-water.png",
  },
  {
    alt: "A group of people doing yoga on a beach deck at sunset. Silhouettes against a vibrant orange and purple sky. High-end resort setting. Calm and serene mood.",
    src: "/pavilion-water.png",
  },
  {
    alt: "Detail shot of hands in a mudra position during meditation by the ocean. Soft focus background of the sea and sunset. Luxurious and peaceful.",
    src: "/pavilion-water.png",
  },
]

const highlights = [
  { icon: "self_improvement", label: "Expert Instructors" },
  { icon: "sports_gymnastics", label: "Yoga Mats Included" },
  { icon: "water", label: "Panoramic Ocean View" },
  { icon: "spa", label: "Meditation Sessions" },
  { icon: "groups", label: "All Levels Welcome" },
  { icon: "local_drink", label: "Hydration Provided" },
]

export default function SunsetYogaPage() {
  return (
    <main className="pt-32 pb-24 max-w-[1140px] mx-auto px-margin-mobile md:px-margin-desktop">
      {/* Header */}
      <header className="mb-12">
        <p className="font-label-caps text-label-caps text-secondary mb-2 uppercase tracking-widest">
          Wellness &amp; Activities
        </p>
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4">
          Sunset Coastal Yoga
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Find your center as the sun dips below the horizon. Our sunset yoga sessions on the wooden deck provide the
          perfect balance of physical movement and spiritual calm.
        </p>
      </header>

      {/* Gallery & Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Gallery */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="w-full aspect-[4/3] rounded-lg overflow-hidden relative">
            <Image
              alt={gallery[0].alt}
              fill
              sizes="(min-width: 1024px) 66vw, 100vw"
              className="object-cover"
              src={gallery[0].src}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {gallery.slice(1).map((img) => (
              <div key={img.src} className="aspect-square rounded-lg overflow-hidden bg-surface-variant relative">
                <Image
                  alt={img.alt}
                  fill
                  sizes="(min-width: 1024px) 22vw, 33vw"
                  className="object-cover"
                  src={img.src}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-4 flex flex-col gap-12">
          {/* Description */}
          <section>
            <h2 className="font-headline-md text-headline-md text-primary mb-6">Tranquility at Twilight</h2>
            <div className="space-y-4 font-body-md text-body-md text-on-surface-variant leading-relaxed">
              <p>
                Find your center as the sun dips below the horizon. Our sunset yoga sessions on the wooden deck provide
                the perfect balance of physical movement and spiritual calm.
              </p>
              <p>
                Led by experienced instructors, it is the ideal way to end your tropical day. The sound of the waves
                and the gentle sea breeze create an immersive atmosphere for relaxation and mindfulness.
              </p>
            </div>
          </section>

          {/* Highlights Grid */}
          <section>
            <h3 className="font-label-caps text-label-caps text-outline uppercase tracking-widest mb-6">
              Experience Highlights
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {highlights.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'wght' 200" }}>
                    {item.icon}
                  </span>
                  <span className="font-body-md text-body-md text-primary">{item.label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}