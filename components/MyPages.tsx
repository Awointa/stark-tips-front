import { TabsContent } from "@radix-ui/react-tabs"
import { Button } from "@/components/ui/button"
import { BarChart3, Plus, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Eye, Check } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useSendTransaction, useContract } from "@starknet-react/core"
import { MY_CONTRACT_ABI } from "@/constants/abi/MyContract"
import { CONTRACT_ADDRESS } from "@/constants"


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

const MyPages = ({tipPages, setActiveTab, shareLink}: {
    tipPages: TipPage[], 
    setActiveTab: (tab: string) => void, 
    shareLink: (pageId: string, pageName: string) => void
}) => {
    const [copiedPageId, setCopiedPageId] = useState<string | null>(null)

    // Contract instance
    const { contract } = useContract({
        abi: MY_CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
    })

    // Send transaction hook for contract interactions
    const { sendAsync, isPending} = useSendTransaction({})

    const handleTogglePageStatus = async (pageId: string, isActive: boolean) => {
        if (!contract) {
            console.error('Contract not available')
            return
        }

        try {
            // Choose the appropriate function based on current status
            const functionName = isActive ? 'deactivate_page' : 'activate_page'
            
            // Use contract.populate to create the call with type safety
            const call = contract.populate(functionName, [pageId])

            // Execute the transaction
            const result = await sendAsync([call])
            
            console.log(`Page ${isActive ? 'deactivated' : 'activated'} successfully:`, result)
            
        } catch (error) {
            console.error(`Failed to ${isActive ? 'deactivate' : 'activate'} page:`, error)
            // You might want to show a toast notification here
            alert(`Failed to ${isActive ? 'deactivate' : 'activate'} page. Please try again.`)
        }
    }

    const handleCopyLink = async (pageId: string) => {
        try {
            // Generate the full URL for the tip page
            const baseUrl = window.location.origin
            const tipPageUrl = `${baseUrl}/tip/${pageId}`
            
            // Copy to clipboard
            await navigator.clipboard.writeText(tipPageUrl)
            
            // Show success state
            setCopiedPageId(pageId)
            
            // Reset success state after 2 seconds
            setTimeout(() => {
                setCopiedPageId(null)
            }, 2000)
            
        } catch (error) {
            console.error('Failed to copy link:', error)
            // Fallback for browsers that don't support clipboard API
            const textArea = document.createElement('textarea')
            const baseUrl = window.location.origin
            const tipPageUrl = `${baseUrl}/tip/${pageId}`
            textArea.value = tipPageUrl
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            
            // Show success state
            setCopiedPageId(pageId)
            setTimeout(() => {
                setCopiedPageId(null)
            }, 2000)
        }
    }

    const handleShareLink = (pageId: string, pageName: string) => {
        if (shareLink) {
            shareLink(pageId, pageName)
        }
    }
    
    return  (
                <TabsContent value="pages" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">My Tip Pages</h2>
                    <Button onClick={() => setActiveTab("create")} className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Page
                    </Button>
                  </div>
    
                  {tipPages.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-gray-500">
                      <p>You haven&apos;t created any tip pages yet.</p>
                      <Button 
                        onClick={() => setActiveTab("create")} 
                        className="mt-4 bg-purple-600 hover:bg-purple-700"
                      >
                        Create Your First Page
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
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

                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleCopyLink(page.id)}
                            className={copiedPageId === page.id ? "bg-green-50 border-green-200" : ""}
                          >
                            {copiedPageId === page.id ? (
                              <Check className="h-4 w-4 mr-2 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 mr-2" />
                            )}
                            {copiedPageId === page.id ? "Copied!" : "Copy Link"}
                          </Button>

                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleShareLink(page.id, page.name)}
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Share
                          </Button>

                          <Button variant="outline" size="sm" onClick={() => setActiveTab("analytics")}>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                          </Button>

                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleTogglePageStatus(page.id, page.isActive)}
                            disabled={isPending}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            {isPending 
                              ? "Processing..." 
                              : page.isActive ? "Deactivate" : "Activate"
                            }
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
              )}
                </TabsContent>
            )
    }           

export default MyPages