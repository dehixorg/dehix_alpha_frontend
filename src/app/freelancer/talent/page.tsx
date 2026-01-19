'use client';
import React from 'react';

import SkillDomainForm from '@/components/freelancer/talent/skilldomainForm';
import FreelancerAppLayout from '@/components/layout/FreelancerAppLayout';

export default function Talent() {
  return (
    <FreelancerAppLayout
      active="Talent"
      activeMenu="Projects"
      breadcrumbItems={[
        { label: 'Freelancer', link: '/dashboard/freelancer' },
        { label: 'Dehix Talent', link: '#' },
      ]}
    >
      <SkillDomainForm />
    </FreelancerAppLayout>
  );
}
