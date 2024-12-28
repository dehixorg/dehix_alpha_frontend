'use client';

import React, { useEffect, useState } from 'react';
import { Map, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get('token');
      setIsLoggedIn(!!token);
    };

    checkAuth();
  }, []);

  const handleNavigation = () => {
    if (isLoggedIn) {
      try {
        window.history.back();
      } catch {
        router.push('/');
      }
    } else {
      router.push('/auth/login');
    }
  };

  if (isLoggedIn === null) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Map className="h-16 w-16 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-4xl font-extrabold">404</CardTitle>
          <p className="text-2xl font-semibold text-muted-foreground">
            Page Not Found
          </p>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">
            We were unable to find the page you are looking for.
          </p>
          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              The page might have been moved, deleted, or never existed.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button
            size="lg"
            onClick={handleNavigation}
            className="w-full sm:w-auto gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {isLoggedIn ? 'Go Back' : 'Login'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotFound;
