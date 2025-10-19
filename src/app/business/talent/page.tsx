'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Talent() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to overview tab to maintain backward compatibility
    router.replace('/business/talent/overview');
  }, [router]);

  // Return null or a loading spinner while redirecting
  return null;
}
