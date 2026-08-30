import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { PublicChrome } from "./components/PublicChrome"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "Sanctuary Resort",
  description: "A refined coastal retreat designed for absolute tranquility and connection with nature.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface font-body-md antialiased selection:bg-secondary-container selection:text-on-secondary-container">
        <PublicChrome>{children}</PublicChrome>
      </body>
    </html>
  )
}
