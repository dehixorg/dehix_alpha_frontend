import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Cache for user type to reduce cookie parsing
const userTypeCache = new Map<string, string>();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  const allowCrossRolePaths = new Set<string>([
    '/project-invitations',
    '/freelancer-profile',
  ]);

  // Skip middleware for static files, API routes, and auth pages
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/auth/sign-up') ||
    pathname.startsWith('/auth/forgot-password')
  ) {
    return NextResponse.next();
  }

  // Get cookies more efficiently
  const token = request.cookies.get('token')?.value;
  let userType = userTypeCache.get(request.cookies.toString());

  if (!userType) {
    userType = request.cookies.get('userType')?.value || '';
    if (userType) {
      userTypeCache.set(request.cookies.toString(), userType);
    }
  }

  // Handle login page
  if (pathname === '/auth/login') {
    if (token && userType) {
      url.pathname = `/dashboard/${userType}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Handle unauthenticated access
  if (!token) {
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // Handle role-based redirects
  if (userType) {
    const isFreelancer = userType === 'freelancer';
    const isBusiness = userType === 'business';
    const isFreelancerPath =
      pathname.startsWith('/freelancer') ||
      pathname.startsWith('/dashboard/freelancer');
    const isBusinessPath =
      pathname.startsWith('/business') ||
      pathname.startsWith('/dashboard/business');

    const isAllowedCrossRolePath = allowCrossRolePaths.has(pathname);

    if (
      (isFreelancer && isBusinessPath && !isAllowedCrossRolePath) ||
      (isBusiness && isFreelancerPath) ||
      pathname === '/'
    ) {
      url.pathname = `/dashboard/${userType}`;
      return NextResponse.redirect(url);
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
    const response = NextResponse.redirect(new URL('/', request.url));
    return addCacheHeaders(response);
  }

  const response = NextResponse.next();
  return addCacheHeaders(response);
}

// Match all request paths except for the ones starting with:
// - _next/static (static files)
// - _next/image (image optimization files)
// - favicon.ico (favicon file)
// - public folder
// - api folder
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|static/).*)'],
};

// Add cache control headers to responses
const addCacheHeaders = (response: NextResponse) => {
  // Cache for 5 minutes on CDN and browser
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=60',
  );
  // Prevent middleware caching
  response.headers.set('x-middleware-cache', 'no-cache');
  return response;
};
