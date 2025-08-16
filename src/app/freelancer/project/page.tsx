'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProjectDashboardPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/freelancer/project/current');
  }, [router]);

  return null;
}
