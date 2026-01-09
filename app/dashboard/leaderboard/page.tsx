import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch top users from leaderboard
  const { data: leaderboard } = await supabase
    .from("leaderboard")
    .select("*, profiles(full_name, avatar_url)")
    .order("total_points", { ascending: false })
    .limit(50)

  // Update ranks
  const rankedLeaderboard = leaderboard?.map((entry: any, index: number) => ({
    ...entry,
    rank: index + 1,
  }))

  // Find current user's rank
  const userRank = rankedLeaderboard?.find((entry: any) => entry.user_id === user.id)

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />
    return <Award className="w-6 h-6 text-muted-foreground" />
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={profile} />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Global Leaderboard</h1>
          <p className="text-muted-foreground text-lg">See how you rank among eco-warriors worldwide</p>
        </div>

        {/* User's current rank */}
        {userRank && (
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-primary">#{userRank.rank}</div>
                <div>
                  <div className="font-semibold text-lg">Your Rank</div>
                  <div className="text-sm text-muted-foreground">{userRank.total_points} total points</div>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Top {Math.round((userRank.rank / (rankedLeaderboard?.length || 1)) * 100)}%
              </Badge>
            </div>
          </Card>
        )}

        {/* Leaderboard table */}
        <Card>
          <div className="p-6">
            <h3 className="font-bold text-xl mb-6">Top Volunteers</h3>
            <div className="space-y-2">
              {rankedLeaderboard?.map((entry: any) => {
                const isCurrentUser = entry.user_id === user.id
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                      isCurrentUser ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"
                    }`}
                  >
                    <div className="w-12 text-center">
                      {entry.rank <= 3 ? (
                        getRankIcon(entry.rank)
                      ) : (
                        <span className="text-lg font-semibold text-muted-foreground">#{entry.rank}</span>
                      )}
                    </div>

                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={entry.profiles?.avatar_url || "/placeholder.svg"}
                        alt={entry.profiles?.full_name}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {entry.profiles?.full_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="font-semibold">{entry.profiles?.full_name || "Anonymous User"}</div>
                      <div className="text-sm text-muted-foreground">
                        {entry.events_attended} events • {entry.waste_collected_kg} kg waste • {entry.trees_planted}{" "}
                        trees
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{entry.total_points}</div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
