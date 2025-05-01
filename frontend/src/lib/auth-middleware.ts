'use server';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { refreshAccessToken } from './auth-service';
import { getSessionToken, getUserData, clearSession } from './cookies';

const SESSION_COOKIE_NAME = 'connect.sid';
const USER_COOKIE_NAME = 'user_data';
const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Session validity duration - 2 hours
const SESSION_EXPIRY = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

/**
 * Verifies if the session token is still valid
 * @returns Boolean indicating if the session is valid
 */
export async function verifySession(): Promise<boolean> {
  try {
    // Get session token and user data
    const sessionToken = await getSessionToken();
    const userData = await getUserData();

    if (!sessionToken) {
      return false;
    }

    // Check if user data exists and has a timestamp
    if (userData && userData._timestamp) {
      const lastUpdated = new Date(userData._timestamp).getTime();
      const currentTime = Date.now();

      // If the session is less than SESSION_EXPIRY old, consider it valid
      if (currentTime - lastUpdated < SESSION_EXPIRY) {
        return true;
      }
    }

    // If no timestamp or expired, validate with the server
    const response = await fetch(`${API_URL}/auth/check-session`, {
      method: 'GET',
      headers: {
        Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`,
      },
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      return result.authenticated === true;
    }

    return false;
  } catch (error) {
    console.error('Error verifying session:', error);
    return false;
  }
}

/**
 * Middleware to check session validity and refresh tokens if needed
 */
export async function withAuth(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: { requireAuth?: boolean; redirectTo?: string } = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const { requireAuth = true, redirectTo = '/login' } = options;

    // Check if session is valid
    const isValid = await verifySession();

    if (!isValid && requireAuth) {
      // Try to refresh the token
      const refreshToken = (await cookies()).get(
        REFRESH_TOKEN_COOKIE_NAME
      )?.value;

      if (refreshToken) {
        try {
          const refreshResult = await refreshAccessToken(refreshToken);

          if (refreshResult.success) {
            // Token refreshed successfully, continue to the handler
            return handler(req);
          }
        } catch (error) {
          console.error('Error refreshing token:', error);
        }
      }

      // If we get here, the refresh failed or there was no refresh token
      // Clear the session and redirect to login
      await clearSession();

      const url = new URL(redirectTo, req.url);
      url.searchParams.set('from', req.nextUrl.pathname);

      return NextResponse.redirect(url);
    }

    // If we don't require auth or the session is valid, continue
    return handler(req);
  };
}

/**
 * Client-side check to see if the session is still valid
 * This can be used from client components
 */
export function useSessionCheck() {
  return {
    checkSession: async () => {
      try {
        const response = await fetch('/api/auth/check-session', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const result = await response.json();
          return result.authenticated;
        }

        return false;
      } catch (error) {
        console.error('Error checking session:', error);
        return false;
      }
    },
    refreshToken: async () => {
      try {
        const response = await fetch('/api/auth/refresh-token', {
          method: 'POST',
          credentials: 'include',
        });

        if (response.ok) {
          const result = await response.json();
          return result.success;
        }

        return false;
      } catch (error) {
        console.error('Error refreshing token:', error);
        return false;
      }
    },
  };
}
