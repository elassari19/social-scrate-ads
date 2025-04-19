'use server';

import axios from 'axios';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const SESSION_COOKIE_NAME = 'session_token';
const USER_COOKIE_NAME = 'user_data';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials extends LoginCredentials {
  name: string;
}

export async function login(credentials: LoginCredentials) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials, {
      withCredentials: true,
    });

    if (response.statusText !== 'OK') {
      return { error: 'Login failed' };
    }

    // Extract the user and session data correctly
    const userData = response.data.user || response.data;
    const sessionToken = response.data.session || response.data.token || '';

    // Set cookies directly using Next.js cookies API
    (await cookies()).set(SESSION_COOKIE_NAME, sessionToken, {
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    (await cookies()).set(USER_COOKIE_NAME, JSON.stringify(userData), {
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { ...response.data, success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Login failed. Please check your credentials.' };
  }
}

export async function signup(credentials: SignupCredentials) {
  const response = await axios.post(`${API_URL}/auth/register`, credentials, {
    withCredentials: true,
  });

  if (!response.data.success) {
    throw new Error('Signup failed');
  }

  return response.data;
}

export async function logout() {
  try {
    // Try to call the backend logout endpoint
    const response = await axios.post(
      `${API_URL}/auth/logout`,
      {},
      {
        withCredentials: true,
      }
    );

    console.log('Logout response:', response.data);
  } catch (error) {
    // Even if API call fails, we should clear local cookies
    console.warn('Logout API error:', error);
  } finally {
    // Always clear cookies directly
    (await cookies()).delete(SESSION_COOKIE_NAME);
    (await cookies()).delete(USER_COOKIE_NAME);
  }
}

export async function getCurrentUser() {
  const response = await axios.get(`${API_URL}/auth/me`, {
    withCredentials: true,
  });

  if (!response.data.success) {
    throw new Error('Failed to fetch user data');
  }

  return response.data.user || response.data;
}

export async function getSession() {
  const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME);
  const userDataCookie = (await cookies()).get(USER_COOKIE_NAME);

  let userData = null;
  if (userDataCookie?.value) {
    try {
      userData = JSON.parse(userDataCookie.value);
    } catch (error) {
      console.error('Error parsing user data from cookie:', error);
    }
  }

  console.log('Session:', sessionCookie?.value);
  return userData;
}
