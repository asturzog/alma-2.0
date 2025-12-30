"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Plus, X } from "lucide-react"

export function CreateMarketForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("EPL")
  const [liquidity, setLiquidity] = useState("1000")
  const [outcomes, setOutcomes] = useState<string[]>(["", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const addOutcome = () => {
    setOutcomes([...outcomes, ""])
  }

  const removeOutcome = (index: number) => {
    if (outcomes.length > 2) {
      setOutcomes(outcomes.filter((_, i) => i !== index))
    }
  }

  const updateOutcome = (index: number, value: string) => {
    const newOutcomes = [...outcomes]
    newOutcomes[index] = value
    setOutcomes(newOutcomes)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Validate outcomes
      const validOutcomes = outcomes.filter((o) => o.trim().length > 0)
      if (validOutcomes.length < 2) {
        throw new Error("Please add at least 2 outcomes")
      }

      // Create market
      const { data: market, error: marketError } = await supabase
        .from("markets")
        .insert({
          title,
          description,
          category,
          liquidity: Number.parseFloat(liquidity),
          created_by: user.id,
        })
        .select()
        .single()

      if (marketError) throw marketError

      // Create outcomes
      const outcomeInserts = validOutcomes.map((outcomeTitle) => ({
        market_id: market.id,
        title: outcomeTitle,
        quantity: 0,
      }))

      const { error: outcomesError } = await supabase.from("outcomes").insert(outcomeInserts)

      if (outcomesError) throw outcomesError

      // Reset form
      setTitle("")
      setDescription("")
      setCategory("EPL")
      setLiquidity("1000")
      setOutcomes(["", ""])
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-emerald-200/50 shadow-md max-w-3xl">
      <CardHeader>
        <CardTitle className="text-2xl">Create New Market</CardTitle>
        <CardDescription>Add a new prediction market for users to bet on</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Market Title</Label>
            <Input
              id="title"
              placeholder="e.g., Who will win the Premier League 2024/25?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide details about the market..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EPL">EPL</SelectItem>
                  <SelectItem value="AFCON">AFCON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="liquidity">Liquidity (GHS)</Label>
              <Input
                id="liquidity"
                type="number"
                placeholder="1000"
                value={liquidity}
                onChange={(e) => setLiquidity(e.target.value)}
                required
                min="100"
                step="100"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Outcomes</Label>
              <Button type="button" variant="outline" size="sm" onClick={addOutcome}>
                <Plus className="h-4 w-4 mr-1" />
                Add Outcome
              </Button>
            </div>
            {outcomes.map((outcome, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Outcome ${index + 1}`}
                  value={outcome}
                  onChange={(e) => updateOutcome(index, e.target.value)}
                  required
                />
                {outcomes.length > 2 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeOutcome(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</div>}

          <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {isLoading ? "Creating Market..." : "Create Market"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
