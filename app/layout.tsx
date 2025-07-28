import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import Link from "next/link"
import { Coins } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Thanksonchain - Starknet Creator Tipping Platform",
  description: "The simplest way for creators to receive tips on Starknet with Thanksonchain",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                <Coins className="h-6 w-6 text-purple-600" />
                Thanksonchain
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/demo" className="text-gray-600 hover:text-gray-900">
                  Demo
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </nav>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
