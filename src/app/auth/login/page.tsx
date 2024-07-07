"use client";

import Image from "next/image";
import Link from "next/link";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/shared/themeToggle";
import { LoaderCircle, Chrome, Key } from "lucide-react";
import { loginUser } from "@/lib/utils";
import { UserCredential } from "firebase/auth";
import { useDispatch } from 'react-redux';
import { setUser } from '@/lib/userSlice';

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [pass, setPass] = useState<string>("");

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential:UserCredential = await loginUser(email, pass);
      const user = userCredential.user;

      // Get the ID token
      const accessToken = await user.getIdToken();
      console.log("Bearer " + accessToken);
      console.log("User ID " + userCredential.user.uid);
      dispatch(setUser(userCredential.user));
      console.log(userCredential.user)
      router.replace("/dashboard/freelancer");
    } catch (error: any) {
      // Optionally handle error based on its type
      setIsLoading(false);
      console.error(error.message);
      return error.message;
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
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
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
                <Input
                  id="password"
                  type="password"
                  onChange={(e) => setPass(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Key className="mr-2 h-4 w-4" />
                )}{" "}
                Login
              </Button>
              <Button variant="outline" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Chrome className="mr-2 h-4 w-4" />
                )}{" "}
                Google Login
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Button variant="outline" size="sm" className="ml-2" asChild>
              <Link href="/auth/sign-up">Sign up</Link>
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
