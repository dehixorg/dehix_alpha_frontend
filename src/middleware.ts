import { NextRequest, NextResponse } from 'next/server';
import cookie from 'cookie';

export async function middleware(request: NextRequest) {
  const cookiesHeader = request.headers.get('cookie');
  const cookies = cookie.parse(cookiesHeader || '');
  const userType = cookies.userType;
  const token = cookies.token;

  const url = request.nextUrl.clone();

  if (url.pathname === '/auth/login') {
    if (token && userType) {
      url.pathname = `/dashboard/${userType}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!token || !userType) {
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  if (
    url.pathname.startsWith('/dashboard/freelancer') &&
    userType !== 'freelancer'
  ) {
    url.pathname = '/dashboard/business';
    return NextResponse.redirect(url);
  }

  if (
    url.pathname.startsWith('/dashboard/business') &&
    userType !== 'business'
  ) {
    url.pathname = '/dashboard/freelancer';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/login', '/dashboard/:path*'],
};
