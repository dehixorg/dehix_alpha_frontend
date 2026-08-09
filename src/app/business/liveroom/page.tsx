'use client';

import BusinessDashboardLayout from '@/components/layout/BusinessDashboardLayout';
import { BusinessLiveRoomDashboard } from '@/components/liveroom/LiveRoomModule';

export default function BusinessLiveRoomPage() {
  return (
    <BusinessDashboardLayout
      active="LiveRoom"
      activeMenu="LiveRoom"
      breadcrumbItems={[{ label: 'LiveRoom', link: '#' }]}
      mainClassName="flex-1 p-0"
    >
      <BusinessLiveRoomDashboard />
    </BusinessDashboardLayout>
  );
}
