import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Mail, MapPin, Calendar, Award, Settings } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in to view your profile.</div>
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Get user stats
  const { data: stats } = await supabase
    .from("leaderboard")
    .select("*")
    .eq("user_id", user.id)
    .single()

  // Get user achievements
  const { data: achievements } = await supabase
    .from("user_achievements")
    .select("*, achievements(*)")
    .eq("user_id", user.id)

  // Get user certifications
  const { data: certifications } = await supabase
    .from("participant_certifications")
    .select("*")
    .eq("participant_id", user.id)
    .order("issued_date", { ascending: false })
    .limit(10)

  // Get recent impact
  const { data: recentImpact } = await supabase
    .from("impact_logs")
    .select("*, events(title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

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
            <h1 className="text-4xl font-bold">My Profile</h1>
            <p className="text-muted-foreground text-lg">Manage your account and view your impact</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{profile?.full_name || 'Eco-Warrior'}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                  {profile?.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Joined {format(new Date(profile?.joined_at || user.created_at), "PPP")}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Stats Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Impact Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats?.total_points || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats?.events_attended || 0}</div>
                    <div className="text-sm text-muted-foreground">Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats?.waste_collected_kg || 0}kg</div>
                    <div className="text-sm text-muted-foreground">Waste</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats?.trees_planted || 0}</div>
                    <div className="text-sm text-muted-foreground">Trees</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Achievements
                </CardTitle>
                <CardDescription>Badges and milestones you've earned</CardDescription>
              </CardHeader>
              <CardContent>
                {achievements && achievements.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {achievements.map((achievement: any) => (
                      <div key={achievement.id} className="text-center p-4 border rounded-lg">
                        <div className="text-2xl mb-2">{achievement.achievements?.icon || '🏆'}</div>
                        <h4 className="font-semibold text-sm">{achievement.achievements?.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {achievement.achievements?.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No achievements yet. Start participating in events to earn badges!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    My Certifications
                  </CardTitle>
                  <Link href="/certifications/upload">
                    <Button variant="outline" size="sm">
                      Upload New
                    </Button>
                  </Link>
                </div>
                <CardDescription>Your environmental certifications and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                {certifications && certifications.length > 0 ? (
                  <div className="space-y-4">
                    {certifications.map((cert: any) => (
                      <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Award className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{cert.certification_name}</h4>
                              <p className="text-sm text-muted-foreground">{cert.certification_type}</p>
                              <p className="text-xs text-muted-foreground">
                                Issued: {format(new Date(cert.issued_date), "PPP")}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={cert.is_active ? "default" : "secondary"}>
                            {cert.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {cert.certificate_url && (
                            <Link href={cert.certificate_url} target="_blank">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-4">No certifications yet.</p>
                    <div className="space-y-2">
                      <p className="text-sm">Upload your environmental certifications to showcase your achievements.</p>
                      <Link href="/certifications/upload">
                        <Button>Upload First Certificate</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest environmental contributions</CardDescription>
              </CardHeader>
              <CardContent>
                {recentImpact && recentImpact.length > 0 ? (
                  <div className="space-y-4">
                    {recentImpact.map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{log.events?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {log.waste_collected_kg > 0 && `${log.waste_collected_kg}kg waste • `}
                            {log.trees_planted > 0 && `${log.trees_planted} trees • `}
                            {log.area_cleaned_sqm > 0 && `${log.area_cleaned_sqm}m² cleaned`}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(log.created_at), "PP")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No recent activity. Join an event to start making an impact!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
