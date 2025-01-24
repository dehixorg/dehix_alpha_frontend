'use client';

import Link from 'next/link';

import { ThemeToggle } from '@/components/shared/themeToggle';
import BusinessRegisterForm from '@/components/form/register/business';
import { Button } from '@/components/ui/button';

export default function SignUp() {
  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute left-4 top-4 sm:left-10 sm:top-10">
        <ThemeToggle />
      </div>
      <div className="flex items-center justify-center py-8 sm:py-12">
        <div className="mx-auto w-full  px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6">
            <div className="grid gap-2 text-center mt-12 sm:mt-0">
              {/* Added margin-top to prevent overlap */}
              <h1 className="text-2xl font-bold sm:text-3xl">
                Sign Up as a Business
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Enter your information to create an account
              </p>
            </div>
            <div className="my-4 text-center text-xs sm:text-sm">
              Are you a Freelancer?{' '}
              <Button variant="outline" size="sm" className="ml-2" asChild>
                <Link href="/auth/sign-up/freelancer">Register</Link>
              </Button>
            </div>
            <BusinessRegisterForm />
            <div className="mt-4 text-center text-xs sm:text-sm">
              Already have an account?{' '}
              <Button variant="outline" size="sm" className="ml-2" asChild>
                <Link href="/auth/login">Sign in</Link>
              </Button>
            </div>
            <p className="px-2 text-center text-xs text-muted-foreground sm:px-8 sm:text-sm">
              By clicking continue, you agree to our{' '}
              <Button variant="link" className="p-0" asChild>
                <Link href="/terms">Terms of Service</Link>
              </Button>{' '}
              and{' '}
              <Button variant="link" className="p-0" asChild>
                <Link href="/privacy">Privacy Policy.</Link>
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
