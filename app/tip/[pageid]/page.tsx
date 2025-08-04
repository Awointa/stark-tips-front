"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import { useAccount } from "@starknet-react/core";

interface TipPageProps {
  params: {
    pageId: string
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
  creatorName: string
  creatorAddress: string
  description: string
  totalAmount: string
  tipCount: number
  goal?: string
  avatar?: string
}

export default function TipPage({ params }: TipPageProps) {
  const { address, status } = useAccount(); 
  const [customAmount, setCustomAmount] = useState("")
  const [message, setMessage] = useState("")
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [txHash, setTxHash] = useState<string | null>(null)

  useEffect(() => {
    if (status === "disconnected") {
      setIsConnected(false)
    } else if (status === "connected") {
      setIsConnected(true)
    }
  }, [address, status])

  const [pageData, setPageData] = useState<PageData>({
    creatorName: "Creative Artist",
    creatorAddress: "0x1234567890abcdef1234567890abcdef12345678",
    description:
      "Supporting my journey in digital art and creativity. Every tip helps me continue creating amazing content for the community! 🎨✨ Your support means everything to me and helps me dedicate more time to creating beautiful art.",
    totalAmount: "2.45",
    tipCount: 23,
    goal: "5.0",
  })

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
    { eth: "0.01", label: "Coffee", emoji: "☕" },
    { eth: "0.05", label: "Snack", emoji: "🍕" },
    { eth: "0.1", label: "Lunch", emoji: "🍔" },
    { eth: "0.25", label: "Generous", emoji: "💝" },
    { eth: "0.5", label: "Amazing", emoji: "🌟" },
    { eth: "1.0", label: "Incredible", emoji: "🚀" },
  ]

  // Calculate progress towards goal
  const progressPercentage = pageData.goal
    ? Math.min((Number.parseFloat(pageData.totalAmount) / Number.parseFloat(pageData.goal)) * 100, 100)
    : 0

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

    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to send a tip",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    setTransactionStatus("pending")

    try {
      // Simulate contract interaction with realistic delays
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate transaction hash generation
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 18)}...`
      setTxHash(mockTxHash)

      // Simulate network confirmation delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newTip: Tip = {
        id: Date.now().toString(),
        sender: "0xYour...Wallet",
        amount,
        message,
        timestamp: Date.now(),
        txHash: mockTxHash,
      }

      setRecentTips((prev) => [newTip, ...prev])
      setPageData((prev) => ({
        ...prev,
        totalAmount: (Number.parseFloat(prev.totalAmount) + Number.parseFloat(amount)).toFixed(3),
        tipCount: prev.tipCount + 1,
      }))

      setTransactionStatus("success")
      setSelectedAmount(null)
      setCustomAmount("")
      setMessage("")

      // Redirect to success page
      window.location.href = `/tip/${params.pageId}/success?amount=${amount}&txHash=${mockTxHash}&message=${encodeURIComponent(message)}`
    } catch (error) {
      setTransactionStatus("error")
      toast({
        title: "Transaction Failed",
        description: "There was an error sending your tip. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
      setTimeout(() => {
        setTransactionStatus("idle")
        setTxHash(null)
      }, 3000)
    }
  }

  const shareLink = () => {
    const url = `${window.location.origin}/tip/${params.pageId}`
    const text = `Support ${pageData.creatorName} on StarkTips! 💜`

    if (navigator.share) {
      navigator.share({
        title: `Support ${pageData.creatorName}`,
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
    const url = `${window.location.origin}/tip/${params.pageId}`
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
              <h1 className="text-lg font-semibold">Support {pageData.creatorName}</h1>
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
                      {pageData.creatorName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{pageData.creatorName}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          {pageData.totalAmount} STRK raised
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-blue-500" />
                          {pageData.tipCount} supporters
                        </span>
                      </div>
                      {pageData.goal && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress to goal</span>
                            <span>{progressPercentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                          <p className="text-xs text-gray-500">
                            {pageData.totalAmount} STRK of {pageData.goal} STRK goal
                          </p>
                        </div>
                      )}
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
                    Your tip goes directly to {pageData.creatorName}'s wallet on Starknet. Show your support!
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
                          key={amount.eth}
                          variant={selectedAmount === amount.eth ? "default" : "outline"}
                          onClick={() => {
                            setSelectedAmount(amount.eth)
                            setCustomAmount("")
                          }}
                          className="h-auto py-4 flex flex-col gap-1"
                          disabled={isSending}
                        >
                          <div className="text-lg">{amount.emoji}</div>
                          <div className="font-semibold">{amount.eth} STRK</div>
                          <div className="text-xs opacity-70">${getAmountInUSD(amount.eth)}</div>
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
                    disabled={isSending || !isConnected || transactionStatus === "pending"}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending Tip...
                      </>
                    ) : (
                      `Send Tip ${selectedAmount || customAmount ? `(${selectedAmount || customAmount} ETH)` : ""}`
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
                            {tip.amount} ETH
                          </Badge>
                          <p className="text-xs text-gray-400">${getAmountInUSD(tip.amount)}</p>
                        </div>
                      </div>
                      {tip.message && (
                        <p className="text-sm text-gray-700 mb-2 bg-gray-50 p-2 rounded">"{tip.message}"</p>
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
                      <span className="font-semibold">{pageData.totalAmount} ETH</span>
                      <p className="text-xs text-gray-500">${getAmountInUSD(pageData.totalAmount)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Tips</span>
                    <span className="font-semibold">{pageData.tipCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Tip</span>
                    <div className="text-right">
                      <span className="font-semibold">
                        {(Number.parseFloat(pageData.totalAmount) / pageData.tipCount).toFixed(3)} ETH
                      </span>
                      <p className="text-xs text-gray-500">
                        ${((Number.parseFloat(pageData.totalAmount) / pageData.tipCount) * 2000).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {pageData.goal && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Goal Progress</span>
                      <span className="font-semibold">{progressPercentage.toFixed(1)}%</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Powered by Thanksonchain */}
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-purple-700 mb-2">Powered by</p>
                  <Link href="/" className="font-bold text-purple-900 text-lg">
                    Thanksonchain
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
