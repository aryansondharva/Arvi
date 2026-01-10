'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Key, AlertTriangle } from 'lucide-react';

export default function ServerDirectAccess() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Direct server access - no authentication required
  const serverAccounts = [
    {
      id: 'admin',
      name: 'Super Admin',
      email: 'admin@ecovolunteer.com',
      password: 'Admin2026!',
      description: 'Full system administrator access'
    },
    {
      id: 'server1',
      name: 'Server Manager 1',
      email: 'server1@ecovolunteer.com',
      password: 'ServerOne2026!',
      description: 'Primary server management access'
    },
    {
      id: 'server2',
      name: 'Server Manager 2',
      email: 'server2@ecovolunteer.com',
      password: 'ServerTwo2026!',
      description: 'Secondary server management access'
    },
    {
      id: 'demo',
      name: 'Demo Server',
      email: 'demo@ecovolunteer.com',
      password: 'Demo2026!',
      description: 'Demo/testing server access'
    }
  ];

  const handleDirectAccess = (accountId: string) => {
    setLoading(true);
    
    // Store selected server info in localStorage (bypass authentication)
    const selectedAccount = serverAccounts.find(acc => acc.id === accountId);
    if (selectedAccount) {
      localStorage.setItem('serverUser', JSON.stringify({
        id: selectedAccount.id,
        name: selectedAccount.name,
        email: selectedAccount.email,
        role: 'server',
        isAuthenticated: true
      }));
      
      // Redirect directly to simple server dashboard
      setTimeout(() => {
        router.push('/server/dashboard/simple');
        router.refresh();
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl w-full">
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center">
                <Shield className="w-9 h-9 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Direct Server Access</CardTitle>
              <p className="text-gray-600">Bypass authentication - Direct server dashboard access</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Warning Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-yellow-800">
                  <p className="font-medium">Direct Access Mode</p>
                  <p className="text-sm">This bypasses authentication for development/testing. Use only in development environment.</p>
                </div>
              </div>
            </div>

            {/* Server Account Selection */}
            <div className="grid md:grid-cols-2 gap-4">
              {serverAccounts.map((account) => (
                <Card key={account.id} className="border-2 hover:border-blue-500 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{account.name}</h3>
                        <Key className="w-5 h-5 text-gray-400" />
                      </div>
                      
                      <p className="text-sm text-gray-600">{account.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="font-medium">ID:</span> {account.id}
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="font-medium">Email:</span> {account.email}
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="font-medium">Password:</span> {account.password}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => handleDirectAccess(account.id)}
                        disabled={loading}
                        className="w-full"
                        variant="outline"
                      >
                        {loading ? (
                          <>Accessing...</>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Access as {account.name}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">How to Use:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Choose any server account above</li>
                <li>Click "Access as [Account Name]" button</li>
                <li>Direct access to server dashboard (no login required)</li>
                <li>Full server privileges activated</li>
              </ol>
            </div>

            {/* Alternative Access */}
            <div className="text-center space-y-3 pt-4 border-t">
              <p className="text-sm text-gray-600">Need regular authentication?</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" asChild>
                  <a href="/server/access">Server Login</a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/auth/login">Client Login</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
