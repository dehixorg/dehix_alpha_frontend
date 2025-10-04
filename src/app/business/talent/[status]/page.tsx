import React from 'react';

import TalentLayout from '@/components/marketComponents/TalentLayout';

export default function Page({ params }: { params: { status: string } }) {
  const { status } = params;
  // Accept only the tabs TalentLayout understands
  const allowed = new Set(['invited', 'accepted', 'rejected']);
  const activeTab = allowed.has(status) ? status : 'invited';
  return (
    <TalentLayout
      activeTab={activeTab as 'invited' | 'accepted' | 'rejected'}
    />
  );
}
