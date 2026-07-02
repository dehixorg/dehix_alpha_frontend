'use client';

import LiveRoomWorkspaceLayout from '@/components/layout/LiveRoomWorkspaceLayout';
import { BusinessLiveRoomWorkspace } from '@/components/liveroom/LiveRoomModule';

export default function BusinessLiveRoomWorkspacePage() {
  return (
    <LiveRoomWorkspaceLayout
      userType="business"
      includeAccessControl
      breadcrumbItems={[{ label: 'LiveRoom', link: '/business/liveroom' }]}
    >
      <BusinessLiveRoomWorkspace />
    </LiveRoomWorkspaceLayout>
  );
}
