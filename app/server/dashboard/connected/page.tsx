'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  Award, 
  TreePine, 
  Recycle, 
  Calendar,
  Target,
  Activity,
  Shield,
  Settings,
  BarChart3,
  FileText,
  Database
} from 'lucide-react';

const supabase = createClient();

export default function ConnectedServerDashboard() {
  const [serverUser, setServerUser] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkServerUser();
    fetchDashboardData();
  }, []);

  const checkServerUser = () => {
    const storedUser = localStorage.getItem('serverUser');
    if (storedUser) {
      setServerUser(JSON.parse(storedUser));
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch participant summary
      const { data: participantData, error: participantError } = await supabase
        .from('participant_impact_summary')
        .select('*')
        .limit(10);

      if (participantError) throw participantError;
      setParticipants(participantData || []);

      // Fetch event summary
      const { data: eventData, error: eventError } = await supabase
        .from('event_tracking_summary')
        .select('*')
        .limit(10);

      if (eventError) throw eventError;
      setEvents(eventData || []);

      // Fetch certification summary
      const { data: certificationData, error: certificationError } = await supabase
        .from('certification_tracking_summary')
        .select('*')
        .limit(10);

      if (certificationError) throw certificationError;
      setCertifications(certificationData || []);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
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

  const totalImpact = participants.reduce((acc, p) => acc + (p.total_impact_score || 0), 0);
  const totalTrees = participants.reduce((acc, p) => acc + (p.total_trees_planted || 0), 0);
  const totalWaste = participants.reduce((acc, p) => acc + (p.total_waste_collected || 0), 0);
  const activeEvents = events.filter(e => e.status === 'ongoing').length;
  const totalCertifications = certifications.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Database className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-600">Database Connection Error</h3>
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Shield className="w-8 h-8 text-green-600 mr-3" />
                <h1 className="text-xl font-bold text-gray-900">Connected Server Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{serverUser?.name || 'Server Admin'}</span>
              </div>
              <Badge className="bg-green-100 text-green-800">
                CONNECTED
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Database Connection Status */}
        <div className="mb-8 bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="font-medium text-green-900">Database Connected</h3>
              <p className="text-sm text-green-800">Real-time participant and event data loaded</p>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{participants.length}</div>
              <p className="text-xs text-muted-foreground">Connected participants</p>
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
              <CardTitle className="text-sm font-medium">Total Impact</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalImpact.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Impact points</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certifications</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCertifications}</div>
              <p className="text-xs text-muted-foreground">Issued total</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Participants */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Recent Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {participants.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No participants found</p>
                ) : (
                  participants.slice(0, 5).map((participant) => (
                    <div key={participant.participant_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{participant.participant_name}</h4>
                        <p className="text-sm text-gray-600">{participant.participant_email}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getImpactLevelColor(participant.impact_level)}>
                          {participant.impact_level?.toUpperCase()}
                        </Badge>
                        <div className="text-lg font-bold mt-1">{participant.total_impact_score}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No events found</p>
                ) : (
                  events.slice(0, 5).map((event) => (
                    <div key={event.event_id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{event.event_title}</h4>
                          <p className="text-sm text-gray-600">{event.organizer_name}</p>
                          <p className="text-xs text-gray-500">{new Date(event.event_date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge className={getStatusColor(event.status)}>
                            {event.status?.toUpperCase()}
                          </Badge>
                          <div className="text-lg font-bold">{event.total_impact_score}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Recent Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {certifications.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No certifications found</p>
              ) : (
                certifications.slice(0, 5).map((cert) => (
                  <div key={cert.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{cert.certification_name}</h4>
                        <p className="text-sm text-gray-600">Issued to: {cert.participant_name}</p>
                        <p className="text-xs text-gray-500">by {cert.issued_by_name}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={cert.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {cert.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{new Date(cert.issued_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <a href="/server/tracking">View Full Analytics</a>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <a href="/server/certifications/issue">Issue Certification</a>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <a href="/server/tasks">Manage Tasks</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generate Impact Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Export Participant Data
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Certification Summary
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Connection:</span>
                <Badge className="bg-green-100 text-green-800">ACTIVE</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tables:</span>
                <span className="text-sm text-green-600">4 Views Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Last Sync:</span>
                <span className="text-sm text-gray-600">Just now</span>
              </div>
              <Button className="w-full mt-4" variant="outline" onClick={fetchDashboardData}>
                <Database className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
