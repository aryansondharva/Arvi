'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Share2, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Eye,
  MessageSquare,
  History,
  Award,
  Server
} from 'lucide-react';

const supabase = createClient();

export default function ShareCertificatePage() {
  const [user, setUser] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [servers, setServers] = useState<any[]>([]);
  const [sharingRequests, setSharingRequests] = useState<any[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<string>('');
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [shareMessage, setShareMessage] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [shareWithCommunity, setShareWithCommunity] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchUserData();
    fetchCertificates();
    fetchServers();
    fetchSharingRequests();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchCertificates = async () => {
    const { data, error } = await supabase
      .from('participant_certifications')
      .select('*')
      .eq('is_active', true)
      .order('issued_date', { ascending: false });

    if (error) console.error('Error fetching certificates:', error);
    setCertificates(data || []);
  };

  const fetchServers = async () => {
    const { data, error } = await supabase
      .from('server_profiles')
      .select('*')
      .eq('is_active', true)
      .order('server_name');

    if (error) console.error('Error fetching servers:', error);
    setServers(data || []);
  };

  const fetchSharingRequests = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('participant_certificate_sharing')
      .select('*')
      .eq('participant_id', user.id)
      .order('request_date', { ascending: false });

    if (error) console.error('Error fetching sharing requests:', error);
    setSharingRequests(data || []);
  };

  const handleShareCertificate = async () => {
    if (!selectedCertificate || !selectedServer) {
      setMessage({ type: 'error', text: 'Please select both a certificate and a server' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.rpc('share_certificate_for_review', {
        participant_uuid: user.id,
        server_uuid: selectedServer,
        certification_uuid: selectedCertificate,
        is_public_param: isPublic,
        share_with_community_param: shareWithCommunity
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Certificate shared successfully! The server will review it soon.' });
      
      // Reset form
      setSelectedCertificate('');
      setSelectedServer('');
      setShareMessage('');
      setIsPublic(false);
      setShareWithCommunity(false);
      
      // Refresh sharing requests
      await fetchSharingRequests();
    } catch (error: any) {
      console.error('Error sharing certificate:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to share certificate' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      needs_revision: 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'under_review': return <Eye className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      case 'needs_revision': return <MessageSquare className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>Please log in to share certificates.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Share Certificates</h1>
        <Button variant="outline" asChild>
          <a href="/(client)/certifications">Back to Certifications</a>
        </Button>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Share Certificate Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Certificate for Review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Certificate Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Certificate</label>
              <Select value={selectedCertificate} onValueChange={setSelectedCertificate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a certificate to share" />
                </SelectTrigger>
                <SelectContent>
                  {certificates.map((cert) => (
                    <SelectItem key={cert.id} value={cert.id}>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{cert.certification_name}</div>
                          <div className="text-sm text-gray-500">{cert.certification_type}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Server Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Server</label>
              <Select value={selectedServer} onValueChange={setSelectedServer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a server to review" />
                </SelectTrigger>
                <SelectContent>
                  {servers.map((server) => (
                    <SelectItem key={server.id} value={server.id}>
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{server.server_name}</div>
                          <div className="text-sm text-gray-500">{server.server_type}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium mb-2 block">Message to Server (Optional)</label>
            <Textarea
              placeholder="Add any notes or context for the server reviewer..."
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Sharing Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-public"
                checked={isPublic}
                onCheckedChange={(checked) => setIsPublic(checked as boolean)}
              />
              <label htmlFor="is-public" className="text-sm font-medium">
                Make this certificate publicly visible
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="share-community"
                checked={shareWithCommunity}
                onCheckedChange={(checked) => setShareWithCommunity(checked as boolean)}
              />
              <label htmlFor="share-community" className="text-sm font-medium">
                Share with community members
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleShareCertificate}
            disabled={loading || !selectedCertificate || !selectedServer}
            className="w-full"
          >
            {loading ? (
              <>Sharing...</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Share Certificate for Review
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Sharing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Sharing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sharingRequests.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No certificates shared yet</p>
          ) : (
            <div className="space-y-4">
              {sharingRequests.map((request) => (
                <div key={request.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{request.certification_name}</h4>
                        <Badge className={getStatusColor(request.sharing_status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(request.sharing_status)}
                            {request.sharing_status.replace('_', ' ').toUpperCase()}
                          </div>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Shared with: {request.server_name} ({request.server_type})
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Requested: {new Date(request.request_date).toLocaleDateString()}
                      </p>
                      {request.review_date && (
                        <p className="text-sm text-gray-600 mb-1">
                          Reviewed: {new Date(request.review_date).toLocaleDateString()}
                        </p>
                      )}
                      {request.review_notes && (
                        <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                          <strong>Review Notes:</strong> {request.review_notes}
                        </p>
                      )}
                      {request.rejection_reason && (
                        <p className="text-sm text-red-700 mt-2 p-2 bg-red-50 rounded">
                          <strong>Rejection Reason:</strong> {request.rejection_reason}
                        </p>
                      )}
                      {request.revision_requested && (
                        <p className="text-sm text-orange-700 mt-2 p-2 bg-orange-50 rounded">
                          <strong>Revision Requested:</strong> {request.revision_requested}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        {request.is_public && (
                          <Badge variant="outline" className="text-xs">
                            Public
                          </Badge>
                        )}
                        {request.shared_with_community && (
                          <Badge variant="outline" className="text-xs">
                            Community Shared
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
