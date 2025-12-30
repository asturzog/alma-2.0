import type React from "react"
import type { Metadata } from "next"
import { Jost } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navigation } from "@/components/navigation"

const jost = Jost({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "almaPredict - Prediction Markets for Major Soccer Leagues",
  description: "Trade on the outcomes of EPL and AFCON 2025 with dynamic market prices using LMSR algorithm",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${jost.className}`}>
        <Navigation />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
