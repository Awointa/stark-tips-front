"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Copy, Share2, BarChart3, Eye, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface TipPageCardProps {
  page: {
    id: string
    name: string
    description: string
    totalAmount: string
    tipCount: number
    createdAt: string
    isActive: boolean
    goal?: string
  }
  onToggleStatus: (pageId: string) => void
  onViewAnalytics: () => void
}

export default function TipPageCard({ page, onToggleStatus, onViewAnalytics }: TipPageCardProps) {
  const { toast } = useToast()

  const copyLink = () => {
    const link = `${window.location.origin}/tip/${page.id}`
    navigator.clipboard.writeText(link)
    toast({
      title: "Link Copied! 📋",
      description: "Your tip page link has been copied to clipboard",
    })
  }

  const shareLink = () => {
    const link = `${window.location.origin}/tip/${page.id}`
    const text = `Support my work on Thanksonchain! ${page.name}`

    if (navigator.share) {
      navigator.share({
        title: page.name,
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

  const progressPercentage = page.goal
    ? Math.min((Number.parseFloat(page.totalAmount) / Number.parseFloat(page.goal)) * 100, 100)
    : 0

  return (
    <Card className={`${!page.isActive ? "opacity-60" : ""} hover:shadow-lg transition-shadow`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl">{page.name}</CardTitle>
              <Badge variant={page.isActive ? "default" : "secondary"}>{page.isActive ? "Active" : "Inactive"}</Badge>
            </div>
            <CardDescription className="mb-3">{page.description}</CardDescription>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="font-medium">{page.totalAmount} STRK raised</span>
              <span>{page.tipCount} tips</span>
              <span>Created {new Date(page.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Goal Progress */}
        {page.goal && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span>Goal Progress</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2 mb-2" />
            <p className="text-xs text-gray-500">
              {page.totalAmount} ETH of {page.goal} ETH goal
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/tip/${page.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Page
            </Link>
          </Button>

          <Button variant="outline" size="sm" onClick={copyLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>

          <Button variant="outline" size="sm" onClick={shareLink}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>

          <Button variant="outline" size="sm" onClick={onViewAnalytics}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>

          <Button variant="outline" size="sm" onClick={() => onToggleStatus(page.id)}>
            <Settings className="h-4 w-4 mr-2" />
            {page.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{page.totalAmount}</div>
            <div className="text-xs text-gray-500">ETH Raised</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{page.tipCount}</div>
            <div className="text-xs text-gray-500">Total Tips</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {page.tipCount > 0 ? (Number.parseFloat(page.totalAmount) / page.tipCount).toFixed(3) : "0.000"}
            </div>
            <div className="text-xs text-gray-500">Avg Tip</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
