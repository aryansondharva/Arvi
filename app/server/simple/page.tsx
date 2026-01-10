'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Key } from 'lucide-react';

export default function SimpleServerLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Single server credentials
  const serverCredentials = {
    id: 'server',
    email: 'server@ecovolunteer.com',
    password: 'Server2026!',
    name: 'Server Administrator'
  };

  const handleServerLogin = () => {
    setLoading(true);
    
    // Store server info in localStorage with proper UUID
    localStorage.setItem('serverUser', JSON.stringify({
      id: '00000000-0000-0000-0000-000000000001', // Default server UUID
      name: serverCredentials.name,
      email: serverCredentials.email,
      role: 'server',
      isAuthenticated: true
    }));
    
    // Redirect to full server dashboard
    setTimeout(() => {
      router.push('/server/dashboard/full');
      router.refresh();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-md w-full">
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center">
                <Shield className="w-9 h-9 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Server Login</CardTitle>
              <p className="text-gray-600">Access server dashboard</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Server Credentials */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Key className="w-5 h-5" />
                Server Credentials
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Server ID:</label>
                  <div className="bg-white border rounded px-3 py-2 font-mono text-sm font-bold">
                    {serverCredentials.id}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email:</label>
                  <div className="bg-white border rounded px-3 py-2 font-mono text-sm">
                    {serverCredentials.email}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Password:</label>
                  <div className="bg-white border rounded px-3 py-2 font-mono text-sm">
                    {serverCredentials.password}
                  </div>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <Button 
              onClick={handleServerLogin} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>Accessing Server...</>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Access Server Dashboard
                </>
              )}
            </Button>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Use the credentials shown above</li>
                <li>Click "Access Server Dashboard" button</li>
                <li>Direct access to server management system</li>
                <li>Full server privileges activated</li>
              </ol>
            </div>

            {/* Alternative Access */}
            <div className="text-center space-y-3 pt-4 border-t">
              <p className="text-sm text-gray-600">Other access options:</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" asChild>
                  <a href="/auth/login">Client Login</a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/">Back to Home</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
