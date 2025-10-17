'use server'

import { cookies } from "next/headers"
import axios from 'axios'
import { getCurrentUserIdAction } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888'

/**
 * Get authentication token from cookies
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value || null;
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

export interface TemplateResponse {
  _id: string;
  title: string;
  global: boolean;
  prompt: string;
  timestamp: string | null;
  edited: string | null;
  user?: string;
}

// Get all templates (global + user's own templates)
export async function getTemplates(userId?: string): Promise<TemplateResponse[]> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return [];
    }

    // Get current user ID for filtering if not provided
    let currentUserId = userId;
    if (!currentUserId) {
      const userIdResult = await getCurrentUserIdAction();
      if (userIdResult.success && userIdResult.userId) {
        currentUserId = userIdResult.userId;
      }
    }

    // Include user parameter for filtering
    const requestBody = currentUserId ? { user: currentUserId } : {};
    
    const response = await axios.post(`${API_BASE_URL}/templates`, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    return response.data || []
  } catch (error) {
    console.error('Get templates error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Templates API error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    return []
  }
}

// Get global templates only
export async function getGlobalTemplates(userId?: string): Promise<TemplateResponse[]> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return [];
    }

    const requestBody = { global: true, ...(userId && { user: userId }) };
    
    const response = await axios.post(`${API_BASE_URL}/templates`, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    return response.data || []
  } catch (error) {
    console.error('Get global templates error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Global templates API error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    return []
  }
}

// Get user templates only
export async function getUserTemplates(userId?: string): Promise<TemplateResponse[]> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return [];
    }

    const requestBody = { global: false, ...(userId && { user: userId }) };
    
    const response = await axios.post(`${API_BASE_URL}/templates`, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    return response.data || []
  } catch (error) {
    console.error('Get user templates error:', error)
    if (axios.isAxiosError(error)) {
      console.error('User templates API error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    return []
  }
}


