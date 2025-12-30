"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OutcomeButton } from "@/components/outcome-button"
import { calculateProbabilities } from "@/lib/market-logic"
import type { Market, Outcome } from "@/lib/market-logic"

interface MarketCardProps {
  market: Market & { outcomes: Outcome[] }
  outcomes: Outcome[]
  userBalance?: number
}

export function MarketCard({ market, outcomes, userBalance }: MarketCardProps) {
  const [probabilities, setProbabilities] = useState<number[]>([])

  useEffect(() => {
    const quantities = outcomes.map((o) => o.quantity)
    const probs = calculateProbabilities(quantities, market.liquidity)
    setProbabilities(probs)
  }, [outcomes, market.liquidity])

  return (
    <Card className="border-emerald-200/50 shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl text-balance">{market.title}</CardTitle>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-300">
                {market.category}
              </Badge>
            </div>
            <CardDescription className="text-base">{market.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {outcomes.map((outcome, index) => (
            <OutcomeButton
              key={outcome.id}
              outcome={outcome}
              probability={probabilities[index] || 0}
              marketId={market.id}
              marketLiquidity={market.liquidity}
              allOutcomes={outcomes}
              userBalance={userBalance}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
