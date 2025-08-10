    "use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface TipAmountSelectorProps {
  selectedAmount: string | null
  customAmount: string
  onAmountSelect: (amount: string) => void
  onCustomAmountChange: (amount: string) => void
  disabled?: boolean
}

const quickAmounts = [
  { eth: "0.01", label: "Small", emoji: "☕" },
  { eth: "0.05", label: "Medium", emoji: "🍕" },
  { eth: "0.1", label: "Large", emoji: "🎁" },
  { eth: "0.25", label: "Generous", emoji: "💝" },
  { eth: "0.5", label: "Amazing", emoji: "🌟" },
  { eth: "1.0", label: "Incredible", emoji: "🚀" },
]

export default function TipAmountSelector({
  selectedAmount,
  customAmount,
  onAmountSelect,
  onCustomAmountChange,
  disabled = false,
}: TipAmountSelectorProps) {
  const getAmountInUSD = (ethAmount: string) => {
    const ethToUsd = 2000 // Mock rate
    return (Number.parseFloat(ethAmount) * ethToUsd).toFixed(2)
  }

  return (
    <div className="space-y-4">
      <Label>Choose Tip Amount</Label>

      {/* Quick Amount Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {quickAmounts.map((amount) => (
          <Button
            key={amount.eth}
            variant={selectedAmount === amount.eth ? "default" : "outline"}
            onClick={() => onAmountSelect(amount.eth)}
            disabled={disabled}
            className="h-auto py-4 flex flex-col gap-1"
          >
            <div className="text-lg">{amount.emoji}</div>
            <div className="font-semibold">{amount.eth} ETH</div>
            <div className="text-xs opacity-70">${getAmountInUSD(amount.eth)}</div>
            <div className="text-xs opacity-60">{amount.label}</div>
          </Button>
        ))}
      </div>

      {/* Custom Amount */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="space-y-2">
            <Label htmlFor="customAmount">Custom Amount (ETH)</Label>
            <div className="relative">
              <Input
                id="customAmount"
                type="number"
                step="0.001"
                min="0.001"
                placeholder="Enter custom amount..."
                value={customAmount}
                onChange={(e) => onCustomAmountChange(e.target.value)}
                disabled={disabled}
                className="pr-20"
              />
              {customAmount && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  ${getAmountInUSD(customAmount)}
                </div>
              )}
            </div>
            {customAmount && Number.parseFloat(customAmount) > 0 && (
              <p className="text-xs text-gray-600">That&apos;s approximately ${getAmountInUSD(customAmount)} USD</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
