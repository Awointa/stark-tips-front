"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, CheckCircle, AlertCircle, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface WalletConnectProps {
  onConnectionChange?: (connected: boolean) => void
}

export default function WalletConnect({ onConnectionChange }: WalletConnectProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [walletType, setWalletType] = useState<"ArgentX" | "Braavos" | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    onConnectionChange?.(isConnected)
  }, [isConnected, onConnectionChange])

  const connectWallet = async (type: "ArgentX" | "Braavos") => {
    setIsConnecting(true)
    setConnectionError(null)
    setIsModalOpen(false) // Close modal once a wallet is selected

    try {
      // Simulate wallet detection and connection
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate connection success
      setIsConnected(true)
      setWalletAddress("0x1234567890abcdef1234567890abcdef12345678")
      setWalletType(type)
    } catch (error) {
      setConnectionError(`Failed to connect to ${type}. Please ensure it's installed and unlocked.`)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setWalletAddress("")
    setWalletType(null)
    setConnectionError(null)
  }

  if (connectionError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <p className="font-medium text-red-800">Connection Failed</p>
              <p className="text-sm text-red-600">{connectionError}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setConnectionError(null)
                setIsModalOpen(true) // Re-open modal to try again
              }}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isConnected) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">{walletType} Connected</p>
                <p className="text-sm text-green-600 font-mono">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={disconnectWallet}
              className="border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">Connect Starknet Wallet</p>
                  <p className="text-sm text-orange-600">ArgentX, Braavos, or other Starknet wallets</p>
                </div>
              </div>
              <Button disabled={isConnecting} className="bg-orange-600 hover:bg-orange-700">
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>Choose your preferred Starknet wallet to connect to Thanksonchain.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="w-full justify-between h-14 text-lg bg-transparent"
            onClick={() => connectWallet("ArgentX")}
            disabled={isConnecting}
          >
            <div className="flex items-center gap-3">
              {/* Replace with actual ArgentX icon */}
              <img src="/placeholder.svg?height=24&width=24" alt="ArgentX" className="h-6 w-6" />
              ArgentX
            </div>
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            className="w-full justify-between h-14 text-lg bg-transparent"
            onClick={() => connectWallet("Braavos")}
            disabled={isConnecting}
          >
            <div className="flex items-center gap-3">
              {/* Replace with actual Braavos icon */}
              <img src="/placeholder.svg?height=24&width=24" alt="Braavos" className="h-6 w-6" />
              Braavos
            </div>
            <ChevronRight className="h-5 w-5" />
          </Button>
          {/* Add more wallet options here */}
        </div>
        {isConnecting && (
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Connecting...
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
