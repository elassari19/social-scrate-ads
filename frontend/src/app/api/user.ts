'use server';

import axios from 'axios';
import { getAuthHeaders, getSession } from './auth';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Get user profile
 */
export async function getUserProfile() {
  try {
    // Use the existing getCurrentUser function from auth.ts
    const userData = await getSession();

    if (!userData) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    return {
      success: true,
      data: userData,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return {
      success: false,
      error: 'Failed to fetch user profile',
    };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userData: {
  name?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
}) {
  try {
    // Get authentication headers
    const authHeaders = await getAuthHeaders();
    const session = await getSession();

    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Remove the currentPassword from the payload going to the API
    const { currentPassword, ...updateData } = userData;

    // Only include password if both current and new are provided
    if (updateData.password && !currentPassword) {
      delete updateData.password;
    }

    const response = await axios.put(
      `${API_URL}/users/${session.id}`,
      updateData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      }
    );

    if (response.status !== 200) {
      throw new Error('Failed to update profile');
    }

    // Revalidate the path to update the UI
    revalidatePath('/profile');

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to update profile',
    };
  }
}
