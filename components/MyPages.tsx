import { TabsContent } from "@radix-ui/react-tabs"
import { Button } from "@/components/ui/button"
import { BarChart3, Plus, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Eye, Share2 } from "lucide-react"
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

const MyPages = ({tipPages, setActiveTab, copyLink, shareLink, togglePageStatus}: {tipPages: TipPage[], setActiveTab: (tab: string) => void, copyLink: (pageId: string) => void, shareLink: (pageId: string, pageName: string) => void, togglePageStatus: (pageId: string) => void}) => {
    return  (
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
                                <span>{page.totalAmount} STRK raised</span>
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
                                {page.totalAmount} STRK of {page.goal} STRK goal
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
            )
    }           

export default MyPages