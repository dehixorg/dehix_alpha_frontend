/* eslint-disable prettier/prettier */
'use client';
import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Phone,
  ExternalLink,
  CheckCircle,
  Mail,
  Github,
} from 'lucide-react';

import { axiosInstance } from '@/lib/axiosinstance';
import TalentLayout from '@/components/marketComponents/TalentLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

interface ProfessionalExperience {
  workFrom?: string;
  workTo?: string;
  jobTitle?: string;
  githubRepoLink?: string;
}

interface Project {
  techUsed?: string[];
}

interface TalentData {
  _id: string;
  firstName: string;
  lastName: string;
  profilePic?: string;
  email: string;
  phone?: string;
  location?: string;
  githubLink?: string;
  professionalInfo: ProfessionalExperience[];
  skills: { name: string; level: string; experience: string }[];
  projects: Record<string, Project>;
  kyc?: { createdAt?: string };
}

const AcceptedTalentsPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const [acceptedTalents, setAcceptedTalents] = useState<TalentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const businessId = user?.uid;

  const calculateExperience = (professionalInfo: ProfessionalExperience[]): string => {
    if (!professionalInfo || professionalInfo.length === 0) {
      return 'Not specified';
    }

    let totalExperienceInMonths = 0;
    professionalInfo.forEach((job) => {
      if (job.workFrom && job.workTo) {
        const start = new Date(job.workFrom);
        const end = new Date(job.workTo);

        if (start < end) {
          const diffInMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
          if (diffInMonths > 0) {
            totalExperienceInMonths += diffInMonths;
          }
        }
      }
    });

    const years = Math.floor(totalExperienceInMonths / 12);
    const months = totalExperienceInMonths % 12;

    if (years === 0 && months === 0) {
      return 'Less than a month';
    }

    const yearString = years > 0 ? `${years} year${years > 1 ? 's' : ''}` : '';
    const monthString = months > 0 ? `${months} month${months > 1 ? 's' : ''}` : '';

    if (yearString && monthString) {
      return `${yearString} and ${monthString}`;
    } else {
      return yearString || monthString;
    }
  };

  useEffect(() => {
    async function fetchAcceptedTalents() {
      if (!businessId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/business/hire-dehixtalent/free/${businessId}/selected`);
        const fetchedData = response.data.data.map((talent: TalentData) => {
          const latestWork = talent.professionalInfo
            .sort((a, b) => new Date(b.workTo || 0).getTime() - new Date(a.workTo || 0).getTime())
            .find(job => job.jobTitle && job.jobTitle.toLowerCase() !== 'string');

          const skills = (talent.skills || [])
            .filter((skill) => skill.name)
            .map(skill => skill.name);

          const projects = Object.values(talent.projects || {});
          const projectTech = projects.flatMap(
            (project) => project.techUsed || [],
          );
          const allSkills = [...new Set([...skills, ...projectTech])];

          return {
            id: talent._id,
            name: `${talent.firstName} ${talent.lastName}`,
            avatar: talent.profilePic,
            role: latestWork?.jobTitle || 'N/A',
            experience: calculateExperience(talent.professionalInfo),
            skills: allSkills,
            location: talent.location || 'N/A',
            phone: talent.phone || 'N/A',
            email: talent.email,
            githubLink: talent.githubLink,
            acceptedDate: talent.kyc?.createdAt ? new Date(talent.kyc.createdAt).toLocaleDateString() : 'N/A',
          };
        });
        setAcceptedTalents(fetchedData);
      } catch (error) {
        console.error('Error fetching accepted talents:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAcceptedTalents();
  }, [businessId]);

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(3)].map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-[120px]" />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Skeleton className="h-4 w-[180px]" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <TalentLayout activeTab="accepted">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Accepted Talents</h2>
          <span className="text-muted-foreground">Loading...</span>
        </div>
        {renderSkeleton()}
      </TalentLayout>
    );
  }

  return (
    <TalentLayout activeTab="accepted">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Accepted Talents</h2>
        <span className="text-muted-foreground">
          Showing {acceptedTalents.length} results
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {acceptedTalents.length > 0 ? (
          acceptedTalents.map((talent) => (
            <Card key={talent._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={talent.avatar} alt={talent.firstName} />
                      <AvatarFallback>
                        {talent.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{talent.firstName}</CardTitle>
                      <CardDescription>{talent.role}</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Accepted
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{talent.experience} of experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{talent.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{talent.email}</span>
                  </div>
                  {talent.phone !== 'N/A' && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{talent.phone}</span>
                    </div>
                  )}
                  {talent.githubLink && (
                    <div className="flex items-center gap-2 text-sm">
                      <Github className="h-4 w-4 text-muted-foreground" />
                      <a href={talent.githubLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        GitHub Profile
                      </a>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {talent.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="text-sm text-muted-foreground">
                  Accepted on {talent.acceptedDate}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Send Message
                  </Button>
                  <Button size="sm" className="flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    Contact
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground">
            No accepted talents found.
          </p>
        )}
      </div>
    </TalentLayout>
  );
};

export default AcceptedTalentsPage;