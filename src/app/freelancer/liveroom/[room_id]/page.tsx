'use client';

import LiveRoomWorkspaceLayout from '@/components/layout/LiveRoomWorkspaceLayout';
import { TalentLiveRoomWorkspace } from '@/components/liveroom/LiveRoomModule';

export default function FreelancerLiveRoomWorkspacePage() {
  return (
    <LiveRoomWorkspaceLayout
      userType="freelancer"
      includeAccessControl={false}
      breadcrumbItems={[{ label: 'LiveRoom', link: '/freelancer/liveroom' }]}
    >
      <TalentLiveRoomWorkspace />
    </LiveRoomWorkspaceLayout>
  );
}
