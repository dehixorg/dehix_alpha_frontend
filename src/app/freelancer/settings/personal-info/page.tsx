'use client';
import { useSelector } from 'react-redux';

import FreelancerSettingsLayout from '../../../../components/layout/FreelancerSettingsLayout';

import { RootState } from '@/lib/store';
import { ProfileForm } from '@/components/form/profileForm';

export default function PersonalInfo() {
  const user = useSelector((state: RootState) => state.user);

  return (
    <FreelancerSettingsLayout
      active="Personal Info"
      activeMenu="Personal Info"
      breadcrumbItems={[
        { label: 'Settings', link: '#' },
        { label: 'Personal Info', link: '#' },
      ]}
      isKycCheck={true}
    >
      <ProfileForm user_id={user.uid} />
    </FreelancerSettingsLayout>
  );
}
