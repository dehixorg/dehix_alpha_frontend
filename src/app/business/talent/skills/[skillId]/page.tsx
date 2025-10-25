'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  Clock,
  FileText,
  Mail,
  MapPin,
  User,
  Users,
  Star,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { axiosInstance } from '@/lib/axiosinstance';

interface Freelancer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  location?: string;
  experience?: any[];
  education?: any[];
  skills?: string[];
  summary?: string;
  availability?: string;
  hourly_rate?: number;
  profile_picture?: string;
  cover_letter?: string;
  status?: string;
  match_score?: number;
  documents?: any[];
  languages?: string[];
  certifications?: string[];
}

export default function SkillFreelancersPage({
  params,
}: {
  params: { skillId: string };
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { skillId } = params;
  const type = searchParams.get('type'); // 'skill' or 'domain'
  const [itemData, setItemData] = useState<any>(null);

  // Parse the item data if it exists
  useEffect(() => {
    const itemDataString = searchParams.get('data');
    if (itemDataString) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(itemDataString));
        setItemData(parsedData);
        console.log('Received item data:', parsedData);
      } catch (error) {
        console.error('Error parsing item data:', error);
      }
    }
  }, [searchParams]);

  const [isLoading, setIsLoading] = useState(true);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [selectedFreelancer, setSelectedFreelancer] =
    useState<Freelancer | null>(null);
  const [skillName, setSkillName] = useState('');

  // Fetch freelancers based on skill or domain
  useEffect(() => {
    const fetchFreelancers = async () => {
      if (!skillId || !type) return;

      setIsLoading(true);
      try {
        let endpoint = '';
        if (type === 'skill') {
          endpoint = `/business/talent/by-skill/${skillId}`;
        } else if (type === 'domain') {
          endpoint = `/business/talent/by-domain/${skillId}`;
        } else if (type === 'all') {
          // If you want to fetch both skills and domains
          const [skillsResponse, domainsResponse] = await Promise.all([
            axiosInstance.get(`/business/talent/by-skill/${skillId}`),
            axiosInstance.get(`/business/talent/by-domain/${skillId}`),
          ]);

          if (skillsResponse.data?.success && domainsResponse.data?.success) {
            const combinedFreelancers = [
              ...(skillsResponse.data.data.freelancers || []),
              ...(domainsResponse.data.data.freelancers || []),
            ];

            // Remove duplicates based on freelancer ID
            const uniqueFreelancers = Array.from(
              new Map(
                combinedFreelancers.map((freelancer) => [
                  freelancer._id,
                  freelancer,
                ]),
              ).values(),
            );

            setFreelancers(uniqueFreelancers);
            setSkillName(`${skillsResponse.data.data.name} (Skills & Domains)`);
            if (uniqueFreelancers.length > 0) {
              setSelectedFreelancer(uniqueFreelancers[0]);
            }
            return;
          }
        }

        // For single type (skill or domain)
        const response = await axiosInstance.get(endpoint);

        if (response.data?.success) {
          setFreelancers(response.data.data.freelancers || []);
          setSkillName(
            `${response.data.data.name} (${type === 'skill' ? 'Skill' : 'Domain'})`,
          );
          if (response.data.data.freelancers?.length > 0) {
            setSelectedFreelancer(response.data.data.freelancers[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching freelancers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFreelancers();
  }, [skillId, type]);

  // Handle status update
  const handleStatusUpdate = async (freelancerId: string, status: string) => {
    try {
      await axiosInstance.patch(`/business/talent/status`, {
        freelancerId,
        status,
      });

      // Update local state
      setFreelancers((prev) =>
        prev.map((f) => (f._id === freelancerId ? { ...f, status } : f)),
      );

      if (selectedFreelancer?._id === freelancerId) {
        setSelectedFreelancer((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Group freelancers by type (skill or domain)
  const freelancersByType = freelancers.reduce(
    (acc, freelancer) => {
      const type = freelancer.skills?.includes(skillName) ? 'skill' : 'domain';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(freelancer);
      return acc;
    },
    {} as Record<string, Freelancer[]>,
  );

  const allTypes = Object.keys(freelancersByType);
  const [activeType, setActiveType] = useState<string>(allTypes[0] || 'all');

  // Filter freelancers based on active type
  const filteredFreelancers =
    activeType === 'all' ? freelancers : freelancersByType[activeType] || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{skillName}</h1>
            <p className="text-gray-500">
              {freelancers.length}{' '}
              {freelancers.length === 1 ? 'freelancer' : 'freelancers'} found
            </p>
          </div>

          {allTypes.length > 1 && (
            <div className="flex space-x-2">
              <Button
                variant={activeType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveType('all')}
              >
                All
              </Button>
              {allTypes.map((type) => (
                <Button
                  key={type}
                  variant={activeType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveType(type)}
                >
                  {type === 'skill' ? 'Skills' : 'Domains'}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Freelancers List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold">Available Freelancers</h2>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {filteredFreelancers.length > 0 ? (
              filteredFreelancers.map((freelancer) => (
                <Card
                  key={freelancer._id}
                  className={`cursor-pointer transition-colors ${
                    selectedFreelancer?._id === freelancer._id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => setSelectedFreelancer(freelancer)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={freelancer.profile_picture} />
                        <AvatarFallback>
                          {freelancer.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">
                          {freelancer.name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {freelancer.title}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">
                            {freelancer.location || 'Remote'}
                          </span>
                          {freelancer.hourly_rate && (
                            <>
                              <span className="mx-2">•</span>
                              <span>${freelancer.hourly_rate}/hr</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {freelancer.status || 'Available'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="mx-auto h-10 w-10 mb-2" />
                <p>
                  No{' '}
                  {activeType === 'all'
                    ? 'freelancers'
                    : activeType + ' freelancers'}{' '}
                  found
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Freelancer Details */}
        <div className="lg:col-span-2">
          {selectedFreelancer ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedFreelancer.name}</CardTitle>
                    <p className="text-muted-foreground">
                      {selectedFreelancer.title}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="font-medium">
                      {selectedFreelancer.match_score
                        ? `${selectedFreelancer.match_score}% Match`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <Tabs defaultValue="overview" className="w-full px-6">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Full Name
                        </p>
                        <p className="text-sm">{selectedFreelancer.name}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="text-sm flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          {selectedFreelancer.email}
                        </p>
                      </div>
                      {selectedFreelancer.phone && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="text-sm">{selectedFreelancer.phone}</p>
                        </div>
                      )}
                      {selectedFreelancer.location && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Location
                          </p>
                          <p className="text-sm flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            {selectedFreelancer.location}
                          </p>
                        </div>
                      )}
                      {selectedFreelancer.availability && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Availability
                          </p>
                          <p className="text-sm">
                            {selectedFreelancer.availability}
                          </p>
                        </div>
                      )}
                      {selectedFreelancer.hourly_rate && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Hourly Rate
                          </p>
                          <p className="text-sm flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            ${selectedFreelancer.hourly_rate}/hour
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills & Expertise */}
                  {selectedFreelancer.skills &&
                    selectedFreelancer.skills.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-medium">Skills & Expertise</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedFreelancer.skills.map((skill, i) => (
                            <Badge
                              key={i}
                              variant={
                                skill === skillName ? 'default' : 'secondary'
                              }
                              className="text-sm"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Professional Summary */}
                  {selectedFreelancer.summary && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Professional Summary</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedFreelancer.summary}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="experience" className="space-y-6">
                  {/* Work Experience */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Work Experience</h3>
                    {selectedFreelancer.experience &&
                    selectedFreelancer.experience.length > 0 ? (
                      <div className="space-y-4">
                        {selectedFreelancer.experience.map((exp, i) => (
                          <div
                            key={i}
                            className="border-l-2 border-primary pl-4 py-1"
                          >
                            <div className="flex justify-between">
                              <h4 className="font-medium">{exp.title}</h4>
                              <span className="text-sm text-muted-foreground">
                                {exp.startDate} - {exp.endDate || 'Present'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {exp.company} • {exp.location}
                            </p>
                            {exp.description && (
                              <p className="text-sm mt-1">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No work experience added
                      </p>
                    )}
                  </div>

                  {/* Education */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Education</h3>
                    {selectedFreelancer.education &&
                    selectedFreelancer.education.length > 0 ? (
                      <div className="space-y-4">
                        {selectedFreelancer.education.map((edu, i) => (
                          <div
                            key={i}
                            className="border-l-2 border-primary pl-4 py-1"
                          >
                            <div className="flex justify-between">
                              <h4 className="font-medium">{edu.degree}</h4>
                              <span className="text-sm text-muted-foreground">
                                {edu.startYear} - {edu.endYear || 'Present'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {edu.institution}
                              {edu.fieldOfStudy && ` • ${edu.fieldOfStudy}`}
                            </p>
                            {edu.description && (
                              <p className="text-sm mt-1">{edu.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No education information available
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-6">
                  {/* Cover Letter */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Cover Letter</h3>
                    {selectedFreelancer.cover_letter ? (
                      <div className="p-4 bg-muted/50 rounded-md">
                        <p className="whitespace-pre-line text-sm">
                          {selectedFreelancer.cover_letter}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No cover letter provided
                      </p>
                    )}
                  </div>

                  {/* Resume & Portfolio */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Documents</h3>
                    {selectedFreelancer.documents &&
                    selectedFreelancer.documents.length > 0 ? (
                      <div className="space-y-2">
                        {selectedFreelancer.documents.map((doc, i) => (
                          <a
                            key={i}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-primary hover:underline"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            {doc.name || 'Document'} (Click to view)
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No documents uploaded
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2 p-6 pt-0 border-t">
                <Button
                  variant="outline"
                  onClick={() =>
                    handleStatusUpdate(selectedFreelancer._id, 'rejected')
                  }
                  disabled={selectedFreelancer.status === 'rejected'}
                >
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    handleStatusUpdate(selectedFreelancer._id, 'shortlisted')
                  }
                  disabled={selectedFreelancer.status === 'shortlisted'}
                >
                  Shortlist
                </Button>
                <Button
                  onClick={() =>
                    handleStatusUpdate(selectedFreelancer._id, 'hired')
                  }
                  disabled={selectedFreelancer.status === 'hired'}
                >
                  {selectedFreelancer.status === 'hired' ? 'Hired' : 'Hire Now'}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
              <User className="h-12 w-12 mb-2" />
              <p>Select a freelancer to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
