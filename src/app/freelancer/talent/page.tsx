'use client';
import React from 'react';

import SkillDomainForm from '@/components/freelancer/talent/skilldomainForm';
import FreelancerAppLayout from '@/components/layout/FreelancerAppLayout';
import { useTalentTour } from '@/components/tour/useTalentTour';

export default function Talent() {
  useTalentTour(true);

  return (
    <div data-tour="talent">
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
    </div>
  );
}
