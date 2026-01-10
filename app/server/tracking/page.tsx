'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  TrendingUp, 
  Award, 
  TreePine, 
  Recycle, 
  Droplets, 
  Calendar,
  Target,
  Activity,
  Download,
  Filter
} from 'lucide-react';

const supabase = createClient();

interface ParticipantTracking {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_email: string;
  total_events: number;
  events_attended: number;
  total_trees_planted: number;
  total_waste_collected: number;
  total_area_cleaned: number;
  total_carbon_saved: number;
  total_water_saved: number;
  total_plastic_saved: number;
  total_impact_score: number;
  impact_level: string;
  last_activity: string;
  certifications_earned: number;
  active_certifications: number;
}

interface EventTracking {
  id: string;
  event_title: string;
  event_date: string;
  event_type: string;
  location: string;
  total_participants: number;
  participants_attended: number;
  total_trees_planted: number;
  total_waste_collected: number;
  total_area_cleaned: number;
  total_impact_score: number;
  status: string;
  organizer_name: string;
}

interface CertificationTracking {
  id: string;
  certification_name: string;
  certification_type: string;
  participant_name: string;
  participant_email: string;
  issued_date: string;
  issued_by_name: string;
  achievement_criteria: string;
  is_active: boolean;
  expiry_date?: string;
}

