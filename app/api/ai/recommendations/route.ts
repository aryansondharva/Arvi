import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { generateText } from "ai"

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch user data
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: stats } = await supabase.from("leaderboard").select("*").eq("user_id", user.id).single()

  const { data: impactLogs } = await supabase
    .from("impact_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get nearby events
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("status", "upcoming")
    .gte("start_date", new Date().toISOString())
    .limit(5)

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are an AI assistant for EcoVolunteer PRO, a platform connecting people with environmental cleanup events.

User Profile:
- Name: ${profile?.full_name}
- Location: ${profile?.location || "Not specified"}
- Events Attended: ${stats?.events_attended || 0}
- Waste Collected: ${stats?.waste_collected_kg || 0} kg
- Trees Planted: ${stats?.trees_planted || 0}
- Total Points: ${stats?.total_points || 0}

Recent Impact Logs: ${impactLogs?.length || 0} logs
Available Events: ${events?.length || 0} upcoming events

Generate 3-5 personalized recommendations to help this user maximize their environmental impact. Focus on:
1. Nearby events they should join
2. Ways to increase their impact metrics
3. Achievements they're close to unlocking
4. Consistency and participation patterns

Keep recommendations actionable, motivating, and specific. Format as a JSON array of objects with 'title' and 'description' fields.`,
    })

    return NextResponse.json({ recommendations: text })
  } catch (error) {
    console.error("AI recommendation error:", error)
    return NextResponse.json(
      {
        recommendations: JSON.stringify([
          {
            title: "Join More Events",
            description: "Increase your participation to unlock new achievements",
          },
          {
            title: "Track Your Impact",
            description: "Log your contributions after each event to see your progress",
          },
        ]),
      },
      { status: 200 },
    )
  }
}
