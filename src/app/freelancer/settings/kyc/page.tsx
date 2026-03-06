'use client';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';

import FreelancerSettingsLayout from '../../../../components/layout/FreelancerSettingsLayout';

import { RootState } from '@/lib/store';

const KYCForm = dynamic(() => import('@/components/form/kycFreelancerForm'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      Loading KYC Form...
    </div>
  ),
});

export default function PersonalInfo() {
  const user = useSelector((state: RootState) => state.user);

  return (
    <FreelancerSettingsLayout
      active="KYC"
      activeMenu="KYC"
      breadcrumbItems={[
        { label: 'Settings', link: '#' },
        { label: 'KYC', link: '#' },
      ]}
      isKycCheck={true}
      contentClassName="flex flex-col sm:pl-14"
      mainClassName="flex-1 p-4 sm:p-8 md:p-12"
    >
      <div className="mx-auto w-full max-w-6xl">
        <KYCForm user_id={user.uid} />
      </div>
    </FreelancerSettingsLayout>
  );
}
