"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  MessageCircle,
  Users,
  Share2,
  Copy,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import WalletConnect from "@/components/wallet-connect"
import Link from "next/link"
import { useAccount, useReadContract, useSendTransaction, useContract } from "@starknet-react/core";
import { MY_CONTRACT_ABI } from "@/constants/abi/MyContract"
import { CONTRACT_ADDRESS } from "@/constants"
import { usePathname } from 'next/navigation';
import { uint256 } from "starknet";

interface TipPageProps {
  params: {
    id: string      
  }
}

interface Tip {
  id: string
  sender: string
  amount: string
  message: string
  timestamp: number
  txHash?: string
}

interface PageData {
  created_at: number
  creator: number
  description: string 
  id: number
  is_active: boolean
  name: string
  total_amount_recieved: number
  total_tips_recieved: number
}

export default function TipPage({ params }: TipPageProps) {
  const pathname = usePathname();
  const id = pathname.split('/').pop();
  const { address, status } = useAccount(); 
  const [customAmount, setCustomAmount] = useState("")
  const [message, setMessage] = useState("")
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { contract } = useContract({ 
    abi: MY_CONTRACT_ABI, 
    address: CONTRACT_ADDRESS
  })

  console.log('ID:', id)

  const {data, isLoading: contractLoading, error: contractError} = useReadContract({
    abi: MY_CONTRACT_ABI,
    functionName: "get_page_info",
    address: CONTRACT_ADDRESS,
    args: [Number(id)]
  })

  console.log('Contract data:', data)
  console.log('Contract loading:', contractLoading)
  console.log('Contract error:', contractError)

  // Fixed useSendTransaction implementation
  const { send, sendAsync, data: txData, error: sendError, status: txStatus, isPending, isSuccess, isError } = useSendTransaction({
    calls: undefined, // Don't pre-populate calls - we'll pass them to send()
  });

  useEffect(() => {
    if (status === "disconnected") {
      setIsConnected(false)
    } else if (status === "connected") {
      setIsConnected(true)
    }
  }, [address, status])

  const [pageData, setPageData] = useState<PageData>({
    created_at: 0,
    creator: 0,
    description: "Loading...",
    id: 0,
    is_active: false,
    name: "Loading...",
    total_amount_recieved: 0,
    total_tips_recieved: 0,
  })

  // Update pageData when contract data is available
  useEffect(() => {
    console.log('Effect triggered - data:', data, 'contractLoading:', contractLoading, 'contractError:', contractError)
    
    // If still loading, keep loading state
    if (contractLoading) {
      setIsLoading(true)
      setError(null)
      return
    }

    // If there's an error, set error state
    if (contractError) {
      console.error('Contract error:', contractError)
      setError("Failed to load page data")
      setIsLoading(false)
      return
    }

    // If we have data, process it
    if (data) {
      try {
        console.log('Processing data:', data)
        
        // Handle different possible data structures
        let contractData;
        if (Array.isArray(data) && data.length > 0) {
          contractData = data[0];
        } else if (typeof data === 'object' && data !== null) {
          contractData = data;
        } else {
          throw new Error('Invalid data structure')
        }
        
        setPageData({
          created_at: contractData.created_at || 0,
          creator: contractData.creator || 0,
          description: contractData.description || "No description available",
          id: Number(id) || 0,
          is_active: contractData.is_active || false,
          name: contractData.name || "Unknown Creator",
          total_amount_recieved: contractData.total_amount_recieved || 0,
          total_tips_recieved: contractData.total_tips_recieved || 0,
        });
        
        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error processing data:', err)
        setError("Failed to process page data");
        setIsLoading(false);
      }
    } else if (data === undefined && !contractLoading) {
      // Data is undefined and not loading - this might mean the page doesn't exist
      setError("Page not found");
      setIsLoading(false);
    }
  }, [data, contractLoading, contractError, id]);

  // Monitor transaction status from the hook
  useEffect(() => {
    if (txStatus === 'success' && !isSending) {
      // Transaction confirmed on network
      console.log('Transaction confirmed:', txData)
    }
    if (txStatus === 'error' && sendError) {
      console.error('Transaction error:', sendError)
    }
  }, [txStatus, txData, sendError, isSending])

  const [recentTips, setRecentTips] = useState<Tip[]>([
    {
      id: "1",
      sender: "0x1234...5678",
      amount: "0.1",
      message: "Love your work! Keep it up! 🎨",
      timestamp: Date.now() - 3600000,
      txHash: "0xabc123...",
    },
    {
      id: "2",
      sender: "0x9876...4321",
      amount: "0.05",
      message: "Amazing art style!",
      timestamp: Date.now() - 7200000,
      txHash: "0xdef456...",
    },
    {
      id: "3",
      sender: "0x5555...7777",
      amount: "0.2",
      message: "Your tutorials helped me so much. Thank you! 🙏",
      timestamp: Date.now() - 10800000,
      txHash: "0x789xyz...",
    },
  ])

  const { toast } = useToast()
  const quickAmounts = [
    { strk: "0.01", label: "Coffee", emoji: "☕" },
    { strk: "0.05", label: "Snack", emoji: "🍕" },
    { strk: "0.1", label: "Lunch", emoji: "🍔" },
    { strk: "0.25", label: "Generous", emoji: "💝" },
    { strk: "0.5", label: "Amazing", emoji: "🌟" },
    { strk: "1.0", label: "Incredible", emoji: "🚀" },
  ]

  // Fixed handleSendTip function
  const handleSendTip = async () => {
    const amount = selectedAmount || customAmount
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please select or enter a valid tip amount",
        variant: "destructive",
      })
      return
    }

    if (!isConnected || !address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to send a tip",
        variant: "destructive",
      })
      return
    }

    if (!contract) {
      toast({
        title: "Contract Error",
        description: "Contract not initialized",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSending(true)
      setTransactionStatus("pending")

      // Convert amount to wei (assuming 18 decimals for STRK)
      // If your token has different decimals, adjust accordingly
      const amountInWei = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, 18)))
      
      // Convert to uint256 format expected by Starknet
      const amountAsUint256 = uint256.bnToUint256(amountInWei)
      
      console.log('Sending tip with params:', {
        pageId: Number(id),
        amount: amountAsUint256,
        message: message
      })

      // Call the contract function
      const calls = [
        contract.populate("send_tip", [
          Number(id), // page_id
          amountAsUint256, // amount in uint256 format
          message // message
        ])
      ]

      // Send the transaction
      const result = await sendAsync(calls)
      
      console.log('Transaction result:', result)
      
      if (result) {
        const txHashResult = result.transaction_hash
        setTxHash(txHashResult)
        setTransactionStatus("success")

        // Create a new tip object for the UI
        const newTip: Tip = {
          id: Date.now().toString(),
          sender: `${address.slice(0, 6)}...${address.slice(-4)}`,
          amount,
          message,
          timestamp: Date.now(),
          txHash: txHashResult,
        }

        // Update the UI with the new tip
        setRecentTips((prev) => [newTip, ...prev])
        setPageData((prev) => ({
          ...prev,
          total_amount_recieved: Number.parseFloat((Number.parseFloat(String(prev.total_amount_recieved)) + Number.parseFloat(String(amount))).toFixed(3)),
          total_tips_recieved: prev.total_tips_recieved + 1,
        }))

        // Clear the form
        setSelectedAmount(null)
        setCustomAmount("")
        setMessage("")

        toast({
          title: "Tip Sent Successfully! 🎉",
          description: `Your tip of ${amount} STRK has been sent!`,
        })

        // Optional: Redirect to success page
        // window.location.href = `/tip/${id}/success?amount=${amount}&txHash=${txHashResult}&message=${encodeURIComponent(message)}`
        
      } else {
        throw new Error('Transaction failed - no result returned')
      }

    } catch (error) {
      console.error('Error sending tip:', error)
      setTransactionStatus("error")
      
      let errorMessage = "There was an error sending your tip. Please try again."
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('User abort')) {
          errorMessage = "Transaction was cancelled by user"
        } else if (error.message.includes('insufficient')) {
          errorMessage = "Insufficient balance to complete transaction"
        } else if (error.message.includes('rejected')) {
          errorMessage = "Transaction was rejected"
        }
      }

      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
      // Reset transaction status after 3 seconds
      setTimeout(() => {
        setTransactionStatus("idle")
        setTxHash(null)
      }, 3000)
    }
  }

  const shareLink = () => {
    const url = `${window.location.origin}/tip/${params.id}`
    const text = `Support ${pageData.name} on StarkTips! 💜`

    if (navigator.share) {
      navigator.share({
        title: `Support ${pageData.name}`,
        text: text,
        url: url,
      })
    } else {
      navigator.clipboard.writeText(`${text} ${url}`)
      toast({
        title: "Share Link Copied! 📱",
        description: "Share text with link copied to clipboard",
      })
    }
  }

  const copyLink = () => {
    const url = `${window.location.origin}/tip/${params.id}`
    navigator.clipboard.writeText(url)
    toast({
      title: "Link Copied! 📋",
      description: "Tip page link copied to clipboard",
    })
  }

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getAmountInUSD = (ethAmount: string) => {
    // Mock ETH to USD conversion (in real app, fetch from API)
    const ethToUsd = 2000
    return (Number.parseFloat(ethAmount) * ethToUsd).toFixed(2)
  }

  // Button disabled state using hook's status
  const isButtonDisabled = isSending || !isConnected || !contract || isPending || txStatus === 'pending'

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading page data...</p>
          <p className="text-xs text-gray-400 mt-2">Contract loading: {contractLoading.toString()}</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to StarkTips
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold">Support {pageData.name}</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button variant="outline" size="sm" onClick={shareLink}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Tip Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Creator Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {pageData.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{pageData.name}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          {pageData.total_amount_recieved} STRK raised
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-blue-500" />
                          {pageData.total_tips_recieved} supporters
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{pageData.description}</p>
                </CardContent>
              </Card>

              {/* Tip Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Send a Tip 💜</CardTitle>
                  <CardDescription>
                    Your tip goes directly to {pageData.name}'s wallet on Starknet. Show your support!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <WalletConnect onConnectionChange={setIsConnected} />

                  {/* Transaction Status */}
                  {transactionStatus !== "idle" && (
                    <Card
                      className={`border-2 ${
                        transactionStatus === "pending"
                          ? "border-blue-200 bg-blue-50"
                          : transactionStatus === "success"
                            ? "border-green-200 bg-green-50"
                            : "border-red-200 bg-red-50"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {transactionStatus === "pending" && (
                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                          )}
                          {transactionStatus === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
                          {transactionStatus === "error" && <AlertCircle className="h-5 w-5 text-red-600" />}

                          <div className="flex-1">
                            <p
                              className={`font-medium ${
                                transactionStatus === "pending"
                                  ? "text-blue-800"
                                  : transactionStatus === "success"
                                    ? "text-green-800"
                                    : "text-red-800"
                              }`}
                            >
                              {transactionStatus === "pending" && "Sending your tip..."}
                              {transactionStatus === "success" && "Tip sent successfully! 🎉"}
                              {transactionStatus === "error" && "Transaction failed"}
                            </p>
                            {txHash && <p className="text-sm text-gray-600 font-mono">Tx: {txHash}</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Amount Selection */}
                  <div className="space-y-3">
                    <Label>Choose Tip Amount</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {quickAmounts.map((amount) => (
                        <Button
                          key={amount.strk}
                          variant={selectedAmount === amount.strk ? "default" : "outline"}
                          onClick={() => {
                            setSelectedAmount(amount.strk)
                            setCustomAmount("")
                          }}
                          className="h-auto py-4 flex flex-col gap-1"
                          disabled={isSending}
                        >
                          <div className="text-lg">{amount.emoji}</div>
                          <div className="font-semibold">{amount.strk} STRK</div>
                          <div className="text-xs opacity-70">${getAmountInUSD(amount.strk)}</div>
                          <div className="text-xs opacity-60">{amount.label}</div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="customAmount">Custom Amount (STRK)</Label>
                    <div className="relative">
                      <Input
                        id="customAmount"
                        type="number"
                        step="0.001"
                        min="0.001"
                        placeholder="Enter custom amount..."
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value)
                          setSelectedAmount(null)
                        }}
                        disabled={isSending}
                        className="pr-20"
                      />
                      {customAmount && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                          ${getAmountInUSD(customAmount)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Leave a supportive message for the creator..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={isSending}
                      maxLength={280}
                    />
                    <p className="text-xs text-gray-500 text-right">{message.length}/280 characters</p>
                  </div>

                  <Button
                    onClick={handleSendTip}
                    disabled={isButtonDisabled}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    {(isSending || isPending) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending Tip...
                      </>
                    ) : (
                      `Send Tip ${selectedAmount || customAmount ? `(${selectedAmount || customAmount} STRK)` : ""}`
                    )}
                  </Button>

                  {!isConnected && (
                    <p className="text-sm text-gray-500 text-center">Connect your Starknet wallet to send a tip</p>
                  )}
                </CardContent>
                
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Recent Tips ({recentTips.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {recentTips.map((tip) => (
                    <div key={tip.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-mono text-gray-500">{tip.sender}</span>
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-1">
                            {tip.amount} STRK
                          </Badge>
                          <p className="text-xs text-gray-400">${getAmountInUSD(tip.amount)}</p>
                        </div>
                      </div>
                      {tip.message && (
                        <p className="text-sm text-gray-700 mb-2 bg-gray-50 p-2 rounded">&quot{tip.message}&quot</p>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">{formatTimeAgo(tip.timestamp)}</span>
                        {tip.txHash && (
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Tx
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Support Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Support Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Raised</span>
                    <div className="text-right">
                      <span className="font-semibold">{pageData.total_amount_recieved} STRK</span>
                      <p className="text-xs text-gray-500">${getAmountInUSD(String(pageData.total_amount_recieved))}</p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Tips</span>
                    <span className="font-semibold">{pageData.total_tips_recieved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Tip</span>
                    <div className="text-right">
                      <span className="font-semibold">
                        {pageData.total_tips_recieved > 0 
                          ? (Number.parseFloat(String(pageData.total_amount_recieved)) / Number.parseFloat(String(pageData.total_tips_recieved))).toFixed(3)
                          : "0"} STRK
                      </span>
                      <p className="text-xs text-gray-500">
                        ${pageData.total_tips_recieved > 0
                          ? ((Number.parseFloat(String(pageData.total_amount_recieved)) / Number.parseFloat(String(pageData.total_tips_recieved))) * 2000).toFixed(2)
                          : "0.00"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Powered by StarkTips */}
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-purple-700 mb-2">Powered by</p>
                  <Link href="/" className="font-bold text-purple-900 text-lg">
                    StarkTips
                  </Link>
                  <p className="text-xs text-purple-600 mt-1">Starknet Creator Tipping Platform</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}