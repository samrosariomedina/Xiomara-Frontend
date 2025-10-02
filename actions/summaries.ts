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
  prompts?: string[],
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
      prompts: prompts || [], // User-provided prompts
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

// Modify an existing summary with a chat prompt (uses the summary's original sources)
export async function chatWithSummaryAction(
  existingSummary: SummaryResponse,
  chatPrompt: string,
  options?: GenerateSummaryOptions
): Promise<SummaryResponse> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    if (!chatPrompt.trim()) {
      throw new Error('Chat prompt is required');
    }

    if (!existingSummary.sources || existingSummary.sources.length === 0) {
      throw new Error('No sources found in the existing summary');
    }

    if (!existingSummary._id) {
      throw new Error('Summary ID is required for updating');
    }

    // Step 1: Generate new content using the existing sources + chat prompt
    const generateRequestBody = {
      sources: existingSummary.sources, // Use sources from existing summary
      references: [], // Required by backend
      prompts: [chatPrompt.trim()], // The chat prompt
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

    console.log('Generating new content with chat prompt:', generateRequestBody)

    // Generate new content
    const generateResponse = await axios.post(`${API_BASE_URL}/summaries/generate`, generateRequestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const newContent = generateResponse.data

    // Step 2: Update the existing summary with the new content
    console.log('Updating existing summary with new content:', {
      summaryId: existingSummary._id,
      newTitle: newContent.title,
      newContent: newContent.content
    })

    await editSummaryAction(
      existingSummary._id,
      newContent.title,
      newContent.content
    )

    // Return the updated summary with the original metadata but new content
    return {
      ...existingSummary,
      title: newContent.title,
      content: newContent.content,
      edited: true,
      timestamp: new Date().toISOString() // Update timestamp to reflect the edit
    }
  } catch (error) {
    console.error('Chat with summary error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Chat API error details:', {
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
        throw new Error('Invalid chat request: Please check your prompt')
      } else if (error.response?.status === 404) {
        throw new Error('Sources not found: The original sources may no longer exist')
      } else if (error.response?.status === 500) {
        throw new Error('Server error: Please try again or contact support if the issue persists')
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to modify summary'
      throw new Error(errorMessage)
    }
    throw new Error('Network error: Please check your connection and try again')
  }
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

    const requestBody: any = {
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
