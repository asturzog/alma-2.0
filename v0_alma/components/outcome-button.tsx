"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatPercentage, formatCurrency, calculateShareCost, type Outcome } from "@/lib/market-logic"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { TrendingUp, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface OutcomeButtonProps {
  outcome: Outcome
  probability: number
  marketId: string
  marketLiquidity: number
  allOutcomes: Outcome[]
  userBalance?: number
}

const QUICK_BET_AMOUNTS = [10, 25, 50, 100]

export function OutcomeButton({
  outcome,
  probability,
  marketId,
  marketLiquidity,
  allOutcomes,
  userBalance = 0,
}: OutcomeButtonProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastBetAmount, setLastBetAmount] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!open) return

    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key
      if (key >= "1" && key <= "4") {
        const index = Number.parseInt(key) - 1
        const quickAmount = QUICK_BET_AMOUNTS[index]
        if (quickAmount && quickAmount <= userBalance) {
          setAmount(quickAmount.toString())
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [open, userBalance])

  useEffect(() => {
    if (open && !amount) {
      // Use last bet amount if available and affordable
      if (lastBetAmount && lastBetAmount <= userBalance) {
        setAmount(lastBetAmount.toString())
      } else {
        // Otherwise suggest a reasonable default (10% of balance or GHS 10)
        const suggestedAmount = Math.min(Math.max(Math.floor(userBalance * 0.1), 10), 100)
        if (suggestedAmount <= userBalance && suggestedAmount >= 10) {
          setAmount(suggestedAmount.toString())
        }
      }
    }
  }, [open, lastBetAmount, userBalance, amount])

  const handleBet = async () => {
    const betAmount = Number.parseFloat(amount)
    if (!betAmount || betAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (betAmount > userBalance) {
      setError("Insufficient balance")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data: profile } = await supabase.from("profiles").select("balance").eq("id", user.id).single()

      if (!profile || profile.balance < betAmount) {
        throw new Error("Insufficient balance")
      }

      const outcomeIndex = allOutcomes.findIndex((o) => o.id === outcome.id)
      const quantities = allOutcomes.map((o) => o.quantity)
      const shareCost = calculateShareCost(quantities, outcomeIndex, betAmount, marketLiquidity)
      const shares = betAmount / probability
      const price = probability

      const { error: betError } = await supabase.from("bets").insert({
        market_id: marketId,
        outcome_id: outcome.id,
        user_id: user.id,
        amount: betAmount,
        shares: shares,
        price: price,
      })

      if (betError) throw betError

      const { error: balanceError } = await supabase
        .from("profiles")
        .update({ balance: profile.balance - betAmount })
        .eq("id", user.id)

      if (balanceError) throw balanceError

      const { error: outcomeError } = await supabase
        .from("outcomes")
        .update({ quantity: outcome.quantity + shares })
        .eq("id", outcome.id)

      if (outcomeError) throw outcomeError

      setLastBetAmount(betAmount)
      setOpen(false)
      setAmount("")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickBet = async (quickAmount: number) => {
    if (quickAmount > userBalance) {
      setError("Insufficient balance")
      return
    }
    setAmount(quickAmount.toString())
    // Auto-trigger bet after setting amount
    setTimeout(() => {
      const btn = document.getElementById(`confirm-bet-${outcome.id}`)
      if (btn) btn.click()
    }, 100)
  }

  const calculatedShares = amount ? Number.parseFloat(amount) / probability : 0
  const potentialPayout = calculatedShares
  const balanceAfterBet = userBalance - (Number.parseFloat(amount) || 0)
  const potentialProfit = potentialPayout - (Number.parseFloat(amount) || 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-auto py-5 px-5 flex items-center justify-between border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all bg-transparent active:scale-[0.98]"
        >
          <span className="font-semibold text-lg">{outcome.title}</span>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-emerald-700">{formatPercentage(probability)}</span>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Place Bet on {outcome.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Probability</span>
              <span className="font-semibold">{formatPercentage(probability)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price per Share</span>
              <span className="font-semibold">{formatCurrency(probability)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-muted-foreground">Your Balance</span>
              <span className="font-bold text-emerald-700">{formatCurrency(userBalance)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Quick Bet</Label>
              <span className="text-xs text-muted-foreground">Press 1-4</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_BET_AMOUNTS.map((quickAmount, index) => {
                const isAffordable = quickAmount <= userBalance
                return (
                  <Button
                    key={quickAmount}
                    variant="outline"
                    size="lg"
                    onClick={() => setAmount(quickAmount.toString())}
                    disabled={!isAffordable}
                    className={cn(
                      "h-14 text-base font-semibold relative",
                      isAffordable
                        ? "border-emerald-300 hover:bg-emerald-100 hover:border-emerald-500"
                        : "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs text-muted-foreground">{index + 1}</span>
                      <span className="text-emerald-700">GHS {quickAmount}</span>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Custom Amount (GHS)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter custom amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="1"
              className="h-12 text-lg"
            />
          </div>

          {amount && Number.parseFloat(amount) > 0 && (
            <div className="space-y-3 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 p-4 border-2 border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-900">Bet Preview</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shares to Receive</span>
                  <span className="font-semibold">{calculatedShares.toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Potential Payout</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(potentialPayout)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Potential Profit</span>
                  <span className={cn("font-bold", potentialProfit > 0 ? "text-green-600" : "text-gray-600")}>
                    {potentialProfit > 0 ? "+" : ""}
                    {formatCurrency(potentialProfit)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-emerald-300">
                  <span className="text-muted-foreground">Balance After Bet</span>
                  <span className={cn("font-bold", balanceAfterBet < 0 ? "text-red-600" : "text-emerald-900")}>
                    {formatCurrency(balanceAfterBet)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</div>}

          <Button
            id={`confirm-bet-${outcome.id}`}
            onClick={handleBet}
            disabled={isLoading || !amount || Number.parseFloat(amount) <= 0 || Number.parseFloat(amount) > userBalance}
            className="w-full h-14 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all"
          >
            {isLoading ? "Placing Bet..." : "Confirm Bet"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
