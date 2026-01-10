'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Key, AlertTriangle, CheckCircle } from 'lucide-react';

const supabase = createClient();

export default function ServerAccess() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Multiple server credentials options
  const serverCredentials = [
    {
      id: 'admin',
      email: 'admin@ecovolunteer.com',
      password: 'Admin2026!',
      name: 'Super Admin',
      description: 'Full system administrator access'
    },
    {
      id: 'server1',
      email: 'server1@ecovolunteer.com',
      password: 'ServerOne2026!',
      name: 'Server Manager 1',
      description: 'Primary server management access'
    },
    {
      id: 'server2',
      email: 'server2@ecovolunteer.com',
      password: 'ServerTwo2026!',
      name: 'Server Manager 2',
      description: 'Secondary server management access'
    },
    {
      id: 'demo',
      email: 'demo@ecovolunteer.com',
      password: 'Demo2026!',
      name: 'Demo Server',
      description: 'Demo/testing server access'
    }
  ];

  const [selectedCredential, setSelectedCredential] = useState(serverCredentials[0]);

  const handleQuickAccess = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: selectedCredential.email,
        password: selectedCredential.password,
      });

      if (error) {
        setMessage({ 
          type: 'error', 
          text: `Login failed: ${error.message}. Please check credentials or create server profile.` 
        });
        return;
      }

      if (data.session) {
        // Check if server profile exists
        const { data: serverProfile, error: serverError } = await supabase
          .from('server_profiles')
          .select('is_active, server_name')
          .eq('user_id', data.user.id)
          .single();

        if (serverError || !serverProfile) {
          // Create server profile if it doesn't exist
          const { error: createError } = await supabase
            .from('server_profiles')
            .insert({
              user_id: data.user.id,
              server_name: selectedCredential.name,
              server_type: 'environmental',
              organization: 'EcoVolunteer PRO',
              contact_email: selectedCredential.email,
              is_active: true,
              created_at: new Date().toISOString()
            });

          if (createError) {
            setMessage({ 
              type: 'error', 
              text: `Server profile creation failed: ${createError.message}` 
            });
            return;
          }
        }

        // Update user role to server
        const { error: roleError } = await supabase
          .from('profiles')
          .update({ user_role: 'server' })
          .eq('id', data.user.id);

        if (roleError) {
          setMessage({ 
            type: 'error', 
            text: `Role update failed: ${roleError.message}` 
          });
          return;
        }

        setMessage({ 
          type: 'success', 
          text: 'Server access granted! Redirecting to dashboard...' 
        });

        setTimeout(() => {
          router.push('/server/dashboard');
          router.refresh();
        }, 2000);
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `Unexpected error: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const createServerAccount = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Sign up new server account
      const { data, error } = await supabase.auth.signUp({
        email: selectedCredential.email,
        password: selectedCredential.password,
        options: {
          data: {
            full_name: selectedCredential.name,
            user_role: 'server'
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          // Account already exists, try to login
          await handleQuickAccess();
          return;
        }
        setMessage({ 
          type: 'error', 
          text: `Account creation failed: ${error.message}` 
        });
        return;
      }

      if (data.user) {
        // Create server profile
        const { error: profileError } = await supabase
          .from('server_profiles')
          .insert({
            user_id: data.user.id,
            server_name: selectedCredential.name,
            server_type: 'environmental',
            organization: 'EcoVolunteer PRO',
            contact_email: selectedCredential.email,
            is_active: true,
            created_at: new Date().toISOString()
          });

        if (profileError) {
          setMessage({ 
            type: 'error', 
            text: `Server profile creation failed: ${profileError.message}` 
          });
          return;
        }

        setMessage({ 
          type: 'success', 
          text: 'Server account created! Please check your email for verification, then use Quick Access.' 
        });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `Unexpected error: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl w-full">
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center">
                <Shield className="w-9 h-9 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Server Quick Access</CardTitle>
              <p className="text-gray-600">Instant server administrator access</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {message && (
              <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            {/* Server ID Selection */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Key className="w-5 h-5" />
                Select Server Account
              </h3>
              
              <div className="grid gap-3">
                {serverCredentials.map((credential) => (
                  <div
                    key={credential.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCredential.id === credential.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedCredential(credential)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{credential.name}</h4>
                        <p className="text-sm text-gray-600">{credential.description}</p>
                        <p className="text-xs text-gray-500 mt-1">ID: {credential.id}</p>
                      </div>
                      <div className="text-right">
                        <div className={`w-3 h-3 rounded-full ${
                          selectedCredential.id === credential.id ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Credentials Display */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Selected Server Credentials
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Server ID:</label>
                  <div className="bg-white border rounded px-3 py-2 font-mono text-sm font-bold">
                    {selectedCredential.id}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email:</label>
                  <div className="bg-white border rounded px-3 py-2 font-mono text-sm">
                    {selectedCredential.email}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Password:</label>
                  <div className="bg-white border rounded px-3 py-2 font-mono text-sm">
                    {selectedCredential.password}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Security Notice:</p>
                    <p>These are default credentials for development. Change them in production for security.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleQuickAccess} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Quick Access as {selectedCredential.name}
                  </>
                )}
              </Button>

              <Button 
                onClick={createServerAccount} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <>Creating Account...</>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Create {selectedCredential.name} Account
                  </>
                )}
              </Button>
            </div>

            {/* Additional Options */}
            <div className="text-center space-y-3 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Need different server access?
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <a href="/server/login">Use Custom Login</a>
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <a href="/auth/login">Go to Client Login</a>
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Quick Start Guide:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Select your preferred server account from the list above</li>
                <li>Click "Quick Access as [Server Name]" to login instantly</li>
                <li>If account doesn't exist, click "Create [Server Name] Account"</li>
                <li>Access server dashboard with full admin privileges</li>
                <li>Manage participants, events, and certifications</li>
              </ol>
            </div>

            {/* All Server Credentials Summary */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">All Available Server Accounts:</h4>
              <div className="grid gap-2 text-sm">
                {serverCredentials.map((cred) => (
                  <div key={cred.id} className="flex justify-between items-center p-2 bg-white rounded border">
                    <div>
                      <span className="font-medium">{cred.id}</span> - {cred.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {cred.email} / {cred.password}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
