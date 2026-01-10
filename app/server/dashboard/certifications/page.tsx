'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Eye, 
  AlertCircle, 
  Calendar,
  User,
  Building,
  Download,
  MessageSquare
} from 'lucide-react';

interface CertificateReview {
  id: string;
  participant_id: string;
  certification_name: string;
  certification_type: string;
  issued_date: string;
  achievement_criteria: string;
  certificate_url: string;
  sharing_status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'needs_revision';
  sharing_request_date: string;
  sharing_review_date: string | null;
  sharing_review_notes: string | null;
  sharing_rejection_reason: string | null;
  sharing_revision_requested: string | null;
  participant_name: string;
  participant_email: string;
  server_name: string;
  server_type: string;
}

const supabase = createClient();

export default function ServerCertificationsPage() {
  const [serverUser, setServerUser] = useState<any>(null);
  const [certificates, setCertificates] = useState<CertificateReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchServerUser();
    fetchCertificates();
  }, []);

  const fetchServerUser = async () => {
    // Get server user from localStorage (set by direct access)
    const storedUser = localStorage.getItem('serverUser');
    if (storedUser) {
      setServerUser(JSON.parse(storedUser));
    }
  };

  const fetchCertificates = async () => {
    const storedUser = localStorage.getItem('serverUser');
    if (!storedUser) return;

    const serverData = JSON.parse(storedUser);
    
    const { data, error } = await supabase
      .from('server_review_dashboard')
      .select('*')
      .eq('server_id', serverData.id)
      .order('request_date', { ascending: false });

    if (error) {
      console.error('Error fetching certificates:', error);
    } else {
      setCertificates(data || []);
    }
    setLoading(false);
  };

  const handleReview = async (certId: string, status: string, notes?: string, rejectionReason?: string) => {
    const storedUser = localStorage.getItem('serverUser');
    if (!storedUser) return;

    const serverData = JSON.parse(storedUser);
    
    const { error } = await supabase.rpc('review_shared_certificate', {
      certification_uuid: certId,
      reviewer_uuid: serverData.user_id || serverData.id,
      review_status: status,
      review_notes_param: notes || null,
      rejection_reason_param: rejectionReason || null,
      revision_requested_param: status === 'needs_revision' ? 'Please revise and resubmit' : null
    });

    if (error) {
      console.error('Error reviewing certificate:', error);
      alert('Error reviewing certificate. Please try again.');
    } else {
      // Refresh the certificates list
      fetchCertificates();
      alert(`Certificate ${status} successfully!`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        );
      case 'under_review':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Eye className="w-3 h-3 mr-1" />
            Under Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'needs_revision':
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Needs Revision
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <FileText className="w-3 h-3 mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  const getCertificationTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      environmental_warrior: 'bg-green-100 text-green-800',
      tree_champion: 'bg-emerald-100 text-emerald-800',
      water_guardian: 'bg-blue-100 text-blue-800',
      carbon_hero: 'bg-slate-100 text-slate-800',
      plastic_free: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatCertificationType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredCertificates = certificates.filter(cert => {
    if (filter === 'all') return true;
    return cert.sharing_status === filter;
  });

  if (!serverUser) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Server Access Required</h1>
          <p className="text-gray-600">Please log in as a server to view certificate reviews.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificate reviews...</p>
        </div>
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
                <img 
                  src="/a2.png" 
                  alt="Arvi Logo" 
                  className="w-8 h-8 rounded-lg mr-3"
                />
                <h1 className="text-xl font-bold text-gray-900">Arvi Certificate Reviews</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Server: <span className="font-medium">{serverUser?.server_name || 'Admin'}</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {serverUser?.id?.toUpperCase() || 'SERVER'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-4 border-b">
            {['all', 'pending', 'under_review', 'approved', 'rejected', 'needs_revision'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  filter === status
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')} 
                {status !== 'all' && (
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {certificates.filter(c => c.sharing_status === status).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{certificates.length}</div>
              <p className="text-xs text-muted-foreground">All certificates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {certificates.filter(c => c.sharing_status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">Need review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {certificates.filter(c => c.sharing_status === 'approved').length}
              </div>
              <p className="text-xs text-muted-foreground">Successfully reviewed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {certificates.filter(c => c.sharing_status === 'under_review').length}
              </div>
              <p className="text-xs text-muted-foreground">Currently reviewing</p>
            </CardContent>
          </Card>
        </div>

        {/* Certificates List */}
        {filteredCertificates.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No Certifications Found</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'No certificates have been shared with your server yet.'
                  : `No certificates with status "${filter}" found.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredCertificates.map((cert) => (
              <Card key={cert.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl line-clamp-2">
                        {cert.certification_name}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2">
                        {getStatusBadge(cert.sharing_status)}
                        <Badge className={getCertificationTypeColor(cert.certification_type)}>
                          {formatCertificationType(cert.certification_type)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Requested: {new Date(cert.sharing_request_date).toLocaleDateString()}
                      </p>
                      {cert.sharing_review_date && (
                        <p className="text-sm text-gray-500">
                          Reviewed: {new Date(cert.sharing_review_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>{cert.participant_name}</span>
                      <span className="text-gray-400 ml-2">({cert.participant_email})</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Issued: {new Date(cert.issued_date).toLocaleDateString()}
                    </div>
                  </div>

                  {cert.achievement_criteria && (
                    <div className="text-sm">
                      <p className="font-medium text-gray-700 mb-1">Achievement Criteria:</p>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded">{cert.achievement_criteria}</p>
                    </div>
                  )}

                  {cert.sharing_review_notes && (
                    <div className="text-sm">
                      <p className="font-medium text-gray-700 mb-1">Review Notes:</p>
                      <p className="text-gray-600 bg-blue-50 p-3 rounded">{cert.sharing_review_notes}</p>
                    </div>
                  )}

                  {cert.sharing_rejection_reason && (
                    <div className="text-sm">
                      <p className="font-medium text-gray-700 mb-1">Rejection Reason:</p>
                      <p className="text-red-600 bg-red-50 p-3 rounded">{cert.sharing_rejection_reason}</p>
                    </div>
                  )}

                  {cert.sharing_revision_requested && (
                    <div className="text-sm">
                      <p className="font-medium text-gray-700 mb-1">Revision Requested:</p>
                      <p className="text-orange-600 bg-orange-50 p-3 rounded">{cert.sharing_revision_requested}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm" asChild>
                      <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4 mr-1" />
                        View Certificate
                      </a>
                    </Button>

                    {cert.sharing_status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleReview(cert.id, 'under_review', 'Started review')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Start Review
                      </Button>
                    )}

                    {cert.sharing_status === 'under_review' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleReview(cert.id, 'approved', 'Certificate approved and verified')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleReview(cert.id, 'rejected', '', 'Does not meet requirements')}
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleReview(cert.id, 'needs_revision', 'Please revise and resubmit', 'Missing information')}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Request Revision
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
