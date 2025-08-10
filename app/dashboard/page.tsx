"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {Eye,TrendingUp, Users, DollarSign,  } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import WalletConnect from "@/components/wallet-connect"
import MyPages from "@/components/MyPages"
import Analytics from "@/components/Analytics"
import CreateNewPage from "@/components/CreateNewPage"

import {MY_CONTRACT_ABI} from "@/constants/abi/MyContract";
import {CONTRACT_ADDRESS} from "@/constants";
import { useAccount, useContract, useReadContract } from "@starknet-react/core";


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

interface ContractStats {
  totalPages: bigint | undefined
  totalTips: number
  totalAmount: number
  activePagesCount: number
  averageTip: number
}

export default function Dashboard() {
  const [pageName, setPageName] = useState("")
  const [description, setDescription] = useState("")
  const [goal, setGoal] = useState("")
  const [tipPages, setTipPages] = useState<TipPage[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  
  const [userPages, setUserPages] = useState<bigint[]>([])
  const [contractStats, setContractStats] = useState<ContractStats>({
    totalPages: undefined,
    totalTips: 0,
    totalAmount: 0,
    activePagesCount: 0,
    averageTip: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  const {account} = useAccount()
  const {toast} = useToast()

    // Create contract instance
    const { contract } = useContract({
      abi: MY_CONTRACT_ABI,
      address: CONTRACT_ADDRESS,
    });
  
    // Read user's pages from contract 
    const {data: totalPagesData} = useReadContract({
      functionName: "get_total_pages",
      abi: MY_CONTRACT_ABI,
      address: CONTRACT_ADDRESS,
    })
    console.log(totalPagesData)

    // Read user's pages from contract 
    const {data: creatorPagesData} = useReadContract({
      functionName: "get_creator_pages",
      abi: MY_CONTRACT_ABI,
      address: CONTRACT_ADDRESS,
      args: account?.address ? [account.address] : undefined,
      enabled: !!account?.address,
    })
  

  // Fetch page details for each user page
  const fetchPageDetails = useCallback(async (pageIds: bigint[]) => {
    if (!contract || pageIds.length == 0) return;

    setIsLoading(true);

    try {
      const pagePromises = pageIds.map(async (pageId) => {
        try {
          const pageInfo = await contract.get_page_info(pageId);
          const pageTips = await contract.get_tips_for_page(pageId);
          
          return {
            id: pageId.toString(),
            pageInfo,
            tips: pageTips || []
          };
        } catch (error) {
          console.error(`Error fetching page ${pageId}:`, error);
          return null;
        }
      });

      const pageDetails = await Promise.all(pagePromises);
      const validPages = pageDetails.filter(page => page !== null);
      
      // Calculate stats from contract data
      let totalTips = 0;
      let totalAmount = 0;
      let activePagesCount = 0;

      validPages.forEach(page => {
        if (page?.pageInfo) {
          // Convert BigInt to number for calculations (be careful with large numbers)
          const pageAmount = Number(page.pageInfo.total_amount_recieved) / Math.pow(10, 18); // Assuming 18 decimals for STRK
          const pageTipsCount = Number(page.pageInfo.total_tips_recieved);
          
          totalAmount += pageAmount;
          totalTips += pageTipsCount;
          
          if (page.pageInfo.is_active) {
            activePagesCount++;
          }
        }
      });

      const averageTip = totalTips > 0 ? totalAmount / totalTips : 0;

      setContractStats({
        totalPages: totalPagesData as bigint,
        totalTips,
        totalAmount,
        activePagesCount,
        averageTip
      });

      // Update tip pages state with real data
      const updatedPages: TipPage[] = validPages.map(page => ({
        id: page!.id,
        name: page!.pageInfo.name.toString(), // Convert ByteArray to string
        description: page!.pageInfo.description.toString(),
        totalAmount: (Number(page!.pageInfo.total_amount_recieved) / Math.pow(10, 18)).toFixed(6),
        tipCount: Number(page!.pageInfo.total_tips_recieved),
        createdAt: new Date(Number(page!.pageInfo.created_at) * 1000).toISOString().split("T")[0],
        isActive: page!.pageInfo.is_active,
      }));

      setTipPages(updatedPages);

    } catch (error) {
      console.error("Error fetching page details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch page details from contract",
        variant: "destructive",
      });
    } finally{
      setIsLoading(false)
    }
  }, [contract, totalPagesData, toast]);

  // Reset data when wallet disconnects
  useEffect(() => {
    if (!account) {
      setUserPages([]);
      setTipPages([]);
      setContractStats({
        totalPages: undefined,
        totalTips: 0,
        totalAmount: 0,
        activePagesCount: 0,
        averageTip: 0
      });
    }
  }, [account]);

  // Effect to fetch user pages when account changes
  useEffect(() => {
    if (creatorPagesData && Array.isArray(creatorPagesData)) {
      setUserPages(creatorPagesData as bigint[]);
    }
  }, [creatorPagesData]);

  // Effect to fetch page details when user pages change
  useEffect(() => {
    if (userPages.length > 0 && account) {
      fetchPageDetails(userPages);
    } else if (account && userPages.length === 0) {
      // Account connected but no pages found - clear the loading state
      setTipPages([]);
      setContractStats(prev => ({
        ...prev,
        totalPages: totalPagesData as bigint,
        totalTips: 0,
        totalAmount: 0,
        activePagesCount: 0,
        averageTip: 0
      }));
    }
  }, [userPages, account, fetchPageDetails, totalPagesData]);



  const handleCreatePage = async () => {
    if (!pageName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a page name",
        variant: "destructive",
      })
      return
    }

    if (!account || !contract) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      })
      return
    }

    // setIsCreating(true)
      try {
        // Call the contract to create a tip page
        const result = await contract.create_tip_page(
          account.address,
          pageName,
          description || "Support my work!"
        );

        // Wait for transaction to complete
        await account.waitForTransaction(result.transaction_hash);

        // Refresh the page data
        const updatedPages = await contract.get_creator_pages(account.address);
        setUserPages(updatedPages as bigint[]);

        setPageName("")
        setDescription("")
        setGoal("")

        toast({
          title: "Success! 🎉",
          description: "Your tip page has been created and is ready to receive tips",
        })

      } catch (error) {
        console.error("Error creating tip page:", error);
        toast({
          title: "Error",
          description: "Failed to create tip page. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsCreating(false)
      }


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

  const togglePageStatus = async (pageId: string) => {
    if(!account || !contract) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      })
      return
    }

     try {
      const page = tipPages.find(p => p.id === pageId);
      
      if (page?.isActive) {
        await contract.deactivate_page(BigInt(pageId));
      } else {
        await contract.activate_page(BigInt(pageId));
      }

      // Refresh data after status change
      fetchPageDetails(userPages);

      toast({
        title: "Page Updated",
        description: "Page status has been changed",
      })
    } catch (error) {
      console.error("Error toggling page status:", error);
      toast({
        title: "Error",
        description: "Failed to update page status",
        variant: "destructive",
      })
    }
  }

 
    // Use contract stats for calculations
  const totalEarnings = contractStats.totalAmount;
  const totalTips = contractStats.totalTips;
  const activePagesCount = contractStats.activePagesCount;
  // const averageTip = contractStats.averageTip;


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Creator Dashboard</h1>
            <p className="text-gray-600">Manage your tip pages and track your earnings on StarkTips</p>
          </div>

          <WalletConnect />

          {!account && (
            <Card className="mt-8 bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <p className="text-center text-yellow-800">
                  Please connect your wallet to view your dashboard and manage tip pages
                </p>
              </CardContent>
            </Card>
          )}

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
                    <div className="text-2xl font-bold">{totalEarnings.toFixed(3)} STRK</div>
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
                    <p className="text-xs text-muted-foreground">Out of {/*totalPages*/} total</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Tip</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {totalTips > 0 ? (totalEarnings / totalTips).toFixed(3) : "0.000"} STRK
                    </div>
                    <p className="text-xs text-muted-foreground">Per tip received</p>
                  </CardContent>
                </Card>
              </div>
              
               {/* Loading state */}
               {account && isLoading && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                      <p>Loading your tip pages from the blockchain...</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* No data state */}
              {account && !isLoading && tipPages.length === 0 && (
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
              )}

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
                        <p className="text-xs text-gray-500">0.1 STRK on My Creative Journey • 2 hours ago</p>
                      </div>
                      <Badge variant="secondary">+0.1 STRK</Badge>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Page shared</p>
                        <p className="text-xs text-gray-500">
                          Music Production Fund shared on social media • 5 hours ago
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Goal milestone reached</p>
                        <p className="text-xs text-gray-500">My Creative Journey reached 50% of goal • 1 day ago</p>
                      </div>
                      <Badge variant="secondary">50%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Pages Tab */}
            <MyPages tipPages={tipPages} setActiveTab={setActiveTab} copyLink={copyLink} shareLink={shareLink} togglePageStatus={togglePageStatus}/>

            {/* Analytics Tab */}
            <Analytics contractAddress={CONTRACT_ADDRESS} creatorAddress={account?.address}/>

            {/* Create New Tab */}
            <CreateNewPage pageName={pageName} setPageName={setPageName} description={description} setDescription={setDescription} goal={goal} setGoal={setGoal}/>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
