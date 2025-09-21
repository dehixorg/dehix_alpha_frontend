// src/components/marketComponents/TalentContent.tsx
'use client';
import React from 'react';

import InvitedProfileCards from './sidebar-projectComponents/profileCards.tsx/invitedProfileCards';
import AcceptedProfileCards from './sidebar-projectComponents/profileCards.tsx/acceptedProfileCards';
import RejectedProfileCards from './sidebar-projectComponents/profileCards.tsx/rejectedProfileCards';

import { calculateExperience } from '@/components/marketComponents/TalentLayout'; // Import from the new location

interface TalentContentProps {
  activeTab: 'invited' | 'accepted' | 'rejected' | 'overview';
  talents: any[];
  loading: boolean;
}

const TalentContent: React.FC<TalentContentProps> = ({
  activeTab,
  talents,
  loading,
}) => {
  const renderCards = () => {
    if (activeTab === 'invited') {
      return (
        <InvitedProfileCards
          talents={talents}
          loading={loading}
          calculateExperience={calculateExperience}
        />
      );
    } else if (activeTab === 'accepted') {
      return (
        <AcceptedProfileCards
          talents={talents}
          loading={loading}
          calculateExperience={calculateExperience}
        />
      );
    } else if (activeTab === 'rejected') {
      return (
        <RejectedProfileCards
          talents={talents}
          loading={loading}
          calculateExperience={calculateExperience}
        />
      );
    }
    return null;
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Talents
        </h2>
        <span className="text-muted-foreground">
          {loading ? 'Loading...' : `Showing ${talents.length} results`}
        </span>
      </div>
      {renderCards()}
    </>
  );
};

export default TalentContent;
