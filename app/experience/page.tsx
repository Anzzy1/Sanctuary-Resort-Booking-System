import Image from "next/image"
import Link from "next/link"

const experiences = [
  {
    title: "Beach Massage",
    href: "/experience/beach-massage",
    description:
      "Surrender to deep relaxation with a bespoke massage accompanied by the rhythmic sound of breaking waves.",
    alt: "A serene outdoor spa setup on a white sand beach. Massage tables with crisp white linens face the turquoise ocean. Gentle sunlight filtering through palm fronds creates a dappled light effect. Minimalist, luxurious, tranquil atmosphere.",
    image:
      "/pavilion-water.png",
  },
  {
    title: "Island Hopping",
    href: "/experience/island-tour",
    description:
      "Navigate pristine waters aboard a private charter, exploring secluded coves and hidden atolls at your own pace.",
    alt: "A sleek wooden boat gliding through crystal clear azure waters between dramatic lush green island cliffs. The scene is bright and airy, capturing the essence of luxury coastal exploration. Wide angle, cinematic lighting.",
    image:
      "/pavilion-water.png",
  },
  {
    title: "Sunset Yoga",
    href: "/experience/sunset-yoga",
    description:
      "Find your center as the sun dips below the horizon during a guided practice on our panoramic viewing deck.",
    alt: "A minimalist yoga deck overlooking the ocean during a spectacular golden hour sunset. A single figure in a graceful yoga pose is silhouetted against the vibrant orange and deep blue sky. Calm, reflective, spiritual mood.",
    image:
      "/pavilion-water.png",
  },
  {
    title: "Banana Boat Adventure",
    href: "/experience/banana-boat",
    description:
      "High-speed aquatic fun. Hold tight as our captain tows your banana boat across the crystal-clear lagoon.",
    alt: "A yellow banana boat cutting through bright turquoise tropical water, splashing white foam under a clear blue sky. Vibrant, exhilarating coastal adventure aesthetic.",
    image:
      "/pavilion-water.png",
  },
]

const favorites = [
  {
    title: "Private Starlit Dinner",
    description:
      "Savor an exclusive, multi-course culinary journey prepared by our executive chef. Set upon the soft sands and illuminated by flickering torches and the brilliant night sky, this dining experience redefines coastal romance.",
    alt: "Private Starlit Dinner",
    image:
      "/pavilion-water.png",
    reverse: false,
  },
  {
    title: "Guided Reef Snorkeling",
    description:
      "Submerge into crystal-clear waters alongside our resident marine biologists. Witness the vibrant life of our protected coral reefs up close, learning about the delicate underwater ecosystems in an immersive, educational adventure.",
    alt: "Guided Reef Snorkeling",
    image:
      "/pavilion-water.png",
    reverse: true,
  },
  {
    title: "Coastal Trekking",
    description:
      "Traverse rugged, breathtaking coastlines with our expert local guides. These invigorating treks offer panoramic ocean views, encounters with native flora and fauna, and a profound sense of connection to the untamed beauty of the island.",
    alt: "Coastal Trekking",
    image:
      "/pavilion-water.png",
    reverse: false,
  },
]

export default function ExperiencePage() {
  return (
    <main className="flex-grow pt-32 pb-0">
      {/* Hero Section */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-20 md:py-32 flex flex-col items-center text-center">
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-6 max-w-3xl">
          Curated Island Experiences
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
          Discover the essence of island life through our meticulously designed activities. Whether seeking profound
          tranquility or invigorating adventure, immerse yourself in the natural elegance of the coast.
        </p>
      </section>

      {/* Experience Grid */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {experiences.map((exp) => (
            <article
              key={exp.title}
              className="group flex flex-col bg-surface-container-lowest border border-surface-container-high rounded-xl overflow-hidden hover:shadow-[0_12px_32px_rgba(26,46,53,0.06)] transition-all duration-500"
            >
              <div className="relative h-64 overflow-hidden bg-surface-container">
                <Image
                  alt={exp.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  src={exp.image}
                />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="font-headline-md text-headline-md text-primary mb-3">{exp.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6 flex-grow">{exp.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-surface-container-high">
                  <Link
                    className="font-label-caps text-label-caps text-secondary hover:text-primary transition-colors uppercase tracking-widest relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-primary hover:after:w-full after:transition-all after:duration-300"
                    href={exp.href ?? "/experience"}
                  >
                    View Details
                  </Link>
                  <Link href={exp.href ?? "/experience"} aria-label="Book Experience" className="text-primary hover:text-secondary transition-colors">
                    <span className="material-symbols-outlined font-light">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Guest Favorites Gallery */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-20 border-t border-outline-variant/20 mt-12">
        <div className="text-center mb-16">
          <h2 className="font-display-lg text-headline-lg text-primary mb-4">Guest Favorites</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Explore our most sought-after experiences, highly recommended by those who have walked our shores.
          </p>
        </div>
        <div className="flex flex-col gap-20">
          {favorites.map((fav) => (
            <div
              key={fav.title}
              className={`flex flex-col md:flex-row items-center gap-12 group ${fav.reverse ? "md:flex-row-reverse" : ""}`}
            >
              <div className="relative w-full md:w-1/2 h-[400px] overflow-hidden rounded-xl bg-surface-container">
                <Image
                  alt={fav.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  src={fav.image}
                />
              </div>
              <div className="w-full md:w-1/2 space-y-6">
                <h3 className="font-headline-md text-headline-lg text-primary">{fav.title}</h3>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">{fav.description}</p>
                <a
                  className="inline-block font-label-caps text-label-caps text-secondary hover:text-primary transition-colors uppercase tracking-widest relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-primary hover:after:w-full after:transition-all after:duration-300"
                  href="#"
                >
                  Discover More
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Harmony with Nature */}
      <section className="bg-surface-container-low py-20 md:py-32 mt-12">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row items-center gap-12 md:gap-20">
          <div className="w-full md:w-1/2 space-y-6">
            <h2 className="font-display-lg text-headline-lg text-primary">Harmony with Nature</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Our commitment to sustainability and eco-tourism ensures that every experience respects and preserves the
              local ecosystem. From eco-friendly boat tours to expert-led marine conservation talks, we invite you to
              connect deeply with the natural world while helping us protect it for generations to come.
            </p>
          </div>
          <div className="relative w-full md:w-1/2 h-[450px] rounded-xl overflow-hidden shadow-sm">
            <Image
              alt="Eco tourism and nature conservation"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              src="/pavilion-water.png"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-24 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-6">
            Your Island Sanctuary Awaits
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-xl">
            Due to our commitment to personalized service and ecological balance, availability is strictly limited.
            Reserve your unparalleled coastal escape today.
          </p>
          <Link href="/book" className="inline-block">
            <button className="bg-primary-container text-on-primary font-body-md text-body-md px-10 py-4 rounded-lg hover:bg-secondary transition-colors duration-300 scale-95 active:scale-90 shadow-[0_4px_12px_rgba(26,46,53,0.08)]">
              Check Availability
            </button>
          </Link>
        </div>
      </section>
    </main>
  )
}