import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  MapPin,
  Users,
  TrendingUp,
  Award,
  Calendar,
  Recycle,
  TreePine,
  Droplets,
  Heart,
  ChevronRight,
  Sparkles,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/a2.png" 
              alt="Arvi Logo" 
              className="w-8 h-8 rounded-lg"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Arvi
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="#impact" className="text-sm font-medium hover:text-primary transition-colors">
              Impact
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/server/simple">
              <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
                Server Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="gap-2">
                Get Started
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Join 50,000+ Eco-Warriors Making a Difference
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
              Clean Up Our Planet,
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {" "}
                One Event at a Time
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground text-balance leading-relaxed max-w-3xl mx-auto">
              Discover local cleanup events, track your environmental impact with AI-powered analytics, and compete with
              friends on the leaderboard
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/auth/signup">
                <Button size="lg" className="gap-2 text-lg h-14 px-8">
                  Start Your Journey
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="gap-2 text-lg h-14 px-8 bg-transparent">
                  <MapPin className="w-5 h-5" />
                  Explore Events
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12">
              {[
                { value: "50K+", label: "Active Volunteers", icon: Users },
                { value: "2.5M kg", label: "Waste Collected", icon: Recycle },
                { value: "15K+", label: "Events Hosted", icon: Calendar },
                { value: "100K+", label: "Trees Planted", icon: TreePine },
              ].map((stat) => (
                <Card key={stat.label} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need to Make an Impact</h2>
            <p className="text-xl text-muted-foreground">
              Powerful features designed to help you organize, participate, and track your environmental contributions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: "Interactive Map",
                description:
                  "Find cleanup events near you with our real-time interactive map powered by location services",
                color: "text-primary",
              },
              {
                icon: Calendar,
                title: "Event Management",
                description: "Create, manage, and join environmental cleanup events with ease. RSVP tracking included",
                color: "text-secondary",
              },
              {
                icon: TrendingUp,
                title: "Impact Analytics",
                description:
                  "AI-powered analytics visualize your environmental impact with beautiful charts and insights",
                color: "text-accent",
              },
              {
                icon: Award,
                title: "Achievements & Badges",
                description: "Unlock achievements and earn badges as you complete events and reach milestones",
                color: "text-primary",
              },
              {
                icon: Users,
                title: "Global Leaderboard",
                description: "Compete with volunteers worldwide and climb the leaderboard by making a bigger impact",
                color: "text-secondary",
              },
              {
                icon: Sparkles,
                title: "AI Recommendations",
                description:
                  "Get personalized event suggestions based on your location, interests, and past participation",
                color: "text-accent",
              },
            ].map((feature) => (
              <Card key={feature.title} className="p-6 hover:shadow-xl transition-all hover:-translate-y-1">
                <feature.icon className={`w-12 h-12 mb-4 ${feature.color}`} />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Start Making a Difference Today</h2>
            <p className="text-xl text-muted-foreground">Join our community in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                icon: Users,
                title: "Create Your Profile",
                description: "Sign up and tell us about your environmental interests and location preferences",
              },
              {
                step: "02",
                icon: MapPin,
                title: "Find Local Events",
                description: "Browse the interactive map or get AI-powered recommendations for events near you",
              },
              {
                step: "03",
                icon: Heart,
                title: "Make an Impact",
                description: "Join events, log your contributions, and watch your impact grow on the leaderboard",
              },
            ].map((step, index) => (
              <div key={step.step} className="relative">
                <Card className="p-8 text-center h-full hover:shadow-xl transition-shadow">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                    {step.step}
                  </div>
                  <step.icon className="w-16 h-16 mx-auto mb-4 mt-4 text-primary" />
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </Card>
                {index < 2 && <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">Your Actions Create Real Change</h2>
            <p className="text-xl text-muted-foreground">
              Every cleanup event contributes to a healthier planet. Here's the collective impact of our community
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
              {[
                { icon: Recycle, value: "2.5M kg", label: "Waste Removed", color: "bg-primary/10 text-primary" },
                { icon: TreePine, value: "100K+", label: "Trees Planted", color: "bg-secondary/10 text-secondary" },
                { icon: Droplets, value: "50K km", label: "Rivers Cleaned", color: "bg-accent/10 text-accent" },
                { icon: Heart, value: "1M+ hrs", label: "Time Volunteered", color: "bg-primary/10 text-primary" },
              ].map((metric) => (
                <Card key={metric.label} className="p-6 hover:shadow-xl transition-all hover:scale-105">
                  <div
                    className={`w-14 h-14 rounded-full ${metric.color} flex items-center justify-center mx-auto mb-4`}
                  >
                    <metric.icon className="w-7 h-7" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{metric.value}</div>
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="p-12 md:p-16 text-center bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Ready to Join the Movement?</h2>
            <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto text-balance">
              Create your free account today and start making a measurable difference in your local community
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg" variant="secondary" className="gap-2 text-lg h-14 px-8">
                  Sign Up Free
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 text-lg h-14 px-8 border-primary-foreground/20 hover:bg-primary-foreground/10 text-primary-foreground bg-transparent"
                >
                  Already Have an Account?
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="/a2.png" 
                  alt="Arvi Logo" 
                  className="w-8 h-8 rounded-lg"
                />
                <span className="text-lg font-bold">Arvi</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Making environmental action accessible to everyone, everywhere.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Find Events
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Create Event
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Impact Analytics
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025 Arvi. All rights reserved. Built with 💚 for planet.
          </div>
        </div>
      </footer>
    </div>
  )
}
