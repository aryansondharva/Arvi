import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, ArrowLeft, Filter, Search } from "lucide-react"
import Link from "next/link"

export default async function MapPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in to view the map.</div>
  }

  // Get all upcoming events
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .gte("start_date", new Date().toISOString())
    .order("start_date", { ascending: true })
    .limit(50)

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
            <h1 className="text-4xl font-bold">Event Map</h1>
            <p className="text-muted-foreground text-lg">Find environmental events near you</p>
          </div>
        </div>

        {/* Map Controls */}
        <div className="flex gap-4 flex-wrap">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter Events
          </Button>
          <Button variant="outline">
            <Search className="w-4 h-4 mr-2" />
            Search Location
          </Button>
        </div>

        {/* Interactive Map */}
        <Card className="h-96">
          <CardContent className="p-0 h-full">
            <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center space-y-4">
                <MapPin className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Interactive Map</h3>
                  <p className="text-muted-foreground">Map functionality coming soon</p>
                </div>
                <div className="text-sm text-muted-foreground max-w-md">
                  {events?.length || 0} events found near your location
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event List */}
        <Card>
          <CardHeader>
            <CardTitle>Nearby Events</CardTitle>
            <CardDescription>Events happening in your area</CardDescription>
          </CardHeader>
          <CardContent>
            {events && events.length > 0 ? (
              <div className="space-y-4">
                {events.slice(0, 5).map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Link href={`/dashboard/events/${event.id}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming events found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
