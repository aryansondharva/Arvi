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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Award, 
  Users, 
  Search, 
  CheckCircle, 
  XCircle, 
  FileText,
  Calendar,
  Target,
  Star
} from 'lucide-react';

const supabase = createClient();

interface Participant {
  id: string;
  full_name: string;
  email: string;
  unique_member_id: string;
  total_impact_score: number;
  impact_level: string;
  events_attended: number;
  trees_planted: number;
  waste_collected: number;
  certifications_earned: number;
}

interface CertificationTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  criteria: string;
  required_score: number;
  required_events: number;
  required_trees: number;
  required_waste: number;
  icon: string;
}

export default function ServerIssueCertification() {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [templates, setTemplates] = useState<CertificationTemplate[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificationTemplate | null>(null);
  const [customCertification, setCustomCertification] = useState({
    name: '',
    type: 'environmental_warrior',
    description: '',
    criteria: ''
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [useTemplate, setUseTemplate] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchParticipants();
    fetchTemplates();
  }, []);

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('participant_impact_summary')
        .select('*')
        .order('total_impact_score', { ascending: false });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const fetchTemplates = async () => {
    // Predefined certification templates
    const templates: CertificationTemplate[] = [
      {
        id: '1',
        name: 'Environmental Warrior',
        type: 'environmental_warrior',
        description: 'Awarded to participants who demonstrate exceptional commitment to environmental conservation',
        criteria: 'Complete 10+ events, plant 50+ trees, and collect 100+ kg of waste',
        required_score: 500,
        required_events: 10,
        required_trees: 50,
        required_waste: 100,
        icon: '🌍'
      },
      {
        id: '2',
        name: 'Tree Champion',
        type: 'tree_champion',
        description: 'Recognizes outstanding contributions to reforestation efforts',
        criteria: 'Plant 100+ trees across multiple events',
        required_score: 300,
        required_events: 5,
        required_trees: 100,
        required_waste: 0,
        icon: '🌳'
      },
      {
        id: '3',
        name: 'Water Guardian',
        type: 'water_guardian',
        description: 'For participants who excel in water conservation and cleanup activities',
        criteria: 'Participate in 8+ water-related events and save 10,000+ liters of water',
        required_score: 400,
        required_events: 8,
        required_trees: 0,
        required_waste: 50,
        icon: '💧'
      },
      {
        id: '4',
        name: 'Carbon Hero',
        type: 'carbon_hero',
        description: 'Recognizes significant carbon footprint reduction efforts',
        criteria: 'Reduce carbon footprint by 500+ kg through various activities',
        required_score: 600,
        required_events: 12,
        required_trees: 75,
        required_waste: 200,
        icon: '🏆'
      },
      {
        id: '5',
        name: 'Plastic Free Champion',
        type: 'plastic_free',
        description: 'For leaders in plastic waste reduction and recycling',
        criteria: 'Collect and properly dispose of 500+ kg of plastic waste',
        required_score: 350,
        required_events: 7,
        required_trees: 25,
        required_waste: 500,
        icon: '♻️'
      }
    ];
    setTemplates(templates);
  };

  const checkEligibility = (participant: Participant, template: CertificationTemplate) => {
    return {
      score: participant.total_impact_score >= template.required_score,
      events: participant.events_attended >= template.required_events,
      trees: participant.trees_planted >= template.required_trees,
      waste: participant.waste_collected >= template.required_waste
    };
  };

  const issueCertification = async () => {
    if (!selectedParticipant) {
      setMessage({ type: 'error', text: 'Please select a participant' });
      return;
    }

    if (useTemplate && !selectedTemplate) {
      setMessage({ type: 'error', text: 'Please select a certification template' });
      return;
    }

    if (!useTemplate && !customCertification.name) {
      setMessage({ type: 'error', text: 'Please enter certification details' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const certificationData = useTemplate ? {
        participant_id: selectedParticipant.id,
        certification_name: selectedTemplate.name,
        certification_type: selectedTemplate.type,
        achievement_criteria: selectedTemplate.criteria,
        issued_by: user.id,
        issued_date: new Date().toISOString(),
        is_active: true,
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year expiry
      } : {
        participant_id: selectedParticipant.id,
        certification_name: customCertification.name,
        certification_type: customCertification.type,
        achievement_criteria: customCertification.criteria,
        issued_by: user.id,
        issued_date: new Date().toISOString(),
        is_active: true,
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      const { error } = await supabase
        .from('participant_certifications')
        .insert(certificationData);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Certification issued successfully!' });
      
      // Reset form
      setSelectedParticipant(null);
      setSelectedTemplate(null);
      setCustomCertification({ name: '', type: 'environmental_warrior', description: '', criteria: '' });
      
      // Refresh participants
      await fetchParticipants();
    } catch (error) {
      console.error('Error issuing certification:', error);
      setMessage({ type: 'error', text: 'Failed to issue certification. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipants = participants.filter(p =>
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.unique_member_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImpactLevelColor = (level: string) => {
    const colors = {
      bronze: 'bg-amber-100 text-amber-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      diamond: 'bg-purple-100 text-purple-800',
      platinum: 'bg-blue-100 text-blue-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Issue Certifications</h1>
        <Button variant="outline" onClick={() => router.push('/server/certifications')}>
          View All Certifications
        </Button>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Participant Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Select Participant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredParticipants.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No participants found</p>
              ) : (
                filteredParticipants.map((participant) => (
                  <div
                    key={participant.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedParticipant?.id === participant.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedParticipant(participant)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{participant.full_name}</h4>
                        <p className="text-sm text-gray-600">{participant.email}</p>
                        <p className="text-xs text-gray-500">ID: {participant.unique_member_id}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getImpactLevelColor(participant.impact_level)}>
                          {participant.impact_level.toUpperCase()}
                        </Badge>
                        <div className="text-lg font-bold mt-1">{participant.total_impact_score}</div>
                        <p className="text-xs text-gray-500">Impact Score</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-gray-600">
                      <div>Events: {participant.events_attended}</div>
                      <div>Trees: {participant.trees_planted}</div>
                      <div>Waste: {participant.waste_collected}kg</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Certification Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Certification Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Template Selection */}
            <div>
              <Label className="text-base font-medium">Certification Type</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={useTemplate ? "default" : "outline"}
                  onClick={() => setUseTemplate(true)}
                >
                  Use Template
                </Button>
                <Button
                  variant={!useTemplate ? "default" : "outline"}
                  onClick={() => setUseTemplate(false)}
                >
                  Custom
                </Button>
              </div>
            </div>

            {useTemplate ? (
              <div className="space-y-4">
                <Label className="text-base font-medium">Select Template</Label>
                <div className="space-y-3">
                  {templates.map((template) => {
                    const eligibility = selectedParticipant ? checkEligibility(selectedParticipant, template) : null;
                    const isEligible = eligibility && Object.values(eligibility).every(Boolean);
                    
                    return (
                      <div
                        key={template.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedTemplate?.id === template.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        } ${!isEligible && selectedParticipant ? 'opacity-50' : ''}`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{template.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{template.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                            <p className="text-sm text-gray-700 mt-2">{template.criteria}</p>
                            
                            {selectedParticipant && eligibility && (
                              <div className="mt-3 space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <Target className="w-4 h-4" />
                                  <span>Requirements:</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="flex items-center gap-1">
                                    {eligibility.score ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                                    <span>Score: {template.required_score}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {eligibility.events ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                                    <span>Events: {template.required_events}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {eligibility.trees ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                                    <span>Trees: {template.required_trees}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {eligibility.waste ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                                    <span>Waste: {template.required_waste}kg</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cert-name">Certification Name</Label>
                  <Input
                    id="cert-name"
                    value={customCertification.name}
                    onChange={(e) => setCustomCertification(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter certification name"
                  />
                </div>

                <div>
                  <Label htmlFor="cert-type">Type</Label>
                  <Select 
                    value={customCertification.type} 
                    onValueChange={(value) => setCustomCertification(prev => ({ ...prev, type: value }))}
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
                  <Label htmlFor="cert-criteria">Achievement Criteria</Label>
                  <Textarea
                    id="cert-criteria"
                    value={customCertification.criteria}
                    onChange={(e) => setCustomCertification(prev => ({ ...prev, criteria: e.target.value }))}
                    placeholder="Describe the achievement criteria for this certification..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Issue Button */}
            <Button 
              onClick={issueCertification} 
              disabled={loading || !selectedParticipant || (useTemplate && !selectedTemplate) || (!useTemplate && !customCertification.name)}
              className="w-full"
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <Award className="w-4 h-4 mr-2" />
                  Issue Certification
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
