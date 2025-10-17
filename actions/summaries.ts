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
  prompts?: string[],
  options?: GenerateSummaryOptions,
  userId?: string
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
      references: [], // Can be added later for context
      prompts: prompts || [], // User-provided prompts
      directives: [], // Can be added later for structured prompts
      options: {
        relevance: options?.relevance || 0.8,
        limit: options?.limit || 10,
        margin: options?.margin || 2,
        temperature: options?.temperature || 0.7,
        top_p: options?.top_p || 0.9,
        ...options
      },
      // Include user ID if provided
      ...(userId && { user: userId })
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

// Iterate (modify) an existing summary with prompts using the /summaries/iterate endpoint
export async function iterateSummaryAction(
  summaryId: string,
  prompts: string[],
  options?: GenerateSummaryOptions
): Promise<SummaryResponse> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    if (!summaryId) {
      throw new Error('Summary ID is required');
    }

    if (!prompts || prompts.length === 0 || !prompts.some(p => p.trim())) {
      throw new Error('At least one prompt is required');
    }

    const requestBody = {
      summary: summaryId,
      prompts: prompts.filter(p => p.trim()), // Filter out empty prompts
      options: {
        relevance: options?.relevance || 0.8,
        limit: options?.limit || 10,
        margin: options?.margin || 2,
        temperature: options?.temperature || 0.7,
        top_p: options?.top_p || 0.9,
        ...options
      }
    }

    console.log('Iterating summary with prompts:', requestBody)

    const response = await axios.post(`${API_BASE_URL}/summaries/iterate`, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    return response.data
  } catch (error) {
    console.error('Iterate summary error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Iterate API error details:', {
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
        throw new Error('Invalid request: Please check your prompts and summary ID')
      } else if (error.response?.status === 404) {
        throw new Error('Summary not found: The summary may have been deleted')
      } else if (error.response?.status === 500) {
        throw new Error('Server error: Please try again or contact support if the issue persists')
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to iterate summary'
      throw new Error(errorMessage)
    }
    throw new Error('Network error: Please check your connection and try again')
  }
}

// Legacy function for backward compatibility - now uses iterate endpoint
export async function chatWithSummaryAction(
  existingSummary: SummaryResponse,
  chatPrompt: string,
  options?: GenerateSummaryOptions
): Promise<SummaryResponse> {
  if (!existingSummary._id) {
    throw new Error('Summary ID is required for updating');
  }

  return iterateSummaryAction(existingSummary._id, [chatPrompt], options);
}

// Add a new user-created summary
export async function addSummaryAction(
  title: string,
  content: string
): Promise<SummaryResponse> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    if (!content.trim()) {
      throw new Error('Content is required');
    }

    const requestBody = {
      title: title.trim() || null,
      content: content.trim()
    }

    console.log('Adding summary:', requestBody)

    const response = await axios.post(`${API_BASE_URL}/summaries/add`, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    return response.data
  } catch (error) {
    console.error('Add summary error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Add summary API error details:', {
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
        throw new Error('Invalid request: Please check your content')
      } else if (error.response?.status === 500) {
        throw new Error('Server error: Please try again or contact support if the issue persists')
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to add summary'
      throw new Error(errorMessage)
    }
    throw new Error('Network error: Please check your connection and try again')
  }
}

// Edit an existing summary
export async function editSummaryAction(
  summaryId: string,
  title?: string,
  content?: string
): Promise<SummaryResponse> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    if (!summaryId) {
      throw new Error('Summary ID is required');
    }

    const requestBody: { summary: string; title?: string; content?: string } = {
      summary: summaryId
    }

    if (title !== undefined) {
      requestBody.title = title
    }
    if (content !== undefined) {
      requestBody.content = content
    }

    console.log('Editing summary:', requestBody)

    const response = await axios.post(`${API_BASE_URL}/summaries/edit`, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    return response.data
  } catch (error) {
    console.error('Edit summary error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Edit summary API error details:', {
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
        throw new Error('Invalid request: Please check your summary ID')
      } else if (error.response?.status === 404) {
        throw new Error('Summary not found: The summary may have been deleted')
      } else if (error.response?.status === 500) {
        throw new Error('Server error: Please try again or contact support if the issue persists')
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to edit summary'
      throw new Error(errorMessage)
    }
    throw new Error('Network error: Please check your connection and try again')
  }
}

// Get all summaries
export async function getSummaries(userId?: string): Promise<SummaryResponse[]> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return [];
    }

    const response = await axios.post(`${API_BASE_URL}/summaries`, {
      // Include user ID if provided
      ...(userId && { user: userId })
    }, {
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

// Server action to get all user summaries
export async function getUserSummariesAction(): Promise<SummaryResponse[]> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return [];
    }

    // Get current user ID for filtering
    const userIdResult = await getCurrentUserIdAction();
    if (!userIdResult.success || !userIdResult.userId) {
      console.error('Failed to get user ID for filtering');
      return [];
    }

    const response = await axios.post(`${API_BASE_URL}/summaries`, {
      user: userIdResult.userId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    return response.data || []
  } catch (error) {
    console.error('Get user summaries error:', error)
    if (axios.isAxiosError(error)) {
      console.error('User summaries API error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    return []
  }
}

// Server action to generate new summary from selected sources
export async function generateNewSummaryAction(
  sourceIds: string[],
  prompts?: string[]
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
      references: [],
      prompts: prompts || [],
      directives: [],
      options: {
        relevance: 0.8,
        limit: 10,
        margin: 2,
        temperature: 0.7,
        top_p: 0.9
      }
    }

    console.log('Generating new summary with:', requestBody)

    const response = await axios.post(`${API_BASE_URL}/summaries/generate`, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    return response.data
  } catch (error) {
    console.error('Generate new summary error:', error)
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to generate summary'
      throw new Error(errorMessage)
    }
    throw new Error('Network error: Please check your connection and try again')
  }
}

// Delete a summary
export async function deleteSummaryAction(summaryId: string): Promise<void> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    if (!summaryId) {
      throw new Error('Summary ID is required');
    }

    const requestBody = {
      summary: summaryId
    }

    console.log('Deleting summary:', requestBody)

    await axios.post(`${API_BASE_URL}/summaries/remove`, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Delete summary error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Delete summary API error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 400) {
        throw new Error('Invalid request: Please check your summary ID')
      } else if (error.response?.status === 404) {
        throw new Error('Summary not found: The summary may have been deleted')
      } else if (error.response?.status === 500) {
        throw new Error('Server error: Please try again or contact support if the issue persists')
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to delete summary'
      throw new Error(errorMessage)
    }
    throw new Error('Network error: Please check your connection and try again')
  }
}