'use client';
import { useSelector } from 'react-redux';

import { RootState } from '@/lib/store';
import { KYCForm } from '@/components/form/kycBusinessForm';
import BusinessSettingsLayout from '@/components/layout/BusinessSettingsLayout';

export default function PersonalInfo() {
  const user = useSelector((state: RootState) => state.user);

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
