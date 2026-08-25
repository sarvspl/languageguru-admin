import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Builds a redirect target inside the admin panel.
 *
 * `new URL('/login', request.url)` would drop the basePath and send the browser
 * to the public website's /login instead. Cloning `nextUrl` keeps the prefix:
 * its `pathname` setter works on the path *after* the basePath and re-adds the
 * prefix when the URL is serialized.
 */
const to = (request: NextRequest, pathname: string) => {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = '';
  return url;
};

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value || request.cookies.get('token')?.value;

  // If visiting the root URL, redirect to login (or dashboard if already logged in)
  if (request.nextUrl.pathname === '/') {
    if (token) {
      return NextResponse.redirect(to(request, '/dashboard'));
    }
    return NextResponse.redirect(to(request, '/login'));
  }

  // Protect /dashboard and its sub-routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(to(request, '/login'));
    }

    try {
      const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const verifyRes = await fetch(`${API_URL}/api/v1/settings/admin-profile`, {
        headers: { Cookie: `admin_token=${token}` },
        cache: 'no-store'
      });
      if (!verifyRes.ok) {
        const response = NextResponse.redirect(to(request, '/login'));
        response.cookies.delete('admin_token');
        response.cookies.delete('token');
        return response;
      }
    } catch (e) {
      const response = NextResponse.redirect(to(request, '/login'));
      response.cookies.delete('admin_token');
      response.cookies.delete('token');
      return response;
    }
  }

  // If logged in, redirect from login page to dashboard
  if (request.nextUrl.pathname === '/login') {
    if (token) {
      return NextResponse.redirect(to(request, '/dashboard'));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*'],
};
