'use client';
import React from 'react';

import SkillDomainForm from '@/components/freelancer/talent/skilldomainForm';
import FreelancerAppLayout from '@/components/layout/FreelancerAppLayout';
import { useTalentTour } from '@/components/tour/freelancer/useTalentTour';

export default function Talent() {
  useTalentTour(true);

  return (
    <div data-tour="talent">
      <FreelancerAppLayout
        active="Talent"
        activeMenu="Talent"
        breadcrumbItems={[
          { label: 'Freelancer', link: '/dashboard/freelancer' },
          { label: 'Dehix Talent', link: '#' },
        ]}
      >
        <SkillDomainForm />
      </FreelancerAppLayout>
    </div>
  );
}
