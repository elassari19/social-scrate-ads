import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Define protected paths that require authentication
const PROTECTED_PATHS = [
  '/deposit',
  '/dashboard',
  // Add other protected routes here
];

// Define public paths that should never be protected
const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh-token',
  '/api/auth/check-session',
  // Add other public routes here
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if the path requires authentication
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (isProtected) {
    // Get the session token and refresh token from cookies
    const cookieStore = request.cookies;
    const sessionToken = cookieStore.get('connect.sid');
    const refreshToken = cookieStore.get('refresh_token');

    // If no session token, redirect to login
    if (!sessionToken) {
      // Try to use refresh token if available
      if (refreshToken) {
        // Redirect to the refresh token API and then back to the original URL
        const refreshUrl = new URL('/api/auth/refresh-token', request.url);
        refreshUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(refreshUrl);
      }

      // No tokens available, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Session token exists, check with the backend if it's valid
    try {
      const checkSessionUrl = new URL('/api/auth/check-session', request.url);
      const checkResponse = await fetch(checkSessionUrl, {
        headers: {
          Cookie: request.headers.get('cookie') || '',
        },
      });

      const checkResult = await checkResponse.json();

      // If not authenticated or expired, try refresh token
      if (!checkResult.authenticated || checkResult.expired) {
        if (refreshToken) {
          const refreshUrl = new URL('/api/auth/refresh-token', request.url);
          refreshUrl.searchParams.set('redirectTo', pathname);
          return NextResponse.redirect(refreshUrl);
        }

        // No refresh token or refresh failed, redirect to login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      console.error('Error in middleware:', error);
      // In case of error, continue to the protected route
      // This prevents blocking access due to temporary errors
      return NextResponse.next();
    }
  }

  // If not protected or authentication validated, continue
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
// Fix: Use explicit path patterns instead of spread operator
export const config = {
  matcher: [
    // Protected paths - explicitly list them for static analysis
    '/deposit/:path*',
    '/dashboard/:path*',
    // API routes except auth endpoints
    '/api/((?!auth).*)',
  ],
};
