import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, MapPin, Users, Clock } from "lucide-react"
import Link from "next/link"

export default async function CreateEventPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in to create an event.</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/events">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold">Create Event</h1>
            <p className="text-muted-foreground text-lg">Organize a new environmental cleanup event</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Event Creation Form</h3>
            <p className="text-muted-foreground mb-6">
              The event creation form is coming soon! You'll be able to create and manage environmental events here.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location Details
                  </h4>
                  <p className="text-sm text-muted-foreground">Set event location, meeting point, and area details</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date & Time
                  </h4>
                  <p className="text-sm text-muted-foreground">Schedule event date, duration, and registration deadline</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Participants
                  </h4>
                  <p className="text-sm text-muted-foreground">Set participant limits and requirements</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Event Details
                  </h4>
                  <p className="text-sm text-muted-foreground">Add description, requirements, and what to bring</p>
                </div>
              </div>
              
              <div className="pt-4">
                <Link href="/dashboard/events">
                  <Button>Browse Existing Events</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
