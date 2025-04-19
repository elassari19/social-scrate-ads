'use server';

import { cookies } from 'next/headers';

// Cookie constants - exporting for direct usage
export const SESSION_COOKIE_NAME = 'session_token';
export const USER_COOKIE_NAME = 'user_data';

// Default cookie options
export const defaultCookieOptions = {
  maxAge: 7 * 24 * 60 * 60, // 7 days
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

/**
 * Set a cookie with the provided key, value, and options
 */
export async function setCookie(key: string, value: string, options = {}) {
  (await cookies()).set(key, value, {
    ...options,
  });
}

/**
 * Get a cookie value by key
 */
export async function getCookie(key: string) {
  return (await cookies()).get(key)?.value;
}

/**
 * Delete a cookie by key
 */
export async function deleteCookie(key: string) {
  (await cookies()).delete(key);
}

/**
 * Set session token in cookies
 */
export async function setSessionToken(token: string) {
  await setCookie(SESSION_COOKIE_NAME, token);
}

/**
 * Get session token from cookies
 */
export async function getSessionToken() {
  return getCookie(SESSION_COOKIE_NAME);
}

/**
 * Set user data in cookies
 */
export async function setUserData(userData: any) {
  try {
    const userDataString = JSON.stringify(userData);
    await setCookie(USER_COOKIE_NAME, userDataString);
  } catch (error) {
    console.error('Error setting user data cookie:', error);
  }
}

/**
 * Get user data from cookies
 */
export async function getUserData() {
  try {
    const userDataString = await getCookie(USER_COOKIE_NAME);
    if (userDataString) {
      return JSON.parse(userDataString);
    }
    return null;
  } catch (error) {
    console.error('Error parsing user data from cookie:', error);
    return null;
  }
}

/**
 * Check if user is authenticated based on cookies
 */
export async function isAuthenticated() {
  const token = await getCookie(SESSION_COOKIE_NAME);
  return !!token;
}

/**
 * Clear all session cookies
 */
export async function clearSession() {
  await deleteCookie(SESSION_COOKIE_NAME);
  await deleteCookie(USER_COOKIE_NAME);
}

/**
 * Refresh cookie expiry (resets the cookies with the same values)
 */
export async function refreshSession() {
  const token = await getCookie(SESSION_COOKIE_NAME);
  const userData = await getCookie(USER_COOKIE_NAME);

  if (token) {
    await setCookie(SESSION_COOKIE_NAME, token);
  }

  if (userData) {
    await setCookie(USER_COOKIE_NAME, userData);
  }
}
