import { NextRequest, NextResponse } from 'next/server';
import cookie from 'cookie';

export async function middleware(request: NextRequest) {
  const cookiesHeader = request.headers.get('cookie');
  const cookies = cookie.parse(cookiesHeader || '');
  const userType = cookies.userType;
  const token = cookies.token;

  const { pathname } = request.nextUrl;
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  if (token && userType) {
    if (
      userType === 'freelancer' &&
      (pathname.startsWith('/dashboard/business') || pathname.startsWith('/business'))
    ) {
      return NextResponse.redirect(
        new URL('/dashboard/freelancer', request.url),
      );
    } else if (
      userType === 'business' &&
      (pathname.startsWith('/dashboard/freelancer')|| pathname.startsWith('/freelancer'))
    ) {
      return NextResponse.redirect(new URL('/dashboard/business',  request.url));
    }
  } else {
    const protectedRoutes = [
      '/dashboard',
      '/dashboard/business',
      '/dashboard/freelancer',
      '/business',
      '/freelancer', 
    ];
    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/protected/:path*','/business/:path*', '/freelancer/:path*'],
};


