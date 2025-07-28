import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, Heart, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-purple-100 rounded-full">
              <Coins className="h-12 w-12 text-purple-600" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Thanksonchain</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The simplest way for creators to receive tips on Starknet. Share your link and start earning in minutes.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Create Tip Page
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg">
                View Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-yellow-500 mb-2" />
              <CardTitle>One-Click Tipping</CardTitle>
              <CardDescription>Supporters can tip in seconds - just connect wallet and send</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="h-8 w-8 text-red-500 mb-2" />
              <CardTitle>No Registration</CardTitle>
              <CardDescription>Neither creators nor supporters need accounts - wallet only</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Coins className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle>Instant Payouts</CardTitle>
              <CardDescription>Tips go directly to your wallet - no middleman or delays</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How it Works */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-purple-600 font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold">Create Your Page</h3>
              <p className="text-gray-600">Connect your wallet and create a personalized tip page</p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold">Share Your Link</h3>
              <p className="text-gray-600">Share your unique link on social media, websites, anywhere</p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold">Receive Tips</h3>
              <p className="text-gray-600">Supporters click, connect wallet, and tip instantly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
