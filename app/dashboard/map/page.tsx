import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { InteractiveMap } from "@/components/interactive-map"

export default async function MapPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch all events with location data
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("status", "upcoming")
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .gte("start_date", new Date().toISOString())

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={profile} />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Event Map</h1>
          <p className="text-muted-foreground text-lg">Discover cleanup events happening around you</p>
        </div>

        <InteractiveMap events={events || []} />
      </main>
    </div>
  )
}
