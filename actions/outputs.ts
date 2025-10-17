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

export interface OutputItem {
  _id: string
  content: string
  template?: string
  timestamp: string
  edited: boolean
  templateName?: string // Added for display purposes
}

export interface OutputResponse {
  _id: string
  items: OutputItem[]
  timestamp: string
  summary: string
  edited: boolean
}

export interface OutputGenerationOptions {
  temperature?: number
  top_p?: number
  timezone?: number
}

// Generate output from summary with specific template
export async function generateOutputForTemplateAction(
  summaryId: string,
  templateId: string,
  prompts?: string[],
  options?: OutputGenerationOptions
): Promise<OutputResponse> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    if (!summaryId) {
      throw new Error('Summary ID is required');
    }

    if (!templateId) {
      throw new Error('Template ID is required');
    }

    const requestBody = {
      summary: summaryId,
      templates: [templateId], // Single template
      directives: [], // Required by backend
      prompts: prompts || [], // Optional custom prompts
      options: {
        temperature: options?.temperature || 0.7,
        top_p: options?.top_p || 0.9,
        timezone: options?.timezone || 0,
        ...options
      }
    }

    console.log('Generating output for template:', requestBody)

    const response = await axios.post(`${API_BASE_URL}/outputs/generate`, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    return response.data
  } catch (error) {
    console.error('Generate output for template error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Template output generation API error details:', {
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
        throw new Error('Invalid request: Please check your summary and template selection')
      } else if (error.response?.status === 404) {
        throw new Error('Summary or template not found')
      } else if (error.response?.status === 500) {
        throw new Error('Server error: Please try again or contact support if the issue persists')
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to generate output'
      throw new Error(errorMessage)
    }
    throw new Error('Network error: Please check your connection and try again')
  }
}

// Generate output from summary with optional templates (legacy function)
export async function generateOutputAction(
  summaryId: string,
  templates?: string[],
  prompts?: string[],
  options?: OutputGenerationOptions
): Promise<OutputResponse> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    if (!summaryId) {
      throw new Error('Summary ID is required');
    }

    const requestBody = {
      summary: summaryId,
      templates: templates || [], // Optional - for future template support
      directives: [], // Required by backend
      prompts: prompts || [], // Optional custom prompts
      options: {
        temperature: options?.temperature || 0.7,
        top_p: options?.top_p || 0.9,
        timezone: options?.timezone || 0,
        ...options
      }
    }

    console.log('Generating output with:', requestBody)

    const response = await axios.post(`${API_BASE_URL}/outputs/generate`, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    return response.data
  } catch (error) {
    console.error('Generate output error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Output generation API error details:', {
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
        throw new Error('Invalid request: Please check your summary selection')
      } else if (error.response?.status === 404) {
        throw new Error('Summary not found: The summary may have been deleted')
      } else if (error.response?.status === 500) {
        throw new Error('Server error: Please try again or contact support if the issue persists')
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to generate output'
      throw new Error(errorMessage)
    }
    throw new Error('Network error: Please check your connection and try again')
  }
}

// Add items to existing output
export async function addOutputAction(
  outputId: string,
  items: { content: string }[]
): Promise<OutputResponse> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    if (!outputId) {
      throw new Error('Output ID is required');
    }

    if (!items || items.length === 0) {
      throw new Error('At least one item is required');
    }

    const requestBody = {
      output: outputId,
      items: items
    }

    console.log('Adding output items:', requestBody)

    const response = await axios.post(`${API_BASE_URL}/outputs/add`, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    return response.data
  } catch (error) {
    console.error('Add output error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Add output API error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 400) {
        throw new Error('Invalid request: Please check your content')
      } else if (error.response?.status === 404) {
        throw new Error('Output not found: The output may have been deleted')
      } else if (error.response?.status === 500) {
        throw new Error('Server error: Please try again or contact support if the issue persists')
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to add output items'
      throw new Error(errorMessage)
    }
    throw new Error('Network error: Please check your connection and try again')
  }
}

