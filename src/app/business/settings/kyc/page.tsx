'use client';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';

import { RootState } from '@/lib/store';
import BusinessSettingsLayout from '@/components/layout/BusinessSettingsLayout';
import { useKycTour } from '@/components/tour/business-profile/useKycTour';

const KYCForm = dynamic(
  () =>
    import('@/components/form/kycBusinessForm').then((mod) => ({
      default: mod.KYCForm,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        Loading KYC Form...
      </div>
    ),
  },
);

export default function PersonalInfo() {
  const user = useSelector((state: RootState) => state.user);
  useKycTour(true);

  return (
    <BusinessSettingsLayout
      active="KYC"
      activeMenu="KYC"
      breadcrumbItems={[
        { label: 'Settings', link: '#' },
        { label: 'KYC', link: '#' },
      ]}
      isKycCheck={true}
    >
      <KYCForm user_id={user.uid} />
    </BusinessSettingsLayout>
  );
}
