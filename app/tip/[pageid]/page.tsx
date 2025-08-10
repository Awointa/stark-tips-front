"use client"

import { useState, useEffect, useCallback } from "react"
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
import { useAccount, useReadContract, useSendTransaction, useContract } from "@starknet-react/core"
import { MY_CONTRACT_ABI } from "@/constants/abi/MyContract"
import { CONTRACT_ADDRESS } from "@/constants"
import { usePathname } from 'next/navigation'
import { uint256, Contract } from "starknet"

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

// STRK token address on Starknet
const STRK_TOKEN_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"

// ERC20 ABI for STRK token interactions
const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    state_mutability: "external",
    inputs: [
      { name: "spender", type: "core::starknet::contract_address::ContractAddress" },
      { name: "amount", type: "core::integer::u256" },
    ],
    outputs: [{ type: "core::bool" }],
  },
  {
    type: "function",
    name: "allowance",
    state_mutability: "view",
    inputs: [
      { name: "owner", type: "core::starknet::contract_address::ContractAddress" },
      { name: "spender", type: "core::starknet::contract_address::ContractAddress" },
    ],
    outputs: [{ type: "core::integer::u256" }],
  },
  {
    type: "function",
    name: "balance_of",
    state_mutability: "view",
    inputs: [
      { name: "account", type: "core::starknet::contract_address::ContractAddress" },
    ],
    outputs: [{ type: "core::integer::u256" }],
  },
] as const

