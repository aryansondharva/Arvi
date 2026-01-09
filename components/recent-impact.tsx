import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Recycle, TreePine, Droplets } from "lucide-react"
import { format } from "date-fns"

interface RecentImpactProps {
  userId: string
}

export async function RecentImpact({ userId }: RecentImpactProps) {
  const supabase = await createClient()

  const { data: impactLogs } = await supabase
    .from("impact_logs")
    .select("*, events(title)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Impact</CardTitle>
        <CardDescription>Your latest environmental contributions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!impactLogs || impactLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Recycle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No impact logged yet. Attend an event to get started!</p>
          </div>
        ) : (
          impactLogs.map((log: any) => (
            <div key={log.id} className="flex gap-4 p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold">{log.events?.title}</h4>
                  <span className="text-xs text-muted-foreground">{format(new Date(log.created_at), "PP")}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  {log.waste_collected_kg > 0 && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Recycle className="w-4 h-4" />
                      {log.waste_collected_kg} kg waste
                    </div>
                  )}
                  {log.trees_planted > 0 && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TreePine className="w-4 h-4" />
                      {log.trees_planted} trees
                    </div>
                  )}
                  {log.area_cleaned_sqm > 0 && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Droplets className="w-4 h-4" />
                      {log.area_cleaned_sqm} m² cleaned
                    </div>
                  )}
                </div>
                {log.notes && <p className="text-sm text-muted-foreground">{log.notes}</p>}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
