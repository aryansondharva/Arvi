"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Clock, Users, MapPin, Phone, Mail, Calendar, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface CreateEventFormProps {
  userId: string
}

interface EventFormData {
  title: string
  description: string
  location: string
  category: string
  difficulty: string
  start_date: string
  start_time: string
  end_time: string
  max_participants: string
  min_participants: string
  registration_deadline: string
  registration_deadline_date: string
  registration_deadline_time: string
  timezone: string
  contact_email: string
  contact_phone: string
  requirements: string[]
  what_to_bring: string[]
  age_restriction: string
  is_virtual: boolean
  meeting_point: string
  transportation_info: string
  waiver_required: boolean
  tags: string[]
}

export function CreateEventForm({ userId }: CreateEventFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    location: "",
    category: "beach-cleanup",
    difficulty: "beginner",
    start_date: "",
    start_time: "",
    end_time: "",
    max_participants: "",
    min_participants: "1",
    registration_deadline: "",
    registration_deadline_date: "",
    registration_deadline_time: "",
    timezone: "Asia/Kolkata",
    contact_email: "",
    contact_phone: "",
    requirements: [],
    what_to_bring: [],
    age_restriction: "",
    is_virtual: false,
    meeting_point: "",
    transportation_info: "",
    waiver_required: true,
    tags: []
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      setFormData((prev: any) => ({
        ...prev,
        [name]: checkbox.checked,
      }))
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleArrayChange = (name: keyof EventFormData, value: string) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [name]: [...prev[name], value.trim()],
      }))
    }
  }

  const handleRemoveFromArray = (name: keyof EventFormData, index: number) => {
    setFormData((prev) => {
      const array = [...prev[name]]
      array.splice(index, 1)
      return {
        ...prev,
        [name]: array,
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Combine date and time with timezone
      const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`)
      const endDateTime = new Date(`${formData.start_date}T${formData.end_time}`)
      const registrationDeadlineDate = formData.registration_deadline_date ? new Date(formData.registration_deadline_date) : null
      const registrationDeadlineTime = formData.registration_deadline_time || '00:00'

      const { data, error } = await supabase
        .from("events")
        .insert({
          organizer_id: userId,
          title: formData.title,
          description: formData.description,
          location: formData.location,
          category: formData.category,
          difficulty: formData.difficulty,
          start_date: startDateTime.toISOString(),
          end_date: endDateTime.toISOString(),
          max_participants: formData.max_participants ? Number.parseInt(formData.max_participants) : null,
          min_participants: Number.parseInt(formData.min_participants),
          registration_deadline: registrationDeadline?.toISOString(),
          timezone: formData.timezone,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          requirements: formData.requirements.length > 0 ? formData.requirements : null,
          what_to_bring: formData.what_to_bring.length > 0 ? formData.what_to_bring : null,
          age_restriction: formData.age_restriction || null,
          is_virtual: formData.is_virtual,
          meeting_point: formData.meeting_point || null,
          transportation_info: formData.transportation_info || null,
          waiver_required: formData.waiver_required,
          tags: formData.tags.length > 0 ? formData.tags : null,
          status: "upcoming",
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Event Created!",
        description: "Your event has been successfully created",
      })

      router.push(`/dashboard/events/${data.id}`)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title*</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Beach Cleanup at Santa Monica"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description*</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your event, what to bring, and what to expect..."
              value={formData.description}
              onChange={handleChange}
              rows={5}
              required
              disabled={loading}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category*</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beach-cleanup">Beach Cleanup</SelectItem>
                  <SelectItem value="forest-restoration">Forest Restoration</SelectItem>
                  <SelectItem value="river-cleanup">River Cleanup</SelectItem>
                  <SelectItem value="park-maintenance">Park Maintenance</SelectItem>
                  <SelectItem value="wildlife-conservation">Wildlife Conservation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level*</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, difficulty: value }))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location*</Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g., Santa Monica Beach, Los Angeles, CA"
              value={formData.location}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Date*</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time*</Label>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                value={formData.start_time}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time*</Label>
              <Input
                id="end_time"
                name="end_time"
                type="time"
                value={formData.end_time}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_participants">Maximum Participants (Optional)</Label>
            <Input
              id="max_participants"
              name="max_participants"
              type="number"
              placeholder="Leave blank for unlimited"
              value={formData.max_participants}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_participants">Minimum Participants*</Label>
              <Input
                id="min_participants"
                name="min_participants"
                type="number"
                placeholder="1"
                value={formData.min_participants}
                onChange={handleChange}
                required
                disabled={loading}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_deadline">Registration Deadline (Optional)</Label>
              <Input
                id="registration_deadline"
                name="registration_deadline"
                type="datetime-local"
                value={formData.registration_deadline}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone*</Label>
            <Select
              value={formData.timezone}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, timezone: value }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Kolkata">Kolkata (IST)</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">New York (EST)</SelectItem>
                <SelectItem value="Europe/London">London (GMT)</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                <SelectItem value="Australia/Sydney">Sydney (AEDT)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              placeholder="organizer@example.com"
              value={formData.contact_email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input
              id="contact_phone"
              name="contact_phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.contact_phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age_restriction">Age Restriction (Optional)</Label>
            <Input
              id="age_restriction"
              name="age_restriction"
              placeholder="e.g., 18+, 13-17, All ages"
              value={formData.age_restriction}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting_point">Meeting Point (Optional)</Label>
            <Input
              id="meeting_point"
              name="meeting_point"
              placeholder="e.g., Main entrance, Parking lot A"
              value={formData.meeting_point}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transportation_info">Transportation Information (Optional)</Label>
            <Textarea
              id="transportation_info"
              name="transportation_info"
              placeholder="Provide details about transportation options..."
              value={formData.transportation_info}
              onChange={handleChange}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Requirements</Label>
            <div className="space-y-2">
              <Input
                placeholder="Add a requirement (e.g., Wear closed shoes)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleArrayChange('requirements', (e.target as HTMLInputElement).value)
                    ;(e.target as HTMLInputElement).value = ''
                  }
                }}
                disabled={loading}
              />
              <div className="flex flex-wrap gap-2">
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm">
                    {req}
                    <button
                      type="button"
                      onClick={() => handleRemoveFromArray('requirements', index)}
                      className="text-destructive hover:text-destructive/80"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>What to Bring</Label>
            <div className="space-y-2">
              <Input
                placeholder="Add an item (e.g., Water bottle, Gloves)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleArrayChange('what_to_bring', (e.target as HTMLInputElement).value)
                    ;(e.target as HTMLInputElement).value = ''
                  }
                }}
                disabled={loading}
              />
              <div className="flex flex-wrap gap-2">
                {formData.what_to_bring.map((item, index) => (
                  <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm">
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveFromArray('what_to_bring', index)}
                      className="text-destructive hover:text-destructive/80"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="space-y-2">
              <Input
                placeholder="Add a tag (e.g., environment, community)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleArrayChange('tags', (e.target as HTMLInputElement).value)
                    ;(e.target as HTMLInputElement).value = ''
                  }
                }}
                disabled={loading}
              />
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded text-sm">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveFromArray('tags', index)}
                      className="text-destructive hover:text-destructive/80"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_virtual"
              checked={formData.is_virtual}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_virtual: checked }))}
              disabled={loading}
            />
            <Label htmlFor="is_virtual">Virtual Event</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="waiver_required"
              checked={formData.waiver_required}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, waiver_required: checked }))}
              disabled={loading}
            />
            <Label htmlFor="waiver_required">Liability Waiver Required</Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} size="lg" className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Event...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              size="lg"
              className="bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
