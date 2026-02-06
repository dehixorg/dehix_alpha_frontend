'use client';

import { usePathname } from 'next/navigation';

import { usePlatformTour } from '@/components/tour/shared/usePlatformTour';
import { useProfilePlatformTour } from '@/components/tour/freelancer-profile/useProfilePlatformTour';

export default function SidebarTourController() {
  const pathname = usePathname();

  const isSettingsPage =
    pathname.startsWith('/freelancer/settings') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/settings/feedback');

  if (isSettingsPage) {
    return <ProfileSidebarTour />;
  }
  return <PlatformNavigationTour />;
}

function ProfileSidebarTour() {
  useProfilePlatformTour(true);
  return null;
}

function PlatformNavigationTour() {
  usePlatformTour(true);
  return null;
}
