"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, CheckCircle, AlertCircle, Loader2} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {ready, braavos, useInjectedConnectors, useAccount, useConnect, useDisconnect} from "@starknet-react/core"

interface WalletConnectProps {
  onConnectionChange?: (connected: boolean) => void
}

export default function WalletConnect({ onConnectionChange }: WalletConnectProps) {
  const { connectors } = useInjectedConnectors({
    recommended: [ready(), braavos()],
    // Hide recommended connectors if the user has any connector installed.
    includeRecommended: "always",
    // Randomize the order of the connectors.
    order: "random",
  });
  
  const {address, isConnected, connector: activeConnector} = useAccount();
  const {connect, isPending: isConnecting, error} = useConnect();
  const {disconnect} = useDisconnect();
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    onConnectionChange?.(!!isConnected)
  }, [isConnected, onConnectionChange])

  // Handle connection errors from useConnect hook
  useEffect(() => {
    if (error) {
      setConnectionError(error.message || "Failed to connect wallet")
      setIsModalOpen(true) // Reopen modal on error
    }
  }, [error])

  const connectWallet = async (connector: any) => {
    setConnectionError(null)
    setIsModalOpen(false) // Close modal once a wallet is selected

    try {
      // Pass the connector object to connect
      connect({ connector });
    } catch (error) {
      setConnectionError(`Failed to connect to ${connector.name}. Please ensure it's installed and unlocked.`)
    } 
  }

  const disconnectWallet = () => {
    disconnect()
  }

  // Handle both local error state and useConnect error
  const displayError = connectionError || error?.message
  if (displayError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <p className="font-medium text-red-800">Connection Failed</p>
              <p className="text-sm text-red-600">{displayError}</p>
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

  if (isConnected && address) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">{activeConnector?.name} Connected</p>
                <p className="text-sm text-green-600 font-mono">
                  {address.slice(0, 6)}...{address.slice(-4)}
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
        <Card className="border-orange-200 bg-orange-50 cursor-pointer hover:bg-orange-100 transition-colors">
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
          {connectors.length > 0 ? (
            connectors.map(connector => (
              <Button
                key={connector.id}
                variant="outline"
                className="w-full justify-between h-14 text-lg bg-transparent hover:bg-gray-50"
                onClick={() => connectWallet(connector)}
                disabled={isConnecting}
              >
                <div className="flex items-center gap-3">
                  {connector.icon && (
                    <img 
                      src={typeof connector.icon === "string" ? connector.icon : connector.icon.light} 
                      alt={connector.name}
                      className="h-6 w-6"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                  {connector.name}
                </div>
              </Button>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-2">No Starknet wallets detected</p>
              <p className="text-sm">
                Please install a Starknet wallet like Ready (ArgentX) or Braavos to continue.
              </p>
            </div>
          )}
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