export default function TipPage({ params }: TipPageProps) {
  const pathname = usePathname()
  const id = pathname.split('/').pop()
  const { address, status } = useAccount()
  const [customAmount, setCustomAmount] = useState("")
  const [message, setMessage] = useState("")
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsApproval, setNeedsApproval] = useState(false)
  const [userBalance, setUserBalance] = useState<string>("0")
  const [currentAllowance, setCurrentAllowance] = useState<string>("0")

  const { contract } = useContract({ 
    abi: MY_CONTRACT_ABI, 
    address: CONTRACT_ADDRESS
  })

  // STRK token contract
  const { contract: strkContract } = useContract({
    abi: ERC20_ABI,
    address: STRK_TOKEN_ADDRESS,
  })

  const { data, isLoading: contractLoading, error: contractError } = useReadContract({
    abi: MY_CONTRACT_ABI,
    functionName: "get_page_info",
    address: CONTRACT_ADDRESS,
    args: id ? [Number(id)] : undefined,
    enabled: Boolean(id)
  })

  const { toast } = useToast()

  // Hook for approval transactions
  const { 
    send: sendApproval, 
    data: approvalTxData, 
    error: approvalError, 
    isPending: isApprovalPending,
    isSuccess: isApprovalSuccess,
    isError: isApprovalError 
  } = useSendTransaction({})

  // Hook for tip transactions
  const { 
    send: sendTip, 
    data: tipTxData, 
    error: tipError, 
    isPending: isTipPending,
    isSuccess: isTipSuccess,
    isError: isTipError 
  } = useSendTransaction({})

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

  // Helper functions (memoized to prevent unnecessary re-renders)
  const strkToWei = useCallback((strk: string): string => {
    try {
      const amount = parseFloat(strk)
      return (BigInt(Math.floor(amount * Math.pow(10, 18)))).toString()
    } catch {
      return "0"
    }
  }, [])

  const weiToStrk = useCallback((wei: string): string => {
    try {
      const amount = BigInt(wei)
      return (Number(amount) / Math.pow(10, 18)).toFixed(6)
    } catch {
      return "0"
    }
  }, [])

  // Check user's STRK balance
  const checkBalance = useCallback(async () => {
    if (!strkContract || !address) return
    
    try {
      const balance = await strkContract.call("balance_of", [address])
      const balanceStr = Array.isArray(balance) ? balance[0]?.toString() : balance?.toString()
      if (balanceStr) {
        setUserBalance(weiToStrk(balanceStr))
      }
    } catch (error) {
      console.error("Error checking balance:", error)
    }
  }, [strkContract, address, weiToStrk])

  // Check current allowance
  const checkAllowance = useCallback(async () => {
    if (!strkContract || !address) return
    
    try {
      const allowance = await strkContract.call("allowance", [address, CONTRACT_ADDRESS])
      const allowanceStr = Array.isArray(allowance) ? allowance[0]?.toString() : allowance?.toString()
      if (allowanceStr) {
        setCurrentAllowance(allowanceStr)
        
        const currentAmount = selectedAmount || customAmount
        if (currentAmount && parseFloat(currentAmount) > 0) {
          const requiredWei = BigInt(strkToWei(currentAmount))
          const currentAllowanceWei = BigInt(allowanceStr)
          setNeedsApproval(currentAllowanceWei < requiredWei)
        }
      }
    } catch (error) {
      console.error("Error checking allowance:", error)
      setNeedsApproval(true)
    }
  }, [strkContract, address, selectedAmount, customAmount, strkToWei])

  // Connection status effect
  useEffect(() => {
    if (status === "disconnected") {
      setIsConnected(false)
    } else if (status === "connected") {
      setIsConnected(true)
    }
  }, [status])

  // Check balance and allowance when connected
  useEffect(() => {
    if (isConnected && address && strkContract) {
      checkBalance()
      checkAllowance()
    }
  }, [isConnected, address, strkContract, checkBalance, checkAllowance])

  // Handle approval success
  useEffect(() => {
    if (isApprovalSuccess && approvalTxData) {
      toast({
        title: "Approval Successful! ✅",
        description: "You can now send your tip",
      })
      
      // Recheck allowance after approval
      const timeoutId = setTimeout(() => {
        checkAllowance()
      }, 2000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isApprovalSuccess, approvalTxData, toast, checkAllowance])

  // Handle approval error
  useEffect(() => {
    if (isApprovalError && approvalError) {
      console.error('Approval error:', approvalError)
      toast({
        title: "Approval Failed ❌",
        description: approvalError.message || "Failed to approve STRK spending",
        variant: "destructive",
      })
    }
  }, [isApprovalError, approvalError, toast])

  // Handle tip success
  useEffect(() => {
    if (isTipSuccess && tipTxData) {
      setTransactionStatus("success")
      setTxHash(tipTxData.transaction_hash || null)
      setSelectedAmount(null)
      setCustomAmount("")
      setMessage("")
      
      toast({
        title: "Tip Sent Successfully! 🎉",
        description: "Your tip has been sent to the creator",
      })

      // Reset after showing success
      const timeoutId = setTimeout(() => {
        setTransactionStatus("idle")
        setTxHash(null)
      }, 5000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isTipSuccess, tipTxData, toast])

  // Handle tip error
  useEffect(() => {
    if (isTipError && tipError) {
      setTransactionStatus("error")
      console.error('Tip error:', tipError)
      toast({
        title: "Tip Failed ❌",
        description: tipError.message || "Failed to send tip",
        variant: "destructive",
      })
      
      const timeoutId = setTimeout(() => {
        setTransactionStatus("idle")
      }, 3000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isTipError, tipError, toast])

  // Update pageData when contract data is available
  useEffect(() => {
    console.log('Effect triggered - data:', data, 'contractLoading:', contractLoading, 'contractError:', contractError)
    
    if (contractLoading) {
      setIsLoading(true)
      setError(null)
      return
    }

    if (contractError) {
      console.error('Contract error:', contractError)
      setError("Failed to load page data")
      setIsLoading(false)
      return
    }

    if (data) {
      try {
        console.log('Processing data:', data)
        
        let contractData: any
        if (Array.isArray(data) && data.length > 0) {
          contractData = data[0]
        } else if (typeof data === 'object' && data !== null) {
          contractData = data
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
        })
        
        setIsLoading(false)
        setError(null)
      } catch (err) {
        console.error('Error processing data:', err)
        setError("Failed to process page data")
        setIsLoading(false)
      }
    } else if (data === undefined && !contractLoading) {
      setError("Page not found")
      setIsLoading(false)
    }
  }, [data, contractLoading, contractError, id])

  // Update sending state
  useEffect(() => {
    setIsSending(isTipPending || isApprovalPending)
  }, [isTipPending, isApprovalPending])

  const [recentTips] = useState<Tip[]>([
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

  const quickAmounts = [
    { strk: "0.01", label: "Coffee", emoji: "☕" },
    { strk: "0.05", label: "Snack", emoji: "🍕" },
    { strk: "0.1", label: "Lunch", emoji: "🍔" },
    { strk: "0.25", label: "Generous", emoji: "💝" },
    { strk: "0.5", label: "Amazing", emoji: "🌟" },
    { strk: "1.0", label: "Incredible", emoji: "🚀" },
  ]

  // Handle STRK approval
  const handleApprove = useCallback(async () => {
    const amount = selectedAmount || customAmount
    if (!amount || parseFloat(amount) < 0.01) {
      toast({
        title: "Invalid Amount ❌",
        description: "Minimum tip amount is 0.01 STRK",
        variant: "destructive",
      })
      return
    }

    if (!strkContract || !address) {
      toast({
        title: "Contract Error ❌",
        description: "STRK token contract not available or wallet not connected",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('Starting approval process...')
      const amountInWei = strkToWei(amount)
      console.log('Approving amount:', amount, 'STRK =', amountInWei, 'wei')
      
      // Create approval call
      const approvalCall = strkContract.populate("approve", [
        CONTRACT_ADDRESS,
        uint256.bnToUint256(BigInt(amountInWei))
      ])
      
      console.log('Approval call created:', approvalCall)
      
      // Send approval transaction
      sendApproval([approvalCall])
      
    } catch (error) {
      console.error("Approval preparation error:", error)
      toast({
        title: "Approval Error ❌",
        description: "Failed to prepare approval transaction",
        variant: "destructive",
      })
    }
  }, [selectedAmount, customAmount, strkContract, address, strkToWei, sendApproval, toast])

  // Handle sending tip
  const handleSendTip = useCallback(async () => {
    const amount = selectedAmount || customAmount
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount ❌",
        description: "Please select or enter a valid tip amount",
        variant: "destructive",
      })
      return
    }

    if (parseFloat(amount) < 0.01) {
      toast({
        title: "Amount Too Low ❌",
        description: "Minimum tip amount is 0.01 STRK",
        variant: "destructive",
      })
      return
    }

    if (!isConnected || !address) {
      toast({
        title: "Wallet Required ❌",
        description: "Please connect your wallet to send a tip",
        variant: "destructive",
      })
      return
    }

    if (!contract) {
      toast({
        title: "Contract Error ❌",
        description: "StarkTips contract not initialized",
        variant: "destructive",
      })
      return
    }

    // Check if user has sufficient balance
    const balanceFloat = parseFloat(userBalance)
    const amountFloat = parseFloat(amount)
    if (balanceFloat < amountFloat) {
      toast({
        title: "Insufficient Balance ❌",
        description: `You need at least ${amount} STRK. Your balance: ${userBalance} STRK`,
        variant: "destructive",
      })
      return
    }

    if (needsApproval) {
      toast({
        title: "Approval Required ❌",
        description: "Please approve STRK spending first",
        variant: "destructive",
      })
      return
    }

    if (!id) {
      toast({
        title: "Invalid Page ID ❌",
        description: "Page ID is required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSending(true)
      setTransactionStatus("pending")

      const amountInWei = BigInt(strkToWei(amount))
      
      console.log('Sending tip with params:', {
        pageId: Number(id),
        amount: amountInWei.toString(),
        message: message
      })

      // Prepare the contract call
      const calls = [
        contract.populate("send_tip", [
          Number(id), // page_id
          uint256.bnToUint256(amountInWei), // amount as uint256
          message || "" // message
        ])
      ]

      console.log('Tip call prepared:', calls)

      // Send the transaction
      sendTip(calls)
      
    } catch (error) {
      console.error('Error preparing tip transaction:', error)
      setTransactionStatus("error")
      setIsSending(false)
      
      toast({
        title: "Transaction Failed ❌",
        description: "Failed to prepare transaction: " + (error as Error).message,
        variant: "destructive",
      })

      const timeoutId = setTimeout(() => {
        setTransactionStatus("idle")
      }, 3000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [
    selectedAmount,
    customAmount,
    isConnected,
    address,
    contract,
    userBalance,
    needsApproval,
    id,
    message,
    strkToWei,
    sendTip,
    toast
  ])

  const shareLink = useCallback(() => {
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
  }, [params.id, pageData.name, toast])

  const copyLink = useCallback(() => {
    const url = `${window.location.origin}/tip/${params.id}`
    navigator.clipboard.writeText(url)
    toast({
      title: "Link Copied! 📋",
      description: "Tip page link copied to clipboard",
    })
  }, [params.id, toast])

  const formatTimeAgo = useCallback((timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }, [])

  const getAmountInUSD = useCallback((ethAmount: string) => {
    const ethToUsd = 2000
    return (parseFloat(ethAmount) * ethToUsd).toFixed(2)
  }, [])

  // Button disabled state
  const isButtonDisabled = isSending || !isConnected || !contract
  const currentAmount = selectedAmount || customAmount

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
                    Your tip goes directly to {pageData.name}&apos;s wallet on Starknet. Show your support!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <WalletConnect onConnectionChange={setIsConnected} />

                  {/* User Balance Display */}
                  {isConnected && userBalance && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700">
                        Your STRK Balance: <span className="font-semibold">{userBalance} STRK</span>
                      </p>
                      {currentAllowance && (
                        <p className="text-xs text-blue-600 mt-1">
                          Current Allowance: {weiToStrk(currentAllowance)} STRK
                        </p>
                      )}
                    </div>
                  )}

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
                              {transactionStatus === "pending" && 
                                (isApprovalPending ? "Approving STRK spending..." : "Sending your tip...")
                              }
                              {transactionStatus === "success" && "Tip sent successfully! 🎉"}
                              {transactionStatus === "error" && "Transaction failed"}
                            </p>
                            {txHash && txHash !== "pending..." && (
                              <p className="text-sm text-gray-600 font-mono break-all">
                                Tx: {txHash.slice(0, 20)}...
                              </p>
                            )}
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
                          disabled={isButtonDisabled}
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
                        min="0.01"
                        placeholder="Enter custom amount (min 0.01)..."
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value)
                          setSelectedAmount(null)
                        }}
                        disabled={isButtonDisabled}
                        className="pr-20"
                      />
                      {customAmount && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                          ${getAmountInUSD(customAmount)}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Minimum tip amount: 0.01 STRK</p>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Leave a supportive message for the creator..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={isButtonDisabled}
                      maxLength={280}
                    />
                    <p className="text-xs text-gray-500 text-right">{message.length}/280 characters</p>
                  </div>

                  {/* Approve Button (shows when approval needed) */}
                  {needsApproval && currentAmount && parseFloat(currentAmount) >= 0.01 && (
                    <Button
                      onClick={handleApprove}
                      disabled={isApprovalPending || !isConnected}
                      className="w-full bg-yellow-500 hover:bg-yellow-600"
                      size="lg"
                    >
                      {isApprovalPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Approving STRK Spending...
                        </>
                      ) : (
                        `Approve ${currentAmount} STRK Spending`
                      )}
                    </Button>
                  )}

                  {/* Send Tip Button */}
                  <Button
                    onClick={handleSendTip}
                    disabled={isButtonDisabled || needsApproval}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    {(isSending || isTipPending) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isTipPending ? "Sending tip..." : "Preparing transaction..."}
                      </>
                    ) : (
                      `Send Tip ${currentAmount ? `(${currentAmount} STRK)` : ""}`
                    )}
                  </Button>

                  {!isConnected && (
                    <p className="text-sm text-gray-500 text-center">Connect your Starknet wallet to send a tip</p>
                  )}

                  {needsApproval && currentAmount && (
                    <p className="text-sm text-yellow-600 text-center">⚠️ Please approve STRK spending before sending tip</p>
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
                        <p className="text-sm text-gray-700 mb-2 bg-gray-50 p-2 rounded">&quot;{tip.message}&quot;</p>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">{formatTimeAgo(tip.timestamp)}</span>
                        {tip.txHash && tip.txHash !== "pending..." && (
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
                          ? (parseFloat(String(pageData.total_amount_recieved)) / parseFloat(String(pageData.total_tips_recieved))).toFixed(3)
                          : "0"} STRK
                      </span>
                      <p className="text-xs text-gray-500">
                        ${pageData.total_tips_recieved > 0
                          ? ((parseFloat(String(pageData.total_amount_recieved)) / parseFloat(String(pageData.total_tips_recieved))) * 2000).toFixed(2)
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