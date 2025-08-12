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
  Check,
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
  const [userBalance, setUserBalance] = useState<string>("0")
  const [strkPrice, setStrkPrice] = useState<number>(0)
  const [isPriceLoading, setIsPriceLoading] = useState(true)
  const [recentTips, setRecentTips] = useState<Tip[]>([])
  
  // Copy states for visual feedback
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({})

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

  // Updated to use get_tips_for_page instead of get_recent_tips
  const {data: tipsForPage, isLoading: tipsLoading, error: tipsError} = useReadContract({
    abi: MY_CONTRACT_ABI,
    functionName: "get_tips_for_page",
    address: CONTRACT_ADDRESS,
    args: id ? [Number(id)] : undefined,
    enabled: Boolean(id)
  })

  const { toast } = useToast()

  // Hook for integrated transactions (approval + tip)
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

  // Enhanced copy function with visual feedback
  const copyToClipboard = useCallback(async (text: string, key: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text)
      
      // Set copied state for visual feedback
      setCopiedStates(prev => ({ ...prev, [key]: true }))
      
      toast({
        title: successMessage,
        description: "Copied to clipboard",
        duration: 2000,
      })
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }))
      }, 2000)
      
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      })
    }
  }, [toast])

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

  // Process tips data when tipsForPage changes
  useEffect(() => {
    if (tipsForPage && Array.isArray(tipsForPage)) {
      const processedTips: Tip[] = tipsForPage
        .map((tip: any) => ({
          id: tip.id?.toString() || Math.random().toString(),
          sender: tip.sender?.toString() || "Unknown",
          amount: weiToStrk(tip.amount?.toString() || "0"),
          message: tip.message?.toString() || "",
          timestamp: Number(tip.timestamp) * 1000, // Convert to milliseconds
          txHash: undefined // You might want to store this in your contract
        }))
        .sort((a, b) => b.timestamp - a.timestamp) // Sort by most recent first
        .slice(0, 10) // Limit to 10 most recent tips
      
      setRecentTips(processedTips)
    } else if (!tipsLoading && !tipsError) {
      setRecentTips([]) // No tips found
    }
  }, [tipsForPage, weiToStrk, tipsLoading, tipsError])

  // Fetch STRK price from CoinGecko
  const fetchStrkPrice = useCallback(async () => {
    try {
      setIsPriceLoading(true)
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=starknet&vs_currencies=usd',
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.starknet && data.starknet.usd) {
        setStrkPrice(data.starknet.usd)
        console.log('STRK price updated:', data.starknet.usd)
      } else {
        throw new Error('Invalid price data structure')
      }
    } catch (error) {
      console.error('Error fetching STRK price:', error)
      // Fallback to a default price if API fails
      setStrkPrice(0.5) // Fallback price
      toast({
        title: "Price Update Failed",
        description: "Using fallback STRK price. Prices may not be accurate.",
        variant: "destructive",
      })
    } finally {
      setIsPriceLoading(false)
    }
  }, [toast])

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

  // Fetch price on component mount and set up periodic updates
  useEffect(() => {
    fetchStrkPrice()
    
    // Update price every 5 minutes
    const priceInterval = setInterval(fetchStrkPrice, 5 * 60 * 1000)
    
    return () => clearInterval(priceInterval)
  }, [fetchStrkPrice])

  // Connection status effect
  useEffect(() => {
    if (status === "disconnected") {
      setIsConnected(false)
    } else if (status === "connected") {
      setIsConnected(true)
    }
  }, [status])

  // Check balance when connected
  useEffect(() => {
    if (isConnected && address && strkContract) {
      checkBalance()
    }
  }, [isConnected, address, strkContract, checkBalance])

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

      // Refresh balance
      setTimeout(() => {
        checkBalance()
      }, 3000)

      // Reset after showing success
      const timeoutId = setTimeout(() => {
        setTransactionStatus("idle")
        setTxHash(null)
      }, 5000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isTipSuccess, tipTxData, toast, checkBalance])

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
    setIsSending(isTipPending)
  }, [isTipPending])

  const quickAmounts = [
    { strk: "10", label: "Coffee", emoji: "☕" },
    { strk: "15", label: "Snack", emoji: "🍕" },
    { strk: "20", label: "Lunch", emoji: "🍔" },
    { strk: "25", label: "Generous", emoji: "💝" },
    { strk: "50", label: "Amazing", emoji: "🌟" },
    { strk: "100", label: "Incredible", emoji: "🚀" },
  ]

  // Integrated handle sending tip (includes approval + tip in single transaction)
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

    if (!contract || !strkContract) {
      toast({
        title: "Contract Error ❌",
        description: "Contracts not initialized",
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
      
      console.log('Sending integrated tip with params:', {
        pageId: Number(id),
        amount: amountInWei.toString(),
        message: message
      })

      // Create multicall with both approval and tip sending
      const calls = []

      // First call: Approve STRK spending (always include to ensure sufficient allowance)
      const approvalCall = strkContract.populate("approve", [
        CONTRACT_ADDRESS,
        uint256.bnToUint256(amountInWei)
      ])
      calls.push(approvalCall)

      // Second call: Send the tip
      const tipCall = contract.populate("send_tip", [
        Number(id), // page_id
        uint256.bnToUint256(amountInWei), // amount as uint256
        message || "" // message
      ])
      calls.push(tipCall)

      console.log('Integrated calls prepared:', calls)

      // Send both transactions in a single multicall
      sendTip(calls)
      
    } catch (error) {
      console.error('Error preparing integrated transaction:', error)
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
    strkContract,
    userBalance,
    id,
    message,
    strkToWei,
    sendTip,
    toast
  ])

  // Enhanced share function
  // const shareLink = useCallback(() => {
  //   if (!id) {
  //     toast({
  //       title: "Error",
  //       description: "Page ID not found",
  //       variant: "destructive",
  //     })
  //     return
  //   }
    
  //   const url = `${window.location.origin}/tip/${id}`
  //   const text = `Support ${pageData.name} on StarkTips! 💜`

  //   if (navigator.share) {
  //     navigator.share({
  //       title: `Support ${pageData.name}`,
  //       text: text,
  //       url: url,
  //     }).catch(err => {
  //       console.log('Error sharing:', err)
  //       // Fallback to copying
  //       copyToClipboard(`${text} ${url}`, 'share', 'Share Link Copied! 📱')
  //     })
  //   } else {
  //     copyToClipboard(`${text} ${url}`, 'share', 'Share Link Copied! 📱')
  //   }
  // }, [id, pageData.name, copyToClipboard, toast])

  // Enhanced copy link function
  const copyLink = useCallback(() => {
    if (!id) {
      toast({
        title: "Error",
        description: "Page ID not found",
        variant: "destructive",
      })
      return
    }
    
    const url = `${window.location.origin}/tip/${id}`
    copyToClipboard(url, 'link', 'Link Copied! 📋')
  }, [id, copyToClipboard, toast])

  // Copy wallet address function
  const copyAddress = useCallback((address: string) => {
    copyToClipboard(address, `address-${address}`, 'Address Copied! 📋')
  }, [copyToClipboard])

  // Copy transaction hash function
  const copyTxHash = useCallback((txHash: string) => {
    copyToClipboard(txHash, `tx-${txHash}`, 'Transaction Hash Copied! 📋')
  }, [copyToClipboard])

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

  const getAmountInUSD = useCallback((strkAmount: string) => {
    if (isPriceLoading) return "..."
    const amount = parseFloat(strkAmount)
    if (isNaN(amount) || strkPrice === 0) return "0.00"
    return (amount * strkPrice).toFixed(2)
  }, [strkPrice, isPriceLoading])

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
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold">Support {pageData.name}</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyLink}>
                {copiedStates['link'] ? (
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy Link
              </Button>
              {/* <Button variant="outline" size="sm" onClick={shareLink}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button> */}
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
                          {(() => {
                                const value = Number(pageData.total_amount_recieved) / 1e18; // from wei to STRK

                                if (value >= 100) return value.toFixed(0);     // No decimals for big numbers
                                if (value >= 1) return value.toFixed(0);       // 2 decimals for normal amounts
                                return value.toPrecision(3);                   // Small numbers keep 3 significant digits
                              })()}
                              STRK raised
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
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-blue-700">
                          Your STRK Balance: <span className="font-semibold">{userBalance} STRK</span>
                        </p>
                        <p className="text-xs text-blue-600">
                          ≈ ${getAmountInUSD(userBalance)}
                        </p>
                      </div>
                      {isPriceLoading && (
                        <p className="text-xs text-blue-500 mt-1">
                          <Loader2 className="h-3 w-3 inline animate-spin mr-1" />
                          Updating price...
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
                              {transactionStatus === "pending" && "Processing your tip..."}
                              {transactionStatus === "success" && "Tip sent successfully! 🎉"}
                              {transactionStatus === "error" && "Transaction failed"}
                            </p>
                            {txHash && txHash !== "pending..." && (
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-gray-600 font-mono break-all">
                                  Tx: {txHash.slice(0, 20)}...
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2"
                                  onClick={() => copyTxHash(txHash)}
                                >
                                  {copiedStates[`tx-${txHash}`] ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Amount Selection */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Choose Tip Amount</Label>
                      {!isPriceLoading && strkPrice > 0 && (
                        <p className="text-xs text-gray-500">
                          1 STRK = ${strkPrice.toFixed(4)}
                        </p>
                      )}
                    </div>
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
                          <div className="text-xs opacity-70">
                            ${isPriceLoading ? "..." : getAmountInUSD(amount.strk)}
                          </div>
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
                          ${isPriceLoading ? "..." : getAmountInUSD(customAmount)}
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

                  {/* Send Tip Button - Now handles both approval and tip in one transaction */}
                  <Button
                    onClick={handleSendTip}
                    disabled={isButtonDisabled}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing tip...
                      </>
                    ) : (
                      `Send Tip ${currentAmount ? `(${currentAmount} STRK)` : ""}`
                    )}
                  </Button>

                  {!isConnected && (
                    <p className="text-sm text-gray-500 text-center">Connect your Starknet wallet to send a tip</p>
                  )}

                  <div className="text-xs text-gray-500 text-center bg-gray-50 p-2 rounded">
                    ℹ️ This transaction will automatically approve and send your tip in a single signature
                  </div>
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
                  {recentTips.length > 0 ? (
                    recentTips.map((tip) => (
                      <div key={tip.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-gray-500">
                              {typeof tip.sender === 'string' && tip.sender.length > 10 
                                ? `${tip.sender.slice(0, 6)}...${tip.sender.slice(-4)}`
                                : tip.sender || "Unknown"}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => copyAddress(tip.sender)}
                            >
                              {copiedStates[`address-${tip.sender}`] ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="">
                              {Number(tip.amount).toFixed(1)} STRK
                            </Badge>
                            <p className="text-xs text-gray-400">
                              ${isPriceLoading ? "..." : getAmountInUSD(tip.amount)}
                            </p>
                          </div>
                        </div>
                        {tip.message && (
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-2">&quot;{tip.message}&quot;</p>
                        )}
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-400">{formatTimeAgo(tip.timestamp)}</span>
                          {tip.txHash && tip.txHash !== "pending..." && (
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Tx
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2"
                                onClick={() => copyTxHash(tip.txHash!)}
                              >
                                {copiedStates[`tx-${tip.txHash}`] ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tips yet</p>
                      <p className="text-xs opacity-75">Be the first to support this creator!</p>
                    </div>
                  )}
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
                      <span className="font-semibold">
                        {(() => {
                          const value = Number(pageData.total_amount_recieved) / 1e18; // convert from wei to STRK
                          if (value >= 100) return `${value.toFixed(0)} STRK`;
                          if (value >= 1) return `${value.toFixed(2)} STRK`;
                          return `${value.toPrecision(3)} STRK`;
                        })()}
                      </span>
                      <p className="text-xs text-gray-500">
                        ${
                          (() => {
                            const usdValue = Number(getAmountInUSD(String(Number(pageData.total_amount_recieved) / 1e18)));
                            if (usdValue >= 100) return usdValue.toFixed(0);
                            if (usdValue >= 1) return usdValue.toFixed(2);
                            return usdValue.toPrecision(3);
                          })()
                        }
                      </p>
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
                          ? (() => {
                              // Average per tip in STRK
                              const value =
                                (Number(pageData.total_amount_recieved) / 1e18) /
                                Number(pageData.total_tips_recieved);

                              if (value >= 100) return `${value.toFixed(0)} STRK`;   // Big numbers: no decimals
                              if (value >= 1) return `${value.toFixed(2)} STRK`;     // Normal: 2 decimals
                              return `${value.toPrecision(3)} STRK`;                 // Small: 3 significant digits
                            })()
                          : "0 STRK"}
                      </span>

                      <p className="text-xs text-gray-500">
                        ${
                          pageData.total_tips_recieved > 0
                            ? (() => {
                                // Average per tip in STRK → USD
                                const avgStrk =
                                  (Number(pageData.total_amount_recieved) / 1e18) /
                                  Number(pageData.total_tips_recieved);

                                const usdValue = Number(getAmountInUSD(String(avgStrk)));

                                if (usdValue >= 100) return usdValue.toFixed(0);   // No decimals for large amounts
                                if (usdValue >= 1) return usdValue.toFixed(2);     // 2 decimals for normal amounts
                                return usdValue.toPrecision(3);                    // 3 sig digits for small amounts
                              })()
                            : "0.00"
                        }
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