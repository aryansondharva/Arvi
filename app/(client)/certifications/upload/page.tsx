'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Eye,
  Download,
  Share2,
  Award,
  Server,
  Image as ImageIcon,
  File
} from 'lucide-react';

const supabase = createClient();

export default function UploadCertificatePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Certificate form data
  const [certificationData, setCertificationData] = useState({
    certification_name: '',
    certification_type: 'environmental_warrior',
    achievement_criteria: '',
    issuing_organization: '',
    issue_date: '',
    expiry_date: '',
    certificate_number: '',
    description: ''
  });

  const [servers, setServers] = useState<any[]>([]);
  const [selectedServer, setSelectedServer] = useState('');
  const [shareWithServer, setShareWithServer] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchServers();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setMessage({ type: 'error', text: 'Please upload a PDF, JPEG, or PNG file' });
        return;
      }

      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 5MB' });
        return;
      }

      setFile(selectedFile);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    console.log('Upload button clicked');
    console.log('File:', file);
    console.log('User:', user);
    console.log('Certification data:', certificationData);
    
    if (!file || !user) {
      setMessage({ type: 'error', text: 'Please select a file and ensure you are logged in' });
      return;
    }

    if (!certificationData.certification_name || !certificationData.issue_date) {
      setMessage({ type: 'error', text: 'Please fill in required fields' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      console.log('Starting upload process...');
      console.log('Supabase client:', supabase);
      
      // Upload file to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      console.log('Uploading file:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      console.log('Upload result:', { uploadData, uploadError });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(fileName);

      setUploadedFileUrl(publicUrl);
      setUploadProgress(50);

      // Create certification record
      const { data: certData, error: certError } = await supabase
        .from('participant_certifications')
        .insert({
          participant_id: user.id,
          certification_name: certificationData.certification_name,
          certification_type: certificationData.certification_type,
          issued_by: null, // Will be set by server when approved
          issued_date: new Date(certificationData.issue_date).toISOString(),
          expiry_date: certificationData.expiry_date ? new Date(certificationData.expiry_date).toISOString() : null,
          achievement_criteria: certificationData.achievement_criteria,
          certificate_url: publicUrl,
          is_active: false, // Will be activated when approved by server
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (certError) throw certError;

      setUploadProgress(75);

      // If server sharing is selected, share for review
      if (shareWithServer && selectedServer) {
        const { error: shareError } = await supabase.rpc('share_certificate_for_review', {
          participant_uuid: user.id,
          server_uuid: selectedServer,
          certification_uuid: certData.id,
          is_public_param: false,
          share_with_community_param: false
        });

        if (shareError) throw shareError;
      }

      setUploadProgress(100);
      setUploadComplete(true);
      setMessage({ type: 'success', text: 'Certificate uploaded successfully!' });

    } catch (error: any) {
      console.error('Error uploading certificate:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to upload certificate' });
    } finally {
      setUploading(false);
    }
  };

  const redirectToServer = () => {
    if (selectedServer) {
      // Store certificate info for server review
      localStorage.setItem('pendingCertificateReview', JSON.stringify({
        certification_name: certificationData.certification_name,
        certification_type: certificationData.certification_type,
        certificate_url: uploadedFileUrl,
        participant_name: user?.user_metadata?.full_name || user?.email,
        participant_email: user?.email,
        issue_date: certificationData.issue_date,
        server_id: selectedServer
      }));

      // Redirect to server login
      router.push('/server/simple');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-8 h-8" />;
    if (fileType === 'application/pdf') return <FileText className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>Please log in to upload certificates.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Upload Certificate</h1>
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

      {!uploadComplete ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Certificate File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        {getFileIcon(file.type)}
                      </div>
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                        Choose Different File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <Upload className="w-12 h-12 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">Click to upload certificate</p>
                        <p className="text-sm text-gray-500">PDF, JPEG, or PNG (Max 5MB)</p>
                      </div>
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Select File
                      </Button>
                    </div>
                  )}
                </label>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              {/* Certificate Details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cert-name">Certificate Name *</Label>
                  <Input
                    id="cert-name"
                    value={certificationData.certification_name}
                    onChange={(e) => setCertificationData(prev => ({ ...prev, certification_name: e.target.value }))}
                    placeholder="e.g., Environmental Warrior Certificate"
                    disabled={uploading}
                  />
                </div>

                <div>
                  <Label htmlFor="cert-type">Certificate Type</Label>
                  <Select 
                    value={certificationData.certification_type} 
                    onValueChange={(value) => setCertificationData(prev => ({ ...prev, certification_type: value }))}
                    disabled={uploading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="environmental_warrior">Environmental Warrior</SelectItem>
                      <SelectItem value="tree_champion">Tree Champion</SelectItem>
                      <SelectItem value="water_guardian">Water Guardian</SelectItem>
                      <SelectItem value="carbon_hero">Carbon Hero</SelectItem>
                      <SelectItem value="plastic_free">Plastic Free Champion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="issuing-org">Issuing Organization</Label>
                  <Input
                    id="issuing-org"
                    value={certificationData.issuing_organization}
                    onChange={(e) => setCertificationData(prev => ({ ...prev, issuing_organization: e.target.value }))}
                    placeholder="e.g., Environmental Protection Agency"
                    disabled={uploading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="issue-date">Issue Date *</Label>
                    <Input
                      id="issue-date"
                      type="date"
                      value={certificationData.issue_date}
                      onChange={(e) => setCertificationData(prev => ({ ...prev, issue_date: e.target.value }))}
                      disabled={uploading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiry-date">Expiry Date</Label>
                    <Input
                      id="expiry-date"
                      type="date"
                      value={certificationData.expiry_date}
                      onChange={(e) => setCertificationData(prev => ({ ...prev, expiry_date: e.target.value }))}
                      disabled={uploading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cert-number">Certificate Number</Label>
                  <Input
                    id="cert-number"
                    value={certificationData.certification_number}
                    onChange={(e) => setCertificationData(prev => ({ ...prev, certification_number: e.target.value }))}
                    placeholder="e.g., ENV-2024-001"
                    disabled={uploading}
                  />
                </div>

                <div>
                  <Label htmlFor="achievement-criteria">Achievement Criteria</Label>
                  <Textarea
                    id="achievement-criteria"
                    value={certificationData.achievement_criteria}
                    onChange={(e) => setCertificationData(prev => ({ ...prev, achievement_criteria: e.target.value }))}
                    placeholder="Describe the requirements met for this certificate..."
                    rows={3}
                    disabled={uploading}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={certificationData.description}
                    onChange={(e) => setCertificationData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional details about the certificate..."
                    rows={2}
                    disabled={uploading}
                  />
                </div>
              </div>

              {/* Server Sharing Option */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="share-with-server"
                    checked={shareWithServer}
                    onChange={(e) => setShareWithServer(e.target.checked)}
                    disabled={uploading}
                    className="rounded"
                  />
                  <label htmlFor="share-with-server" className="text-sm font-medium">
                    Share with server for review and verification
                  </label>
                </div>

                {shareWithServer && (
                  <div>
                    <Label htmlFor="server-select">Select Server</Label>
                    <Select value={selectedServer} onValueChange={setSelectedServer} disabled={uploading}>
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
                )}
              </div>

              {/* Upload Button */}
              <Button 
                onClick={handleUpload}
                disabled={!file || uploading || !certificationData.certification_name || !certificationData.issue_date}
                className="w-full"
              >
                {uploading ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Certificate
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {file ? (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-center mb-4">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Certificate Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span>{certificationData.certification_name || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span>{certificationData.certification_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Organization:</span>
                        <span>{certificationData.issuing_organization || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Issue Date:</span>
                        <span>{certificationData.issue_date || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expiry Date:</span>
                        <span>{certificationData.expiry_date || 'No expiry'}</span>
                      </div>
                    </div>
                  </div>

                  {shareWithServer && selectedServer && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2 text-blue-900">Server Review</h4>
                      <div className="space-y-2 text-sm text-blue-800">
                        <div className="flex justify-between">
                          <span>Server:</span>
                          <span>{servers.find(s => s.id === selectedServer)?.server_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span>Pending review</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a file to see preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Upload Complete */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Upload Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Certificate Uploaded Successfully!</h3>
            <p className="text-gray-600 mb-6">
              Your certificate has been uploaded and is ready for review.
            </p>

            {uploadedFileUrl && (
              <div className="mb-6">
                <Button variant="outline" asChild>
                  <a href={uploadedFileUrl} target="_blank" rel="noopener noreferrer">
                    <Eye className="w-4 h-4 mr-2" />
                    View Certificate
                  </a>
                </Button>
              </div>
            )}

            {shareWithServer && selectedServer ? (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Server Review Requested</h4>
                  <p className="text-blue-800 text-sm">
                    Your certificate has been shared with {servers.find(s => s.id === selectedServer)?.server_name} for review.
                  </p>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button onClick={redirectToServer} className="flex-1">
                    <Server className="w-4 h-4 mr-2" />
                    Go to Server Review
                  </Button>
                  <Button variant="outline" asChild className="flex-1">
                    <a href="/(client)/certifications">
                      <Award className="w-4 h-4 mr-2" />
                      My Certificates
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Button variant="outline" asChild className="w-full">
                  <a href="/(client)/certifications/share">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Certificate for Review
                  </a>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <a href="/(client)/certifications">
                    <Award className="w-4 h-4 mr-2" />
                    View My Certificates
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  );
}

