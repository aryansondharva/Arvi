import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { ImpactCharts } from "@/components/impact-charts"
import { AIInsights } from "@/components/ai-insights"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch user's impact logs
  const { data: impactLogs } = await supabase
    .from("impact_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  // Fetch user stats
  const { data: stats } = await supabase.from("leaderboard").select("*").eq("user_id", user.id).single()

  // Fetch user's event history
  const { data: eventHistory } = await supabase
    .from("event_participants")
    .select("*, events(*)")
    .eq("user_id", user.id)
    .order("registered_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={profile} />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Impact Analytics</h1>
          <p className="text-muted-foreground text-lg">Track your environmental contributions over time</p>
        </div>

        <AIInsights userId={user.id} stats={stats} impactLogs={impactLogs || []} eventHistory={eventHistory || []} />

        <ImpactCharts impactLogs={impactLogs || []} stats={stats} />
      </main>
    </div>
  )
}
