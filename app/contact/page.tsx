import Image from "next/image"

const contactDetails = [
  {
    icon: "location_on",
    label: "Resort Address",
    lines: ["1200 Shoreline Drive", "Carmel-by-the-Sea, CA 93921", "United States"],
  },
  {
    icon: "call",
    label: "Direct Line",
    lines: ["+1 (800) 555-0199"],
  },
  {
    icon: "mail",
    label: "General Inquiries",
    lines: ["concierge@sanctuaryresort.ph"],
  },
]

const guideFeatures = [
  { icon: "support_agent", text: "24/7 Instant Support" },
  { icon: "translate", text: "Multilingual Assistance" },
  { icon: "auto_awesome", text: "Personalized Recommendations" },
  { icon: "calendar_add_on", text: "Direct Booking Integration" },
]

const faqs = [
  {
    question: "What is your cancellation policy?",
    answer:
      "Reservations must be cancelled 72 hours prior to arrival to avoid a penalty of one night's room and tax.",
  },
  {
    question: "Are pets allowed at the resort?",
    answer:
      "We welcome well-mannered dogs up to 40 lbs in select ground-floor suites. A dedicated pet fee applies.",
  },
  {
    question: "Do you offer airport transportation?",
    answer:
      "Yes, private luxury car service from Monterey Regional Airport or SFO can be arranged through our concierge.",
  },
]

export default function ContactPage() {
  return (
    <main className="pt-32 pb-24">
      {/* Hero Section */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center mb-24">
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-6">
          Get in Touch
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Whether you&apos;re inquiring about a future stay, special arrangements, or simply wish to learn more about
          our coastal retreat, our dedicated team is here to assist you with meticulous care.
        </p>
      </section>

      {/* Two Column Layout: Info & Form */}
      <section className="max-w-[1140px] mx-auto px-margin-mobile md:px-margin-desktop mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          {/* Left Column: Contact Info */}
          <div className="flex flex-col gap-12">
            <div>
              <h2 className="font-headline-md text-headline-md text-primary mb-8 border-b border-surface-variant pb-4">
                Contact Details
              </h2>
              <div className="flex flex-col gap-8">
                {contactDetails.map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-secondary mt-1">{item.icon}</span>
                    <div>
                      <h3 className="font-label-caps text-label-caps text-primary uppercase mb-2">{item.label}</h3>
                      {item.lines.map((line) => (
                        <p key={line} className="font-body-md text-body-md text-on-surface-variant">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Office Hours */}
            <div className="bg-surface p-8 rounded-xl border border-surface-variant/50 shadow-[0_8px_30px_rgb(26,46,53,0.04)]">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-secondary">schedule</span>
                <h3 className="font-label-caps text-label-caps text-primary uppercase">Concierge Hours</h3>
              </div>
              <ul className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-2">
                <li className="flex justify-between border-b border-surface-variant/50 pb-2">
                  <span>Monday – Friday</span>
                  <span>8:00 AM – 8:00 PM</span>
                </li>
                <li className="flex justify-between border-b border-surface-variant/50 pb-2">
                  <span>Saturday – Sunday</span>
                  <span>9:00 AM – 6:00 PM</span>
                </li>
                <li className="flex justify-between pt-2">
                  <span>Front Desk</span>
                  <span>24/7</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Form */}
          <div>
            <h2 className="font-headline-md text-headline-md text-primary mb-8 border-b border-surface-variant pb-4">
              Send a Message
            </h2>
            <form className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-1" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none px-4 py-3 font-body-md text-body-md text-primary transition-all"
                    id="firstName"
                    placeholder="Jane"
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-1" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none px-4 py-3 font-body-md text-body-md text-primary transition-all"
                    id="lastName"
                    placeholder="Doe"
                    type="text"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-1" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none px-4 py-3 font-body-md text-body-md text-primary transition-all"
                  id="email"
                  placeholder="jane.doe@example.com"
                  type="email"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-1" htmlFor="subject">
                  Subject
                </label>
                <select
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none px-4 py-3 font-body-md text-body-md text-primary transition-all appearance-none"
                  id="subject"
                >
                  <option>Booking Inquiry</option>
                  <option>Special Events</option>
                  <option>Dining Reservations</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-1" htmlFor="message">
                  Message
                </label>
                <textarea
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none px-4 py-3 font-body-md text-body-md text-primary transition-all resize-none"
                  id="message"
                  placeholder="How can we assist you?"
                  rows={5}
                />
              </div>
              <button
                className="mt-4 bg-primary text-on-primary hover:bg-secondary transition-colors duration-300 rounded-lg px-8 py-4 font-label-caps text-label-caps uppercase w-full md:w-auto self-start"
                type="submit"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="mb-32">
        <div className="w-full h-[400px] relative bg-surface-variant/30">
          <div className="absolute inset-0">
            <Image
              alt="A highly stylized, minimalist map illustration of a coastal region, featuring elegant line art mapping the coastline, subtle contour lines, and a discreet marker for a luxury boutique resort. The color palette is restricted to soft sand tones, muted sea glass teal, and deep ocean blue outlines, creating an airy, sophisticated, and high-end editorial feel."
              fill
              sizes="100vw"
              className="object-cover mix-blend-multiply opacity-80"
              src="/pavilion-water.png"
            />
          </div>
          <div className="absolute bottom-8 left-8 md:left-margin-desktop bg-white/80 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-lg max-w-sm">
            <h3 className="font-headline-md text-headline-md text-primary mb-2">Arriving at Sanctuary</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Located 15 minutes from Monterey Regional Airport. Valet parking is complimentary for all resort guests.
            </p>
          </div>
        </div>
      </section>

      {/* AI Sanctuary Guide */}
      <section className="bg-surface-container-lowest py-16 mb-32">
        <div className="max-w-[1140px] mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="bg-surface-container-low rounded-xl border border-surface-variant/30 p-8 md:p-12 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <h2 className="font-display-lg-mobile md:font-headline-lg text-display-lg-mobile md:text-headline-lg text-primary">
                    Chat with our AI Sanctuary Guide
                  </h2>
                  <p className="font-body-lg text-body-lg text-on-surface-variant">
                    Experience the future of hospitality. Our AI Sanctuary Guide is your personal digital concierge,
                    crafted to provide effortless serenity from the moment you begin your journey.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {guideFeatures.map((feature) => (
                    <div key={feature.text} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary text-xl">{feature.icon}</span>
                      <span className="font-body-md text-body-md text-on-surface">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-surface-container-lowest p-8 rounded-xl border border-surface-variant/20 shadow-lg flex flex-col items-center text-center gap-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-4xl">smart_toy</span>
                    </div>
                    <span className="absolute bottom-0 right-0 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-secondary border-2 border-surface-container-lowest"></span>
                    </span>
                  </div>
                  <div>
                    <p className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">Online Now</p>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">Average response time: &lt; 30s</p>
                  </div>
                </div>
                <button className="w-full bg-primary text-on-primary hover:bg-secondary transition-all duration-300 rounded-lg px-12 py-5 font-label-caps text-label-caps uppercase shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-3">
                  <span>Start Chatting</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop">
        <h2 className="font-display-lg-mobile md:font-headline-lg text-display-lg-mobile md:text-headline-lg text-primary text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-4">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="border border-surface-variant rounded-lg p-6 bg-surface-container-lowest hover:border-outline transition-colors cursor-pointer group"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-headline-md text-headline-md text-primary text-lg">{faq.question}</h3>
                <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors">add</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant/80">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}