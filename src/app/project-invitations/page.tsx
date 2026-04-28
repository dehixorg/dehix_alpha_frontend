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
  X,
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
import { useProjectInvitationTour } from '@/components/tour/shared/useProjectInvitationTour';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

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
  const [rejectingInviteId, setRejectingInviteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<InvitationStatusFilter>('ALL');
  const [sortBy, setSortBy] = useState<
    'createdAt' | 'projectName' | 'freelancerName'
  >('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useProjectInvitationTour(true);

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
      return (
        dir *
        (new Date(a.invitedAt).getTime() -
          new Date(b.invitedAt).getTime())
      );
    });
    return arr;
  }, [invitations, search, statusFilter, sortBy, sortDir]);

  const InvitationsContent = () => (
    <CardContent>{/* unchanged content */}</CardContent>
  );

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
          breadcrumbItems={[]}
        />

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0">
          <div className="card rounded-xl border shadow-sm mb-6 max-w-full">
            <Tabs value={statusFilter}>
              
              {/* ✅ FIXED SCROLL AREA */}
              <div className="border-b px-4 sm:px-6">
                <ScrollArea className="w-full whitespace-nowrap">
                  <TabsList className="bg-transparent h-12 w-max min-w-max p-0">
                    <TabsTrigger value="ALL">All</TabsTrigger>
                    <TabsTrigger value={InvitationStatus.PENDING}>
                      Pending
                    </TabsTrigger>
                    <TabsTrigger value={InvitationStatus.ACCEPTED}>
                      Accepted
                    </TabsTrigger>
                    <TabsTrigger value={InvitationStatus.REJECTED}>
                      Rejected
                    </TabsTrigger>
                  </TabsList>

                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>

              <TabsContent value="ALL">
                <InvitationsContent />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectInvitationsPage;