'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Mail, Lock, Loader2, AlertCircle, CheckCircle2, Server, Users, Award, TrendingUp } from 'lucide-react';

const supabase = createClient();

export default function ServerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError(
            `Server login failed. This usually means:\n` +
              `1. Wrong password (most common)\n` +
              `2. Email typo: "${normalizedEmail}"\n` +
              `3. Account doesn't have server privileges\n\n` +
              `Please check your credentials or contact admin.`,
          );
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please confirm your email address. Check your inbox for the confirmation link.');
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }

      if (data.session) {
        // Check if user has server privileges
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_role')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          setError('Profile not found. Please contact admin to set up server access.');
          await supabase.auth.signOut();
          return;
        }

        if (profile.user_role !== 'server' && profile.user_role !== 'admin') {
          setError('You do not have server privileges. Please use the client login.');
          await supabase.auth.signOut();
          return;
        }

        // Check if server profile exists and is active
        const { data: serverProfile, error: serverError } = await supabase
          .from('server_profiles')
          .select('is_active, server_name, server_type')
          .eq('user_id', data.user.id)
          .single();

        if (serverError || !serverProfile) {
          setError('Server profile not found. Please contact admin to set up your server account.');
          await supabase.auth.signOut();
          return;
        }

        if (!serverProfile.is_active) {
          setError('Your server account is not active. Please contact admin.');
          await supabase.auth.signOut();
          return;
        }

        // Redirect to server dashboard
        router.push('/server/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Server Features */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
                <Server className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Server Portal</h1>
                <p className="text-gray-600">Environmental Management System</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Server Capabilities</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Participant Management</h3>
                    <p className="text-gray-600">Track and manage all participant activities, certifications, and impact metrics</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Certification System</h3>
                    <p className="text-gray-600">Issue and manage environmental certifications for participants</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Impact Analytics</h3>
                    <p className="text-gray-600">Comprehensive tracking and reporting of environmental impact</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Compliance & Review</h3>
                    <p className="text-gray-600">Ensure regulatory compliance and conduct thorough reviews</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Need Server Access?</h3>
              <p className="text-gray-600 mb-4">Contact your system administrator to get server privileges assigned to your account.</p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• Admin Email: admin@ecovolunteer.com</p>
                <p>• Required Role: Server or Admin</p>
                <p>• Active Server Profile Required</p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="max-w-md w-full mx-auto">
            <Card className="shadow-xl">
              <CardHeader className="space-y-4 text-center">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center">
                    <Shield className="w-9 h-9 text-white" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">Server Login</CardTitle>
                  <CardDescription className="text-base">
                    Access server management dashboard
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Server Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="server@yourcompany.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your server password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      'Access Server Dashboard'
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center space-y-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Need help?</span>
                    <a href="mailto:support@ecovolunteer.com" className="text-blue-600 hover:text-blue-500 ml-1">
                      Contact Server Support
                    </a>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-2">Looking for client access?</p>
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/auth/login">Go to Client Login</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
