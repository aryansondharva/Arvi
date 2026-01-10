import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, ArrowLeft, Share2, Clock } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { notFound } from "next/navigation"

interface EventPageProps {
  params: { id: string }
}

export default async function EventPage({ params }: EventPageProps) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in to view event details.</div>
  }

  // Get event details with participant count
  const { data: event, error } = await supabase
    .from("events")
    .select(`
      *,
      event_participants!inner(count)
    `)
    .eq("id", id)
    .single()

  if (error || !event) {
    notFound()
  }

  // Get actual participant count
  const { data: participants } = await supabase
    .from("event_participants")
    .select("id")
    .eq("event_id", id)
    .eq("status", "registered")

  const participantCount = participants?.length || 0

  // Check if user is registered for this event
  const { data: registration } = await supabase
    .from("event_participants")
    .select("*")
    .eq("user_id", user.id)
    .eq("event_id", id)
    .eq("status", "registered")
    .single()

  const isRegistered = !!registration
  const isPast = new Date(event.start_date) < new Date()
  const isFull = participantCount >= event.max_participants

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/events">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold">{event.title}</h1>
            <p className="text-muted-foreground text-lg">{event.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            {event.image_url && (
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img 
                      src={event.image_url} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Date</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(event.start_date), "PPP")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Time</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(event.start_date), "p")} - {format(new Date(event.end_date), "p")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Location</div>
                      <div className="text-sm text-muted-foreground">{event.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Participants</div>
                      <div className="text-sm text-muted-foreground">
                        {participantCount} / {event.max_participants}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">Category:</span>
                    <Badge variant="secondary">{event.category?.replace("-", " ") || "Environmental"}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Difficulty:</span>
                    <Badge variant="outline">{event.difficulty || "Moderate"}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p>{event.description || "Join us for this meaningful environmental event where we'll work together to make a positive impact on our community and planet."}</p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>What to Bring</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>• Comfortable clothing and closed-toe shoes</li>
                  <li>• Water bottle and snacks</li>
                  <li>• Sunscreen and hat</li>
                  <li>• Gloves (if you have them)</li>
                  <li>• Enthusiasm and positive attitude!</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card>
              <CardHeader>
                <CardTitle>Join This Event</CardTitle>
                <CardDescription>
                  {isPast ? "This event has already ended" : 
                   isRegistered ? "You're registered for this event" : 
                   isFull ? "This event is full" : 
                   "Register to participate"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isRegistered ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <div className="text-green-800 font-medium">✓ Registered</div>
                      <div className="text-sm text-green-600 mt-1">You're all set for this event!</div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Event
                    </Button>
                  </div>
                ) : isPast ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-gray-600">This event has ended</div>
                  </div>
                ) : isFull ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <div className="text-red-600">Event is full</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button className="w-full" size="lg">
                      Register Now
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Event
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Event Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Event Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Spots Available</span>
                  <span className="font-medium">{Math.max(0, event.max_participants - participantCount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="font-medium">
                    {Math.round((new Date(event.end_date).getTime() - new Date(event.start_date).getTime()) / (1000 * 60 * 60))} hours
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Impact Score</span>
                  <span className="font-medium">{event.impact_score || 50} points</span>
                </div>
              </CardContent>
            </Card>

            {/* Organizer */}
            <Card>
              <CardHeader>
                <CardTitle>Event Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">EcoVolunteer Team</div>
                    <div className="text-sm text-muted-foreground">Environmental Organization</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
