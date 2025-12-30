import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Trophy, Users, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-balance text-emerald-900">Predict. Bet. Win.</h1>
            <p className="text-xl md:text-2xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Trade on the outcomes of Major Soccer Leagues with dynamic market prices
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700" asChild>
              <Link href="/auth/sign-up">Get Started - GHS 1,000 Free</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 border-emerald-600 text-emerald-700 bg-transparent"
              asChild
            >
              <Link href="/markets">View Markets</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-emerald-200/50">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="flex justify-center">
                <TrendingUp className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-lg">Dynamic Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Prices adjust in real-time based on market activity using LMSR algorithm
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200/50">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="flex justify-center">
                <Trophy className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-lg">Multiple Markets</h3>
              <p className="text-sm text-muted-foreground">
                Bet on EPL and AFCON 2025 with multiple outcomes per market
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200/50">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="flex justify-center">
                <Zap className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-lg">Instant Trading</h3>
              <p className="text-sm text-muted-foreground">
                Place bets instantly and see your portfolio update in real-time
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200/50">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="flex justify-center">
                <Users className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-lg">Transparent Odds</h3>
              <p className="text-sm text-muted-foreground">See probability percentages and track all market activity</p>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-bold text-emerald-900">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mb-3">
                1
              </div>
              <h3 className="font-semibold text-lg">Sign Up</h3>
              <p className="text-sm text-muted-foreground">
                Create your account and receive GHS 1,000 in free trading credit
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mb-3">
                2
              </div>
              <h3 className="font-semibold text-lg">Choose Markets</h3>
              <p className="text-sm text-muted-foreground">
                Browse EPL and AFCON markets and pick the outcomes you believe in
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mb-3">
                3
              </div>
              <h3 className="font-semibold text-lg">Win Big</h3>
              <p className="text-sm text-muted-foreground">
                Earn full payout if your prediction is correct when markets resolve
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
