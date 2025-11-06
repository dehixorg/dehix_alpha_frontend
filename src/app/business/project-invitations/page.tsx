'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError } from '@/utils/toastMessage';
import processInvitations from '@/utils/invitations/processInvitations';
import InvitationCard from '@/components/business/invitations/InvitationCard';
import {
  ProjectInvitation,
  InvitationStatus,
  InvitationStatusFilter,
} from '@/types/invitation';
import { Search, LayoutGrid, Table as TableIcon, Filter } from 'lucide-react';
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

        const processed = processInvitations(hires, projects, {});
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
            <div className="grid gap-4">
              <div className="h-12 bg-muted/50 rounded" />
              <div className="h-12 bg-muted/50 rounded" />
              <div className="h-12 bg-muted/50 rounded" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Search className="mx-auto mb-2" />
              <div>No invitations found</div>
            </div>
          ) : isTableView ? (
            <div className="overflow-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="p-2">Project</th>
                    <th className="p-2">Profile</th>
                    <th className="p-2">Freelancer</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Invited</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => (
                    <tr key={inv._id} className="border-t">
                      <td className="p-2">{inv.projectName}</td>
                      <td className="p-2">{inv.profileDomain}</td>
                      <td className="p-2">{inv.freelancerName}</td>
                      <td className="p-2">{inv.status}</td>
                      <td className="p-2">
                        {new Date(inv.invitedAt).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            router.push(`/business/project/${inv.projectId}`)
                          }
                        >
                          View Project
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
