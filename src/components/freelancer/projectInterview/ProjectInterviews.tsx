'use client';
import { GraduationCap } from 'lucide-react';

import EmptyState from '@/components/shared/EmptyState';
// import CurrentInterviews from '@/components/freelancer/scheduleInterview/CurrentInterviews';
// import BidedInterviews from '@/components/freelancer/scheduleInterview/BidedInterviews';

export default function InterviewsPage() {
  return (
    <div className="w-full">
      <EmptyState
        title="No project interviews scheduled"
        description="Once an interview is scheduled for a project, it will appear here."
        icon={<GraduationCap className="h-12 w-12 text-muted-foreground" />}
        className="bg-transparent border-dashed"
      />
    </div>
  );
}
