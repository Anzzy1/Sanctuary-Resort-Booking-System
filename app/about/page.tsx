import Image from "next/image"
import Link from "next/link"

export default function AboutPage() {
  return (
    <main className="pt-16 pb-0">
      {/* Hero Section */}
      <section className="relative min-h-[716px] flex items-center justify-center overflow-hidden px-margin-mobile md:px-margin-desktop">
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full opacity-60">
            <Image
              alt="A serene, expansive view of an empty misty beach at dawn. The water is calm with gentle ripples catching the soft, diffused morning light. The color palette is composed of muted cool tones, soft greys, and pale sea glass blues. The composition is highly editorial and minimalist, evoking a deep sense of calm and sanctuary. Shot with a slight film grain for a high-end luxury resort feel."
              fill
              sizes="100vw"
              className="object-cover"
              src="/pavilion-water.png"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent"></div>
        </div>
        <div className="relative z-10 text-center max-w-3xl mx-auto mt-24">
          <h1 className="font-display-lg text-display-lg text-primary mb-6 drop-shadow-sm">The Soul of Sanctuary</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            More than a destination, Sanctuary is a philosophy of serenity. A place where the rhythm of the tides
            dictates the pace of the day, and connection to the coastal elements restores the spirit.
          </p>
        </div>
      </section>

      {/* The Heritage */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
          <div className="md:col-span-5 md:pr-12 order-2 md:order-1 mt-12 md:mt-0">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-6">The Heritage</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
              Our origin is rooted in simplicity. What began decades ago as a solitary seaside cottage, a refuge for
              weary travelers, has thoughtfully evolved into a premier coastal sanctuary.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Throughout this evolution, we have remained steadfast in our commitment to preserve the raw, natural
              beauty of the shore that first inspired us. Every architectural decision and guest experience is
              designed to honor this heritage.
            </p>
          </div>
          <div className="md:col-span-7 order-1 md:order-2 relative">
            <div className="aspect-[4/3] rounded-lg overflow-hidden ambient-shadow-lg relative">
              <Image
                alt="A sophisticated, slightly desaturated architectural photograph of a minimalist coastal building blending seamlessly into a sandy dune landscape. The structure features clean lines, weathered wood, and large expanses of glass reflecting the ocean. The lighting is soft and natural, emphasizing the texture of the sea oats and the pale sand. The overall mood is quiet luxury, emphasizing an editorial, high-end design aesthetic."
                fill
                sizes="(min-width: 768px) 58vw, 100vw"
                className="object-cover"
                src="/pavilion-water.png"
              />
              <div className="absolute bottom-6 right-6 glass-overlay p-4 rounded-lg">
                <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">Est. 1984</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainable Luxury */}
      <section className="py-24 bg-surface-container-low px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">Sustainable Luxury</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Our commitment to coastal hospitality extends beyond our guests to the environment that sustains us.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface rounded-xl p-8 ambient-shadow border border-surface-container-high h-full flex flex-col">
              <div className="mb-6 h-12 w-12 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">water_ec</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary mb-3">Ecosystem Stewardship</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-auto">
                Active preservation of our local dunes and marine life habitats through mindful operational practices.
              </p>
            </div>
            <div className="md:col-span-2 rounded-xl overflow-hidden ambient-shadow relative h-80 md:h-auto">
              <Image
                alt="Close-up detail shot of beautiful, handcrafted ceramic tableware in muted seafoam and sand colors, resting on a textured linen cloth on an outdoor dining table. The background is a soft, blurred ocean view (bokeh effect). The lighting highlights the artisanal textures and imperfections of the ceramics. The mood is authentic, luxurious, and earthy, aligning with a high-end boutique resort aesthetic."
                fill
                sizes="(min-width: 768px) 66vw, 100vw"
                className="object-cover"
                src="/pavilion-water.png"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-container/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="font-headline-md text-headline-md text-on-primary mb-2">Local Artisans</h3>
                <p className="font-body-md text-body-md text-surface-container-high max-w-lg">
                  From handcrafted ceramics to bespoke furnishings, we proudly partner with regional creators to bring
                  authentic coastal texture to every room.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Visionaries */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-end mb-16">
          <div className="md:col-span-7">
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.2em] mb-4 block">Our Leadership</span>
            <h2 className="font-display-lg text-display-lg text-primary">The Heart Behind the Resort</h2>
          </div>
          <div className="md:col-span-5">
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Guided by a shared vision of coastal preservation and refined hospitality, our leadership team ensures
              every detail of the Sanctuary experience honors our heritage.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <div className="group relative flex flex-col md:flex-row items-center gap-8 p-8 rounded-xl bg-surface-container-low transition-all duration-500 hover:bg-surface-container">
            <div className="relative w-48 h-64 flex-shrink-0 rounded-lg overflow-hidden ambient-shadow border border-surface-container-high">
              <Image
                alt="Eleanor Vance Portrait"
                fill
                sizes="192px"
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                src="/pavilion-water.png"
              />
            </div>
            <div className="flex-grow">
              <h3 className="font-headline-md text-headline-md text-primary mb-2">Eleanor Vance</h3>
              <p className="font-label-caps text-label-caps text-secondary uppercase tracking-widest mb-4">Founder &amp; Curator</p>
              <div className="w-12 h-px bg-outline-variant mb-4"></div>
              <p className="font-body-md text-body-md text-on-surface-variant italic">&quot;Preserving the soul of the coast through intentional design.&quot;</p>
            </div>
          </div>
          <div className="group relative flex flex-col md:flex-row items-center gap-8 p-8 rounded-xl bg-surface-container-low transition-all duration-500 hover:bg-surface-container md:mt-12">
            <div className="relative w-48 h-64 flex-shrink-0 rounded-lg overflow-hidden ambient-shadow border border-surface-container-high">
              <Image
                alt="Julian Hayes Portrait"
                fill
                sizes="192px"
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                src="/pavilion-water.png"
              />
            </div>
            <div className="flex-grow">
              <h3 className="font-headline-md text-headline-md text-primary mb-2">Julian Hayes</h3>
              <p className="font-label-caps text-label-caps text-secondary uppercase tracking-widest mb-4">Director of Experience</p>
              <div className="w-12 h-px bg-outline-variant mb-4"></div>
              <p className="font-body-md text-body-md text-on-surface-variant italic">&quot;Crafting moments that resonate long after the tide goes out.&quot;</p>
            </div>
          </div>
        </div>
      </section>

      {/* Seamless Integration */}
      <section className="py-24 bg-surface px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-2 gap-gutter items-center">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-6">Seamless Integration</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Our architecture doesn&apos;t compete with the landscape; it embraces it. Designed to meld effortlessly
              with the natural dunes and coastal flora, the resort offers an immersive experience where the boundaries
              between indoors and outdoors naturally disappear.
            </p>
          </div>
          <div className="mt-12 md:mt-0">
            <div className="aspect-[4/3] rounded-lg overflow-hidden ambient-shadow-lg relative">
              <Image
                alt="The Landscape and Architecture"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                src="/pavilion-water.png"
              />
            </div>
          </div>
        </div>
      </section>

      {/* The Guest Experience Philosophy */}
      <section className="py-24 bg-surface-container-low px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-2 gap-gutter items-center">
          <div className="order-2 md:order-1 mt-12 md:mt-0">
            <div className="aspect-[4/3] rounded-lg overflow-hidden ambient-shadow-lg relative">
              <Image
                alt="Guest Experience"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                src="/pavilion-water.png"
              />
            </div>
          </div>
          <div className="order-1 md:order-2 md:pl-12">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-6">A Rhythm of Rest</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Life at Sanctuary moves to the gentle rhythm of the tides. From your morning coffee on a sun-drenched deck
              to evening walks along the pristine beach, every moment is an invitation to slow down, reconnect, and
              find peace in the present.
            </p>
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-24 bg-surface px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto text-center border-b border-surface-container-high pb-24">
          <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-12">Celebrated By</h3>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60">
            <div className="flex flex-col items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
              <span className="material-symbols-outlined text-5xl text-primary mb-2">public</span>
              <span className="font-body-md text-primary font-medium tracking-wide">Condé Nast Traveler</span>
            </div>
            <div className="flex flex-col items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
              <span className="material-symbols-outlined text-5xl text-primary mb-2">eco</span>
              <span className="font-body-md text-primary font-medium tracking-wide">Green Hotel Award</span>
            </div>
            <div className="flex flex-col items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
              <span className="material-symbols-outlined text-5xl text-primary mb-2">star_rate</span>
              <span className="font-body-md text-primary font-medium tracking-wide">Forbes Travel Guide</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stay Connected */}
      <section className="py-24 bg-surface px-margin-mobile md:px-margin-desktop text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-4">Join Our Story</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-10">
            Subscribe to our newsletter for exclusive offers, coastal inspiration, and resort news.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <input
              className="px-6 py-4 rounded border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary flex-grow max-w-sm text-on-surface"
              placeholder="Enter your email address"
              type="email"
            />
            <button
              className="bg-primary text-on-primary hover:bg-secondary transition-colors duration-300 rounded px-8 py-4 font-label-caps text-label-caps uppercase tracking-widest"
              type="button"
            >
              Subscribe
            </button>
          </form>
          <div className="flex justify-center gap-8 text-on-surface-variant">
            <a className="hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined text-3xl">share</span></a>
            <a className="hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined text-3xl">photo_camera</span></a>
            <a className="hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined text-3xl">alternate_email</span></a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-surface-container-low text-center px-margin-mobile md:px-margin-desktop relative overflow-hidden border-t border-surface-container-high">
        <div className="absolute inset-0 bg-gradient-to-b from-surface to-transparent opacity-50"></div>
        <div className="relative z-10 max-w-container-max mx-auto ambient-shadow-lg bg-surface p-12 md:py-24 rounded-xl border border-surface-container-high">
          <div className="max-w-2xl mx-auto">
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.2em] mb-6 block">The Journey Awaits</span>
            <h2 className="font-display-lg text-display-lg text-primary mb-6">Begin Your Story</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-12">
              Immerse yourself in the calm of Sanctuary, where every moment is crafted for restoration.
            </p>
            <Link href="/book" className="inline-block">
              <button className="bg-primary text-on-primary hover:bg-secondary transition-all duration-300 rounded px-10 py-5 font-label-caps text-label-caps uppercase tracking-widest shadow-lg hover:-translate-y-1 flex items-center gap-3 mx-auto">
                Check Availability
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}