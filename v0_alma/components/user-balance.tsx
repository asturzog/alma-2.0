"use client"

import { formatCurrency } from "@/lib/market-logic"
import { Card } from "@/components/ui/card"
import { Wallet } from "lucide-react"

interface UserBalanceProps {
  balance: number
}

export function UserBalance({ balance }: UserBalanceProps) {
  return (
    <Card className="border-emerald-200/50 px-6 py-4">
      <div className="flex items-center gap-3">
        <Wallet className="h-5 w-5 text-emerald-600" />
        <div>
          <p className="text-sm text-muted-foreground">Your Balance</p>
          <p className="text-2xl font-bold text-emerald-900">{formatCurrency(balance)}</p>
        </div>
      </div>
    </Card>
  )
}
