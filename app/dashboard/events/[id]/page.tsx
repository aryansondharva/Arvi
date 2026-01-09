import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { EventDetails } from "@/components/event-details"

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch event details
  const { data: event, error } = await supabase
    .from("events")
    .select("*, profiles(full_name, avatar_url, email)")
    .eq("id", id)
    .single()

  if (error || !event) {
    notFound()
  }

  // Fetch participants
  const { data: participants } = await supabase
    .from("event_participants")
    .select("*, profiles(full_name, avatar_url)")
    .eq("event_id", id)
    .eq("status", "registered")

  // Check if user is registered
  const { data: userRegistration } = await supabase
    .from("event_participants")
    .select("*")
    .eq("event_id", id)
    .eq("user_id", user.id)
    .single()

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={profile} />
      <EventDetails event={event} participants={participants || []} userRegistration={userRegistration} user={user} />
    </div>
  )
}
