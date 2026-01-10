import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Search, Filter, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default async function EventsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in to view events.</div>
  }

  // Get all upcoming events with participant counts
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select(`
      *,
      event_participants!inner(count)
    `)
    .gte("start_date", new Date().toISOString())
    .order("start_date", { ascending: true })
    .limit(20)

  // Get user's registered events
  const { data: registeredEvents } = await supabase
    .from("event_participants")
    .select("event_id")
    .eq("user_id", user.id)
    .eq("status", "registered")

  const registeredEventIds = registeredEvents?.map((reg: any) => reg.event_id) || []

  // Get participant counts for each event
  const eventsWithCounts = await Promise.all(
    (upcomingEvents || []).map(async (event: any) => {
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
            <h1 className="text-4xl font-bold">Environmental Events</h1>
            <p className="text-muted-foreground text-lg">Discover and join environmental cleanup events</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 flex-wrap">
          <Link href="/dashboard/events/history">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              My Event History
            </Button>
          </Link>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter Events
          </Button>
          <Button variant="outline">
            <Search className="w-4 h-4 mr-2" />
            Search Events
          </Button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventsWithCounts.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No upcoming events</h3>
                  <p className="text-muted-foreground mb-6">
                    There are no upcoming environmental events at the moment. Check back soon!
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      You can also check your <Link href="/dashboard/events/history" className="text-primary hover:underline">event history</Link> to see past events you've participated in.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            eventsWithCounts.map((event: any) => {
              const isRegistered = registeredEventIds.includes(event.id)
              const isPast = new Date(event.start_date) < new Date()
              
              return (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {event.description || "Join us for this environmental event"}
                        </CardDescription>
                      </div>
                      <Badge variant={isRegistered ? "default" : "secondary"}>
                        {isRegistered ? "Registered" : event.category?.replace("-", " ") || "Environmental"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{format(new Date(event.start_date), "PPP")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{event.participantCount || 0} participants</span>
                      </div>
                    </div>

                    {event.image_url && (
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={event.image_url} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link href={`/dashboard/events/${event.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          {isRegistered ? "View Details" : "Learn More"}
                        </Button>
                      </Link>
                      {!isRegistered && !isPast && (
                        <Button size="sm" variant="outline">
                          Register
                        </Button>
                      )}
                    </div>

                    {isRegistered && (
                      <div className="text-xs text-green-600 font-medium text-center">
                        ✓ You are registered for this event
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Event Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Event Categories</CardTitle>
            <CardDescription>Browse events by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Beach Cleanup", icon: "🏖️", count: 0 },
                { name: "Tree Planting", icon: "🌳", count: 0 },
                { name: "Waste Management", icon: "♻️", count: 0 },
                { name: "River Cleanup", icon: "🌊", count: 0 },
                { name: "Park Restoration", icon: "🌲", count: 0 },
                { name: "Community Garden", icon: "🌻", count: 0 },
                { name: "Recycling Drive", icon: "♻️", count: 0 },
                { name: "Education Workshop", icon: "📚", count: 0 }
              ].map((category) => (
                <Link key={category.name} href={`/dashboard/events?category=${category.name.toLowerCase().replace(" ", "-")}`}>
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <div className="font-medium text-sm">{category.name}</div>
                      <div className="text-xs text-muted-foreground">{category.count} events</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
