import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "The Mortgage Masters - Master Your Mortgage, Retire Debt-Free",
  description:
    "Take control of your financial future by mastering all mortgage prepayment options to be mortgage free before retirement. Calculate your path to mortgage freedom with proven strategies.",
  generator: "v0.app",
  openGraph: {
    title: "The Mortgage Masters - Master Your Mortgage, Retire Debt-Free",
    description:
      "Take control of your financial future by mastering all mortgage prepayment options to be mortgage free before retirement.",
    url: "https://the-mortgage-masters.com",
    siteName: "The Mortgage Masters",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Mortgage Masters - Master your mortgage, retire debt free",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Mortgage Masters - Master Your Mortgage, Retire Debt-Free",
    description:
      "Take control of your financial future by mastering all mortgage prepayment options to be mortgage free before retirement.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
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
      <body className={`font-sans antialiased`}>{children}</body>
    </html>
  )
}
