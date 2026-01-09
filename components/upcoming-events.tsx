import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ExternalLink } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface UpcomingEventsProps {
  userId: string
}

export async function UpcomingEvents({ userId }: UpcomingEventsProps) {
  const supabase = await createClient()

  // Get user's registered events
  const { data: registeredEvents } = await supabase
    .from("event_participants")
    .select("event_id, events(*)")
    .eq("user_id", userId)
    .eq("status", "registered")
    .gte("events.start_date", new Date().toISOString())
    .limit(10) // Fetch more to sort client-side

  // Sort and limit the events
  const events =
    registeredEvents
      ?.map((reg: any) => reg.events)
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, 3) || []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Events you're registered for</CardDescription>
          </div>
          <Link href="/dashboard/events">
            <Button variant="ghost" size="sm" className="gap-2">
              View All
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="mb-4">You haven't registered for any events yet</p>
            <Link href="/dashboard/events">
              <Button>Browse Events</Button>
            </Link>
          </div>
        ) : (
          events.map((event: any) => (
            <div key={event.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-lg">{event.title}</h4>
                  <Badge variant="secondary">{event.category?.replace("-", " ")}</Badge>
                </div>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(event.start_date), "PPP")}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                </div>
                <Link href={`/dashboard/events/${event.id}`}>
                  <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
