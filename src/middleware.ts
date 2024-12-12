import { NextRequest, NextResponse } from 'next/server';
import cookie from 'cookie';

export async function middleware(request: NextRequest) {
  const cookiesHeader = request.headers.get('cookie');
  const cookies = cookie.parse(cookiesHeader || '');
  const userType = cookies.userType;
  const token = cookies.token;

  const { pathname } = request.nextUrl;

  // Handle explicit logout logic
  if (pathname === '/auth/login') {
    // If the user is already logged in, redirect them to the appropriate dashboard
    if (token && userType) {
      const redirectPath =
        userType === 'freelancer'
          ? '/dashboard/freelancer'
          : '/dashboard/business';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Allow access to the login page if no session exists
    return NextResponse.next();
  }

  // Redirect to login page if no token exists
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Protect routes and enforce role-based redirection
  if (token && userType) {
    if (
      userType === 'freelancer' &&
      (pathname.startsWith('/dashboard/business') ||
        pathname.startsWith('/business'))
    ) {
      return NextResponse.redirect(
        new URL('/dashboard/freelancer', request.url),
      );
    } else if (
      userType === 'business' &&
      (pathname.startsWith('/dashboard/freelancer') ||
        pathname.startsWith('/freelancer'))
    ) {
      return NextResponse.redirect(new URL('/dashboard/business', request.url));
    }
  }

  // Block access to protected routes if no valid role is found
  const protectedRoutes = [
    '/dashboard',
    '/dashboard/business',
    '/dashboard/freelancer',
    '/business',
    '/freelancer',
  ];
  if (
    !userType &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/protected/:path*',
    '/business/:path*',
    '/freelancer/:path*',
    '/auth/login',
  ],
};
