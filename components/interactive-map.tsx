"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Navigation } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface Event {
  id: string
  title: string
  location: string
  latitude: number
  longitude: number
  start_date: string
  category: string
  description: string
}

interface InteractiveMapProps {
  events: Event[]
}

export function InteractiveMap({ events }: InteractiveMapProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }, [])

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "beach-cleanup": "bg-blue-500",
      "forest-restoration": "bg-green-500",
      "river-cleanup": "bg-cyan-500",
      "park-maintenance": "bg-emerald-500",
      "wildlife-conservation": "bg-amber-500",
      other: "bg-gray-500",
    }
    return colors[category] || colors.other
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const eventsWithDistance = events.map((event) => ({
    ...event,
    distance: userLocation
      ? calculateDistance(userLocation.lat, userLocation.lng, event.latitude, event.longitude)
      : null,
  }))

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Map placeholder - In production, integrate with Leaflet or Google Maps */}
      <Card className="lg:col-span-2 p-0 overflow-hidden">
        <div className="relative w-full h-[600px] bg-muted">
          {/* Simulated map visualization */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              {/* Background grid to simulate map */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />

              {/* User location marker */}
              {userLocation && (
                <div
                  className="absolute w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="absolute inset-0 rounded-full bg-blue-600 opacity-25 animate-ping" />
                </div>
              )}

              {/* Event markers - distributed around center */}
              {events.slice(0, 10).map((event, index) => {
                const angle = (index / events.length) * 2 * Math.PI
                const radius = 150 + Math.random() * 100
                const x = 50 + Math.cos(angle) * (radius / 6)
                const y = 50 + Math.sin(angle) * (radius / 6)

                return (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`absolute w-8 h-8 rounded-full border-2 border-white shadow-lg transition-all hover:scale-110 ${getCategoryColor(event.category)} ${
                      selectedEvent?.id === event.id ? "scale-125 ring-4 ring-primary/50" : ""
                    }`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <MapPin className="w-4 h-4 text-white mx-auto" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Map controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button size="icon" variant="secondary" className="shadow-lg">
              <Navigation className="w-4 h-4" />
            </Button>
          </div>

          {/* Map legend */}
          <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur p-4 rounded-lg shadow-lg">
            <div className="text-sm font-semibold mb-2">Event Categories</div>
            <div className="space-y-2">
              {[
                { category: "beach-cleanup", label: "Beach Cleanup" },
                { category: "forest-restoration", label: "Forest Restoration" },
                { category: "river-cleanup", label: "River Cleanup" },
              ].map((item) => (
                <div key={item.category} className="flex items-center gap-2 text-xs">
                  <div className={`w-3 h-3 rounded-full ${getCategoryColor(item.category)}`} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Selected event popup */}
          {selectedEvent && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 max-w-[90vw] pointer-events-none">
              <Card className="pointer-events-auto shadow-2xl">
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-lg">{selectedEvent.title}</h4>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                  <Badge className={getCategoryColor(selectedEvent.category)}>
                    {selectedEvent.category.replace("-", " ")}
                  </Badge>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(selectedEvent.start_date), "PPP")}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {selectedEvent.location}
                    </div>
                  </div>
                  <Link href={`/dashboard/events/${selectedEvent.id}`}>
                    <Button size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Card>

      {/* Events list sidebar */}
      <Card className="p-6">
        <h3 className="font-bold text-xl mb-4">Nearby Events</h3>
        <div className="space-y-3 max-h-[540px] overflow-y-auto">
          {eventsWithDistance
            .sort((a, b) => (a.distance || Number.POSITIVE_INFINITY) - (b.distance || Number.POSITIVE_INFINITY))
            .map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedEvent?.id === event.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${getCategoryColor(event.category)}`} />
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-sm line-clamp-1">{event.title}</h4>
                    <p className="text-xs text-muted-foreground">{event.location}</p>
                    {event.distance && (
                      <p className="text-xs text-primary font-medium">{event.distance.toFixed(1)} km away</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
        </div>
      </Card>
    </div>
  )
}
