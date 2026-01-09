import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface EventListProps {
  userId: string
}

export async function EventList({ userId }: EventListProps) {
  const supabase = await createClient()

  // Get all upcoming events
  const { data: events } = await supabase
    .from("events")
    .select(
      `
      *,
      profiles(full_name),
      event_participants(count)
    `,
    )
    .eq("status", "upcoming")
    .gte("start_date", new Date().toISOString())
    .order("start_date", { ascending: true })

  // Get user's registered event IDs
  const { data: registrations } = await supabase
    .from("event_participants")
    .select("event_id")
    .eq("user_id", userId)
    .eq("status", "registered")

  const registeredEventIds = new Set(registrations?.map((r) => r.event_id) || [])

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "beach-cleanup": "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "forest-restoration": "bg-green-500/10 text-green-500 border-green-500/20",
      "river-cleanup": "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      "park-maintenance": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      "wildlife-conservation": "bg-amber-500/10 text-amber-500 border-amber-500/20",
      other: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    }
    return colors[category] || colors.other
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {!events || events.length === 0 ? (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No upcoming events found</p>
          <p className="text-sm">Check back later or create your own event!</p>
        </div>
      ) : (
        events.map((event: any) => {
          const isRegistered = registeredEventIds.has(event.id)
          const participantCount = Array.isArray(event.event_participants)
            ? event.event_participants.length
            : event.event_participants?.[0]?.count || 0

          return (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-xl line-clamp-2">{event.title}</h3>
                  <Badge className={getCategoryColor(event.category)}>{event.category.replace("-", " ")}</Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(event.start_date), "PPP")}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {format(new Date(event.start_date), "p")} - {format(new Date(event.end_date), "p")}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {participantCount} {event.max_participants ? `/ ${event.max_participants}` : ""} participants
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/dashboard/events/${event.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      View Details
                    </Button>
                  </Link>
                  {isRegistered ? (
                    <Badge variant="secondary" className="px-4 flex items-center">
                      Registered
                    </Badge>
                  ) : (
                    <Link href={`/dashboard/events/${event.id}`} className="flex-1">
                      <Button className="w-full">Join Event</Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          )
        })
      )}
    </div>
  )
}
