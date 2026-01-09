import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if profile exists, create if not
      const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle()

      if (!existingProfile) {
        // Create profile for OAuth user
        await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || "User",
          avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
        })

        // Initialize leaderboard entry
        await supabase.from("leaderboard").insert({
          user_id: data.user.id,
          total_points: 0,
          events_attended: 0,
          waste_collected_kg: 0,
          trees_planted: 0,
        })
      }
    }
  }

  // Redirect to dashboard
  return NextResponse.redirect(`${origin}/dashboard`)
}
