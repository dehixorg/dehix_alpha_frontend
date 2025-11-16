'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutGrid,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock4,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Image from 'next/image';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError } from '@/utils/toastMessage';
import processInvitations from '@/utils/invitations/processInvitations';
import { statusOutlineClasses } from '@/utils/common/getBadgeStatus';
import {
  ProjectInvitation,
  InvitationStatus,
  InvitationStatusFilter,
} from '@/types/invitation';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import {
  menuItemsTop,
  menuItemsBottom,
} from '@/config/menuItems/business/dashboardMenuItems';
import EmptyState from '@/components/shared/EmptyState';

const ProjectInvitationsPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<InvitationStatusFilter>('ALL');
  const [sortBy, setSortBy] = useState<
    'createdAt' | 'projectName' | 'freelancerName'
  >('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [hiRes, pRes] = await Promise.all([
          axiosInstance.get('/business/hire-dehixtalent'),
          axiosInstance.get('/project/business'),
        ]);

        const hires = hiRes?.data?.data || [];
        const projects = pRes?.data?.data || [];

        // Extract unique freelancer IDs from all hire documents
        const freelancerIdsSet = new Set<string>();
        for (const hire of hires) {
          const freelancers = hire.freelancers || [];
          for (const entry of freelancers) {
            const freelancerId =
              entry.freelancerId || entry.freelancer_id || entry.freelancer;
            if (freelancerId) {
              freelancerIdsSet.add(freelancerId);
            }
          }
        }

        // Fetch freelancer details using batch API
        const freelancersMap: Record<string, any> = {};
        const freelancerIds = Array.from(freelancerIdsSet);

        if (freelancerIds.length > 0) {
          try {
            const idsParam = JSON.stringify(freelancerIds);
            const freelancerRes = await axiosInstance.get('/public/user_id', {
              params: { user_ids: idsParam },
            });
            const freelancersData = freelancerRes?.data?.data || [];

            // Build freelancersMap
            for (const freelancer of freelancersData) {
              if (freelancer._id) {
                freelancersMap[freelancer._id] = freelancer;
              }
            }
          } catch (freelancerErr) {
            console.warn('Failed to fetch freelancer details:', freelancerErr);
            // Continue with empty map
          }
        }

        const processed = processInvitations(hires, projects, freelancersMap);
        setInvitations(processed);
      } catch (err: any) {
        console.error('Failed to load invitations', err);
        notifyError(err?.message || 'Failed to load invitations', 'Error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    let arr = invitations.slice();
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter((inv) =>
        [inv.projectName, inv.profileDomain, inv.freelancerName]
          .join(' ')
          .toLowerCase()
          .includes(q),
      );
    }
    if (statusFilter !== 'ALL') {
      arr = arr.filter((i) => i.status === statusFilter);
    }
    arr.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'projectName')
        return dir * a.projectName.localeCompare(b.projectName);
      if (sortBy === 'freelancerName')
        return dir * a.freelancerName.localeCompare(b.freelancerName);
      // createdAt
      return (
        dir *
        (new Date(a.invitedAt).getTime() - new Date(b.invitedAt).getTime())
      );
    });
    return arr;
  }, [invitations, search, statusFilter, sortBy, sortDir]);

  return (
    <div className="flex min-h-screen w-full">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Project Invitations"
      />
      <div className="w-full flex flex-col sm:gap-4 sm:py-4 md:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Project Invitations"
          breadcrumbItems={[
            { label: 'Business', link: '/dashboard/business' },
            {
              label: 'Project Invitations',
              link: '/business/project-invitations',
            },
          ]}
        />

        <main className="gap-4 p-4 sm:px-6 sm:py-3 md:gap-8">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Project Invitations
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage and track all your project invitations in one place
              </p>
            </div>

            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <Tabs
                defaultValue={statusFilter}
                onValueChange={(value: string) =>
                  setStatusFilter(value as InvitationStatusFilter)
                }
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-4 sm:w-auto">
                  <TabsTrigger value="ALL" className="text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value={InvitationStatus.PENDING}
                    className="text-xs"
                  >
                    <Clock4 className="h-3 w-3 mr-1.5" />
                    Pending
                  </TabsTrigger>
                  <TabsTrigger
                    value={InvitationStatus.ACCEPTED}
                    className="text-xs"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1.5 text-green-500" />
                    Accepted
                  </TabsTrigger>
                  <TabsTrigger
                    value={InvitationStatus.REJECTED}
                    className="text-xs"
                  >
                    <XCircle className="h-3 w-3 mr-1.5 text-red-500" />
                    Rejected
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value as any)}
                  >
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Invitation Date</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="projectName">
                        <div className="flex items-center">
                          <LayoutGrid className="h-4 w-4 mr-2" />
                          <span>Project Name</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="freelancerName">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <span>Freelancer Name</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                    }
                    className="h-9 w-9"
                  >
                    {sortDir === 'asc' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="space-y-4 mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="p-4 space-y-4">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                }
                title="No invitations found"
                description={
                  search || statusFilter !== 'ALL'
                    ? 'Try adjusting your search or filter criteria.'
                    : "You haven't sent any project invitations yet."
                }
                actions={
                  (search || statusFilter !== 'ALL') && (
                    <Button
                      variant="ghost"
                      className="mt-4"
                      onClick={() => {
                        setSearch('');
                        setStatusFilter('ALL');
                      }}
                    >
                      Clear filters
                    </Button>
                  )
                }
                className="py-16 text-center"
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
              {filtered.map((inv) => (
                <Card
                  key={inv._id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          {inv.freelancerProfilePic ? (
                            <Image
                              width={40}
                              height={40}
                              src={inv.freelancerProfilePic}
                              alt={inv.freelancerName}
                              className="w-10 h-10 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted/80 flex items-center justify-center">
                              <User className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-background flex items-center justify-center">
                            {inv.status === InvitationStatus.ACCEPTED ? (
                              <CheckCircle2 className="w-3 h-3 text-green-500 fill-green-500/20" />
                            ) : inv.status === InvitationStatus.REJECTED ? (
                              <XCircle className="w-3 h-3 text-red-500 fill-red-500/20" />
                            ) : (
                              <Clock4 className="w-3 h-3 text-amber-500 fill-amber-500/20" />
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium">{inv.freelancerName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {inv.profileDomain}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          statusOutlineClasses(inv.status),
                          'text-xs h-6 px-2 py-0.5',
                        )}
                      >
                        {inv.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">{inv.projectName}</h4>
                      {inv.projectStatus && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {inv.projectStatus.toLowerCase()}
                        </Badge>
                      )}
                      {inv.profileDescription && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {inv.profileDescription}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        <span>
                          {new Date(inv.invitedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/business/project/${inv.projectId}`)
                        }
                      >
                        View Project
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProjectInvitationsPage;
