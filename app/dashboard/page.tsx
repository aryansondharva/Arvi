import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardStats } from "@/components/dashboard-stats"
import { UpcomingEvents } from "@/components/upcoming-events"
import { RecentImpact } from "@/components/recent-impact"
import { AchievementShowcase } from "@/components/achievement-showcase"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  let { data: profile, error: profileFetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  // If profile doesn't exist, create it
  if (!profile && !profileFetchError) {
    console.log("[v0] Creating profile for user:", user.id)
    const { data: newProfile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Eco-Warrior",
      })
      .select()
      .single()

    if (profileError) {
      console.error("[v0] Profile creation error:", profileError)
    } else {
      profile = newProfile
      console.log("[v0] Profile created successfully")
    }
  }

  // Initialize leaderboard entry if it doesn't exist
  const { data: existingLeaderboard } = await supabase
    .from("leaderboard")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!existingLeaderboard) {
    console.log("[v0] Creating leaderboard entry for user:", user.id)
    const { error: leaderboardError } = await supabase.from("leaderboard").insert({
      user_id: user.id,
      total_points: 0,
      events_attended: 0,
      waste_collected_kg: 0,
      trees_planted: 0,
    })

    if (leaderboardError) {
      console.error("[v0] Leaderboard creation error:", leaderboardError)
    } else {
      console.log("[v0] Leaderboard entry created successfully")
    }
  }

  const { data: stats } = await supabase.from("leaderboard").select("*").eq("user_id", user.id).maybeSingle()

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={profile} />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome back, {profile?.full_name || "Eco-Warrior"}!</h1>
          <p className="text-muted-foreground text-lg">Here's your environmental impact summary</p>
        </div>

        <DashboardStats stats={stats} />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <UpcomingEvents userId={user.id} />
            <RecentImpact userId={user.id} />
          </div>
          <div>
            <AchievementShowcase userId={user.id} />
          </div>
        </div>
      </main>
    </div>
  )
}
