'use client';

import { useEffect, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
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
import ApplicationCard from '@/components/freelancer/talent/ApplicationCard';
import { notifyError, notifySuccess } from '@/utils/toastMessage';

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
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeStatus, setActiveStatus] = useState<
    'APPLIED' | 'SELECTED' | 'REJECTED' | 'INVITED' | 'LOBBY' | 'INTERVIEW'
  >('APPLIED');
  const [applyingByHireId, setApplyingByHireId] = useState<
    Record<string, boolean>
  >({});

  const type = String(params?.type || '').toUpperCase();
  const talentId = String(params?.talentId || '');
  const labelFromQuery = searchParams.get('label') || '';

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
          `/freelancer/${user.uid}/dehix-talent/status`,
        );

        const applied = talentResponse.data?.data?.APPLIED || {};
        const appliedSkills = Array.isArray(applied?.SKILL)
          ? applied.SKILL
          : [];
        const appliedDomains = Array.isArray(applied?.DOMAIN)
          ? applied.DOMAIN
          : [];

        const mapped = [...appliedSkills, ...appliedDomains]
          .filter(
            (t: any) =>
              t?.type_id &&
              t?.name &&
              (t?.type === 'SKILL' || t?.type === 'DOMAIN'),
          )
          .map((t: any) => ({
            id: t.type_id as string,
            label: t.name as string,
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
      if (!talentId) return;
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/freelancer/dehix-talent/${talentId}/applications`,
          {
            params: {
              status: activeStatus,
            },
          },
        );
        const data = response.data || {};
        setApplications(
          Array.isArray(data.applications) ? data.applications : [],
        );
      } catch (error) {
        console.error('Failed to fetch applications', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, [user?.uid, activeStatus, talentId, refreshKey]);

  const handleApply = async (app: any) => {
    const hireId = String(app?.hireId || app?.application?.hireId || '').trim();
    const businessId = String(
      app?.business?.businessId || app?.businessId || app?.business?._id || '',
    ).trim();
    const freelancerId = String(user?.uid || '').trim();

    if (!hireId || !businessId || !freelancerId) {
      notifyError('Missing required data to apply.', 'Error');
      return;
    }

    setApplyingByHireId((prev) => ({ ...prev, [hireId]: true }));
    try {
      await axiosInstance.post('/freelancer/dehix-talent/apply', {
        hireId,
        businessId,
        freelancerId,
      });
      notifySuccess('Applied successfully.', 'Success');
      setRefreshKey((k) => k + 1);
    } catch (error) {
      console.error('Failed to apply', error);
      notifyError('Failed to apply. Please try again.', 'Error');
    } finally {
      setApplyingByHireId((prev) => ({ ...prev, [hireId]: false }));
    }
  };

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
          const hireId = String(
            app?.hireId || app?.application?.hireId || '',
          ).trim();
          const companyName = app?.business?.companyName || 'Unknown company';
          const contactName = [
            app?.business?.firstName,
            app?.business?.lastName,
          ]
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
            <ApplicationCard
              key={`${hireId || i}`}
              companyName={companyName}
              contactName={contactName}
              profilePic={profilePic}
              initials={initials}
              status={status}
              talentName={talentName}
              experience={experience}
              description={app?.talent?.description}
              postStatus={postStatus}
              postUpdatedAt={postUpdatedAt}
              updatedAt={updatedAt}
              coverLetter={coverLetter}
              activeStatus={activeStatus}
              isApplying={Boolean(applyingByHireId[hireId])}
              onApply={() => handleApply(app)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <section className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Talent"
      />
      <div className="flex flex-col gap-4 sm:py-0 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Talent"
          breadcrumbItems={breadcrumbItems}
        />
        <main className="px-4 mb-5">
          <Card className="rounded-xl border shadow-sm overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
              <div className="flex items-start gap-3">
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  aria-label="Back to Talent"
                >
                  <Link href="/freelancer/talent">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base sm:text-lg">
                      {labelFromQuery || talentId}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="rounded-full text-[10px] font-semibold uppercase tracking-wide"
                    >
                      {type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Track applications by stage and manage invited
                    opportunities.
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-72 md:w-72">
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
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate">{t.label}</span>
                          <Badge
                            variant="outline"
                            className="rounded-full text-[10px] font-semibold uppercase tracking-wide"
                          >
                            {t.type}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
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
                <div className="border-b px-4 sm:px-6">
                  <TabsList className="bg-transparent h-12 w-full md:w-auto p-0">
                    <TabsTrigger
                      value="applied"
                      className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      Applied
                    </TabsTrigger>
                    <TabsTrigger
                      value="selected"
                      className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      Selected
                    </TabsTrigger>
                    <TabsTrigger
                      value="invited"
                      className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      Invited
                    </TabsTrigger>
                    <TabsTrigger
                      value="lobby"
                      className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      Lobby
                    </TabsTrigger>
                    <TabsTrigger
                      value="interview"
                      className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      Interview
                    </TabsTrigger>
                    <TabsTrigger
                      value="rejected"
                      className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      Rejected
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="applied" className="m-0 p-4 sm:p-6">
                  {renderApplicationCards()}
                </TabsContent>

                <TabsContent value="selected" className="m-0 p-4 sm:p-6">
                  {renderApplicationCards()}
                </TabsContent>

                <TabsContent value="invited" className="m-0 p-4 sm:p-6">
                  {renderApplicationCards()}
                </TabsContent>

                <TabsContent value="lobby" className="m-0 p-4 sm:p-6">
                  {renderApplicationCards()}
                </TabsContent>

                <TabsContent value="interview" className="m-0 p-4 sm:p-6">
                  {renderApplicationCards()}
                </TabsContent>

                <TabsContent value="rejected" className="m-0 p-4 sm:p-6">
                  {renderApplicationCards()}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </section>
  );
}
