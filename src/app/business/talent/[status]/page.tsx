import React from 'react';

import TalentLayout from '@/components/marketComponents/TalentLayout';

export default function Page({ params }: { params: { status: string } }) {
  const { status } = params;
  // Accept only the tabs TalentLayout understands
  const allowed = new Set(['overview', 'invited', 'accepted', 'rejected']);
  const activeTab = allowed.has(status) ? status : 'overview';
  return (
    <TalentLayout
      activeTab={activeTab as 'overview' | 'invited' | 'accepted' | 'rejected'}
    />
  );
}
