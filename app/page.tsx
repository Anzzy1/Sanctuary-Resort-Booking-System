import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <main>
        {/* Hero Section */}
        <section className="relative min-h-screen pt-32 pb-16 lg:pt-36 lg:pb-24 w-full flex items-center overflow-hidden bg-white">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-5 flex flex-col items-start z-20">
              <span className="font-label-caps text-sm font-bold tracking-[0.3em] uppercase mb-6 block text-secondary">
                Welcome to Paradise
              </span>
              <h1 className="font-display-lg text-5xl md:text-7xl lg:text-8xl text-primary mb-8 leading-[1.1] tracking-tight">
                Welcome to <br className="hidden md:block" /> Your Sanctuary
              </h1>
              <p className="font-body-lg text-lg md:text-xl text-on-surface-variant mb-12 max-w-xl font-light leading-relaxed opacity-90">
                Discover a sanctuary of serenity where modern luxury meets the effortless rhythm of the coast.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link className="flex items-center justify-center text-center w-full sm:w-auto px-6 py-3 rounded-lg border border-surface-container-high bg-white/40 backdrop-blur-xl text-primary font-label-caps text-label-caps tracking-wider shadow-sm hover:shadow-xl hover:-translate-y-1 hover:bg-white/60 transition-all duration-500" href="/accommodations">
                  View Cottages &amp; Rooms
                </Link>
                <a className="bg-primary text-on-primary px-6 py-3 rounded-lg hover:opacity-90 transition-all duration-300 font-label-caps text-label-caps tracking-wider flex items-center justify-center gap-2 w-full sm:w-auto group" href="/book">
                  Book Now
                  <span className="material-symbols-outlined text-[18px] transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </a>
              </div>
            </div>
            <div className="lg:col-span-7 relative w-full h-[500px] sm:h-[600px] lg:h-[800px] z-10 flex gap-4 sm:gap-6">
              <div className="flex flex-col gap-4 sm:gap-6 w-1/2 pt-8 sm:pt-16">
                <div className="relative w-full h-1/2 rounded-[2rem] overflow-hidden shadow-xl ambient-shadow hover:-translate-y-1 transition-transform duration-500">
                  <Image alt="Resort Villa" fill sizes="(min-width: 1024px) 35vw, 50vw" className="object-cover" src="/pavilion-water.png" />
                </div>
                <div className="relative w-full h-[40%] rounded-[2rem] overflow-hidden shadow-xl ambient-shadow hover:-translate-y-1 transition-transform duration-500">
                  <Image alt="Tropical Scenery" fill sizes="(min-width: 1024px) 35vw, 50vw" className="object-cover" src="/pavilion-water.png" />
                </div>
              </div>
              <div className="flex flex-col gap-4 sm:gap-6 w-1/2 pb-8 sm:pb-16 justify-end">
                <div className="relative w-full h-[40%] rounded-[2rem] overflow-hidden shadow-xl ambient-shadow hover:-translate-y-1 transition-transform duration-500">
                  <Image alt="Resort Interior" fill sizes="(min-width: 1024px) 35vw, 50vw" className="object-cover" src="/pavilion-water.png" />
                </div>
                <div className="relative w-full h-1/2 rounded-[2rem] overflow-hidden shadow-xl ambient-shadow hover:-translate-y-1 transition-transform duration-500">
                  <Image alt="Coastal View" fill sizes="(min-width: 1024px) 35vw, 50vw" className="object-cover" src="/pavilion-water.png" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Stays Section */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="mb-16 text-center md:text-left flex justify-between items-end">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary-container mb-4">Featured Stays</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                Curated spaces designed to connect you intimately with the coastal environment, offering quiet luxury and absolute comfort.
              </p>
            </div>
            <Link className="hidden md:inline-flex items-center text-secondary hover:text-secondary-fixed-dim transition-colors font-label-caps text-label-caps tracking-widest uppercase group" href="/accommodations">
              View All Accommodations <span className="material-symbols-outlined ml-2 text-[18px] transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-gutter">
            {/* Beachside Cottage */}
            <Link className="md:col-span-2 group cursor-pointer" href="/accommodations/beachside-cottage">
              <div className="relative overflow-hidden rounded-[2rem] h-[500px] md:h-[600px] bg-white border border-surface-container-high transition-transform duration-500 hover:-translate-y-1">
                <Image alt="Beachside Cottage" fill sizes="(min-width: 768px) 66vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" src="/pavilion-water.png" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 w-full p-8 md:p-12 flex flex-col justify-end text-white">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h3 className="font-headline-lg text-headline-lg mb-2">Beachside Cottage</h3>
                      <p className="font-body-md opacity-90 max-w-md">A private sanctuary steps away from the shoreline, featuring natural textures and expansive views of the horizon.</p>
                    </div>
                    <span className="font-body-md font-light whitespace-nowrap">From ₱6,800/night</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/20 pt-6">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center text-sm"><span className="material-symbols-outlined text-[18px] mr-1">bed</span> 1 King Bed</div>
                      <div className="flex items-center text-sm"><span className="material-symbols-outlined text-[18px] mr-1">person</span> Up to 2 Guests</div>
                    </div>
                    <span className="font-label-caps text-label-caps uppercase tracking-widest flex items-center gap-2 group/btn">Explore Room <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover/btn:translate-x-1">arrow_forward</span></span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Garden Room */}
            <Link className="md:col-span-1 group cursor-pointer" href="/accommodations/garden-room">
              <div className="relative overflow-hidden rounded-[2rem] h-[500px] md:h-[600px] bg-surface-container-lowest border border-surface-container-high transition-transform duration-500 hover:-translate-y-1">
                <div className="relative h-[65%] overflow-hidden">
                  <Image alt="Garden Room" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" src="/pavilion-water.png" />
                </div>
                <div className="p-8 flex flex-col justify-between h-[35%]">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-primary-container mb-2">Garden Room</h3>
                    <p className="font-body-md text-on-surface-variant line-clamp-2">Nestled within lush tropical foliage, offering a tranquil retreat.</p>
                  </div>
                  <div className="flex justify-between items-center border-t border-outline-variant/30 pt-4">
                    <span className="text-secondary font-label-caps text-label-caps uppercase tracking-wider">₱3,500/night</span>
                    <span className="material-symbols-outlined text-secondary">arrow_forward</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Poolside Suite */}
            <Link className="md:col-span-1 group cursor-pointer" href="/accommodations/poolside-suite">
              <div className="relative overflow-hidden rounded-[2rem] h-[500px] bg-white border border-surface-container-high transition-transform duration-500 hover:-translate-y-1">
                <div className="relative h-1/2 overflow-hidden">
                  <Image alt="Poolside Suite" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" src="/pavilion-water.png" />
                </div>
                <div className="p-6 flex flex-col justify-between h-1/2">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-primary-container mb-2">Poolside Suite</h3>
                    <p className="font-body-md text-on-surface-variant line-clamp-2">Step straight from your terrace into the azure waters of our main pool.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 text-on-surface-variant text-sm">
                      <div className="flex items-center"><span className="material-symbols-outlined text-[18px] mr-1">bed</span> 1 King</div>
                      <div className="flex items-center"><span className="material-symbols-outlined text-[18px] mr-1">square_foot</span> 1,100 sq ft</div>
                    </div>
                    <div className="flex justify-between items-center border-t border-outline-variant/30 pt-4">
                      <span className="font-body-md text-on-surface-variant">₱7,500/night</span>
                      <span className="text-secondary font-label-caps text-label-caps uppercase tracking-wider">Explore</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Family Studio */}
            <Link className="md:col-span-2 group cursor-pointer" href="/accommodations/family-studio">
              <div className="relative overflow-hidden rounded-[2rem] h-[500px] bg-white border border-surface-container-high transition-transform duration-500 hover:-translate-y-1 flex flex-col md:flex-row">
                <div className="relative w-full md:w-1/2 h-1/2 md:h-full overflow-hidden">
                  <Image alt="Family Studio" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" src="/pavilion-water.png" />
                </div>
                <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between bg-white">
                  <div>
                    <span className="font-label-caps text-xs text-secondary uppercase tracking-widest mb-2 block">Spacious Living</span>
                    <h3 className="font-headline-lg text-headline-lg text-primary-container mb-4">Family Studio</h3>
                    <p className="font-body-md text-on-surface-variant mb-6">Expansive accommodations designed for families, offering distinct living and sleeping zones with panoramic resort views.</p>
                    <div className="flex items-center space-x-6 text-on-surface-variant mb-8">
                      <div className="flex items-center text-sm"><span className="material-symbols-outlined text-[18px] mr-1">bed</span> 2 Queen Beds</div>
                      <div className="flex items-center text-sm"><span className="material-symbols-outlined text-[18px] mr-1">person</span> Up to 4 Guests</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-outline-variant/30 pt-6">
                    <span className="font-headline-md text-headline-md text-primary-container">₱6,200<span className="text-sm font-body-md text-on-surface-variant">/night</span></span>
                    <span className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-caps text-label-caps tracking-wider hover:opacity-90 transition-opacity">Book Studio</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link className="inline-flex items-center text-secondary font-label-caps text-label-caps tracking-widest uppercase pb-1 border-b border-secondary" href="/accommodations">
              View All Accommodations
            </Link>
          </div>
        </section>

        {/* Resort Highlights */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto bg-white">
          <div className="mb-16 text-center md:text-left">
            <h2 className="font-headline-lg text-headline-lg text-primary-container mb-4">Resort Highlights</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
              Immerse yourself in curated moments that define the coastal lifestyle, from tranquil wellness to spirited adventure.
            </p>
          </div>
          <div className="w-full bg-white rounded-[2rem] overflow-hidden border border-surface-container-high shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4">
              <Link href="/experience/beach-massage" className="group cursor-pointer flex flex-col border-b md:border-b-0 md:border-r border-outline-variant/20 hover:bg-surface-container-low transition-colors duration-300">
                <div className="relative h-48 overflow-hidden">
                  <Image alt="Beach Massage" fill sizes="25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" src="/pavilion-water.png" />
                </div>
                <div className="p-6 flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">spa</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-[18px] text-primary-container leading-tight">Beach Massage</h3>
                    <p className="font-body-md text-xs text-on-surface-variant mt-1">Serene wellness.</p>
                  </div>
                </div>
              </Link>
              <Link href="/experience/banana-boat" className="group cursor-pointer flex flex-col border-b md:border-b-0 md:border-r border-outline-variant/20 hover:bg-surface-container-low transition-colors duration-300">
                <div className="relative h-48 overflow-hidden">
                  <Image alt="Banana Boat" fill sizes="25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" src="/pavilion-water.png" />
                </div>
                <div className="p-6 flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">directions_boat</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-[18px] text-primary-container leading-tight">Banana Boat</h3>
                    <p className="font-body-md text-xs text-on-surface-variant mt-1">High-energy fun.</p>
                  </div>
                </div>
              </Link>
              <Link href="/experience/sunset-yoga" className="group cursor-pointer flex flex-col border-b md:border-b-0 md:border-r border-outline-variant/20 hover:bg-surface-container-low transition-colors duration-300">
                <div className="relative h-48 overflow-hidden">
                  <Image alt="Coastal Yoga" fill sizes="25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" src="/pavilion-water.png" />
                </div>
                <div className="p-6 flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">self_improvement</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-[18px] text-primary-container leading-tight">Sunset Yoga</h3>
                    <p className="font-body-md text-xs text-on-surface-variant mt-1">Tranquil sessions.</p>
                  </div>
                </div>
              </Link>
              <Link href="/experience/island-tour" className="group cursor-pointer flex flex-col hover:bg-surface-container-low transition-colors duration-300">
                <div className="relative h-48 overflow-hidden">
                  <Image alt="Boat Tour" fill sizes="25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" src="/pavilion-water.png" />
                </div>
                <div className="p-6 flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">sailing</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-[18px] text-primary-container leading-tight">Island Tour</h3>
                    <p className="font-body-md text-xs text-on-surface-variant mt-1">Hidden coves.</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
          <div className="mt-16 flex justify-center md:justify-end">
            <a className="inline-flex items-center text-secondary hover:text-secondary-fixed-dim transition-colors font-label-caps text-label-caps tracking-widest uppercase group" href="/experience">
              View All Experiences <span className="material-symbols-outlined ml-2 text-[18px] transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </a>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto bg-surface-container-low rounded-[2rem] my-8 bg-gradient-to-b">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <span className="material-symbols-outlined text-4xl text-secondary opacity-20 transition-opacity">format_quote</span>
            </div>
            <blockquote className="mb-8">
              <p className="font-display-lg text-headline-lg text-primary leading-tight italic md:text-3xl">
                &quot;We came for two nights and stayed for five. The stilt cottage floods with the sound of water at high tide, in the best way — like sleeping inside the cove itself.&quot;
              </p>
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-6 bg-outline-variant"></div>
              <cite className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant not-italic tracking-[0.4em]">
                Reyna M., Stilt Cottage, March stay
              </cite>
              <div className="h-px w-6 bg-outline-variant"></div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="bg-surface-container-low rounded-[2rem] p-8 md:p-20 text-center shadow-sm border border-surface-container-high">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display-lg text-4xl md:text-5xl lg:text-6xl text-primary mb-6 leading-tight">
                Your Journey to Serenity Begins Here
              </h2>
              <p className="font-body-lg text-lg md:text-xl text-on-surface-variant mb-12 leading-relaxed opacity-90">
                With only eleven exclusive cottages, every stay is a curated escape. Let us help you find your perfect moment by the sea.
              </p>
              <div className="flex justify-center">
                <a className="bg-primary text-on-primary px-10 py-4 rounded-xl hover:opacity-90 transition-all duration-300 font-label-caps text-label-caps tracking-widest flex items-center gap-3 group shadow-lg hover:shadow-xl hover:-translate-y-1" href="/book">
                  Check Availability
                  <span className="material-symbols-outlined text-[20px] transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
  )
}

      
