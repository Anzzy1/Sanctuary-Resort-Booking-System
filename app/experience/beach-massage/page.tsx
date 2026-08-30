import Image from "next/image"

const gallery = [
  {
    alt: "An outdoor massage cabana set on pristine white sand. A massage table with crisp white linens faces the turquoise ocean, with soft sunlight filtering through palm fronds.",
    src: "/pavilion-water.png",
  },
  {
    alt: "A close-up of a serene spa scene with tropical flowers and oils arranged beside a massage bed, overlooking calm blue water.",
    src: "/pavilion-water.png",
  },
  {
    alt: "A massage therapist's hands performing a relaxing treatment with aromatic oils, surrounded by tranquil beach ambiance.",
    src: "/pavilion-water.png",
  },
]

const highlights = [
  {
    icon: "holiday_village",
    title: "Private Beach Pavilion",
    description: "Secluded cabanas steps from the water",
  },
  {
    icon: "spa",
    title: "Organic Oils & Serums",
    description: "Handcrafted botanical blends for every treatment",
  },
  {
    icon: "self_improvement",
    title: "Expert Therapists",
    description: "Certified professionals in traditional techniques",
  },
  {
    icon: "air",
    title: "Sea Breeze Ambience",
    description: "Therapeutic sound of waves throughout your session",
  },
  {
    icon: "local_cafe",
    title: "Complimentary Refreshments",
    description: "Coconut water and herbal infusions after your massage",
  },
  {
    icon: "schedule",
    title: "Daily Sessions",
    description: "Available 8AM to 6PM, seven days a week",
  },
]

export default function BeachMassagePage() {
  return (
    <main className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-[1140px] mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-headline-lg text-headline-lg md:text-display-lg text-primary mb-4">
          Beach Massage &amp; Wellness
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Rejuvenate your senses with an oceanfront spa experience designed to harmonize body, mind, and coastal spirit.
        </p>
      </div>

      {/* Bento Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-20 h-auto md:h-[600px]">
        <div className="md:col-span-8 rounded-lg overflow-hidden h-[400px] md:h-full relative group">
          <Image
            alt={gallery[0].alt}
            fill
            sizes="(min-width: 768px) 66vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            src={gallery[0].src}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <div className="md:col-span-4 flex flex-row md:flex-col gap-4 overflow-x-auto md:overflow-visible hide-scroll">
          <div className="min-w-[200px] md:min-w-0 md:h-1/2 rounded-lg overflow-hidden relative group shrink-0">
            <Image
              alt={gallery[1].alt}
              fill
              sizes="(min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              src={gallery[1].src}
            />
          </div>
          <div className="min-w-[200px] md:min-w-0 md:h-1/2 rounded-lg overflow-hidden relative group shrink-0">
            <Image
              alt={gallery[2].alt}
              fill
              sizes="(min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              src={gallery[2].src}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7">
          <h2 className="font-headline-md text-headline-md text-primary mb-6">A Serene Sanctuary by the Sea</h2>
          <div className="space-y-6 text-on-surface-variant font-body-md text-body-md leading-relaxed">
            <p>
              Wake your senses to the gentle whisper of the tide as skilled therapists guide you into a state of deep
              release. Our signature beach massages blend time-honored techniques with locally sourced botanicals,
              performed in the open air beneath shaded palm pavilions where the ocean horizon meets the sky.
            </p>
            <p>
              From indulgent couple rituals to restorative single treatments, every session is tailored to your needs
              and preferences. Allow the warm sea breeze, the rhythmic lull of the waves, and the fragrance of tropical
              oils to dissolve tension and restore harmony — a wellness ritual you will carry long after you leave our
              shores.
            </p>
          </div>
        </div>

        <div className="lg:col-span-5">
          <h3 className="font-label-caps text-label-caps text-primary uppercase tracking-widest mb-8 border-b border-surface-container-high pb-4">
            Experience Highlights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6">
            {highlights.map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container text-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined font-light text-2xl">{item.icon}</span>
                </div>
                <div>
                  <h4 className="font-body-lg text-body-lg text-primary font-semibold mb-1">{item.title}</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
