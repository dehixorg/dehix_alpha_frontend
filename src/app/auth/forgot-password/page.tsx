'use client';
import { LoaderCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ThemeToggle } from '@/components/shared/themeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { resetPassword } from '@/lib/utils';

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await resetPassword(email);
      notifySuccess(
        'Password reset email sent! Please check your inbox.',
        'Success',
      );
      router.push('/auth/login');
    } catch (error: any) {
      notifyError('Invalid Email or Password. Please try again.', 'Error');
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-screen">
      <div className="absolute left-10 top-10">
        <ThemeToggle />
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Forgot Password</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email address below to reset your password
            </p>
          </div>
          <form onSubmit={handleForgotPassword}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Remembered your password?{' '}
            <Button variant="outline" size="sm" className="ml-2" asChild>
              <Link href="/auth/sign-in">Login</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="hidden lg:block">
        <Image
          src="/bg.png"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:invert"
        />
      </div>
    </div>
  );
}
