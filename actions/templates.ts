'use server'

import { cookies } from "next/headers"
import axios from 'axios'

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

// Get all templates
export async function getTemplates(): Promise<TemplateResponse[]> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return [];
    }

    const response = await axios.post(`${API_BASE_URL}/templates`, {
      // Fetch both global and user templates
    }, {
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
export async function getGlobalTemplates(): Promise<TemplateResponse[]> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return [];
    }

    const response = await axios.post(`${API_BASE_URL}/templates`, {
      global: true
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log(response.data)   
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
export async function getUserTemplates(): Promise<TemplateResponse[]> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return [];
    }

    const response = await axios.post(`${API_BASE_URL}/templates`, {
      global: false
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log(response.data); 
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


