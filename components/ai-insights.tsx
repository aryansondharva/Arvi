"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp, Target, Calendar, Award } from "lucide-react"

interface AIInsightsProps {
  userId: string
  stats: any
  impactLogs: any[]
  eventHistory: any[]
}

export function AIInsights({ userId, stats, impactLogs, eventHistory }: AIInsightsProps) {
  // Calculate insights
  const totalEvents = stats?.events_attended || 0
  const avgWastePerEvent = totalEvents > 0 ? (stats?.waste_collected_kg || 0) / totalEvents : 0
  const monthlyAverage = impactLogs.length > 0 ? impactLogs.length / 12 : 0

  // Generate personalized recommendations
  const recommendations = []

  if (totalEvents < 5) {
    recommendations.push({
      title: "Join More Events",
      description: "Attending 5+ events will unlock the 'Regular Volunteer' achievement",
      icon: Calendar,
      color: "text-primary",
    })
  }

  if (avgWastePerEvent < 10) {
    recommendations.push({
      title: "Increase Your Impact",
      description: "Focus on larger cleanup events to collect more waste per session",
      icon: TrendingUp,
      color: "text-secondary",
    })
  }

  if (stats?.trees_planted < 5) {
    recommendations.push({
      title: "Try Tree Planting",
      description: "Join a forest restoration event to earn the 'Tree Planter' badge",
      icon: Award,
      color: "text-accent",
    })
  }

  recommendations.push({
    title: "Set a Monthly Goal",
    description: "Try attending at least 2 events per month to maintain momentum",
    icon: Target,
    color: "text-primary",
  })

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI-Powered Insights
        </CardTitle>
        <CardDescription>Personalized recommendations to maximize your impact</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Performance summary */}
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div className="p-4 rounded-lg bg-background/50 backdrop-blur">
            <div className="text-2xl font-bold text-primary">{totalEvents}</div>
            <div className="text-sm text-muted-foreground">Events Attended</div>
          </div>
          <div className="p-4 rounded-lg bg-background/50 backdrop-blur">
            <div className="text-2xl font-bold text-secondary">{avgWastePerEvent.toFixed(1)} kg</div>
            <div className="text-sm text-muted-foreground">Avg Waste/Event</div>
          </div>
          <div className="p-4 rounded-lg bg-background/50 backdrop-blur">
            <div className="text-2xl font-bold text-accent">{(stats?.total_points || 0).toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h4 className="font-semibold">Recommended Actions</h4>
          {recommendations.map((rec, index) => {
            const Icon = rec.icon
            return (
              <div key={index} className="flex gap-4 p-4 rounded-lg bg-background/50 backdrop-blur">
                <div className={`w-10 h-10 rounded-lg bg-background flex items-center justify-center ${rec.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold mb-1">{rec.title}</h5>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Trend analysis */}
        {totalEvents >= 3 && (
          <div className="p-4 rounded-lg bg-background/50 backdrop-blur">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-semibold">Trend Analysis</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your participation is {totalEvents >= 10 ? "excellent" : totalEvents >= 5 ? "great" : "growing"}! Keep it
              up to unlock more achievements and climb the leaderboard.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
