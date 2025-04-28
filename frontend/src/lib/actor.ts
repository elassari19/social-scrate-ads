'use server';

import axios from 'axios';
import { getAuthHeaders } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ActorParams {
  category?: string;
  search?: string;
  limit?: number;
  page?: number;
}

/**
 * Fetch actors from the backend
 */
export async function getActors(params: ActorParams = {}) {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.set('category', params.category);
    if (params.search) queryParams.set('q', params.search);
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.page) queryParams.set('page', params.page.toString());

    const queryString = queryParams.toString();
    const url = `${API_URL}/actors${queryString ? `?${queryString}` : ''}`;

    // Get authentication headers
    const authHeaders = await getAuthHeaders();

    const response = await axios.get(url, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
    });

    if (response.status !== 200) {
      throw new Error('Failed to fetch actors');
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error fetching actors:', error);
    return {
      success: false,
      error: 'Failed to fetch actors',
      // Return mock data as fallback
      data: await import('../utils/constants').then(
        (module) => module.mockActors
      ),
    };
  }
}

/**
 * Get actor by namespace
 */
export async function getActorByNamespace(namespace: string) {
  try {
    // Get authentication headers
    const authHeaders = await getAuthHeaders();

    const response = await axios.get(
      `${API_URL}/actors/namespace/${namespace}`,
      {
        withCredentials: true,
        headers: authHeaders,
      }
    );

    if (response.status !== 200) {
      throw new Error('Failed to fetch actor');
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error fetching actor with namespace ${namespace}:`, error);
    return {
      success: false,
      error: 'Failed to fetch actor',
    };
  }
}

/**
 * Execute an actor
 */
export async function executeActor(id: number, payload: any) {
  try {
    // Get authentication headers
    const authHeaders = await getAuthHeaders();

    const response = await axios.post(
      `${API_URL}/actors/${id}/execute`,
      payload,
      {
        withCredentials: true,
        headers: authHeaders,
      }
    );

    if (response.status !== 200) {
      throw new Error('Failed to execute actor');
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error executing actor with ID ${id}:`, error);
    return {
      success: false,
      error: 'Failed to execute actor',
    };
  }
}

/**
 * Get actor executions
 */
export async function getActorExecutions(id: number) {
  try {
    // Get authentication headers
    const authHeaders = await getAuthHeaders();

    const response = await axios.get(`${API_URL}/actors/${id}/executions`, {
      withCredentials: true,
      headers: authHeaders,
    });

    if (response.status !== 200) {
      throw new Error('Failed to fetch actor executions');
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error fetching executions for actor with ID ${id}:`, error);
    return {
      success: false,
      error: 'Failed to fetch actor executions',
    };
  }
}

/**
 * Rate an actor
 */
export async function rateActor(actorId: string, rating: number, comment?: string) {
  try {
    // Get authentication headers
    const authHeaders = await getAuthHeaders();

    const response = await axios.post(
      `${API_URL}/actors/${actorId}/ratings`,
      { rating, comment },
      {
        withCredentials: true,
        headers: authHeaders,
      }
    );

    if (response.status !== 201) {
      throw new Error('Failed to rate actor');
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error rating actor with ID ${actorId}:`, error);
    return {
      success: false,
      error: 'Failed to rate actor',
    };
  }
}

/**
 * Get all ratings for an actor
 */
export async function getActorRatings(actorId: string) {
  try {
    // Get authentication headers
    const authHeaders = await getAuthHeaders();

    const response = await axios.get(
      `${API_URL}/actors/${actorId}/ratings`,
      {
        withCredentials: true,
        headers: authHeaders,
      }
    );

    if (response.status !== 200) {
      throw new Error('Failed to fetch actor ratings');
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error fetching ratings for actor with ID ${actorId}:`, error);
    return {
      success: false,
      error: 'Failed to fetch actor ratings',
    };
  }
}

/**
 * Get current user's rating for an actor
 */
export async function getUserRating(actorId: string) {
  try {
    // Get authentication headers
    const authHeaders = await getAuthHeaders();

    const response = await axios.get(
      `${API_URL}/actors/${actorId}/ratings/user`,
      {
        withCredentials: true,
        headers: authHeaders,
      }
    );

    if (response.status !== 200) {
      // If user hasn't rated, this isn't an error
      if (response.status === 404) {
        return {
          success: true,
          data: null,
        };
      }
      throw new Error('Failed to fetch user rating');
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error fetching user rating for actor ${actorId}:`, error);
    return {
      success: false,
      error: 'Failed to fetch user rating',
    };
  }
}

/**
 * Update an existing rating
 */
export async function updateRating(ratingId: string, data: { rating?: number; comment?: string }) {
  try {
    // Get authentication headers
    const authHeaders = await getAuthHeaders();

    const response = await axios.put(
      `${API_URL}/actors/ratings/${ratingId}`,
      data,
      {
        withCredentials: true,
        headers: authHeaders,
      }
    );

    if (response.status !== 200) {
      throw new Error('Failed to update rating');
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error updating rating with ID ${ratingId}:`, error);
    return {
      success: false,
      error: 'Failed to update rating',
    };
  }
}

/**
 * Delete a rating
 */
export async function deleteRating(ratingId: string) {
  try {
    // Get authentication headers
    const authHeaders = await getAuthHeaders();

    const response = await axios.delete(
      `${API_URL}/actors/ratings/${ratingId}`,
      {
        withCredentials: true,
        headers: authHeaders,
      }
    );

    if (response.status !== 204) {
      throw new Error('Failed to delete rating');
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Error deleting rating with ID ${ratingId}:`, error);
    return {
      success: false,
      error: 'Failed to delete rating',
    };
  }
}

/**
 * Analyze actor ratings with DeepSeek AI
 */
export async function analyzeActorRatings(actorId: string, prompt?: string) {
  try {
    // Get authentication headers
    const authHeaders = await getAuthHeaders();

    const payload = {
      actorId,
      prompt
    };

    const response = await axios.post(
      `${API_URL}/puppeteer/analyze-ratings`,
      payload,
      {
        withCredentials: true,
        headers: authHeaders,
      }
    );

    if (response.status !== 200) {
      throw new Error('Failed to analyze actor ratings');
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error analyzing ratings for actor ${actorId}:`, error);
    return {
      success: false,
      error: 'Failed to analyze actor ratings',
    };
  }
}
