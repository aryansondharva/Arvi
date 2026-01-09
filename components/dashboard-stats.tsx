import { Card } from "@/components/ui/card"
import { Recycle, Calendar, TreePine, TrendingUp } from "lucide-react"

interface DashboardStatsProps {
  stats: any
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      label: "Events Attended",
      value: stats?.events_attended || 0,
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Waste Collected",
      value: `${stats?.waste_collected_kg || 0} kg`,
      icon: Recycle,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      label: "Trees Planted",
      value: stats?.trees_planted || 0,
      icon: TreePine,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Total Points",
      value: stats?.total_points || 0,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </Card>
        )
      })}
    </div>
  )
}
