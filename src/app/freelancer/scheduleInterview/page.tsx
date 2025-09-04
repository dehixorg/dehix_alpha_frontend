'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import CurrentInterviewsPage from './current/page';

export default function ScheduleInterviewPage() {
  const pathname = usePathname();
  const router = useRouter();
  
  const activeTab = pathname.includes('/bids') ? 'bids' : 
                   pathname.includes('/history') ? 'history' : 'current';

  const handleTabChange = (tab: string) => {
    router.push(`/freelancer/scheduleInterview/${tab === 'current' ? '' : tab}`);
  };

  return (
    <div className="flex flex-row">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Schedule Interview</h2>
          <p className="text-sm text-muted-foreground">
            Manage your interviews and track your progress.
          </p>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Schedule New
          </Button>
        </div>
      <CurrentInterviewsPage />
      </div>
    </div>
  );
}
