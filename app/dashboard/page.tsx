"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Plus, BarChart3, Eye, Settings, TrendingUp, Users, DollarSign, Calendar, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import WalletConnect from "@/components/wallet-connect"
import Link from "next/link"

interface TipPage {
  id: string
  name: string
  description: string
  totalAmount: string
  tipCount: number
  createdAt: string
  isActive: boolean
  goal?: string
}

export default function Dashboard() {
  const [pageName, setPageName] = useState("")
  const [description, setDescription] = useState("")
  const [goal, setGoal] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const [tipPages, setTipPages] = useState<TipPage[]>([
    {
      id: "creative-journey",
      name: "My Creative Journey",
      description: "Supporting my digital art and creative projects. Every tip helps me continue creating!",
      totalAmount: "2.45",
      tipCount: 23,
      createdAt: "2024-01-15",
      isActive: true,
      goal: "5.0",
    },
    {
      id: "music-production",
      name: "Music Production Fund",
      description: "Help me produce my next album and share it with the world!",
      totalAmount: "1.2",
      tipCount: 8,
      createdAt: "2024-01-10",
      isActive: true,
      goal: "10.0",
    },
    {
      id: "coding-tutorials",
      name: "Coding Tutorials",
      description: "Creating free coding tutorials for the community.",
      totalAmount: "0.8",
      tipCount: 12,
      createdAt: "2024-01-05",
      isActive: false,
    },
  ])

  const { toast } = useToast()

  const handleCreatePage = async () => {
    if (!pageName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a page name",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    // Simulate contract interaction
    setTimeout(() => {
      const newPage: TipPage = {
        id: Math.random().toString(36).substring(2, 15),
        name: pageName,
        description: description || "Support my work!",
        totalAmount: "0",
        tipCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
        isActive: true,
        goal: goal || undefined,
      }

      setTipPages((prev) => [newPage, ...prev])
      setPageName("")
      setDescription("")
      setGoal("")
      setIsCreating(false)

      toast({
        title: "Success! 🎉",
        description: "Your tip page has been created and is ready to receive tips",
      })
    }, 2000)
  }

  const copyLink = (pageId: string) => {
    const link = `${window.location.origin}/tip/${pageId}`
    navigator.clipboard.writeText(link)
    toast({
      title: "Link Copied! 📋",
      description: "Your tip page link has been copied to clipboard",
    })
  }

  const shareLink = (pageId: string, pageName: string) => {
    const link = `${window.location.origin}/tip/${pageId}`
    const text = `Support my work on Thanksonchain! ${pageName}`

    if (navigator.share) {
      navigator.share({
        title: pageName,
        text: text,
        url: link,
      })
    } else {
      navigator.clipboard.writeText(`${text} ${link}`)
      toast({
        title: "Share Text Copied! 📱",
        description: "Share text with link copied to clipboard",
      })
    }
  }

  const togglePageStatus = (pageId: string) => {
    setTipPages((prev) => prev.map((page) => (page.id === pageId ? { ...page, isActive: !page.isActive } : page)))
    toast({
      title: "Page Updated",
      description: "Page status has been changed",
    })
  }

  const totalEarnings = tipPages.reduce((sum, page) => sum + Number.parseFloat(page.totalAmount), 0)
  const totalTips = tipPages.reduce((sum, page) => sum + page.tipCount, 0)
  const activePagesCount = tipPages.filter((page) => page.isActive).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Creator Dashboard</h1>
            <p className="text-gray-600">Manage your tip pages and track your earnings on Thanksonchain</p>
          </div>

          <WalletConnect />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pages">My Pages</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalEarnings.toFixed(3)} ETH</div>
                    <p className="text-xs text-muted-foreground">≈ ${(totalEarnings * 2000).toFixed(2)} USD</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tips</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalTips}</div>
                    <p className="text-xs text-muted-foreground">From all your pages</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Pages</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activePagesCount}</div>
                    <p className="text-xs text-muted-foreground">Out of {tipPages.length} total</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Tip</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {totalTips > 0 ? (totalEarnings / totalTips).toFixed(3) : "0.000"} ETH
                    </div>
                    <p className="text-xs text-muted-foreground">Per tip received</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest tips and page updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New tip received</p>
                        <p className="text-xs text-gray-500">0.1 ETH on "My Creative Journey" • 2 hours ago</p>
                      </div>
                      <Badge variant="secondary">+0.1 ETH</Badge>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Page shared</p>
                        <p className="text-xs text-gray-500">
                          "Music Production Fund" shared on social media • 5 hours ago
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Goal milestone reached</p>
                        <p className="text-xs text-gray-500">"My Creative Journey" reached 50% of goal • 1 day ago</p>
                      </div>
                      <Badge variant="secondary">50%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Pages Tab */}
            <TabsContent value="pages" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Tip Pages</h2>
                <Button onClick={() => setActiveTab("create")} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Page
                </Button>
              </div>

              <div className="grid gap-6">
                {tipPages.map((page) => (
                  <Card key={page.id} className={`${!page.isActive ? "opacity-60" : ""}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl">{page.name}</CardTitle>
                            <Badge variant={page.isActive ? "default" : "secondary"}>
                              {page.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <CardDescription className="mb-3">{page.description}</CardDescription>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{page.totalAmount} ETH raised</span>
                            <span>{page.tipCount} tips</span>
                            <span>Created {new Date(page.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/tip/${page.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Page
                          </Link>
                        </Button>

                        <Button variant="outline" size="sm" onClick={() => copyLink(page.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </Button>

                        <Button variant="outline" size="sm" onClick={() => shareLink(page.id, page.name)}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>

                        <Button variant="outline" size="sm" onClick={() => setActiveTab("analytics")}>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>

                        <Button variant="outline" size="sm" onClick={() => togglePageStatus(page.id)}>
                          <Settings className="h-4 w-4 mr-2" />
                          {page.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>

                      {page.goal && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Goal Progress</span>
                            <span>
                              {((Number.parseFloat(page.totalAmount) / Number.parseFloat(page.goal)) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min((Number.parseFloat(page.totalAmount) / Number.parseFloat(page.goal)) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {page.totalAmount} ETH of {page.goal} ETH goal
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Last 30 Days
                  </Button>
                  <Button variant="outline" size="sm">
                    Export Data
                  </Button>
                </div>
              </div>

              {/* Analytics Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">+0.8 ETH</div>
                    <p className="text-xs text-muted-foreground">↗️ +23% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">New Supporters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <p className="text-xs text-muted-foreground">↗️ +4 from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Best Performing Page</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-bold">My Creative Journey</div>
                    <p className="text-xs text-muted-foreground">2.45 ETH total</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Peak Tip Day</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-bold">Yesterday</div>
                    <p className="text-xs text-muted-foreground">0.3 ETH in tips</p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analytics */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tips Over Time</CardTitle>
                    <CardDescription>Your tip earnings trend</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Chart visualization would go here</p>
                        <p className="text-sm">Showing earnings over the last 30 days</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Supporters</CardTitle>
                    <CardDescription>Your most generous supporters</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">0x1234...5678</p>
                          <p className="text-sm text-gray-500">3 tips</p>
                        </div>
                        <Badge variant="secondary">0.3 ETH</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">0x9876...4321</p>
                          <p className="text-sm text-gray-500">2 tips</p>
                        </div>
                        <Badge variant="secondary">0.25 ETH</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">0x5555...7777</p>
                          <p className="text-sm text-gray-500">1 tip</p>
                        </div>
                        <Badge variant="secondary">0.2 ETH</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Page Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Page Performance</CardTitle>
                  <CardDescription>How each of your tip pages is performing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tipPages.map((page) => (
                      <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{page.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span>{page.tipCount} tips</span>
                            <span>{page.totalAmount} ETH</span>
                            <span>
                              Avg:{" "}
                              {page.tipCount > 0
                                ? (Number.parseFloat(page.totalAmount) / page.tipCount).toFixed(3)
                                : "0.000"}{" "}
                              ETH
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{page.totalAmount} ETH</div>
                          <Badge variant={page.isActive ? "default" : "secondary"}>
                            {page.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Create New Tab */}
            <TabsContent value="create" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create New Tip Page
                  </CardTitle>
                  <CardDescription>Set up a new tip page to start receiving support from your audience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pageName">Page Name *</Label>
                    <Input
                      id="pageName"
                      placeholder="e.g., Support My Art, Coffee Fund, Music Production"
                      value={pageName}
                      onChange={(e) => setPageName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell your supporters what you're working on and how their tips will help..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Goal (Optional)</Label>
                    <Input
                      id="goal"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 5.0"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      Set a fundraising goal in ETH to show progress to supporters
                    </p>
                  </div>

                  <Button
                    onClick={handleCreatePage}
                    disabled={isCreating}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    {isCreating ? "Creating Your Page..." : "Create Tip Page"}
                  </Button>
                </CardContent>
              </Card>

              {/* Tips for Success */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">💡 Tips for Success</CardTitle>
                </CardHeader>
                <CardContent className="text-blue-800 space-y-2 text-sm">
                  <p>
                    ✅ <strong>Clear page name:</strong> Make it obvious what you're raising funds for
                  </p>
                  <p>
                    ✅ <strong>Compelling description:</strong> Explain your project and how tips help
                  </p>
                  <p>
                    ✅ <strong>Set realistic goals:</strong> Start with achievable targets to build momentum
                  </p>
                  <p>
                    ✅ <strong>Share regularly:</strong> Post your link on social media, Discord, etc.
                  </p>
                  <p>
                    ✅ <strong>Thank supporters:</strong> Acknowledge tips to encourage more support
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
