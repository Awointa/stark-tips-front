import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Users, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  const mockTips = [
    {
      sender: "0x1234...5678",
      amount: "0.1",
      message: "Love your work! Keep creating! 🎨",
      timestamp: "2h ago",
    },
    {
      sender: "0x9876...4321",
      amount: "0.05",
      message: "Amazing art style!",
      timestamp: "4h ago",
    },
    {
      sender: "0x5555...7777",
      amount: "0.2",
      message: "Your tutorials helped me so much. Thank you!",
      timestamp: "6h ago",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Demo Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Demo Tip Page</h1>
            <p className="text-gray-600">This is how your tip page will look to supporters</p>
            <Link href="/dashboard">
              <Button className="mt-4 bg-purple-600 hover:bg-purple-700">Create Your Own Page</Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Demo Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Creator Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      A
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Amazing Creator</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          3.2 STRK raised
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          47 supporters
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    I&apos;m a digital artist creating amazing NFT collections and teaching others about blockchain art. Your
                    support helps me continue creating and sharing knowledge with the community! 🎨✨
                  </p>
                </CardContent>
              </Card>

              {/* Demo Tip Form */}
              <Card className="border-2 border-dashed border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Send a Tip
                    <Badge variant="secondary">Demo Mode</Badge>
                  </CardTitle>
                  <CardDescription>In the real version, supporters would connect their wallet here</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    <Button variant="outline" disabled>
                      0.01  STRK
                    </Button>
                    <Button variant="outline" disabled>
                      0.05 STRK
                    </Button>
                    <Button variant="default" disabled>
                      0.1 STRK
                    </Button>
                    <Button variant="outline" disabled>
                      0.25 STRK
                    </Button>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-500 mb-2">💡 Demo Preview</p>
                    <p className="text-sm text-gray-600">
                      Supporters would see quick amount buttons, custom input, and message field here
                    </p>
                  </div>

                  <Button disabled className="w-full" size="lg">
                    Connect Wallet to Send Tip
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Tips Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Recent Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockTips.map((tip, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-mono text-gray-500">{tip.sender}</span>
                        <Badge variant="secondary">{tip.amount} STRK</Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{tip.message}</p>
                      <span className="text-xs text-gray-400">{tip.timestamp}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Support Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Raised</span>
                    <span className="font-semibold">3.2 STRK</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Tips</span>
                    <span className="font-semibold">47</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Tip</span>
                    <span className="font-semibold">0.068 STRK</span>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-purple-900 mb-2">Ready to start?</h3>
                  <p className="text-sm text-purple-700 mb-4">Create your own tip page in minutes</p>
                  <Link href="/dashboard">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Create Tip Page
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
