'use server';

import axios from 'axios';
import { getAuthHeaders } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Get user's subscription balance
 */
export async function getBalance() {
  try {
    const authHeaders = await getAuthHeaders();

    if (!authHeaders) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    const response = await axios.get(`${API_URL}/subscription/balance`, {
      withCredentials: true,
      headers: {
        ...authHeaders,
      },
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Error fetching balance:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch balance',
    };
  }
}

/**
 * Create a checkout session for depositing funds
 */
export async function createDepositCheckoutSession(amount: number) {
  try {
    if (amount < 5) {
      return {
        success: false,
        error: 'Minimum deposit amount is $5',
      };
    }

    const authHeaders = await getAuthHeaders();

    if (!authHeaders) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    const response = await axios.post(
      `${API_URL}/subscription/deposit/checkout-session`,
      { amount },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Error creating deposit checkout session:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to create checkout session',
    };
  }
}

/**
 * Process a successful deposit after checkout
 */
export async function processSuccessfulDeposit(sessionId: string) {
  try {
    const authHeaders = await getAuthHeaders();

    if (!authHeaders) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    const response = await axios.post(
      `${API_URL}/subscription/deposit/process`,
      { sessionId },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Error processing deposit:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to process deposit',
    };
  }
}

/**
 * Get transaction history
 */
export async function getTransactionHistory() {
  try {
    const authHeaders = await getAuthHeaders();

    if (!authHeaders) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    const response = await axios.get(`${API_URL}/subscription/transactions`, {
      withCredentials: true,
      headers: {
        ...authHeaders,
      },
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Error fetching transaction history:', error);
    return {
      success: false,
      error:
        error.response?.data?.error || 'Failed to fetch transaction history',
    };
  }
}
