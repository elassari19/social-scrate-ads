import { NextRequest, NextResponse } from 'next/server';
import {
  getSessionToken,
  isAuthenticated,
  isSessionExpired,
} from '@/lib/cookies';
import { verifyToken } from '@/lib/auth-service';

/**
 * API route to check if the current session is valid
 */
export async function GET(request: NextRequest) {
  // Check if the user has authentication cookies
  const authenticated = await isAuthenticated();
  const expired = await isSessionExpired();

  // If we have a token, attempt to verify with the backend
  let verified = false;
  const sessionToken = await getSessionToken();

  if (sessionToken) {
    verified = await verifyToken(sessionToken);
  }

  return NextResponse.json({
    authenticated: authenticated && !expired && verified,
    expired: expired,
  });
}
