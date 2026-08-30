import Image from "next/image"

export default function FacilitiesPage() {
  return (
    <main className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto space-y-24">
      {/* Hero Section */}
      <header className="text-center md:text-left max-w-3xl">
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-6">
          Curated Spaces for Decompression
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Experience effortless coastal serenity across our thoughtfully designed facilities. Every detail is crafted
          to provide a sophisticated, tranquil environment, merging the natural beauty of the shoreline with
          minimalist luxury.
        </p>
      </header>

      {/* Bento Grid Facilities */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Infinity Pool (Featured Image) */}
        <article className="col-span-1 md:col-span-8 group relative rounded-lg overflow-hidden border border-surface-container-high bg-surface-container-lowest shadow-sm shadow-primary/5 transition-all duration-500 hover:shadow-primary/10">
          <div className="relative h-[600px] w-full overflow-hidden">
            <Image
              alt="Sanctuary Infinity Pool"
              fill
              sizes="(min-width: 768px) 66vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              src="/pavilion-water.png"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent"></div>
          </div>
          <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full text-on-primary">
            <div className="flex items-center gap-3 mb-4 opacity-90">
              <span className="material-symbols-outlined">pool</span>
              <span className="font-label-caps text-label-caps tracking-widest uppercase">The Infinity Pool</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg mb-4">Seamlessly merge with the horizon.</h2>
            <p className="font-body-md text-body-md opacity-80 max-w-2xl">
              Our temperature-controlled infinity pool creates an unbroken visual line to the sea. Featuring submerged
              lounging areas and attentive poolside service, it is a serene haven designed for absolute relaxation.
            </p>
          </div>
        </article>

        {/* Private Beach Access */}
        <article className="col-span-1 md:col-span-4 flex flex-col rounded-lg border border-surface-container-high bg-surface-container-lowest shadow-sm shadow-primary/5 p-8 justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6 text-primary">
              <span className="material-symbols-outlined">beach_access</span>
              <span className="font-label-caps text-label-caps tracking-widest uppercase">Private Beach</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-primary mb-4">Your secluded stretch of sand.</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8">
              Direct, private access to a pristine shoreline. Enjoy complimentary loungers, umbrellas, and unhurried
              coastal walks away from the crowds.
            </p>
          </div>
          <div className="relative w-full h-48 rounded bg-surface-container-high overflow-hidden">
            <Image
              alt="Private Beach"
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover"
              src="/pavilion-water.png"
            />
          </div>
        </article>

        {/* Coastal Dining Area */}
        <article className="col-span-1 md:col-span-6 flex flex-col md:flex-row rounded-lg border border-surface-container-high bg-surface-container-lowest shadow-sm shadow-primary/5 overflow-hidden">
          <div className="relative w-full md:w-1/2 h-64 md:h-auto">
            <Image
              alt="Dining"
              fill
              sizes="(min-width: 768px) 25vw, 100vw"
              className="object-cover"
              src="/pavilion-water.png"
            />
          </div>
          <div className="p-8 w-full md:w-1/2 flex flex-col justify-center bg-surface">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <span className="material-symbols-outlined">restaurant</span>
              <span className="font-label-caps text-label-caps tracking-widest uppercase">Dining</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-primary mb-4">Culinary artistry by the sea.</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Experience hyper-local, seasonal ingredients in an airy, glass-enclosed dining room that brings the
              coastal landscape indoors.
            </p>
          </div>
        </article>

        {/* Wellness Center */}
        <article className="col-span-1 md:col-span-6 flex flex-col md:flex-row-reverse rounded-lg border border-surface-container-high bg-surface-container-lowest shadow-sm shadow-primary/5 overflow-hidden">
          <div className="relative w-full md:w-1/2 h-64 md:h-auto">
            <Image
              alt="Wellness Spa"
              fill
              sizes="(min-width: 768px) 25vw, 100vw"
              className="object-cover"
              src="/pavilion-water.png"
            />
          </div>
          <div className="p-8 w-full md:w-1/2 flex flex-col justify-center bg-surface">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <span className="material-symbols-outlined">spa</span>
              <span className="font-label-caps text-label-caps tracking-widest uppercase">Wellness Spa</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-primary mb-4">Restore and rejuvenate.</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              A minimalist sanctuary offering bespoke treatments designed to decompress the mind and body, featuring
              panoramic ocean views.
            </p>
          </div>
        </article>
      </div>

      {/* The Beach Club */}
      <article className="w-full rounded-lg overflow-hidden border border-surface-container-high bg-surface-container-lowest shadow-sm shadow-primary/5 relative">
        <div className="relative h-[500px] w-full">
          <Image
            alt="The Beach Club"
            fill
            sizes="100vw"
            className="object-cover"
            src="/pavilion-water.png"
          />
          <div className="absolute inset-0 bg-primary/40"></div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-on-primary">
          <div className="flex items-center gap-3 mb-6 opacity-90">
            <span className="material-symbols-outlined">local_bar</span>
            <span className="font-label-caps text-label-caps tracking-widest uppercase">The Beach Club</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg mb-6 max-w-2xl">Sunsets and signature cocktails.</h2>
          <p className="font-body-lg text-body-lg opacity-90 max-w-2xl">
            Unwind as the day transitions to night. Our Beach Club offers an elegant yet relaxed atmosphere for
            evening drinks, light bites, and panoramic sunset views over the water.
          </p>
        </div>
      </article>

      {/* Fitness & Sustainability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {/* Fitness Sanctuary */}
        <article className="col-span-1 flex flex-col rounded-lg border border-surface-container-high bg-surface-container-lowest shadow-sm shadow-primary/5 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6 text-primary">
            <span className="material-symbols-outlined">fitness_center</span>
            <span className="font-label-caps text-label-caps tracking-widest uppercase">Fitness Sanctuary</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-primary mb-4">Elevate your wellness routine.</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8 flex-grow">
            A state-of-the-art facility blending indoor strength conditioning with outdoor yoga decks. Maintain your
            rhythm surrounded by inspiring coastal vistas and natural light.
          </p>
          <div className="relative w-full h-64 rounded bg-surface-container-high overflow-hidden">
            <Image
              alt="Fitness Center"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              src="/pavilion-water.png"
            />
          </div>
        </article>

        {/* Sustainability & Nature */}
        <article className="col-span-1 flex flex-col rounded-lg border border-surface-container-high bg-surface-container-lowest shadow-sm shadow-primary/5 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6 text-primary">
            <span className="material-symbols-outlined">eco</span>
            <span className="font-label-caps text-label-caps tracking-widest uppercase">Sustainability</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-primary mb-4">Harmony with our environment.</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8 flex-grow">
            We are committed to preserving the natural beauty that surrounds us. From solar-powered water heating to
            zero-single-use-plastic policies, every stay contributes to our coastal conservation efforts.
          </p>
          <div className="relative w-full h-64 rounded bg-surface-container-high overflow-hidden">
            <Image
              alt="Nature and Sustainability"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              src="/pavilion-water.png"
            />
          </div>
        </article>
      </div>

      {/* Resort Map */}
      <article className="w-full rounded-lg border border-surface-container-high bg-surface-container-low p-8 md:p-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-6 text-primary">
          <span className="material-symbols-outlined">map</span>
          <span className="font-label-caps text-label-caps tracking-widest uppercase">Resort Map</span>
        </div>
        <h2 className="font-headline-lg text-headline-lg text-primary mb-6">Navigate your sanctuary.</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto mb-12">
          Familiarize yourself with the layout of our pristine grounds, from the secluded cottages to the beachfront
          dining areas.
        </p>
        <div className="w-full max-w-4xl mx-auto aspect-video rounded bg-surface border border-surface-container-high flex items-center justify-center shadow-sm">
          <div className="text-on-surface-variant flex flex-col items-center gap-4 opacity-50">
            <span className="material-symbols-outlined" style={{ fontSize: 48 }}>map</span>
            <span className="font-label-caps">Interactive Map Coming Soon</span>
          </div>
        </div>
      </article>
    </main>
  )
}