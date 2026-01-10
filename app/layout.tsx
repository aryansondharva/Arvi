import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Arvi - Join Environmental Cleanup Events",
  description:
    "Connect with environmental cleanup events, track your impact, and make a difference. Join our community of eco-warriors today.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/a2.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/a2.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/a2.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
