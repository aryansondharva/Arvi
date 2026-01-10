"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Recycle, MapPin, Calendar, TrendingUp, Award, Bell, User, LogOut, PlusCircle, Fingerprint } from "lucide-react"
import { formatMemberId } from "@/lib/utils"

interface DashboardNavProps {
  user: any
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: TrendingUp },
    { href: "/dashboard/events", label: "Events", icon: Calendar },
    { href: "/dashboard/map", label: "Map", icon: MapPin },
    { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Award },
  ]

  const handleLogout = async () => {
    await fetch("/auth/logout", { method: "POST" })
    window.location.href = "/"
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <img 
                src="/a2.png" 
                alt="Arvi Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-xl font-bold hidden sm:inline">Arvi</span>
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img 
              src="/a2.png" 
              alt="Arvi Logo" 
              className="w-8 h-8 rounded-lg"
            />
            <span className="text-xl font-bold hidden sm:inline">Arvi</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button variant={isActive ? "secondary" : "ghost"} size="sm" className="gap-2">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/events/create">
            <Button size="sm" className="gap-2">
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Create Event</span>
            </Button>
          </Link>

          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={user?.avatar_url || undefined} alt={user?.full_name || ''} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Fingerprint className="w-3 h-3" />
                    <span className="font-mono">{formatMemberId(user?.unique_member_id || '')}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
