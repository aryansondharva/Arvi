'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Clock,
  AlertCircle,
  FileText,
  User,
  Award,
  Server,
  Filter,
  Search
} from 'lucide-react';

const supabase = createClient();

export default function ServerReviewCertificates() {
  const [serverUser, setServerUser] = useState<any>(null);
  const [serverProfile, setServerProfile] = useState<any>(null);
  const [sharingRequests, setSharingRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [revisionRequested, setRevisionRequested] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkServerUser();
    fetchServerProfile();
    fetchSharingRequests();
  }, [filterStatus, searchTerm]);

  const checkServerUser = () => {
    const storedUser = localStorage.getItem('serverUser');
    if (storedUser) {
      setServerUser(JSON.parse(storedUser));
    }
  };

  const fetchServerProfile = async () => {
    const storedUser = localStorage.getItem('serverUser');
    const serverUser = storedUser ? JSON.parse(storedUser) : null;
    
    if (!serverUser) return;

    try {
      const { data, error } = await supabase
        .from('server_profiles')
        .select('*')
        .eq('contact_email', serverUser.email)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setServerProfile(data);
    } catch (error) {
      console.error('Error fetching server profile:', error);
    }
  };

  const fetchSharingRequests = async () => {
    if (!serverProfile) return;

    try {
      let query = supabase
        .from('participant_certificate_sharing')
        .select('*')
        .eq('server_id', serverProfile.id)
        .order('request_date', { ascending: false });

      // Apply status filter
      if (filterStatus !== 'all') {
        query = query.eq('sharing_status', filterStatus);
      }

      // Apply search filter
      if (searchTerm) {
        query = query.or(`participant_name.ilike.%${searchTerm}%,certification_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSharingRequests(data || []);
    } catch (error) {
      console.error('Error fetching sharing requests:', error);
    }
  };

  const handleReview = async (action: 'approve' | 'reject' | 'needs_revision') => {
    if (!selectedRequest || !serverUser) return;

    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.rpc('review_shared_certificate', {
        sharing_request_uuid: selectedRequest.id,
        reviewer_uuid: serverUser.id,
        review_status: action,
        review_notes_param: reviewNotes || null,
        rejection_reason_param: action === 'rejected' ? rejectionReason : null,
        revision_requested_param: action === 'needs_revision' ? revisionRequested : null
      });

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: `Certificate ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'revision requested'} successfully!` 
      });
      
      // Reset form
      setSelectedRequest(null);
      setReviewNotes('');
      setRejectionReason('');
      setRevisionRequested('');
      
      // Refresh requests
      await fetchSharingRequests();
    } catch (error: any) {
      console.error('Error reviewing certificate:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to review certificate' });
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
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'needs_revision': return <MessageSquare className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredRequests = sharingRequests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.sharing_status === filterStatus;
    const matchesSearch = !searchTerm || 
      request.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.certification_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: sharingRequests.length,
    pending: sharingRequests.filter(r => r.sharing_status === 'pending').length,
    under_review: sharingRequests.filter(r => r.sharing_status === 'under_review').length,
    approved: sharingRequests.filter(r => r.sharing_status === 'approved').length,
    rejected: sharingRequests.filter(r => r.sharing_status === 'rejected').length,
    needs_revision: sharingRequests.filter(r => r.sharing_status === 'needs_revision').length
  };

  if (!serverUser) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>Please log in as a server to review certificates.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Review Certificates</h1>
        <Button variant="outline" asChild>
          <a href="/server/dashboard/full">Back to Dashboard</a>
        </Button>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-gray-600">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.under_review}</div>
            <p className="text-sm text-gray-600">In Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-sm text-gray-600">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-sm text-gray-600">Rejected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.needs_revision}</div>
            <p className="text-sm text-gray-600">Needs Revision</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Status:</span>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="needs_revision">Needs Revision</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search by participant or certificate name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certificate List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Certificates to Review ({filteredRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredRequests.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No certificates found</p>
              ) : (
                filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRequest?.id === request.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{request.certification_name}</h4>
                        <p className="text-sm text-gray-600">{request.certification_type}</p>
                      </div>
                      <Badge className={getStatusColor(request.sharing_status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(request.sharing_status)}
                          {request.sharing_status.replace('_', ' ').toUpperCase()}
                        </div>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-3 h-3" />
                      <span>{request.participant_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(request.request_date).toLocaleDateString()}</span>
                    </div>
                    {request.review_comments_count > 0 && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <MessageSquare className="w-3 h-3" />
                        <span>{request.review_comments_count} comments</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Review Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Review Certificate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRequest ? (
              <div className="space-y-6">
                {/* Certificate Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">{selectedRequest.certification_name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span>{selectedRequest.certification_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Participant:</span>
                      <span>{selectedRequest.participant_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{selectedRequest.participant_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Issued:</span>
                      <span>{new Date(selectedRequest.issued_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Requested:</span>
                      <span>{new Date(selectedRequest.request_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Review Actions */}
                {selectedRequest.sharing_status === 'pending' || selectedRequest.sharing_status === 'under_review' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Review Notes</label>
                      <Textarea
                        placeholder="Add your review comments..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleReview('approve')}
                        disabled={loading}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        onClick={() => handleReview('needs_revision')}
                        disabled={loading}
                        variant="outline"
                        className="flex-1"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Request Revision
                      </Button>
                      <Button 
                        onClick={() => handleReview('reject')}
                        disabled={loading}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>

                    {selectedRequest.sharing_status === 'needs_revision' && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Revision Requested</label>
                        <Textarea
                          placeholder="Describe what needs to be revised..."
                          value={revisionRequested}
                          onChange={(e) => setRevisionRequested(e.target.value)}
                          rows={3}
                        />
                      </div>
                    )}

                    {selectedRequest.sharing_status === 'rejected' && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Rejection Reason</label>
                        <Textarea
                          placeholder="Reason for rejection..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(selectedRequest.sharing_status)}`}>
                      {getStatusIcon(selectedRequest.sharing_status)}
                      <span>{selectedRequest.sharing_status.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      This certificate has been {selectedRequest.sharing_status.replace('_', ' ')}
                    </p>
                    {selectedRequest.review_notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded text-left">
                        <p className="font-medium">Review Notes:</p>
                        <p className="text-sm">{selectedRequest.review_notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Sharing Options */}
                <div className="flex gap-2">
                  {selectedRequest.is_public && (
                    <Badge variant="outline" className="text-xs">
                      Public
                    </Badge>
                  )}
                  {selectedRequest.shared_with_community && (
                    <Badge variant="outline" className="text-xs">
                      Community Shared
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a certificate to review</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
