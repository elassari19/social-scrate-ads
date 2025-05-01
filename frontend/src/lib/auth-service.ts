'use server';

import axios from 'axios';
import { cookies } from 'next/headers';
import { setSessionToken, setUserData } from './cookies';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';

/**
 * Refresh the access token using a refresh token
 * @param refreshToken The refresh token to use
 * @returns An object indicating success/failure and any error
 */
export async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await axios.post(
      `${API_URL}/auth/refresh-token`,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status !== 200) {
      return { success: false, error: 'Failed to refresh token' };
    }

    // Extract the new tokens from the response
    const { accessToken, newRefreshToken, user } = response.data;

    // Set the new tokens in cookies
    await setSessionToken(accessToken);

    // Store the refresh token
    (await cookies()).set(REFRESH_TOKEN_COOKIE_NAME, newRefreshToken, {
      path: '/',
      httpOnly: true, // Important: refresh tokens should be httpOnly
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    });

    // Update user data with a timestamp for future validations
    if (user) {
      const userData = {
        ...user,
        _timestamp: new Date().toISOString(),
      };
      await setUserData(userData);
    }

    return { success: true };
  } catch (error) {
    console.error('Error refreshing token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle storing tokens after login
 * This function should be called after successful login to properly
 * store tokens and user data
 */
export async function storeAuthTokens(
  accessToken: string,
  refreshToken: string,
  userData: any
) {
  // Set the session token
  await setSessionToken(accessToken);

  // Store the refresh token
  (await cookies()).set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  });

  // Store user data with timestamp
  const enhancedUserData = {
    ...userData,
    _timestamp: new Date().toISOString(),
  };
  await setUserData(enhancedUserData);

  return { success: true };
}

/**
 * Verify a token with the backend
 */
export async function verifyToken(token: string) {
  try {
    const response = await axios.post(
      `${API_URL}/auth/verify-token`,
      { token },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.valid === true;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
}