export default function ServerTracking() {
  const [participants, setParticipants] = useState<ParticipantTracking[]>([]);
  const [events, setEvents] = useState<EventTracking[]>([]);
  const [certifications, setCertifications] = useState<CertificationTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchTrackingData();
  }, [filter, dateRange]);

  const fetchTrackingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch participant tracking data
      const { data: participantData, error: participantError } = await supabase
        .from('participant_impact_summary')
        .select('*')
        .order('total_impact_score', { ascending: false });

      if (participantError) throw participantError;

      // Fetch event tracking data
      const { data: eventData, error: eventError } = await supabase
        .from('event_tracking_summary')
        .select('*')
        .order('event_date', { ascending: false });

      if (eventError) throw eventError;

      // Fetch certification tracking data
      const { data: certificationData, error: certificationError } = await supabase
        .from('certification_tracking_summary')
        .select('*')
        .order('issued_date', { ascending: false });

      if (certificationError) throw certificationError;

      setParticipants(participantData || []);
      setEvents(eventData || []);
      setCertifications(certificationData || []);
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactLevelColor = (level: string) => {
    const colors = {
      bronze: 'bg-amber-100 text-amber-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      diamond: 'bg-purple-100 text-purple-800',
      platinum: 'bg-blue-100 text-blue-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      upcoming: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCertificationTypeColor = (type: string) => {
    const colors = {
      environmental_warrior: 'bg-green-100 text-green-800',
      tree_champion: 'bg-emerald-100 text-emerald-800',
      water_guardian: 'bg-blue-100 text-blue-800',
      carbon_hero: 'bg-gray-100 text-gray-800',
      plastic_free: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const exportData = (type: string) => {
    let data: any[] = [];
    let filename = '';
    
    switch(type) {
      case 'participants':
        data = participants;
        filename = 'participant-tracking.csv';
        break;
      case 'events':
        data = events;
        filename = 'event-tracking.csv';
        break;
      case 'certifications':
        data = certifications;
        filename = 'certification-tracking.csv';
        break;
    }

    if (data.length === 0) return;

    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map((row: any) => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const filteredParticipants = participants.filter(p => 
    p.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.participant_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalImpact = participants.reduce((acc, p) => acc + p.total_impact_score, 0);
  const totalTrees = participants.reduce((acc, p) => acc + p.total_trees_planted, 0);
  const totalWaste = participants.reduce((acc, p) => acc + p.total_waste_collected, 0);
  const activeEvents = events.filter(e => e.status === 'ongoing').length;
  const totalCertifications = certifications.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Tracking & Analytics</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportData('participants')}>
            <Download className="w-4 h-4 mr-2" />
            Export Participants
          </Button>
          <Button variant="outline" onClick={() => exportData('events')}>
            <Download className="w-4 h-4 mr-2" />
            Export Events
          </Button>
          <Button variant="outline" onClick={() => exportData('certifications')}>
            <Download className="w-4 h-4 mr-2" />
            Export Certifications
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participants.length}</div>
            <p className="text-xs text-muted-foreground">Active participants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impact Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpact.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Combined impact points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEvents}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certifications Issued</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCertifications}</div>
            <p className="text-xs text-muted-foreground">Total certifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Environmental Impact Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trees Planted</CardTitle>
            <TreePine className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalTrees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total trees planted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waste Collected</CardTitle>
            <Recycle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalWaste.toLocaleString()} kg</div>
            <p className="text-xs text-muted-foreground">Total waste collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Area Cleaned</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {participants.reduce((acc, p) => acc + p.total_area_cleaned, 0).toLocaleString()} m²
            </div>
            <p className="text-xs text-muted-foreground">Total area cleaned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Impact Score</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {participants.length > 0 ? Math.round(totalImpact / participants.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Average per participant</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tracking Tables */}
      <Tabs defaultValue="participants" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        {/* Participants Tab */}
        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Participant Tracking</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search participants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="diamond">Diamond</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredParticipants.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No participants found</p>
                ) : (
                  filteredParticipants.map((participant) => (
                    <div key={participant.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{participant.participant_name}</h3>
                          <p className="text-sm text-gray-600">{participant.participant_email}</p>
                          <p className="text-xs text-gray-500">Last activity: {new Date(participant.last_activity).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge className={getImpactLevelColor(participant.impact_level)}>
                            {participant.impact_level.toUpperCase()}
                          </Badge>
                          <div className="text-lg font-bold">{participant.total_impact_score}</div>
                          <p className="text-xs text-gray-500">Impact Score</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Events:</span>
                          <p className="text-gray-600">{participant.events_attended}/{participant.total_events}</p>
                        </div>
                        <div>
                          <span className="font-medium">Trees:</span>
                          <p className="text-gray-600">{participant.total_trees_planted}</p>
                        </div>
                        <div>
                          <span className="font-medium">Waste:</span>
                          <p className="text-gray-600">{participant.total_waste_collected} kg</p>
                        </div>
                        <div>
                          <span className="font-medium">Certifications:</span>
                          <p className="text-gray-600">{participant.certifications_earned}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No events found</p>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{event.event_title}</h3>
                          <p className="text-sm text-gray-600">by {event.organizer_name}</p>
                          <p className="text-sm text-gray-600">{event.location}</p>
                          <p className="text-xs text-gray-500">{new Date(event.event_date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge className={getStatusColor(event.status)}>
                            {event.status.toUpperCase()}
                          </Badge>
                          <div className="text-lg font-bold">{event.total_impact_score}</div>
                          <p className="text-xs text-gray-500">Impact Score</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Participants:</span>
                          <p className="text-gray-600">{event.participants_attended}/{event.total_participants}</p>
                        </div>
                        <div>
                          <span className="font-medium">Trees:</span>
                          <p className="text-gray-600">{event.total_trees_planted}</p>
                        </div>
                        <div>
                          <span className="font-medium">Waste:</span>
                          <p className="text-gray-600">{event.total_waste_collected} kg</p>
                        </div>
                        <div>
                          <span className="font-medium">Area:</span>
                          <p className="text-gray-600">{event.total_area_cleaned} m²</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certification Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certifications.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No certifications found</p>
                ) : (
                  certifications.map((cert) => (
                    <div key={cert.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{cert.certification_name}</h3>
                          <p className="text-sm text-gray-600">Issued to: {cert.participant_name}</p>
                          <p className="text-sm text-gray-600">Email: {cert.participant_email}</p>
                          <p className="text-sm text-gray-600">Issued by: {cert.issued_by_name}</p>
                          <p className="text-xs text-gray-500">Issued: {new Date(cert.issued_date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge className={getCertificationTypeColor(cert.certification_type)}>
                            {cert.certification_type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {cert.is_active ? (
                            <Badge className="bg-green-100 text-green-800">ACTIVE</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">INACTIVE</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-sm">Achievement Criteria:</span>
                        <p className="text-gray-600 text-sm mt-1">{cert.achievement_criteria}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
