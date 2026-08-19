import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value || request.cookies.get('token')?.value;

  // If visiting the root URL, redirect to login (or dashboard if already logged in)
  if (request.nextUrl.pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect /dashboard and its sub-routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const verifyRes = await fetch(`${API_URL}/api/v1/settings/admin-profile`, {
        headers: { Cookie: `admin_token=${token}` },
        cache: 'no-store'
      });
      if (!verifyRes.ok) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('admin_token');
        response.cookies.delete('token');
        return response;
      }
    } catch (e) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('admin_token');
      response.cookies.delete('token');
      return response;
    }
  }

  // If logged in, redirect from login page to dashboard
  if (request.nextUrl.pathname === '/login') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*'],
};
