'use client';

import { useState, useEffect } from 'react';
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
  FileText
} from 'lucide-react';

export default function SimpleServerDashboard() {
  const [serverUser, setServerUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get server user from localStorage (set by direct access)
    const storedUser = localStorage.getItem('serverUser');
    if (storedUser) {
      setServerUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Mock data for demonstration
  const mockStats = {
    totalParticipants: 1247,
    activeEvents: 23,
    totalImpact: 45678,
    certificationsIssued: 892,
    treesPlanted: 12345,
    wasteCollected: 67890,
    areaCleaned: 45678,
    avgImpactScore: 36.6
  };

  const mockRecentActivity = [
    { id: 1, type: 'certification', user: 'John Doe', action: 'Earned Environmental Warrior', time: '2 hours ago' },
    { id: 2, type: 'event', user: 'Jane Smith', action: 'Completed Beach Cleanup', time: '4 hours ago' },
    { id: 3, type: 'impact', user: 'Mike Johnson', action: 'Planted 50 trees', time: '6 hours ago' },
    { id: 4, type: 'certification', user: 'Sarah Wilson', action: 'Earned Tree Champion', time: '8 hours ago' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
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
              <div className="flex items-center">
              <img 
                src="/a2.png" 
                alt="Arvi Logo" 
                className="w-8 h-8 rounded-lg mr-3"
              />
              <h1 className="text-xl font-bold text-gray-900">Arvi Server Dashboard</h1>
            </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{serverUser?.name || 'Server Admin'}</span>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {serverUser?.id?.toUpperCase() || 'ADMIN'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalParticipants.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Active users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.activeEvents}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Impact</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalImpact.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Impact points</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certifications</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.certificationsIssued}</div>
              <p className="text-xs text-muted-foreground">Issued total</p>
            </CardContent>
          </Card>
        </div>

        {/* Environmental Impact */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trees Planted</CardTitle>
              <TreePine className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{mockStats.treesPlanted.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total trees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waste Collected</CardTitle>
              <Recycle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{mockStats.wasteCollected.toLocaleString()} kg</div>
              <p className="text-xs text-muted-foreground">Total waste</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Area Cleaned</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{mockStats.areaCleaned.toLocaleString()} m²</div>
              <p className="text-xs text-muted-foreground">Total area</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Impact Score</CardTitle>
              <Activity className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{mockStats.avgImpactScore}</div>
              <p className="text-xs text-muted-foreground">Per participant</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Manage Participants
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Create Event
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <a href="/server/dashboard/certifications">
                  <FileText className="w-4 h-4 mr-2" />
                  Review Certificates
                </a>
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generate Reports
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'certification' ? 'bg-green-500' :
                        activity.type === 'event' ? 'bg-blue-500' : 'bg-purple-500'
                      }`} />
                      <div>
                        <p className="font-medium">{activity.user}</p>
                        <p className="text-sm text-gray-600">{activity.action}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Server Info */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">Server Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <span className="font-medium">Server ID:</span> {serverUser?.id || 'admin'}
            </div>
            <div>
              <span className="font-medium">Access Level:</span> {serverUser?.name || 'Super Admin'}
            </div>
            <div>
              <span className="font-medium">Mode:</span> Direct Access (Development)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
