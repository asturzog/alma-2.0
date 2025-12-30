import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarketCard } from "@/components/market-card"
import { UserBalance } from "@/components/user-balance"

export default async function MarketsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch all active markets with their outcomes
  const { data: markets } = await supabase
    .from("markets")
    .select(
      `
      *,
      outcomes (*)
    `,
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })

  const eplMarkets = markets?.filter((m) => m.category === "EPL") || []
  const afconMarkets = markets?.filter((m) => m.category === "AFCON") || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-emerald-900">Prediction Markets</h1>
            <p className="text-muted-foreground mt-1">Trade on soccer match outcomes</p>
          </div>
          <UserBalance balance={profile?.balance || 0} />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Markets</TabsTrigger>
            <TabsTrigger value="epl">EPL</TabsTrigger>
            <TabsTrigger value="afcon">AFCON 2025</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {markets && markets.length > 0 ? (
              markets.map((market) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  outcomes={market.outcomes}
                  userBalance={profile?.balance || 0}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">No active markets available</div>
            )}
          </TabsContent>

          <TabsContent value="epl" className="space-y-6">
            {eplMarkets.length > 0 ? (
              eplMarkets.map((market) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  outcomes={market.outcomes}
                  userBalance={profile?.balance || 0}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">No EPL markets available</div>
            )}
          </TabsContent>

          <TabsContent value="afcon" className="space-y-6">
            {afconMarkets.length > 0 ? (
              afconMarkets.map((market) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  outcomes={market.outcomes}
                  userBalance={profile?.balance || 0}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">No AFCON markets available</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
