import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, CheckCircle, ExternalLink, Users } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface CompletedEventsProps {
  userId: string
}

export async function CompletedEvents({ userId }: CompletedEventsProps) {
  const supabase = await createClient()

  // Get user's completed events (events that have ended and user attended)
  const { data: completedEvents } = await supabase
    .from("event_participants")
    .select("event_id, events(*)")
    .eq("user_id", userId)
    .in("status", ["attended", "registered"]) // Include both attended and registered for flexibility
    .lt("events.end_date", new Date().toISOString()) // Events that have ended
    .order("events.end_date", { ascending: false }) // Most recent first
    .limit(5)

  // Sort and limit events
  const events =
    completedEvents
      ?.map((reg: any) => reg.events)
      .filter(Boolean)
      .slice(0, 3) || []

  // Get participant counts for completed events
  const eventsWithCounts = await Promise.all(
    events.map(async (event: any) => {
      const { data: participants } = await supabase
        .from("event_participants")
        .select("id")
        .eq("event_id", event.id)
        .eq("status", "registered")
      
      return {
        ...event,
        participantCount: participants?.length || 0
      }
    })
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Completed Events</CardTitle>
            <CardDescription>Events you participated in that have ended</CardDescription>
          </div>
          <Link href="/dashboard/events/history">
            <Button variant="ghost" size="sm" className="gap-2">
              View All
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {eventsWithCounts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="mb-4">You haven't completed any events yet</p>
            <Link href="/dashboard/events">
              <Button>Browse Events</Button>
            </Link>
          </div>
        ) : (
          eventsWithCounts.map((event: any) => (
            <div key={event.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-lg">{event.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">
                      COMPLETED
                    </Badge>
                    <Badge variant="secondary">{event.category?.replace("-", " ")}</Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(event.end_date), "PPP")}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {event.participantCount || 0} participants
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-muted-foreground">
                    Event ended {format(new Date(event.end_date), "PPP")}
                  </div>
                  <Link href={`/dashboard/events/${event.id}`}>
                    <Button size="sm" variant="outline" className="bg-transparent">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
