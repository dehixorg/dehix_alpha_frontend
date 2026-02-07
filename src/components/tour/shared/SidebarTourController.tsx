'use client';

import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';

import { RootState } from '@/lib/store';
import { usePlatformTour } from '@/components/tour/shared/usePlatformTour';
import { useProfilePlatformTour } from '@/components/tour/freelancer-profile/useProfilePlatformTour';
import { useSettingsTour } from '@/components/tour/business-profile/useSettingsTour';

export default function SidebarTourController() {
  const pathname = usePathname();
  const userType = useSelector((state: RootState) => state.user.type);

  const isSharedSettingsPage =
    pathname === '/reports' || pathname === '/settings/feedback';

  const isFreelancerSettings =
    pathname.startsWith('/freelancer/settings') ||
    (userType === 'freelancer' && isSharedSettingsPage);

  const isBusinessSettings =
    pathname.startsWith('/business/settings') ||
    (userType === 'business' && isSharedSettingsPage);

  if (isBusinessSettings) {
    return <BusinessSidebarTour />;
  }

  if (isFreelancerSettings) {
    return <FreelancerSidebarTour />;
  }

  return <PlatformNavigationTour />;
}

function BusinessSidebarTour() {
  useSettingsTour(true);
  return null;
}

function FreelancerSidebarTour() {
  useProfilePlatformTour(true);
  return null;
}

function PlatformNavigationTour() {
  usePlatformTour(true);
  return null;
}
