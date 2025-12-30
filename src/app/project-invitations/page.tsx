'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
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
  CircleX,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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
import {
  menuItemsTop as freelancerMenuItemsTop,
  menuItemsBottom as freelancerMenuItemsBottom,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import EmptyState from '@/components/shared/EmptyState';
import StatusDot from '@/components/shared/StatusDot';
import { useAppSelector } from '@/lib/hooks';
import { projectInvitationService } from '@/services/projectInvitation';

const ProjectInvitationsPage: React.FC = () => {
  const router = useRouter();
  const userTypeFromStore = useAppSelector((s) => s.user.type);
  const userType = userTypeFromStore || (Cookies.get('userType') as any);
  const isBusiness = userType === 'business';
  const isFreelancer = userType === 'freelancer';

  const sidebarMenuItemsTop = isFreelancer
    ? freelancerMenuItemsTop
    : menuItemsTop;
  const sidebarMenuItemsBottom = isFreelancer
    ? freelancerMenuItemsBottom
    : menuItemsBottom;

  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inviteToDelete, setInviteToDelete] =
    useState<ProjectInvitation | null>(null);
  const [deletingInviteId, setDeletingInviteId] = useState<string | null>(null);
  const [rejectingInviteId, setRejectingInviteId] = useState<string | null>(
    null,
  );
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
        const res = await projectInvitationService.getInvitations(isFreelancer);
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
            freelancerId:
              row?.freelancerId || row?.businessId || row?.companyId,
            freelancerName:
              row?.freelancerName ||
              row?.businessName ||
              row?.companyName ||
              'Unknown',
            freelancerProfilePic:
              row?.freelancerProfilePic || row?.businessProfilePic,
            status,
            invitedAt: row?.invitedAt || new Date().toISOString(),
            respondedAt: row?.respondedAt,
            hireId: row?.hireId || row?.hire_id,
            freelancerEntryId:
              row?.freelancerEntryId ||
              row?.freelancer_entry_id ||
              row?.freelancer_professional_profile_id,
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
  }, [isFreelancer]);

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
    if (!isBusiness) return;
    if (!inviteToDelete?._id) return;
    const inviteId = inviteToDelete._id;

    setDeletingInviteId(inviteId);
    try {
      const res = await projectInvitationService.deleteInvitation(inviteId);
      if (!res?.success) {
        const errorMessage =
          res?.data?.message ||
          res?.data?.error ||
          'Failed to delete invitation';
        notifyError(errorMessage);
        return;
      }
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

  const handleRejectInvite = async (inv: ProjectInvitation) => {
    if (!isFreelancer) return;
    if (!inv) return;

    const inviteId = inv._id;
    if (!inviteId) {
      notifyError('Missing inviteId. Please refresh and try again.');
      return;
    }

    setRejectingInviteId(inv._id);
    try {
      const res = await projectInvitationService.rejectInvitation(inviteId);
      if (!res?.success) {
        const errorMessage =
          res?.data?.message ||
          res?.data?.error ||
          'Failed to reject invitation';
        notifyError(errorMessage);
        return;
      }
      notifySuccess('Invitation rejected successfully');

      setInvitations((prev) => prev.filter((x) => x._id !== inv._id));
    } catch (error: any) {
      notifyError(
        error?.response?.data?.message || 'Failed to reject invitation',
      );
    } finally {
      setRejectingInviteId(null);
    }
  };

  const InvitationsContent = () => {
    return (
      <>
        <CardContent>
          {loading ? (
            <div className="space-y-4 mt-6">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6">
              {filtered.map((inv) => (
                <Card
                  key={inv._id}
                  className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <CardHeader className="p-4 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative">
                          <Avatar
                            className="h-10 w-10 border cursor-pointer"
                            onClick={() =>
                              router.push(
                                `/business/freelancerProfile/${inv.freelancerId}`,
                              )
                            }
                          >
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
                        router.push(
                          isFreelancer
                            ? `/freelancer/project/${inv.projectId}`
                            : `/business/project/${inv.projectId}`,
                        )
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          router.push(
                            isFreelancer
                              ? `/freelancer/project/${inv.projectId}`
                              : `/business/project/${inv.projectId}`,
                          );
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

                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <StatusDot status={inv.projectStatus} />
                        </div>
                      </div>
                    </div>

                    {inv.profileDescription && (
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                        {inv.profileDescription}
                      </p>
                    )}
                  </CardContent>

                  <Separator />

                  <CardFooter className="p-4 pt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                    <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
                      {isFreelancer &&
                        inv.status === InvitationStatus.PENDING && (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={rejectingInviteId === inv._id}
                            onClick={() => handleRejectInvite(inv)}
                          >
                            <CircleX className="h-4 w-4" />
                            {rejectingInviteId === inv._id
                              ? 'Rejecting...'
                              : 'Reject'}
                          </Button>
                        )}
                      {isBusiness && (
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
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={sidebarMenuItemsTop}
        menuItemsBottom={sidebarMenuItemsBottom}
        active="Project Invitations"
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14">
        <Header
          menuItemsTop={sidebarMenuItemsTop}
          menuItemsBottom={sidebarMenuItemsBottom}
          activeMenu="Project Invitations"
          breadcrumbItems={[
            {
              label: isFreelancer ? 'Freelancer' : 'Business',
              link: isFreelancer
                ? '/dashboard/freelancer'
                : '/dashboard/business',
            },
            {
              label: 'Project Invitations',
              link: '/project-invitations',
            },
          ]}
        />

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0">
          <div className="w-full mx-auto">
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  Project Invitations
                </h1>
                <p className="text-muted-foreground">
                  Manage and track all your project invitations in one place
                </p>
              </div>

              <div className="flex w-full items-center justify-start gap-2 sm:w-auto">
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as any)}
                >
                  <SelectTrigger className="h-9 w-14 px-2 sm:w-auto sm:px-3">
                    <div className="flex w-full items-center justify-center gap-2 min-w-0 sm:justify-start">
                      <span className="shrink-0">
                        {sortBy === 'createdAt' ? (
                          <Calendar className="h-4 w-4" />
                        ) : sortBy === 'projectName' ? (
                          <LayoutGrid className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </span>
                      <span className="hidden sm:inline truncate">
                        {sortBy === 'createdAt'
                          ? 'Invitation Date'
                          : sortBy === 'projectName'
                            ? 'Project Name'
                            : isFreelancer
                              ? 'Business Name'
                              : 'Freelancer Name'}
                      </span>
                    </div>
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
                        <span>
                          {isFreelancer ? 'Business Name' : 'Freelancer Name'}
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
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

            <div className="card rounded-xl border shadow-sm mb-6 max-w-full">
              {isFreelancer ? (
                <>
                  <InvitationsContent />
                </>
              ) : (
                <Tabs
                  value={statusFilter}
                  onValueChange={(value: string) =>
                    setStatusFilter(value as InvitationStatusFilter)
                  }
                  className="max-w-[92vw]"
                >
                  <div className="border-b px-4 sm:px-6">
                    <div className="max-w-full overflow-x-auto">
                      <TabsList className="bg-transparent h-12 w-max min-w-max md:w-auto p-0 whitespace-nowrap">
                        <TabsTrigger
                          value="ALL"
                          className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                        >
                          <LayoutGrid className="mr-2 h-4 w-4" />
                          All
                        </TabsTrigger>
                        <TabsTrigger
                          value={InvitationStatus.PENDING}
                          className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                        >
                          <Clock4 className="mr-2 h-4 w-4" />
                          Pending
                        </TabsTrigger>
                        <TabsTrigger
                          value={InvitationStatus.ACCEPTED}
                          className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Accepted
                        </TabsTrigger>
                        <TabsTrigger
                          value={InvitationStatus.REJECTED}
                          className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Rejected
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </div>

                  <TabsContent value="ALL" className="m-0">
                    <InvitationsContent />
                  </TabsContent>
                  <TabsContent value={InvitationStatus.PENDING} className="m-0">
                    <InvitationsContent />
                  </TabsContent>
                  <TabsContent
                    value={InvitationStatus.ACCEPTED}
                    className="m-0"
                  >
                    <InvitationsContent />
                  </TabsContent>
                  <TabsContent
                    value={InvitationStatus.REJECTED}
                    className="m-0"
                  >
                    <InvitationsContent />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </main>
      </div>

      {isBusiness && (
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
                  !inviteToDelete?._id ||
                  deletingInviteId === inviteToDelete?._id
                }
              >
                {deletingInviteId === inviteToDelete?._id
                  ? 'Deleting...'
                  : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProjectInvitationsPage;
