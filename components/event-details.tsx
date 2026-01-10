"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, Clock, Users, Share2, CheckCircle2, Loader2, Edit } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface EventDetailsProps {
  event: any
  participants: any[]
  userRegistration: any
  user: any
  isOrganizer?: boolean
}

export function EventDetails({ event, participants, userRegistration, user, isOrganizer = false }: EventDetailsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(!!userRegistration)

  const handleRegister = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      if (isRegistered) {
        // Unregister
        const { error } = await supabase
          .from("event_participants")
          .delete()
          .eq("event_id", event.id)
          .eq("user_id", user.id)

        if (error) throw error

        toast({
          title: "Unregistered",
          description: "You've been removed from this event",
        })
        setIsRegistered(false)
      } else {
        // Register
        const { error } = await supabase.from("event_participants").insert({
          event_id: event.id,
          user_id: user.id,
          status: "registered",
        })

        if (error) throw error

        toast({
          title: "Successfully Registered!",
          description: "You've been added to this event",
        })
        setIsRegistered(true)
      }

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link Copied",
        description: "Event link copied to clipboard",
      })
    }
  }

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
    <main className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8">
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Badge className={getCategoryColor(event.category)}>{event.category.replace("-", " ")}</Badge>
                    <h1 className="text-4xl font-bold">{event.title}</h1>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOrganizer && (
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/events/${event.id}/edit`)} className="bg-transparent">
                        <Edit className="w-4 h-4" />
                        Edit Event
                      </Button>
                    )}
                    <Button variant="outline" size="icon" onClick={handleShare} className="bg-transparent">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Key details */}
                <div className="grid sm:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm">Date</div>
                      <div className="font-semibold text-foreground">{format(new Date(event.start_date), "PPP")}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <div className="text-sm">Time</div>
                      <div className="font-semibold text-foreground">
                        {format(new Date(event.start_date), "p")} - {format(new Date(event.end_date), "p")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="text-sm">Location</div>
                      <div className="font-semibold text-foreground">{event.location}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm">Participants</div>
                      <div className="font-semibold text-foreground">
                        {participants.length} {event.max_participants ? `/ ${event.max_participants}` : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">About This Event</h3>
                <p className="text-muted-foreground leading-relaxed">{event.description}</p>
              </div>

              <Separator />

              {/* Organizer */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Organized By</h3>
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={event.profiles?.avatar_url || "/placeholder.svg"}
                      alt={event.profiles?.full_name}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {event.profiles?.full_name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{event.profiles?.full_name}</div>
                    <div className="text-sm text-muted-foreground">{event.profiles?.email}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration card */}
          <Card className="p-6 sticky top-24">
            <div className="space-y-4">
              {isRegistered ? (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-primary/10 text-primary">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">You're Registered</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="font-bold text-2xl">Join This Event</h3>
                  <p className="text-sm text-muted-foreground">Make a difference in your community</p>
                </div>
              )}

              <Button className="w-full" size="lg" onClick={handleRegister} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : isRegistered ? (
                  "Unregister"
                ) : (
                  "Register Now"
                )}
              </Button>

              {event.difficulty && (
                <div className="pt-2">
                  <div className="text-sm text-muted-foreground mb-1">Difficulty Level</div>
                  <Badge variant="outline">{event.difficulty}</Badge>
                </div>
              )}
            </div>
          </Card>

          {/* Participants list */}
          {participants.length > 0 && (
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Participants ({participants.length})</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {participants.slice(0, 10).map((participant: any) => (
                  <div key={participant.id} className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={participant.profiles?.avatar_url || "/placeholder.svg"}
                        alt={participant.profiles?.full_name}
                      />
                      <AvatarFallback className="bg-muted">
                        {participant.profiles?.full_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{participant.profiles?.full_name || "Anonymous"}</span>
                  </div>
                ))}
                {participants.length > 10 && (
                  <div className="text-sm text-muted-foreground text-center pt-2">
                    And {participants.length - 10} more...
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
