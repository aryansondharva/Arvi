'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Database,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Wrench,
  GraduationCap,
  Star,
  Clipboard
} from 'lucide-react';

const supabase = createClient();

export default function FullServerDashboard() {
  const [serverUser, setServerUser] = useState<any>(null);
  const [serverProfile, setServerProfile] = useState<any>(null);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [participantCerts, setParticipantCerts] = useState<any[]>([]);
  const [impactTracking, setImpactTracking] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [completedEvents, setCompletedEvents] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [compliance, setCompliance] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [training, setTraining] = useState<any[]>([]);
  const [financial, setFinancial] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkServerUser();
    fetchAllServerData();
    checkPendingCertificateReview();
  }, []);

  const checkServerUser = () => {
    const storedUser = localStorage.getItem('serverUser');
    if (storedUser) {
      setServerUser(JSON.parse(storedUser));
    }
  };

  const checkPendingCertificateReview = () => {
    const pendingReview = localStorage.getItem('pendingCertificateReview');
    if (pendingReview) {
      // Show notification about pending certificate review
      console.log('Pending certificate review:', pendingReview);
      // You can show a notification or banner here
      // For now, just log it and remove from localStorage
      localStorage.removeItem('pendingCertificateReview');
    }
  };

  const fetchAllServerData = async () => {
    try {
      // Get server user from localStorage
      const storedUser = localStorage.getItem('serverUser');
      const serverUser = storedUser ? JSON.parse(storedUser) : null;
      
      if (!serverUser) {
        throw new Error('Server user not found');
      }

      // Try to fetch server profile by email first, then fallback to user_id
      let profileData = null;
      let profileError = null;

      try {
        // Try contact_email approach
        const { data, error } = await supabase
          .from('server_profiles')
          .select('*')
          .eq('contact_email', serverUser.email)
          .single();
        profileData = data;
        profileError = error;
      } catch (e) {
        // If contact_email doesn't exist, try user_id approach
        const { data, error } = await supabase
          .from('server_profiles')
          .select('*')
          .eq('user_id', serverUser.id)
          .single();
        profileData = data;
        profileError = error;
      }

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      setServerProfile(profileData);

      const serverId = profileData?.id;

      // If no server profile found, create a mock one for demo
      if (!serverId) {
        console.log('No server profile found, using demo mode');
        setServerProfile({
          id: 'demo-server-id',
          server_name: 'Demo Server',
          server_type: 'waste_management',
          certification_level: 'platinum',
          license_number: 'DEMO-001',
          service_area: 'Demo Area',
          max_capacity: 100,
          is_active: true
        });
        setLoading(false);
        return;
      }

      // Fetch all 11 tables data using proper server ID with error handling
      const [
        serverCerts,
        participantCertData,
        impactData,
        tasksData,
        reviewsData,
        complianceData,
        equipmentData,
        trainingData,
        financialData,
        performanceData,
        eventData,
        completedEventData
      ] = await Promise.allSettled([
        supabase.from('server_certifications').select('*').eq('server_id', serverId).limit(10),
        supabase.from('participant_certifications').select('*').eq('issued_by', serverId).limit(10),
        supabase.from('server_impact_tracking').select('*').eq('server_id', serverId).limit(10),
        supabase.from('server_tasks').select('*').eq('server_id', serverId).limit(10),
        supabase.from('server_reviews').select('*').eq('server_id', serverId).limit(10),
        supabase.from('server_compliance_checks').select('*').eq('server_id', serverId).limit(10),
        supabase.from('server_equipment').select('*').eq('server_id', serverId).limit(10),
        supabase.from('server_training_records').select('*').eq('server_id', serverId).limit(10),
        supabase.from('server_financial_tracking').select('*').eq('server_id', serverId).limit(10),
        supabase.from('server_performance_metrics').select('*').eq('server_id', serverId).limit(10),
        supabase.from('events').select('*').eq('status', 'completed').order('end_date', { ascending: false }).limit(10),
        supabase.from('events').select('*').eq('status', 'completed').order('end_date', { ascending: false }).limit(10)
      ]);

      // Handle settled promises - get data if successful, empty array if failed
      setCertifications(serverCerts.status === 'fulfilled' ? serverCerts.value.data || [] : []);
      setParticipantCerts(participantCertData.status === 'fulfilled' ? participantCertData.value.data || [] : []);
      setImpactTracking(impactData.status === 'fulfilled' ? impactData.value.data || [] : []);
      setTasks(tasksData.status === 'fulfilled' ? tasksData.value.data || [] : []);
      setReviews(reviewsData.status === 'fulfilled' ? reviewsData.value.data || [] : []);
      setCompliance(complianceData.status === 'fulfilled' ? complianceData.value.data || [] : []);
      setEquipment(equipmentData.status === 'fulfilled' ? equipmentData.value.data || [] : []);
      setTraining(trainingData.status === 'fulfilled' ? trainingData.value.data || [] : []);
      setFinancial(financialData.status === 'fulfilled' ? financialData.value.data || [] : []);
      setPerformance(performanceData.status === 'fulfilled' ? performanceData.value.data || [] : []);
      setEvents(eventData.status === 'fulfilled' ? eventData.value.data || [] : []);
      setCompletedEvents(completedEventData.status === 'fulfilled' ? completedEventData.value.data || [] : []);

    } catch (error: any) {
      console.error('Error fetching server data:', error);
      setError(error.message);
      
      // Set demo data on error
      setServerProfile({
        id: 'demo-server-id',
        server_name: 'Demo Server',
        server_type: 'waste_management',
        certification_level: 'platinum',
        license_number: 'DEMO-001',
        service_area: 'Demo Area',
        max_capacity: 100,
        is_active: true
      });
    } finally {
      setLoading(false);
    }
  };

  const getCertificationLevelColor = (level: string) => {
    const colors = {
      bronze: 'bg-amber-100 text-amber-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-purple-100 text-purple-800',
      diamond: 'bg-blue-100 text-blue-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTaskStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getComplianceStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      requires_action: 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const totalImpact = impactTracking.reduce((acc: number, item: any) => acc + (item.impact_score || 0), 0);
  const totalTrees = impactTracking.reduce((acc: number, item: any) => acc + (item.trees_planted || 0), 0);
  const totalWaste = impactTracking.reduce((acc: number, item: any) => acc + (item.waste_collected_kg || 0), 0);
  const activeTasks = tasks.filter((t: any) => t.status !== 'completed').length;
  const avgRating = reviews.length > 0 ? reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / reviews.length : 0;
  const totalFinancial = financial.reduce((acc: number, f: any) => acc + (f.amount || 0), 0);

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
                <h1 className="text-xl font-bold text-gray-900">Full Server Management System</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {serverProfile?.server_name || 'Server Admin'}
              </div>
              {serverProfile && (
                <Badge className={getCertificationLevelColor(serverProfile.certification_level)}>
                  {serverProfile.certification_level?.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Server Profile Overview */}
        {serverProfile && (
          <div className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <h3 className="font-semibold text-green-900">Server Name</h3>
                <p className="text-green-800">{serverProfile.server_name}</p>
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Type</h3>
                <p className="text-green-800">{serverProfile.server_type}</p>
              </div>
              <div>
                <h3 className="font-semibold text-green-900">License</h3>
                <p className="text-green-800">{serverProfile.license_number}</p>
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Service Area</h3>
                <p className="text-green-800">{serverProfile.service_area}</p>
              </div>
            </div>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Server Certifications</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{certifications.length}</div>
              <p className="text-xs text-muted-foreground">Professional certs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participant Certs Issued</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{participantCerts.length}</div>
              <p className="text-xs text-muted-foreground">Total issued</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Impact Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalImpact.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Environmental impact</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Performance rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Different Table Categories */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TreePine className="w-5 h-5" />
                    Environmental Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Trees Planted</span>
                      <span className="font-bold">{totalTrees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Waste Collected</span>
                      <span className="font-bold">{totalWaste.toLocaleString()} kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Impact Score</span>
                      <span className="font-bold">{totalImpact.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Active Tasks</span>
                      <span className="font-bold">{activeTasks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Rating</span>
                      <span className="font-bold">{avgRating.toFixed(1)}/5.0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Compliance Checks</span>
                      <span className="font-bold">{compliance.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Completed Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {completedEvents.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No completed events</p>
                    ) : (
                      completedEvents.slice(0, 5).map((event) => (
                        <div key={event.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{event.title}</h4>
                              <p className="text-sm text-gray-600">{event.location}</p>
                              <p className="text-xs text-gray-500">
                                Ended: {new Date(event.end_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-green-100 text-green-800">
                                COMPLETED
                              </Badge>
                              <div className="text-lg font-bold mt-1">
                                {event.total_participants || 0}
                              </div>
                              <p className="text-xs text-gray-500">Participants</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Server Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {certifications.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No server certifications</p>
                    ) : (
                      certifications.map((cert) => (
                        <div key={cert.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{cert.certification_name}</h4>
                              <p className="text-sm text-gray-600">Level: {cert.certification_level}</p>
                              <p className="text-xs text-gray-500">Issued: {new Date(cert.issued_date).toLocaleDateString()}</p>
                            </div>
                            <Badge className={getCertificationLevelColor(cert.certification_level)}>
                              {cert.certification_level?.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Participant Certifications Issued
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {participantCerts.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No participant certifications issued</p>
                    ) : (
                      participantCerts.map((cert) => (
                        <div key={cert.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{cert.certification_name}</h4>
                              <p className="text-sm text-gray-600">Type: {cert.certification_type}</p>
                              <p className="text-xs text-gray-500">Issued: {new Date(cert.issued_date).toLocaleDateString()}</p>
                            </div>
                            <Badge className={cert.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {cert.is_active ? 'ACTIVE' : 'INACTIVE'}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clipboard className="w-5 h-5" />
                    Server Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasks.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No tasks found</p>
                    ) : (
                      tasks.map((task) => (
                        <div key={task.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{task.task_name}</h4>
                              <p className="text-sm text-gray-600">{task.task_type}</p>
                              <p className="text-xs text-gray-500">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</p>
                            </div>
                            <Badge className={getTaskStatusColor(task.status)}>
                              {task.status?.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Server Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No reviews found</p>
                    ) : (
                      reviews.map((review: any) => (
                        <div key={review.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{review.review_type}</h4>
                              <p className="text-sm text-gray-600">{review.review_text}</p>
                              <p className="text-xs text-gray-500">Rating: {review.rating}/5</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Compliance Checks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {compliance.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No compliance checks found</p>
                    ) : (
                      compliance.map((check) => (
                        <div key={check.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{check.check_type}</h4>
                              <p className="text-sm text-gray-600">{check.check_notes}</p>
                              <p className="text-xs text-gray-500">Date: {new Date(check.check_date).toLocaleDateString()}</p>
                            </div>
                            <Badge className={getComplianceStatusColor(check.check_status)}>
                              {check.check_status?.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performance.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No performance metrics found</p>
                    ) : (
                      performance.map((metric) => (
                        <div key={metric.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">Performance Score</h4>
                              <p className="text-sm text-gray-600">Events: {metric.total_events_managed}</p>
                              <p className="text-sm text-gray-600">Participants: {metric.total_participants_served}</p>
                              <p className="text-xs text-gray-500">Date: {new Date(metric.metric_date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">{metric.overall_performance_score}</div>
                              <p className="text-xs text-gray-500">Score</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Equipment Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {equipment.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No equipment found</p>
                    ) : (
                      equipment.map((item) => (
                        <div key={item.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{item.equipment_name}</h4>
                              <p className="text-sm text-gray-600">{item.equipment_type}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <Badge className={
                              item.condition_status === 'excellent' ? 'bg-green-100 text-green-800' :
                              item.condition_status === 'good' ? 'bg-blue-100 text-blue-800' :
                              item.condition_status === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {item.condition_status?.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Training Records
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {training.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No training records found</p>
                    ) : (
                      training.map((record) => (
                        <div key={record.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{record.training_name}</h4>
                              <p className="text-sm text-gray-600">{record.training_type}</p>
                              <p className="text-xs text-gray-500">Date: {new Date(record.training_date).toLocaleDateString()}</p>
                            </div>
                            <Badge className={record.completion_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {record.completion_status?.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Financial Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financial.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No financial records found</p>
                  ) : (
                    financial.map((record) => (
                      <div key={record.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{record.transaction_type}</h4>
                            <p className="text-sm text-gray-600">{record.category}</p>
                            <p className="text-sm text-gray-600">{record.description}</p>
                            <p className="text-xs text-gray-500">Date: {new Date(record.transaction_date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${record.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              ${record.amount?.toFixed(2)}
                            </div>
                            <Badge className={
                              record.transaction_type === 'income' ? 'bg-green-100 text-green-800' :
                              record.transaction_type === 'expense' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }>
                              {record.transaction_type?.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Balance:</span>
                    <span className={`text-xl font-bold ${totalFinancial >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${totalFinancial.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button className="w-full" variant="outline" asChild>
            <a href="/server/certifications/issue">Issue Certification</a>
          </Button>
          <Button className="w-full" variant="outline" asChild>
            <a href="/server/tasks">Manage Tasks</a>
          </Button>
          <Button className="w-full" variant="outline" asChild>
            <a href="/server/tracking">View Analytics</a>
          </Button>
          <Button className="w-full" variant="outline" onClick={fetchAllServerData}>
            <Database className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  );
}
