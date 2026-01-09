import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award } from "lucide-react"

interface AchievementShowcaseProps {
  userId: string
}

export async function AchievementShowcase({ userId }: AchievementShowcaseProps) {
  const supabase = await createClient()

  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select("*, achievements(*)")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false })
    .limit(6)

  const achievements = userAchievements?.map((ua: any) => ua.achievements).filter(Boolean) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Achievements
        </CardTitle>
        <CardDescription>Your earned badges and milestones</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {achievements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Complete events to unlock achievements!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement: any) => (
              <div
                key={achievement.id}
                className="p-4 border rounded-lg text-center hover:bg-muted/50 transition-colors"
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <div className="font-semibold text-sm mb-1">{achievement.name}</div>
                <Badge variant="secondary" className="text-xs">
                  {achievement.badge_tier}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
