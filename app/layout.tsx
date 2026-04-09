import type { Metadata } from "next"
import { DM_Sans, DM_Mono, Syne } from "next/font/google"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
})

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
})

export const metadata: Metadata = {
  title: "OmniCore — Gym Facility Management",
  description:
    "Multi-role B2B SaaS portal for managing community gym facilities in RWAs and corporate campuses.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`dark ${dmSans.variable} ${dmMono.variable} ${syne.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  )
}
