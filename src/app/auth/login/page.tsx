'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { UserCredential } from 'firebase/auth';
import { LoaderCircle, Chrome, Key, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/shared/themeToggle';
import { getUserData, loginGoogleUser, loginUser } from '@/lib/utils';
import { setUser } from '@/lib/userSlice';

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [pass, setPass] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const userCredential: UserCredential = await loginUser(email, pass);
      const { user, claims } = await getUserData(userCredential);
      dispatch(
        setUser({
          ...user,
          type: claims.type,
        }),
      );
      router.replace(`/dashboard/${claims.type}`);
    } catch (error: any) {
      setError('Invalid Email or Password ');
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const userCredential: UserCredential = await loginGoogleUser();
      const { user, claims } = await getUserData(userCredential);

      dispatch(setUser({ ...user, type: claims.type }));
      router.replace(`/dashboard/${claims.type}`);
    } catch (error: any) {
      setError(error.message);
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-screen">
      <div className="absolute left-10 top-10">
        <ThemeToggle />
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <form onSubmit={handleLogin}>
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
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    onChange={(e) => setPass(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Key className="mr-2 h-4 w-4" />
                )}{' '}
                Login
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={isLoading}
                onClick={handleGoogle}
              >
                {isLoading ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Chrome className="mr-2 h-4 w-4" />
                )}{' '}
                Google Login
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Button variant="outline" size="sm" className="ml-2" asChild>
              <Link href="/auth/sign-up/freelancer">Sign up</Link>
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
