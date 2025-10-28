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
          `/freelancer/${user.uid}/dehix-talent`,
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
      if (!user?.uid || !talentId) return;
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/freelancer/${user.uid}/dehix-talent/${talentId}/applications`,
        );
        setApplications(response.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch applications', error);
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, [user?.uid, talentId]);

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

  const renderApplicationCards = (status: string) => {
    const filteredApplications = applications.filter(
      (app) => app.status.toLowerCase() === status.toLowerCase(),
    );

    if (loading) {
      return <p>Loading...</p>;
    }

    if (filteredApplications.length === 0) {
      return <p>No applications found.</p>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApplications.map((app, i) => (
          <Card key={`${status}-${i}`} className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{app.project_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Status: {app.status}</p>
                <p>Updated: {new Date(app.updatedAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
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
          activeMenu="Projects"
          breadcrumbItems={breadcrumbItems}
        />
        <main className="px-4 sm:px-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/freelancer/talent">
                <Button variant="ghost" size="icon" aria-label="Back to Talent">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
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
              <Tabs defaultValue="applied" className="w-full">
                <TabsList>
                  <TabsTrigger value="applied">Applied</TabsTrigger>
                  <TabsTrigger value="invited">Invited</TabsTrigger>
                  <TabsTrigger value="interview">Interview</TabsTrigger>
                  <TabsTrigger value="accepted">Accepted</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>

                <TabsContent value="applied" className="mt-4">
                  {renderApplicationCards('applied')}
                </TabsContent>

                <TabsContent value="invited" className="mt-4">
                  {renderApplicationCards('invited')}
                </TabsContent>

                <TabsContent value="interview" className="mt-4">
                  {renderApplicationCards('interview')}
                </TabsContent>

                <TabsContent value="accepted" className="mt-4">
                  {renderApplicationCards('accepted')}
                </TabsContent>

                <TabsContent value="rejected" className="mt-4">
                  {renderApplicationCards('rejected')}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
