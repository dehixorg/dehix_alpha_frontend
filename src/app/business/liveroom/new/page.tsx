'use client';

import BusinessDashboardLayout from '@/components/layout/BusinessDashboardLayout';
import { BusinessLiveRoomCreateFlow } from '@/components/liveroom/LiveRoomModule';

export default function BusinessNewLiveRoomPage() {
  return (
    <BusinessDashboardLayout
      active="LiveRoom"
      activeMenu="New LiveRoom"
      breadcrumbItems={[
        { label: 'LiveRoom', link: '/business/liveroom' },
        { label: 'New', link: '#' },
      ]}
      mainClassName="flex-1 p-0"
    >
      <BusinessLiveRoomCreateFlow />
    </BusinessDashboardLayout>
  );
}
