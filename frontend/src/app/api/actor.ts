'use server';

import axios from 'axios';
import { getAuthHeaders, getSession } from './auth';
import { revalidatePath } from 'next/cache';
import { Actor } from '@/types';

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

    // Log parameters in development only
    if (process.env.NODE_ENV === 'development') {
      console.log(`Fetching actors with params: ${JSON.stringify(params)}`);
    }

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
      data: await import('../../utils/constants').then(
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
 * Execute an actor with DeepSeek AI
 */
export async function executeActorWithDeepSeek(
  namespace: string,
  platform: string,
  prompt: string,
  additionalContext?: Record<string, any>
) {
  try {
    // Get authentication headers
    const authHeaders = await getAuthHeaders();

    console.log(
      `Executing actor with namespace ${namespace} using DeepSeek and prompt: ${prompt}`
    );

    console.log('Sending payload to DeepSeek API:');

    const response = await axios.post(
      `${API_URL}/actors/namespace/${namespace}/deepseek`,
      {
        platform: platform,
        prompt: prompt,
        additionalContext: {
          ...additionalContext,
        },
      },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      }
    );

    if (response.status !== 200) {
      throw new Error(
        `Failed to execute actor with DeepSeek: ${response.statusText}`
      );
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error(
      `Error executing actor with namespace ${namespace} using DeepSeek:`,
      error
    );

    // Add more detailed error information
    let errorMessage = 'Failed to execute actor with DeepSeek';

    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        `Error ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      console.error('No response received from server');
      errorMessage = 'No response received from server';
    } else {
      console.error('Error message:', error.message);
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Execute an actor
 */
export async function executeActor(id: string | number, payload: any) {
  try {
    // Get authentication headers
    const authHeaders = await getAuthHeaders();

    // Ensure we're using the proper URL format and ID
    const actorId = typeof id === 'string' ? id : id.toString();

    console.log(
      `Executing actor ${actorId} with payload:`,
      JSON.stringify(payload)
    );

    // Check if the payload is in the format for the DeepSeek API
    if (payload.options?.prompt && !payload.prompt) {
      // Convert the payload to match the expected format for the DeepSeek API
      const deepSeekPayload = {
        prompt: payload.options.prompt,
        additionalContext: payload.options.additionalContext || {},
      };

      const response = await axios.post(
        `${API_URL}/actors/${actorId}/execute`,
        deepSeekPayload,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
        }
      );

      if (response.status !== 200) {
        throw new Error('Failed to execute actor');
      }

      return {
        success: true,
        data: response.data,
      };
    } else {
      // Use the payload as is
      const response = await axios.post(
        `${API_URL}/actors/${actorId}/execute`,
        payload,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
        }
      );

      if (response.status !== 200) {
        throw new Error('Failed to execute actor');
      }

      return {
        success: true,
        data: response.data,
      };
    }
  } catch (error: any) {
    console.error(`Error executing actor with ID ${id}:`, error);

    // Add more detailed error information
    let errorMessage = 'Failed to execute actor';
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        errorMessage;
    }

    return {
      success: false,
      error: errorMessage,
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
export async function rateActor(
  actorId: string,
  rating: number,
  comment?: string
) {
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

    const response = await axios.get(`${API_URL}/actors/${actorId}/ratings`, {
      withCredentials: true,
      headers: authHeaders,
    });

    if (response.status !== 200) {
      throw new Error('Failed to fetch actor ratings');
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(
      `Error fetching ratings for actor with ID ${actorId}:`,
      error
    );
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
export async function updateRating(
  ratingId: string,
  data: { rating?: number; comment?: string }
) {
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
      prompt,
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

/**
 * Create a new actor
 */
export async function createActor(actorData: any) {
  try {
    // Get authentication headers
    const authHeaders = await getAuthHeaders();
    const user = await getSession();

    const response = await axios.post(
      `${API_URL}/actors`,
      {
        ...actorData,
        authorName: user?.name.split(' ')[0],
      },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      }
    );

    if (response.status !== 201) {
      throw new Error(`Failed to create actor: ${response.status}`);
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    // Log detailed error information
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }

    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to create actor',
    };
  }
}

/**
 * Update an existing actor
 */
export async function updateActor(id: string, actorData: Partial<Actor>) {
  try {
    // Get authentication headers
    const authHeaders = await getAuthHeaders();

    // Make sure URL is properly included in the request
    const dataToSend = {
      ...actorData,
      url: actorData.url || undefined, // Include URL or explicitly set as undefined
    };

    const response = await axios.put(`${API_URL}/actors/${id}`, dataToSend, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
    });

    if (response.status !== 200) {
      console.error('Error response:', response.data);
      return {
        success: false,
        error: 'Failed to update actor',
      };
    }

    // Revalidate to update cached data
    revalidatePath('/store/actors');

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error(`Error updating actor with ID ${id}:`, error);
    // Add more detailed error logging
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return {
      success: false,
      error:
        error.response?.data?.error ||
        error.message ||
        'Failed to update actor',
    };
  }
}

/**
 * Delete an actor
 */
export async function deleteActor(id: string) {
  try {
    // Get authentication headers
    const authHeaders = await getAuthHeaders();

    const response = await axios.delete(`${API_URL}/actors/${id}`, {
      withCredentials: true,
      headers: authHeaders,
    });

    if (response.status !== 204) {
      throw new Error('Failed to delete actor');
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error(`Error deleting actor with ID ${id}:`, error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete actor',
    };
  }
}
