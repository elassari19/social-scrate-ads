import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRefreshToken, setSessionToken, setUserData } from '@/lib/cookies';
import { refreshAccessToken } from '@/lib/auth-service';

/**
 * API route to refresh the access token using the refresh token
 */
export async function POST(request: NextRequest) {
  try {
    // Get the refresh token from cookies
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'No refresh token found' },
        { status: 401 }
      );
    }

    // Call the refresh token function
    const result = await refreshAccessToken(refreshToken);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in refresh token API route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}