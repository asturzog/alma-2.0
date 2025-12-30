"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ResolveMarketDialog } from "@/components/resolve-market-dialog"
import { formatCurrency, calculateProbabilities } from "@/lib/market-logic"
import type { Market, Outcome } from "@/lib/market-logic"

interface AdminMarketListProps {
  markets: (Market & { outcomes: Outcome[] })[]
  status: "active" | "resolved"
}

export function AdminMarketList({ markets, status }: AdminMarketListProps) {
  if (markets.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No {status} markets found</div>
  }

  return (
    <div className="space-y-6">
      {markets.map((market) => {
        const probabilities = calculateProbabilities(
          market.outcomes.map((o) => o.quantity),
          market.liquidity,
        )

        return (
          <Card key={market.id} className="border-emerald-200/50 shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl text-balance">{market.title}</CardTitle>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-300">
                      {market.category}
                    </Badge>
                    {status === "resolved" && (
                      <Badge variant="outline" className="border-blue-300 text-blue-700">
                        Resolved
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-base">{market.description}</CardDescription>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Liquidity: {formatCurrency(market.liquidity)}</span>
                  </div>
                </div>
                {status === "active" && <ResolveMarketDialog market={market} outcomes={market.outcomes} />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Outcomes:</h4>
                <div className="space-y-2">
                  {market.outcomes.map((outcome, index) => (
                    <div
                      key={outcome.id}
                      className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-200"
                    >
                      <span className="font-medium">{outcome.title}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Shares: {outcome.quantity.toFixed(2)}</span>
                        <span className="font-semibold text-emerald-700">
                          {((probabilities[index] || 0) * 100).toFixed(1)}%
                        </span>
                        {market.winning_outcome_id === outcome.id && <Badge className="bg-emerald-600">Winner</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
