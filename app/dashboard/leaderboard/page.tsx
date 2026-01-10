import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, ArrowLeft, Users, Award, TreePine, Recycle } from "lucide-react"
import Link from "next/link"

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in to view the leaderboard.</div>
  }

  // Get top performers
  const { data: leaderboard } = await supabase
    .from("leaderboard")
    .select("*, profiles(full_name, avatar_url)")
    .order("total_points", { ascending: false })
    .limit(50)

  // Get user's rank
  const { data: userStats } = await supabase
    .from("leaderboard")
    .select("*, profiles(full_name, avatar_url)")
    .eq("user_id", user.id)
    .single()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold">Global Leaderboard</h1>
            <p className="text-muted-foreground text-lg">Top environmental volunteers worldwide</p>
          </div>
        </div>

        {/* User Stats */}
        {userStats && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Your Ranking</h3>
                    <p className="text-sm text-muted-foreground">
                      Rank #{leaderboard?.findIndex((item: any) => item.user_id === user.id) + 1 || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{userStats.total_points}</div>
                  <div className="text-sm text-muted-foreground">Total Points</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Top Performers
            </CardTitle>
            <CardDescription>Most active environmental volunteers</CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-4">
                {leaderboard.map((entry: any, index: number) => {
                  const isCurrentUser = entry.user_id === user.id
                  const rank = index + 1
                  
                  return (
                    <div 
                      key={entry.user_id} 
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isCurrentUser ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'
                      } transition-colors`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                          rank === 2 ? 'bg-gray-100 text-gray-800' :
                          rank === 3 ? 'bg-amber-100 text-amber-800' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {rank}
                        </div>
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {entry.profiles?.full_name || 'Anonymous'}
                            {isCurrentUser && <Badge variant="secondary">You</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {entry.events_attended} events • {entry.waste_collected_kg}kg waste • {entry.trees_planted} trees
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{entry.total_points}</div>
                        <div className="text-xs text-muted-foreground">points</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No leaderboard data available yet</p>
                <p className="text-sm">Start participating in events to appear on the leaderboard!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Recycle className="w-5 h-5" />
                Waste Champions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Coming Soon</div>
              <p className="text-sm text-muted-foreground">Top waste collectors</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="w-5 h-5" />
                Tree Planters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Coming Soon</div>
              <p className="text-sm text-muted-foreground">Most trees planted</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Event Heroes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Coming Soon</div>
              <p className="text-sm text-muted-foreground">Most events attended</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
