import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateMarketForm } from "@/components/create-market-form"
import { AdminMarketList } from "@/components/admin-market-list"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all markets created by this user
  const { data: markets } = await supabase
    .from("markets")
    .select(
      `
      *,
      outcomes (*)
    `,
    )
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })

  const activeMarkets = markets?.filter((m) => m.status === "active") || []
  const resolvedMarkets = markets?.filter((m) => m.status === "resolved") || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-emerald-900">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage markets and resolve outcomes</p>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="create">Create Market</TabsTrigger>
            <TabsTrigger value="active">Active Markets ({activeMarkets.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved Markets ({resolvedMarkets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <CreateMarketForm />
          </TabsContent>

          <TabsContent value="active">
            <AdminMarketList markets={activeMarkets} status="active" />
          </TabsContent>

          <TabsContent value="resolved">
            <AdminMarketList markets={resolvedMarkets} status="resolved" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