// Get all outputs
export async function getOutputsAction(): Promise<OutputResponse[]> {
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

    const response = await axios.post(`${API_BASE_URL}/outputs`, {
      user: userIdResult.userId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    return response.data || []
  } catch (error) {
    console.error('Get outputs error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Outputs API error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    return []
  }
}

// Get all outputs for current user (sorted by timestamp, newest first)
export async function getAllOutputsAction(): Promise<OutputResponse[]> {
  try {
    const outputs = await getOutputsAction()
    
    // Sort by timestamp, newest first
    const sortedOutputs = outputs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    
    return sortedOutputs
  } catch (error) {
    console.error('Get all outputs error:', error)
    return []
  }
}

// Get outputs with template names
export async function getOutputsWithTemplateNamesAction(): Promise<OutputResponse[]> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return [];
    }

    // First get all outputs
    const outputsResponse = await axios.post(`${API_BASE_URL}/outputs`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const outputs = outputsResponse.data || []
    
    // Get all templates to map template IDs to names
    const templatesResponse = await axios.post(`${API_BASE_URL}/templates`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const templates = templatesResponse.data || []
    const templateMap = new Map(templates.map((template: any) => [template._id, template.title]))
    
    // Enhance outputs with template names
    const enhancedOutputs = outputs.map((output: any) => ({
      ...output,
      items: output.items.map((item: any) => ({
        ...item,
        templateName: item.template ? templateMap.get(item.template) || 'Unknown Template' : 'Manual Content'
      }))
    }))
    
    // Sort by timestamp, newest first
    return enhancedOutputs.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  } catch (error) {
    console.error('Get outputs with template names error:', error)
    return []
  }
}

// Get latest output for current user (for backward compatibility)
export async function getLatestOutputAction(): Promise<OutputResponse | null> {
  try {
    const outputs = await getAllOutputsAction()
    return outputs.length > 0 ? outputs[0] : null
  } catch (error) {
    console.error('Get latest output error:', error)
    return null
  }
}

// Edit existing output items
export async function editOutputAction(
  outputId: string,
  items: { [itemId: string]: { content: string } }
): Promise<OutputResponse> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    if (!outputId) {
      throw new Error('Output ID is required');
    }

    if (!items || Object.keys(items).length === 0) {
      throw new Error('At least one item to edit is required');
    }

    const requestBody = {
      output: outputId,
      items: items
    }

    console.log('Editing output items:', requestBody)

    const response = await axios.post(`${API_BASE_URL}/outputs/edit`, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    return response.data
  } catch (error) {
    console.error('Edit output error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Edit output API error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 400) {
        throw new Error('Invalid request: Please check your output ID and items')
      } else if (error.response?.status === 404) {
        throw new Error('Output not found: The output may have been deleted')
      } else if (error.response?.status === 500) {
        throw new Error('Server error: Please try again or contact support if the issue persists')
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to edit output'
      throw new Error(errorMessage)
    }
    throw new Error('Network error: Please check your connection and try again')
  }
}

// Remove output or specific items
export async function removeOutputAction(
  outputId: string,
  itemIds?: string[]
): Promise<void> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    if (!outputId) {
      throw new Error('Output ID is required');
    }

    const requestBody: any = {
      output: outputId
    }

    if (itemIds && itemIds.length > 0) {
      requestBody.items = itemIds
    }

    console.log('Removing output/items:', requestBody)

    await axios.post(`${API_BASE_URL}/outputs/remove`, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Remove output error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Remove output API error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 400) {
        throw new Error('Invalid request: Please check your output ID')
      } else if (error.response?.status === 404) {
        throw new Error('Output not found: The output may have been deleted')
      } else if (error.response?.status === 500) {
        throw new Error('Server error: Please try again or contact support if the issue persists')
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to remove output'
      throw new Error(errorMessage)
    }
    throw new Error('Network error: Please check your connection and try again')
  }
}

// Delete entire output
export async function deleteOutputAction(outputId: string): Promise<void> {
  return removeOutputAction(outputId) // Remove entire output when no itemIds specified
}

// Delete specific output item
export async function deleteOutputItemAction(outputId: string, itemId: string): Promise<void> {
  return removeOutputAction(outputId, [itemId])
}
