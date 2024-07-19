'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { LoaderCircle, Chrome, Rocket, Eye, EyeOff } from 'lucide-react';
import { z, ZodError } from 'zod'; // Import Zod for validation

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/shared/themeToggle';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const FormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function SignUp() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string>('');

  // Define Zod schema for password validation
  const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters long');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Ensure event is of type React.FormEvent<HTMLFormElement>
    setIsLoading(true);

    const formData = new FormData(event.currentTarget); // Access form data correctly
    const firstName = formData.get('first-name') as string;
    const lastName = formData.get('last-name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // Validate password using Zod schema
      passwordSchema.parse(password);

      // Simulate API request
      setTimeout(() => {
        setIsLoading(false);
        console.log(
          `Submitted data: ${firstName}, ${lastName}, ${email}, ${password}`,
        );
      }, 3000);
    } catch (error: any) {
      // Handle Zod validation error
      if (error instanceof ZodError) {
        setPasswordError(error.errors[0].message);
      } else {
        console.error(error.message);
      }
      setIsLoading(false);
    }
  }

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordError(''); // Clear the error message as user types
  };

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-screen">
      <div className="absolute left-10 top-10">
        <ThemeToggle />
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Sign Up</h1>
            <p className="text-balance text-muted-foreground">
              Enter your information to create an account
            </p>
          </div>
          <form onSubmit={onSubmit}>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input
                    id="first-name"
                    name="first-name"
                    placeholder="Max"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input
                    id="last-name"
                    name="last-name"
                    placeholder="Robinson"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    required
                    onChange={handlePasswordChange} // Attach handler
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
                {passwordError && (
                  <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="mr-2 h-4 w-4" />
                )}{' '}
                Create an account
              </Button>
              <Button variant="outline" type="button" disabled={isLoading}>
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
            Already have an account?{' '}
            <Button variant="outline" size="sm" className="ml-2" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{' '}
            <Button variant="link" className="p-0" asChild>
              <Link href="/terms">Terms of Service</Link>
            </Button>{' '}
            and{' '}
            <Button variant="link" className="p-0" asChild>
              <Link href="/privacy">Privacy Policy</Link>
            </Button>
            .
          </p>
        </div>
      </div>
      <div className="hidden lg:block">
        <Image
          src="/bg.png"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
