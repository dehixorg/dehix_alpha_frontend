'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OracleDashboardPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/freelancer/oracleDashboard/businessVerification');
  }, [router]);

  return null;
}
