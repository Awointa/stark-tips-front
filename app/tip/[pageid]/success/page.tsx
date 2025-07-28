"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ExternalLink, Share2, Heart, Copy } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface SuccessPageProps {
  params: {
    pageId: string
  }
  searchParams: {
    amount?: string
    txHash?: string
    message?: string
  }
}

export default function TipSuccessPage({ params, searchParams }: SuccessPageProps) {
  const [confetti, setConfetti] = useState(true)
  const { toast } = useToast()

  const amount = searchParams.amount || "0.1"
  const txHash = searchParams.txHash || "0x1234567890abcdef..."
  const message = searchParams.message || ""

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => setConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const shareSuccess = () => {
    const text = `I just tipped ${amount} ETH to support this amazing creator! 🎉`
    const url = `${window.location.origin}/tip/${params.pageId}`

    if (navigator.share) {
      navigator.share({
        title: "I just sent a tip!",
        text,
        url,
      })
    } else {
      navigator.clipboard.writeText(`${text} ${url}`)
      toast({
        title: "Shared!",
        description: "Share text copied to clipboard",
      })
    }
  }

  const copyTxHash = () => {
    navigator.clipboard.writeText(txHash)
    toast({
      title: "Copied!",
      description: "Transaction hash copied to clipboard",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
      {/* Confetti Animation */}
      {confetti && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7"][
                    Math.floor(Math.random() * 5)
                  ],
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Tip Sent Successfully! 🎉</h1>
            <p className="text-xl text-gray-600">Your support means the world to this creator</p>
          </div>

          {/* Transaction Details */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-green-800">
                <Heart className="h-5 w-5" />
                Transaction Confirmed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount Sent</span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {amount} ETH
                </Badge>
              </div>

              {message && (
                <div className="text-left">
                  <span className="text-gray-600 block mb-2">Your Message</span>
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="text-gray-800">"{message}"</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Transaction Hash</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-white px-2 py-1 rounded">
                    {txHash.slice(0, 10)}...{txHash.slice(-6)}
                  </code>
                  <Button variant="ghost" size="sm" onClick={copyTxHash}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button variant="outline" className="w-full bg-transparent" asChild>
                <a href={`https://starkscan.co/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Starkscan
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex gap-4 justify-center">
              <Button onClick={shareSuccess} className="bg-blue-600 hover:bg-blue-700">
                <Share2 className="h-4 w-4 mr-2" />
                Share Your Support
              </Button>

              <Link href={`/tip/${params.pageId}`}>
                <Button variant="outline">
                  <Heart className="h-4 w-4 mr-2" />
                  Send Another Tip
                </Button>
              </Link>
            </div>

            <Link href="/">
              <Button variant="ghost" className="text-gray-600">
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>✅ Your tip has been sent directly to the creator's wallet</p>
                <p>✅ The transaction is recorded on Starknet blockchain</p>
                <p>✅ The creator will be notified of your support</p>
                <p>💡 Consider following the creator for updates on their work!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .confetti-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confetti-fall 3s linear infinite;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
    