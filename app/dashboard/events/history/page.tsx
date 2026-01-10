import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, CheckCircle, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default async function EventsHistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in to view your event history.</div>
  }

  // Get user's completed events (events that have ended and user attended)
  const { data: completedEvents } = await supabase
    .from("event_participants")
    .select("event_id, events(*)")
    .eq("user_id", user.id)
    .in("status", ["attended", "registered"]) // Include both attended and registered for flexibility
    .lt("events.end_date", new Date().toISOString()) // Events that have ended
    .order("events.end_date", { ascending: false }) // Most recent first
    .limit(20)

  const events =
    completedEvents
      ?.map((reg: any) => reg.events)
      .filter(Boolean) || []

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
            <h1 className="text-4xl font-bold">Event History</h1>
            <p className="text-muted-foreground text-lg">Your completed environmental events</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Completed Events
            </CardTitle>
            <CardDescription>
              Events you participated in that have ended
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventsWithCounts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No completed events yet</h3>
                <p className="mb-6">You haven't participated in any events that have ended.</p>
                <Link href="/dashboard/events">
                  <Button>Browse Events</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {eventsWithCounts.map((event: any) => (
                  <div key={event.id} className="flex gap-4 p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-xl">{event.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">
                            COMPLETED
                          </Badge>
                          <Badge variant="secondary">{event.category?.replace("-", " ")}</Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Ended: {format(new Date(event.end_date), "PPP")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{event.participantCount || 0} participants</span>
                        </div>
                      </div>

                      {event.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs text-muted-foreground">
                          Event duration: {format(new Date(event.start_date), "PPP")} - {format(new Date(event.end_date), "PPP")}
                        </div>
                        <Link href={`/dashboard/events/${event.id}`}>
                          <Button size="sm" variant="outline" className="bg-transparent">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
