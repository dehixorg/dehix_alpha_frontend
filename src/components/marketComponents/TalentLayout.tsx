'use client';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  BookMarked,
  CheckCircle2,
  ChevronDown,
  Filter,
  Search,
  Users2,
  XCircle,
} from 'lucide-react';

import { Button } from '../ui/button';
import { Switch } from '../ui/switch';

import SidebarMenu from '@/components/menu/sidebarMenu';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvitedProfileCards from '@/components/marketComponents/sidebar-projectComponents/profileCards.tsx/invitedProfileCards';

// ------------------- Experience Helper -------------------
interface ProfessionalExperience {
  workFrom: string;
  workTo: string;
}
export const calculateExperience = (
  professionalInfo: ProfessionalExperience[],
): string => {
  if (!professionalInfo || professionalInfo.length === 0)
    return 'Not specified';
  let longestExperienceInMonths: number = 0;
  professionalInfo.forEach((job) => {
    if (job.workFrom && job.workTo) {
      const start = new Date(job.workFrom);
      const end = new Date(job.workTo);
      const diff =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());
      if (diff > longestExperienceInMonths) longestExperienceInMonths = diff;
    }
  });
  const years = Math.floor(longestExperienceInMonths / 12);
  const months = longestExperienceInMonths % 12;
  if (years === 0 && months === 0) return 'Less than a month';
  if (years === 0) return `${months} month${months > 1 ? 's' : ''}`;
  if (months === 0) return `${years} year${years > 1 ? 's' : ''}`;
  return `${years} year${years > 1 ? 's' : ''} and ${months} month${months > 1 ? 's' : ''}`;
};

interface TalentLayoutProps {
  activeTab: string;
}

const TalentLayout: React.FC<TalentLayoutProps> = ({ activeTab }) => {
  const [activePage, setActivePage] = useState('Talent');
  const [invitedTalents, setInvitedTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.user);
  const businessId = user?.uid;

  useEffect(() => {
    async function fetchInvitedTalents() {
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `business/hire-dehixtalent/free/${businessId}/invited`,
        );
        setInvitedTalents(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (businessId) fetchInvitedTalents();
  }, [businessId]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SidebarMenu
        menuItemsTop={[]}
        menuItemsBottom={[]}
        active={activePage}
        setActive={setActivePage}
      />

      <div className="ml-14 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold">Talent Management</h1>
          </div>
        </header>

        {/* Tabs */}
        <div className="container px-4 py-4">
          <Tabs defaultValue={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" asChild>
                <a href="/business/talent">
                  <Users2 className="h-4 w-4" />
                  Overview
                </a>
              </TabsTrigger>
              <TabsTrigger value="invited" asChild>
                <a href="/business/market/invited">
                  <BookMarked className="h-4 w-4" />
                  Invites
                </a>
              </TabsTrigger>
              <TabsTrigger value="accepted" asChild>
                <a href="/business/market/accepted">
                  <CheckCircle2 className="h-4 w-4" />
                  Accepted
                </a>
              </TabsTrigger>
              <TabsTrigger value="rejected" asChild>
                <a href="/business/market/rejected">
                  <XCircle className="h-4 w-4" />
                  Rejected
                </a>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Main */}
        <div className="container flex-1 items-start px-4 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Filters Sidebar */}
            <aside className="col-span-3">
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

            {/* Profile Cards */}
            <div className="col-span-9">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">
                  Invited Talents
                </h2>
                <span className="text-muted-foreground">
                  {loading
                    ? 'Loading...'
                    : `Showing ${invitedTalents.length} results`}
                </span>
              </div>

              {/* Cards */}
              <InvitedProfileCards
                talents={invitedTalents}
                loading={loading}
                calculateExperience={calculateExperience}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentLayout;
