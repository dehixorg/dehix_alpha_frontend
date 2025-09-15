// src/components/marketComponents/TalentLayout.tsx
'use client';
import React, { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookMarked,
  CheckCircle2,
  ChevronDown,
  Filter,
  Search,
  Users2,
  XCircle,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

import SidebarMenu from '@/components/menu/sidebarMenu';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import TalentContent from './TalentContent';

interface TalentLayoutProps {
  activeTab: 'invited' | 'accepted' | 'rejected' | 'overview';
}
interface ProfessionalExperience {
  workFrom?: string;
  workTo?: string;
  jobTitle?: string;
}
interface TalentData {
  invited: any[];
  accepted: any[];
  rejected: any[];
}
export const calculateExperience = (professionalInfo: ProfessionalExperience[]): string => {
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

  if (years === 0 && months === 0) return 'Less than a month';
  const yearString = years > 0 ? `${years} year${years > 1 ? 's' : ''}` : '';
  const monthString = months > 0 ? `${months} month${months > 1 ? 's' : ''}` : '';

  if (yearString && monthString) return `${yearString} and ${monthString}`;
  return yearString || monthString;
};


const TalentLayout: React.FC<TalentLayoutProps> = ({ activeTab }) => {
  const router = useRouter();
  const [activePage, setActivePage] = useState('Talent');
  const user = useSelector((state: RootState) => state.user);
  const businessId = user?.uid;

  const [talentData, setTalentData] = useState<TalentData>({
    invited: [],
    accepted: [],
    rejected: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!businessId || activeTab === 'overview') {
        return;
      }

      // Check if data is already cached
      if (talentData[activeTab]?.length > 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let endpoint = '';
        if (activeTab === 'invited') {
          endpoint = `/business/hire-dehixtalent/free/${businessId}/invited`;
        } else if (activeTab === 'accepted') {
          endpoint = `/business/hire-dehixtalent/free/${businessId}/selected`;
        } else if (activeTab === 'rejected') {
          endpoint = `/business/hire-dehixtalent/free/${businessId}/rejected`;
        }

        const response = await axiosInstance.get(endpoint);
        setTalentData(prevData => ({
          ...prevData,
          [activeTab]: response.data.data,
        }));
      } catch (err) {
        console.error('Error fetching talents:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [businessId]);

  const handleTabChange = (value: string) => {
    router.push(`/business/market/${value}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SidebarMenu
        menuItemsTop={[]}
        menuItemsBottom={[]}
        active={activePage}
        setActive={setActivePage}
      />
      <div className="ml-14 flex flex-col min-h-screen">
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold">Talent Management</h1>
          </div>
        </header>
        <div className="container px-4 py-4">
          <Tabs value={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" asChild>
                <a href="/business/talent">
                  <Users2 className="h-4 w-4" />
                  Overview
                </a>
              </TabsTrigger>
              <TabsTrigger
                value="invited"
                onClick={() => handleTabChange('invited')}
              >
                <BookMarked className="h-4 w-4" />
                Invites
              </TabsTrigger>
              <TabsTrigger
                value="accepted"
                onClick={() => handleTabChange('accepted')}
              >
                <CheckCircle2 className="h-4 w-4" />
                Accepted
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                onClick={() => handleTabChange('rejected')}
              >
                <XCircle className="h-4 w-4" />
                Rejected
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="container flex-1 items-start px-4 py-6">
          <div className="grid grid-cols-12 gap-6">
            <aside className="col-span-3">
              {/* Your filter sidebar component here */}
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by name, skills..."
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="space-y-1">
                      {['React', 'TypeScript', 'NextJS', 'UI/UX'].map(
                        (skill) => (
                          <div
                            key={skill}
                            className="flex items-center space-x-2"
                          >
                            <Switch id={`skill-${skill}`} />
                            <Label
                              htmlFor={`skill-${skill}`}
                              className="font-normal"
                            >
                              {skill}
                            </Label>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Experience</Label>
                    <div className="space-y-1">
                      {['Junior', 'Mid-level', 'Senior', 'Lead'].map((exp) => (
                        <div key={exp} className="flex items-center space-x-2">
                          <Switch id={`exp-${exp}`} />
                          <Label htmlFor={`exp-${exp}`} className="font-normal">
                            {exp}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <div className="relative">
                      <Input placeholder="Select location" />
                      <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button variant="outline">Reset</Button>
                    <Button>Apply Filters</Button>
                  </div>
                </CardContent>
              </Card>
            </aside>
            <div className="col-span-9">
              <TalentContent
                activeTab={activeTab}
                talents={talentData[activeTab]}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentLayout;