"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import type { Market, Outcome } from "@/lib/market-logic"

interface ResolveMarketDialogProps {
  market: Market
  outcomes: Outcome[]
}

export function ResolveMarketDialog({ market, outcomes }: ResolveMarketDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedOutcome, setSelectedOutcome] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleResolve = async () => {
    if (!selectedOutcome) {
      setError("Please select a winning outcome")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Update market with winning outcome
      const { error: marketError } = await supabase
        .from("markets")
        .update({
          status: "resolved",
          winning_outcome_id: selectedOutcome,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", market.id)

      if (marketError) throw marketError

      // Get all bets for winning outcome
      const { data: winningBets } = await supabase
        .from("bets")
        .select("user_id, shares")
        .eq("market_id", market.id)
        .eq("outcome_id", selectedOutcome)

      if (winningBets && winningBets.length > 0) {
        // Group bets by user and sum shares
        const userPayouts = winningBets.reduce(
          (acc, bet) => {
            acc[bet.user_id] = (acc[bet.user_id] || 0) + bet.shares
            return acc
          },
          {} as Record<string, number>,
        )

        // Update user balances
        for (const [userId, payout] of Object.entries(userPayouts)) {
          const { data: profile } = await supabase.from("profiles").select("balance").eq("id", userId).single()

          if (profile) {
            await supabase
              .from("profiles")
              .update({ balance: profile.balance + payout })
              .eq("id", userId)
          }
        }
      }

      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <CheckCircle className="h-4 w-4 mr-2" />
          Resolve Market
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Resolve Market</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <p className="text-sm text-muted-foreground">
            Select the winning outcome to resolve this market and pay out winners.
          </p>

          <RadioGroup value={selectedOutcome} onValueChange={setSelectedOutcome}>
            {outcomes.map((outcome) => (
              <div key={outcome.id} className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200">
                <RadioGroupItem value={outcome.id} id={outcome.id} />
                <Label htmlFor={outcome.id} className="flex-1 cursor-pointer">
                  {outcome.title}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</div>}

          <Button onClick={handleResolve} disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {isLoading ? "Resolving..." : "Confirm Resolution"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
