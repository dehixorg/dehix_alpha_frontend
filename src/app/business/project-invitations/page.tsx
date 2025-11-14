'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutGrid,
  Table as TableIcon,
  Filter,
  User,
} from 'lucide-react';
import Image from 'next/image';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError } from '@/utils/toastMessage';
import processInvitations from '@/utils/invitations/processInvitations';
import InvitationCard from '@/components/business/invitations/InvitationCard';
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

const ProjectInvitationsPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [isTableView, setIsTableView] = useState(true);
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
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Project Invitations"
      />

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

      <div className="sm:pl-14 flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Project Invitations</h1>
            <p className="text-sm text-muted-foreground">
              Manage freelancer invitations sent for your projects
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Search invitations"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={() => setIsTableView(false)}
              aria-label="grid view"
            >
              <LayoutGrid />
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsTableView(true)}
              aria-label="table view"
            >
              <TableIcon />
            </Button>
          </div>
        </div>

        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as InvitationStatusFilter)
                }
                className="bg-transparent"
              >
                <option value="ALL">All</option>
                <option value={InvitationStatus.PENDING}>Pending</option>
                <option value={InvitationStatus.ACCEPTED}>Accepted</option>
                <option value={InvitationStatus.REJECTED}>Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent"
              >
                <option value="createdAt">Newest first</option>
                <option value="projectName">Project A-Z</option>
                <option value="freelancerName">Freelancer A-Z</option>
              </select>
              <select
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value as any)}
                className="bg-transparent"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>

          {loading ? (
            isTableView ? (
              <div className="rounded-lg border shadow-sm p-4">
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            )
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Search className="mx-auto mb-2" />
              <div>No invitations found</div>
            </div>
          ) : isTableView ? (
            <div className="rounded-lg border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Freelancer</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Profile</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Invited Date</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-40 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search className="h-8 w-8" />
                          <span>No invitations found</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((inv) => (
                      <TableRow key={inv._id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {inv.freelancerProfilePic ? (
                              <Image
                                width={32}
                                height={32}
                                src={inv.freelancerProfilePic}
                                alt={inv.freelancerName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <User className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">
                                {inv.freelancerName}
                              </div>
                              {inv.freelancerEmail && (
                                <div className="text-sm text-muted-foreground">
                                  {inv.freelancerEmail}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{inv.projectName}</div>
                          {inv.projectStatus && (
                            <div className="text-sm text-muted-foreground capitalize">
                              {inv.projectStatus.toLowerCase()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{inv.profileDomain}</div>
                          {inv.profileDescription && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {inv.profileDescription}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={statusOutlineClasses(inv.status)}>
                            {inv.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(inv.invitedAt).toLocaleDateString()}
                          </div>
                          {inv.respondedAt && (
                            <div className="text-xs text-muted-foreground">
                              Responded:{' '}
                              {new Date(inv.respondedAt).toLocaleDateString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/business/project/${inv.projectId}`)
                            }
                          >
                            View Project
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((inv) => (
                <InvitationCard
                  key={inv._id}
                  invitation={inv}
                  onViewProject={(pid) =>
                    router.push(`/business/project/${pid}`)
                  }
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProjectInvitationsPage;
