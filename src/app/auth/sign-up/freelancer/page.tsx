'use client';

import Link from 'next/link';

import { ThemeToggle } from '@/components/shared/themeToggle';
import FreelancerRegisterForm from '@/components/form/register/freelancer';
import { Button } from '@/components/ui/button';

export default function SignUp() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute left-4 top-4 sm:left-10 sm:top-10">
        <ThemeToggle />
      </div>

      <div className="flex items-center justify-center py-8 sm:py-12">
        <div className="mx-auto w-3/4 px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6">
            <FreelancerRegisterForm />
            <div className="mt-4 text-center text-xs sm:text-sm">
              Already have an account?{' '}
              <Button variant="outline" size="sm" className="ml-2" asChild>
                <Link href="/auth/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
