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
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Trash2,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inviteToDelete, setInviteToDelete] =
    useState<ProjectInvitation | null>(null);
  const [deletingInviteId, setDeletingInviteId] = useState<string | null>(null);
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
        const res = await axiosInstance.get('/business/invite');
        const rows = res?.data?.data || [];

        const mapped: ProjectInvitation[] = (rows as any[]).map((row: any) => {
          const rawStatus = String(row?.status || 'PENDING').toUpperCase();
          const status: InvitationStatus =
            rawStatus === InvitationStatus.ACCEPTED
              ? InvitationStatus.ACCEPTED
              : rawStatus === InvitationStatus.REJECTED
                ? InvitationStatus.REJECTED
                : InvitationStatus.PENDING;

          return {
            _id:
              row?.inviteId ||
              row?._id ||
              `${row?.projectId}_${row?.freelancerId}_${row?.invitedAt}`,
            projectId: row?.projectId,
            projectName: row?.projectName || 'Untitled Project',
            projectStatus: row?.projectStatus,
            profileId: row?.profileId,
            profileDomain: row?.profileName || row?.profileDomain,
            freelancerId: row?.freelancerId,
            freelancerName: row?.freelancerName || 'Unknown',
            freelancerProfilePic: row?.freelancerProfilePic,
            status,
            invitedAt: row?.invitedAt || new Date().toISOString(),
            respondedAt: row?.respondedAt,
          };
        });

        setInvitations(mapped);
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
        [inv.projectName, inv.profileDomain || '', inv.freelancerName]
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

  const handleDeleteInvite = async () => {
    if (!inviteToDelete?._id) return;
    const inviteId = inviteToDelete._id;

    setDeletingInviteId(inviteId);
    try {
      await axiosInstance.delete(`/business/invite/${inviteId}`);
      setInvitations((prev) => prev.filter((i) => i._id !== inviteId));
      notifySuccess('Invitation deleted successfully');
      setDeleteDialogOpen(false);
      setInviteToDelete(null);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to delete invitation';
      notifyError(errorMessage);
    } finally {
      setDeletingInviteId(null);
    }
  };

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
                      <ArrowUpNarrowWide className="h-4 w-4" />
                    ) : (
                      <ArrowDownNarrowWide className="h-4 w-4" />
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
                  className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <CardHeader className="p-4 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative">
                          <Avatar className="h-10 w-10 border">
                            <AvatarImage
                              src={inv.freelancerProfilePic || ''}
                              alt={inv.freelancerName}
                            />
                            <AvatarFallback>
                              {(inv.freelancerName || 'U')
                                .split(' ')
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((p) => p[0])
                                .join('')
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
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

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <CardTitle className="text-base truncate">
                              {inv.freelancerName}
                            </CardTitle>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {inv.profileDomain || 'Profile'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            statusOutlineClasses(inv.status),
                            'text-xs h-6 px-2 py-0.5 whitespace-nowrap',
                          )}
                        >
                          {inv.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-0">
                    <div
                      className="group rounded-lg border bg-gradient p-4 cursor-pointer transition-colors hover:bg-muted/20"
                      onClick={() =>
                        router.push(`/business/project/${inv.projectId}`)
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          router.push(`/business/project/${inv.projectId}`);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Project
                          </div>
                          <div className="mt-0.5 text-sm leading-snug truncate">
                            {inv.projectName}
                          </div>
                        </div>

                        {inv.projectStatus && (
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <span
                              className={cn(
                                'h-2.5 w-2.5 rounded-full',
                                inv.projectStatus?.toUpperCase() === 'ACTIVE' &&
                                  'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]',
                                inv.projectStatus?.toUpperCase() ===
                                  'PENDING' &&
                                  'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]',
                                inv.projectStatus?.toUpperCase() ===
                                  'COMPLETED' &&
                                  'bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.9)]',
                                !['ACTIVE', 'PENDING', 'COMPLETED'].includes(
                                  inv.projectStatus?.toUpperCase() || '',
                                ) &&
                                  'bg-slate-400 shadow-[0_0_12px_rgba(148,163,184,0.7)]',
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {inv.profileDescription && (
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                        {inv.profileDescription}
                      </p>
                    )}
                  </CardContent>

                  <Separator />

                  <CardFooter className="p-4 pt-3 justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      <span>
                        {new Date(inv.invitedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setInviteToDelete(inv);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setInviteToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Delete invitation?</DialogTitle>
            <DialogDescription>
              This will permanently delete the invitation for{' '}
              <span className="font-medium text-foreground">
                {inviteToDelete?.freelancerName || 'this freelancer'}
              </span>{' '}
              on project{' '}
              <span className="font-medium text-foreground">
                {inviteToDelete?.projectName || 'this project'}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={!!deletingInviteId}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteInvite}
              disabled={
                !inviteToDelete?._id || deletingInviteId === inviteToDelete?._id
              }
            >
              {deletingInviteId === inviteToDelete?._id
                ? 'Deleting...'
                : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectInvitationsPage;
