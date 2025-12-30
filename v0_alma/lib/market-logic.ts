// LMSR (Logarithmic Market Scoring Rule) implementation
export interface Outcome {
  id: string
  title: string
  quantity: number
}

export interface Market {
  id: string
  title: string
  description: string
  category: string
  liquidity: number
  status: string
}

export interface Bet {
  id: string
  market_id: string
  outcome_id: string
  user_id: string
  amount: number
  shares: number
  price: number
  created_at: string
}

// Calculate the cost function C(q) = b * ln(sum(e^(q_i/b)))
export function calculateCost(quantities: number[], liquidity: number): number {
  const b = liquidity
  const sum = quantities.reduce((acc, q) => acc + Math.exp(q / b), 0)
  return b * Math.log(sum)
}

// Calculate probability for each outcome
export function calculateProbabilities(quantities: number[], liquidity: number): number[] {
  const b = liquidity
  const sum = quantities.reduce((acc, q) => acc + Math.exp(q / b), 0)
  return quantities.map((q) => Math.exp(q / b) / sum)
}

// Calculate price for buying shares (marginal cost)
export function calculateBuyPrice(quantities: number[], outcomeIndex: number, liquidity: number): number {
  const probabilities = calculateProbabilities(quantities, liquidity)
  return probabilities[outcomeIndex]
}

// Calculate cost to buy a specific number of shares
export function calculateShareCost(
  quantities: number[],
  outcomeIndex: number,
  shareAmount: number,
  liquidity: number,
): number {
  const initialCost = calculateCost(quantities, liquidity)
  const newQuantities = [...quantities]
  newQuantities[outcomeIndex] += shareAmount
  const finalCost = calculateCost(newQuantities, liquidity)
  return finalCost - initialCost
}

// Calculate potential payout
export function calculatePayout(shares: number, outcomeWon: boolean): number {
  return outcomeWon ? shares : 0
}

// Format currency to GHS
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount)
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}
