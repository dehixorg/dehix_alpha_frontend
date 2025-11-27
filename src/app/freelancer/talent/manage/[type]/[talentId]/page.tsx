'use client';

import { useMemo, useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useSelector } from 'react-redux';

import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import EmptyState from '@/components/shared/EmptyState';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ManageTalentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [talents, setTalents] = useState<
    Array<{ id: string; label: string; type: 'SKILL' | 'DOMAIN' }>
  >([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<
    'APPLIED' | 'SELECTED' | 'REJECTED' | 'INVITED' | 'LOBBY' | 'INTERVIEW'
  >('APPLIED');

  const type = String(params?.type || '').toUpperCase();
  const talentId = String(params?.talentId || '');
  const labelFromQuery = searchParams.get('label') || '';

  const title = useMemo(() => {
    const humanType =
      type === 'SKILL' ? 'Skill' : type === 'DOMAIN' ? 'Domain' : 'Talent';
    return `${humanType}: ${labelFromQuery || talentId}`;
  }, [type, labelFromQuery, talentId]);

  const breadcrumbItems = [
    { label: 'Freelancer', link: '/dashboard/freelancer' },
    { label: 'Dehix Talent', link: '/freelancer/talent' },
    { label: 'Manage', link: '#' },
  ];

  // Fetch all user's talents (skills and domains) to populate dropdown
  useEffect(() => {
    async function fetchTalents() {
      if (!user?.uid) return;
      try {
        const talentResponse = await axiosInstance.get(
          `/freelancer/dehix-talent/attributes/verified`,
        );
        const payload = Array.isArray(talentResponse.data?.data)
          ? talentResponse.data.data
          : Object.values(talentResponse.data?.data || {});
        const flattened = (payload as any[]).flat();
        const mapped = flattened
          .filter(
            (t: any) =>
              t?.talentId &&
              t?.talentName &&
              (t?.type === 'SKILL' || t?.type === 'DOMAIN'),
          )
          .map((t: any) => ({
            id: t.talentId as string,
            label: t.talentName as string,
            type: t.type as 'SKILL' | 'DOMAIN',
          }));
        // Deduplicate by id+type
        const seen = new Set<string>();
        const unique = mapped.filter((t) => {
          const k = `${t.id}-${t.type}`;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
        setTalents(unique);
      } catch (e) {
        // Fail silently for now
        console.error('Failed to fetch talents for dropdown', e);
      }
    }
    fetchTalents();
  }, [user?.uid]);

  useEffect(() => {
    async function fetchApplications() {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/freelancer/dehix-talent/applications`,
          {
            params: {
              status: activeStatus,
            },
          },
        );
        const data = response.data || {};
        setApplications(Array.isArray(data.applications) ? data.applications : []);
      } catch (error) {
        console.error('Failed to fetch applications', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, [user?.uid, activeStatus]);

  const selectedValue = `${type}:${talentId}`;

  const handleTalentChange = (value: string) => {
    const [newType, newId] = value.split(':');
    const sel = talents.find(
      (t) => t.id === newId && t.type === (newType as 'SKILL' | 'DOMAIN'),
    );
    router.push(
      `/freelancer/talent/manage/${newType.toLowerCase()}/${newId}?label=${encodeURIComponent(
        sel?.label || '',
      )}`,
    );
  };

  const renderApplicationCards = () => {
    const filtered = applications.filter((app) => {
      const appTalentId = app?.talent?.talentId;
      return appTalentId && appTalentId === talentId;
    });

    if (loading) {
      return (
        <EmptyState
          title="Loading applications"
          description="Please wait while we fetch your job applications for this talent."
        />
      );
    }

    if (!filtered || filtered.length === 0) {
      return (
        <EmptyState
          title="No applications found"
          description="You don't have any job applications in this stage yet. Once you apply or are invited, they will show up here."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((app, i) => {
          const companyName = app?.business?.companyName || 'Unknown company';
          const contactName =
            [app?.business?.firstName, app?.business?.lastName]
              .filter(Boolean)
              .join(' ');
          const talentName = app?.talent?.talentName;
          const experience = app?.talent?.experience;
          const status = app?.application?.applicationStatus || 'NA';
          const updatedAt = app?.application?.applicationUpdatedAt;
          const postStatus = app?.talent?.postStatus;
          const postUpdatedAt = app?.talent?.postUpdatedAt;
          const coverLetter = app?.application?.coverLetter;
          const profilePic = app?.business?.profilePic;

          const initials = companyName
            .split(' ')
            .map((part: string) => part.charAt(0))
            .join('')
            .slice(0, 2)
            .toUpperCase();

          return (
            <Card
              key={`${app?.hireId || i}`}
              className="shadow-sm h-full flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={profilePic} alt={companyName} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">
                      {companyName}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground truncate">
                      {contactName || 'Business contact'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-2 text-sm text-muted-foreground">
                {(talentName || experience) && (
                  <p className="font-medium text-xs text-primary uppercase tracking-wide">
                    {talentName}
                    {experience ? ` · ${experience} yrs exp` : ''}
                  </p>
                )}

                {app?.talent?.description && (
                  <p className="line-clamp-2 text-xs">
                    {app.talent.description}
                  </p>
                )}

                {(postStatus || postUpdatedAt) && (
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground/90">
                    {postStatus && (
                      <span className="uppercase tracking-wide">
                        Post: {postStatus}
                      </span>
                    )}
                    {postUpdatedAt && (
                      <span>
                        {new Date(postUpdatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                    {status}
                  </span>
                  <span>
                    {updatedAt
                      ? new Date(updatedAt).toLocaleDateString()
                      : 'Updated: NA'}
                  </span>
                </div>

                {coverLetter && (
                  <div className="mt-2 border-t pt-2 text-xs">
                    <p className="font-medium mb-0.5">Cover letter</p>
                    <p className="line-clamp-3 whitespace-pre-line">
                      {coverLetter}
                    </p>
                  </div>
                )}

                <div className="mt-3 flex justify-end">
                  <Button size="sm" variant="outline" type="button">
                    View details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Talent"
      />
      <div className="flex flex-col sm:gap-4 sm:pb-4 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Talent"
          breadcrumbItems={breadcrumbItems}
        />
        <main className="px-4 sm:px-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label="Back to Talent"
              >
                <Link href="/freelancer/talent">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-xl sm:text-2xl font-semibold">{title}</h1>
            </div>
          </div>

          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
              <CardTitle className="w-full text-center md:text-left">
                Manage Job Posts
              </CardTitle>
              <div className="w-full sm:w-64 md:w-64 mx-auto md:mx-0">
                <Select
                  value={selectedValue}
                  onValueChange={handleTalentChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select talent" />
                  </SelectTrigger>
                  <SelectContent>
                    {talents.map((t) => (
                      <SelectItem
                        key={`${t.type}:${t.id}`}
                        value={`${t.type}:${t.id}`}
                      >
                        {t.label} ({t.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeStatus.toLowerCase()}
                onValueChange={(value) =>
                  setActiveStatus(
                    value.toUpperCase() as
                      | 'APPLIED'
                      | 'SELECTED'
                      | 'REJECTED'
                      | 'INVITED'
                      | 'LOBBY'
                      | 'INTERVIEW',
                  )
                }
                className="w-full"
              >
                <TabsList>
                  <TabsTrigger value="applied">Applied</TabsTrigger>
                  <TabsTrigger value="selected">Selected</TabsTrigger>
                  <TabsTrigger value="invited">Invited</TabsTrigger>
                  <TabsTrigger value="lobby">Lobby</TabsTrigger>
                  <TabsTrigger value="interview">Interview</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>

                <TabsContent value="applied" className="mt-4">
                  {renderApplicationCards()}
                </TabsContent>

                <TabsContent value="selected" className="mt-4">
                  {renderApplicationCards()}
                </TabsContent>

                <TabsContent value="invited" className="mt-4">
                  {renderApplicationCards()}
                </TabsContent>

                <TabsContent value="lobby" className="mt-4">
                  {renderApplicationCards()}
                </TabsContent>

                <TabsContent value="interview" className="mt-4">
                  {renderApplicationCards()}
                </TabsContent>

                <TabsContent value="rejected" className="mt-4">
                  {renderApplicationCards()}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
