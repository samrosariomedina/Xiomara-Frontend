'use server'

import { cookies } from "next/headers"
import axios from 'axios'
import { getCurrentUserIdAction } from "./auth"
import { getFolderFileIds, pushToFolder } from './_folders'

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
  options?: OutputGenerationOptions,
  link?: { folderId?: string }
): Promise<OutputResponse & { linked?: boolean; linkError?: string }> {
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
    
    const created: OutputResponse = response.data

    // Optional push to folder
    let linked: boolean | undefined
    let linkError: string | undefined
    if (link?.folderId && created?._id) {
      const result = await pushToFolder(link.folderId, { outputs: [created._id] })
      linked = result.linked
      linkError = result.linkError
    }

    return { ...created, linked, linkError }
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
  options?: OutputGenerationOptions,
  link?: { folderId?: string }
): Promise<OutputResponse & { linked?: boolean; linkError?: string }> {
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
    
    const created: OutputResponse = response.data

    let linked: boolean | undefined
    let linkError: string | undefined
    if (link?.folderId && created?._id) {
      const result = await pushToFolder(link.folderId, { outputs: [created._id] })
      linked = result.linked
      linkError = result.linkError
    }

    return { ...created, linked, linkError }
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
export async function getOutputsAction(options: { folderId: string }): Promise<OutputResponse[]> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return [];
    }

    const files = await getFolderFileIds(options.folderId)
    const ids = files?.outputs || []
    if (ids.length === 0) {
      return []
    }
    
    // Get current user ID for filtering
    const userIdResult = await getCurrentUserIdAction();
    if (!userIdResult.success || !userIdResult.userId) {
      console.error('Failed to get user ID for filtering');
      return [];
    }
    
    const response = await axios.post(`${API_BASE_URL}/outputs`, {
      outputs: ids,
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
export async function getAllOutputsAction(options: { folderId: string }): Promise<OutputResponse[]> {
  try {
    const outputs = await getOutputsAction(options)
    
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
export async function getOutputsWithTemplateNamesAction(options: { folderId: string }): Promise<OutputResponse[]> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return [];
    }

    // Folder-scoped read
    const files = await getFolderFileIds(options.folderId)
    const ids = files?.outputs || []
    
    if (ids.length === 0) {
      return []
    }
    
    // Get current user ID for filtering
    const userIdResult = await getCurrentUserIdAction();
    if (!userIdResult.success || !userIdResult.userId) {
      console.error('Failed to get user ID for filtering');
      return [];
    }
    
    const outputsResponse = await axios.post(`${API_BASE_URL}/outputs`, {
      outputs: ids,
      user: userIdResult.userId
    }, {
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
    const templateMap = new Map(templates.map((template: { _id: string; title: string }) => [template._id, template.title]))
    
    // Enhance outputs with template names
    const enhancedOutputs = outputs.map((output: OutputResponse) => ({
      ...output,
      items: output.items.map((item: OutputItem) => ({
        ...item,
        templateName: item.template ? templateMap.get(item.template) || 'Unknown Template' : 'Manual Content'
      }))
    }))
    
    // Sort by timestamp, newest first
    return enhancedOutputs.sort((a: OutputResponse, b: OutputResponse) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ) as OutputResponse[]
  } catch (error) {
    console.error('Get outputs with template names error:', error)
    return []
  }
}

// Get latest output for current user (for backward compatibility)
export async function getLatestOutputAction(options: { folderId: string }): Promise<OutputResponse | null> {
  try {
    const outputs = await getAllOutputsAction(options)
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
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      if (!outputId) {
        throw new Error('Output ID is required');
      }

      const requestBody: { output: string; items?: string[] } = {
        output: outputId
      }

    if (itemIds && itemIds.length > 0) {
      // Validate that all itemIds are valid strings
      const validItemIds = itemIds.filter(id => typeof id === 'string' && id.trim().length > 0)
      
      if (validItemIds.length === 0) {
        throw new Error('No valid item IDs provided for deletion')
      }
      
      if (validItemIds.length !== itemIds.length) {
        console.warn('Some item IDs were invalid and filtered out:', {
          original: itemIds,
          valid: validItemIds
        })
      }
      
      requestBody.items = validItemIds
      console.log('Removing specific items from output:', {
        requestBody,
        itemIds: validItemIds,
        itemIdsType: typeof validItemIds,
        itemIdsLength: validItemIds.length,
        firstItemType: typeof validItemIds[0]
      })
    } else {
      console.log('Removing entire output:', requestBody)
    }

    console.log('Making API request to:', `${API_BASE_URL}/outputs/remove`)
    console.log('Request headers:', {
      'Authorization': `Bearer ${token?.substring(0, 10)}...`,
      'Content-Type': 'application/json'
    })

    const response = await axios.post(`${API_BASE_URL}/outputs/remove`, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

      console.log('Remove output/items response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      })
      
      // Success - exit retry loop
      return;
      
    } catch (error) {
      lastError = error as Error;
      console.error(`Remove output error (attempt ${attempt}/${maxRetries}):`, error)
      
      if (axios.isAxiosError(error)) {
        console.error('Remove output API error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          requestBody: { output: outputId, items: itemIds },
          attempt
        });
        
        // Don't retry for certain errors
        if (error.response?.status === 400 || error.response?.status === 404) {
          if (error.response?.status === 400) {
            const errorMsg = error.response?.data?.message || error.response?.data || 'Invalid request'
            throw new Error(`Invalid request: ${errorMsg}`)
          } else if (error.response?.status === 404) {
            throw new Error('Output not found: The output may have been deleted')
          }
        }
        
        // For 500 errors, we'll retry
        if (error.response?.status === 500 && attempt < maxRetries) {
          console.log(`Server error on attempt ${attempt}, retrying...`)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Exponential backoff
          continue;
        }
        
        if (error.response?.status === 500) {
          throw new Error('Server error: Please try again or contact support if the issue persists')
        }
        
        const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to remove output'
        throw new Error(errorMessage)
      }
      
      // For network errors, retry
      if (attempt < maxRetries) {
        console.log(`Network error on attempt ${attempt}, retrying...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Exponential backoff
        continue;
      }
      
      throw new Error('Network error: Please check your connection and try again')
    }
  }
  
  // If we get here, all retries failed
  throw lastError || new Error('Failed to remove output after multiple attempts')
}

// Delete entire output
export async function deleteOutputAction(outputId: string): Promise<void> {
  return removeOutputAction(outputId) // Remove entire output when no itemIds specified
}

// Delete specific output item
export async function deleteOutputItemAction(outputId: string, itemId: string): Promise<void> {
  return removeOutputAction(outputId, [itemId])
}
