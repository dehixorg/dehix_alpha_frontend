'use client';

import { CreateProjectBusinessForm } from '@/components/form/businessCreateProjectForm';
import BusinessDashboardLayout from '@/components/layout/BusinessDashboardLayout';

export default function Dashboard() {
  // Removed: const user = useSelector((state: RootState) => state.user);

  return (
    <BusinessDashboardLayout
      active="Projects"
      activeMenu="Create Project"
      breadcrumbItems={[
        { label: 'Business', link: '/dashboard/business' },
        { label: 'Create Project', link: '#' },
      ]}
      contentClassName="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8"
      mainClassName="flex-1 items-start py-4 sm:py-2 md:gap-8"
    >
      <CreateProjectBusinessForm />
    </BusinessDashboardLayout>
  );
}
