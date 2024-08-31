'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let redirectPath = '/';

    if (pathname.includes('/freelancer')) {
      redirectPath = '/dashboard/freelancer';
    } else if (pathname.includes('/business')) {
      redirectPath = '/dashboard/business';
    }

    const timer = setTimeout(() => {
      router.push(redirectPath);
    }, 1500);

    return () => clearTimeout(timer);
  }, [router, pathname]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold text-white">404 - Page Not Found</h1>
      <p className="mt-4 text-lg text-white">
        Redirecting to your dashboard...
      </p>
    </div>
  );
}
