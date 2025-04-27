'use server';

import axios from 'axios';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const SESSION_COOKIE_NAME = 'connect.sid'; // Match the actual cookie name from your backend
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
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (response.status !== 200) {
      return { error: 'Login failed' };
    }

    // Extract the user data correctly
    const userData = response.data.user || response.data;

    // Forward the cookie from the response to the client
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      // Store session token in cookie
      const sessionCookie = setCookieHeader.find((cookie) =>
        cookie.includes(SESSION_COOKIE_NAME)
      );
      if (sessionCookie) {
        const cookieValue = sessionCookie.split(';')[0].split('=')[1];
        (await cookies()).set(SESSION_COOKIE_NAME, cookieValue, {
          path: '/',
          httpOnly: false, // Allow client-side access
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      }
    }

    // Store user data in a cookie for easier access
    (await cookies()).set(USER_COOKIE_NAME, JSON.stringify(userData), {
      path: '/',
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return {
      user: userData,
      success: true,
      session: response.data.session || null,
    };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Login failed. Please check your credentials.' };
  }
}

export async function signup(credentials: SignupCredentials) {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, credentials, {
      withCredentials: true,
    });

    // Similar cookie handling as in the login function
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      const sessionCookie = setCookieHeader.find((cookie) =>
        cookie.includes(SESSION_COOKIE_NAME)
      );
      if (sessionCookie) {
        const cookieValue = sessionCookie.split(';')[0].split('=')[1];
        (await cookies()).set(SESSION_COOKIE_NAME, cookieValue, {
          path: '/',
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      }
    }

    return {
      success: true,
      user: response.data,
    };
  } catch (error: any) {
    console.error('Signup error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Signup failed',
    };
  }
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
  try {
    // Get authentication cookie
    const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME);

    // Only make the request if we have a session cookie
    if (!sessionCookie?.value) {
      return null;
    }

    const response = await axios.get(`${API_URL}/auth/me`, {
      withCredentials: true,
      headers: {
        Cookie: `${SESSION_COOKIE_NAME}=${sessionCookie.value}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Helper function to get auth headers for API calls
export async function getAuthHeaders() {
  const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME);
  if (sessionCookie?.value) {
    return {
      Cookie: `${SESSION_COOKIE_NAME}=${sessionCookie.value}`,
    };
  }
  return {};
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

  return userData;
}
