'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  CheckCircle, 
  Clock, 
  Eye, 
  Share2, 
  FileText,
  Calendar,
  Building,
  AlertCircle
} from 'lucide-react';

interface Certification {
  id: string;
  certification_name: string;
  certification_type: string;
  issued_by: string | null;
  issued_date: string;
  expiry_date: string | null;
  achievement_criteria: string;
  certificate_url: string;
  is_active: boolean;
  sharing_status: 'not_shared' | 'pending' | 'under_review' | 'approved' | 'rejected' | 'needs_revision';
  shared_with_server: string | null;
  sharing_review_date: string | null;
  created_at: string;
}

const supabase = createClient();

export default function CertificationsPage() {
  const [user, setUser] = useState<any>(null);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchCertifications();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchCertifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('participant_certifications')
      .select(`
        *,
        server_profiles:shared_with_server (
          server_name,
          server_type
        )
      `)
      .eq('participant_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching certifications:', error);
    } else {
      setCertifications(data || []);
    }
    setLoading(false);
  };

  const getStatusBadge = (certification: Certification) => {
    if (certification.is_active && certification.issued_by) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    }

    switch (certification.sharing_status) {
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
            Draft
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

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p className="text-gray-600">You need to be logged in to view your certifications.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your certifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Certificates</h1>
        <div className="space-x-4">
          <Button variant="outline" asChild>
            <a href="/(client)/certifications/upload">
              <Award className="w-4 h-4 mr-2" />
              Upload New
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/(client)/certifications/share">
              <Share2 className="w-4 h-4 mr-2" />
              Share for Review
            </a>
          </Button>
        </div>
      </div>

      {certifications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold mb-2">No Certifications Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't uploaded any certificates yet. Start by uploading your first certificate.
            </p>
            <Button asChild>
              <a href="/(client)/certifications/upload">
                <Award className="w-4 h-4 mr-2" />
                Upload Your First Certificate
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.map((cert) => (
            <Card key={cert.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">
                    {cert.certification_name}
                  </CardTitle>
                  {getStatusBadge(cert)}
                </div>
                <Badge className={`mt-2 ${getCertificationTypeColor(cert.certification_type)}`}>
                  {formatCertificationType(cert.certification_type)}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Issued: {new Date(cert.issued_date).toLocaleDateString()}
                  </div>
                  {cert.expiry_date && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Expires: {new Date(cert.expiry_date).toLocaleDateString()}
                    </div>
                  )}
                  {cert.server_profiles && (
                    <div className="flex items-center text-gray-600">
                      <Building className="w-4 h-4 mr-2" />
                      Server: {cert.server_profiles.server_name}
                    </div>
                  )}
                </div>

                {cert.achievement_criteria && (
                  <div className="text-sm">
                    <p className="font-medium text-gray-700 mb-1">Achievement Criteria:</p>
                    <p className="text-gray-600 line-clamp-3">{cert.achievement_criteria}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </a>
                  </Button>
                  {!cert.is_active && cert.sharing_status === 'not_shared' && (
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <a href="/(client)/certifications/share">
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
