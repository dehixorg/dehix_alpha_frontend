'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAppSelector } from '@/lib/store';
import { BusinessForm } from '@/components/form/businessForm';
import BusinessSettingsLayout from '@/components/layout/BusinessSettingsLayout';

export default function BusinessInfoPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  // Optional: Redirect if user is not authenticated
  useEffect(() => {
    if (!user.uid) {
      // uid will be empty string if not authenticated
      router.push('/auth/login');
    }
  }, [user.uid, router]);

  return (
    <BusinessSettingsLayout
      active="Business Info"
      activeMenu="Business Info"
      breadcrumbItems={[
        { label: 'Settings', link: '#' },
        { label: 'Business Info', link: '#' },
      ]}
      isKycCheck={true}
    >
      <BusinessForm user_id={user.uid} />
    </BusinessSettingsLayout>
  );
}
