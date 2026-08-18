'use client';

import FreelancerAppLayout from '@/components/layout/FreelancerAppLayout';
import { TalentLiveRoomDashboard } from '@/components/liveroom/LiveRoomModule';

export default function FreelancerLiveRoomPage() {
  return (
    <FreelancerAppLayout
      active="LiveRoom"
      activeMenu="LiveRoom"
      breadcrumbItems={[{ label: 'LiveRoom', link: '#' }]}
      mainClassName="flex-1 p-0"
    >
      <TalentLiveRoomDashboard />
    </FreelancerAppLayout>
  );
}
