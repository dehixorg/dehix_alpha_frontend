'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { notifyError } from '@/utils/toastMessage';
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
import { useAppSelector } from '@/lib/hooks';
import { projectInvitationService } from '@/services/projectInvitation';
import { useProjectInvitationTour } from '@/components/tour/shared/useProjectInvitationTour';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const ProjectInvitationsPage: React.FC = () => {
  const userTypeFromStore = useAppSelector((s) => s.user.type);
  const userType = userTypeFromStore || (Cookies.get('userType') as any);
  const isFreelancer = userType === 'freelancer';

  const sidebarMenuItemsTop = isFreelancer
    ? freelancerMenuItemsTop
    : menuItemsTop;
  const sidebarMenuItemsBottom = isFreelancer
    ? freelancerMenuItemsBottom
    : menuItemsBottom;

  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [search, setSearch] = useState('');
  const statusFilter = 'ALL';
  const sortBy = 'createdAt';
  const sortDir = 'desc';

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
