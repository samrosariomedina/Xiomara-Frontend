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

export interface SummaryResponse {
  _id: string
  title: string
  content: string
  timestamp: string
  sources: string[]
  references?: string[]
  edited: boolean
}

export interface GenerateSummaryOptions {
  relevance?: number
  limit?: number
  margin?: number
  temperature?: number
  top_p?: number
}

// Generate a summary from selected sources
export async function generateSummaryAction(
  sourceIds: string[],
  options?: GenerateSummaryOptions
): Promise<SummaryResponse> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    if (!sourceIds || sourceIds.length === 0) {
      throw new Error('At least one source must be selected');
    }

    const requestBody = {
      sources: sourceIds,
      references: [], // Required by backend
      prompts: [], // Required by backend  
      directives: [], // Required by backend
      options: {
        relevance: options?.relevance || 0.8,
        limit: options?.limit || 10,
        margin: options?.margin || 2,
        temperature: options?.temperature || 0.7,
        top_p: options?.top_p || 0.9,
        ...options
      }
    }

    console.log('Generating summary with:', requestBody)

    const response = await axios.post(`${API_BASE_URL}/summaries/generate`, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    return response.data
  } catch (error) {
    console.error('Generate summary error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Summary API error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        },
        message: error.message
      });
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error('Invalid request: Please check your source selection')
      } else if (error.response?.status === 404) {
        throw new Error('Sources not found: Some selected sources may no longer exist')
      } else if (error.response?.status === 500) {
        throw new Error('Server error: Please try again or contact support if the issue persists')
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to generate summary'
      throw new Error(errorMessage)
    }
    throw new Error('Network error: Please check your connection and try again')
  }
}

// Get all summaries
export async function getSummaries(): Promise<SummaryResponse[]> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return [];
    }

    const response = await axios.post(`${API_BASE_URL}/summaries`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    return response.data || []
  } catch (error) {
    console.error('Get summaries error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Summaries API error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    return []
  }
}
