'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InterviewPage() {
  const router = useRouter();
  useEffect(() => {
    router.push('/dashboard/freelancer/interview/profile');
  }, [router]);

  return null;
}
