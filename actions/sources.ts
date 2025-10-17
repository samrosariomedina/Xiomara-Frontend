'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from "next/headers"
import axios from 'axios'
import FormData from 'form-data'
import type { SourceResponse } from '@/lib/schemas'
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

// Get all sources
export async function getSourcesAction(): Promise<SourceResponse[]> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Get current user ID for filtering
    const userIdResult = await getCurrentUserIdAction();
    if (!userIdResult.success || !userIdResult.userId) {
      throw new Error('Failed to get user ID for filtering');
    }

    // For non-admin users, let the backend handle user filtering automatically
    // Only send user parameter for admin users who need to query other users' data
    const requestBody: { types: string[] } = {
      types: ['text', 'file', 'webpage'] // Filter for manually added sources
    };

    const response = await axios.post(`${API_BASE_URL}/sources`, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    
    return response.data
  } catch (error) {
    console.error('Get sources error:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch sources')
    }
    throw new Error('Failed to fetch sources')
  }
}

// Server-side function to get sources (for use in server components)
export async function getSources(): Promise<SourceResponse[]> {
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

    // For non-admin users, let the backend handle user filtering automatically
    const requestBody: { types: string[] } = {
      types: ['text', 'file', 'webpage'] // Filter for manually added sources
    };

    const response = await axios.post(`${API_BASE_URL}/sources`, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const sources = response.data || []
    
    // Note: We can't use localStorage in server components, 
    // but we'll handle caching in the client components
    return sources
  } catch (error) {
    console.error('Get sources server error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Server-side sources API error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    return []
  }
}

// Server action to get sources for content engine
export async function getContentEngineSources(): Promise<SourceResponse[]> {
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

    // For non-admin users, let the backend handle user filtering automatically
    const requestBody: { types: string[] } = {
      types: ['text', 'file', 'webpage'] // Filter for manually added sources
    };

    const response = await axios.post(`${API_BASE_URL}/sources`, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    return response.data || []
  } catch (error) {
    console.error('Get content engine sources error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Content engine sources API error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    return []
  }
}

// Create a new source
export async function createSourceAction(data: {
  name: string;
  description?: string;
  file?: File;
  url?: string;
  text?: string;
}): Promise<SourceResponse> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Prepare form data for multipart/form-data
    const formData = new FormData()

    // Add basic fields
    formData.append('title', data.name)

    // Determine type and content based on what's provided
    let sourceType = 'text';
    let content = '';
    
    if (data.file) {
      // Handle file upload
      sourceType = 'file';
      const buffer = Buffer.from(await data.file.arrayBuffer())
      formData.append('file', buffer, {
        filename: data.file.name,
        contentType: data.file.type
      })
      content = data.file.name; // Use filename as content for now
    } else if (data.url) {
      sourceType = 'webpage';
      content = data.url.trim();
      
      // Validate URL format before sending
      try {
        new URL(content);
      } catch {
        throw new Error('Invalid URL format. Please enter a valid URL starting with http:// or https://');
      }
    } else if (data.text) {
      sourceType = 'text';
      content = data.text.trim();
      
      // Validate that text content is not empty after processing
      if (!content) {
        throw new Error('Text content cannot be empty. Please enter some text.');
      }
    }

    formData.append('type', sourceType)
    formData.append('content', content)
    
    // Additional logging for text sources
    if (sourceType === 'text') {
      console.log('Text source details:', {
        originalText: data.text,
        processedContent: content,
        contentLength: content.length,
        isEmpty: content.length === 0
      });
    }

    
    // Check file size and type
    if (data.file) {
      const fileSizeMB = data.file.size / (1024 * 1024);
      if (fileSizeMB > 100) {
        throw new Error('File size exceeds 100MB limit');
      }
      
      // Check if file type is supported by backend
      const supportedTypes = ['txt', 'md', 'pdf', 'htm', 'html'];
      const fileExtension = data.file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !supportedTypes.includes(fileExtension)) {
        throw new Error(`Unsupported file type. Please upload one of: ${supportedTypes.join(', ').toUpperCase()}`);
      }
    }

    console.log('Sending source data:', {
      type: sourceType,
      content: content,
      contentLength: content.length,
      hasFile: !!data.file,
      url: data.url,
      text: data.text ? `Text length: ${data.text.length}` : 'No text'
    })

    const response = await axios.post(`${API_BASE_URL}/sources/add`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
    })
    
    revalidatePath('/clients')
    revalidatePath('/clients/fuentes')
    revalidatePath('/clients/dashboards/fuentes')
    revalidatePath('/clients/content-engine')
    return response.data
  } catch (error) {
    console.error('Create source error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to create source')
    }
    throw new Error('Failed to create source')
  }
}

// Edit an existing source
export async function editSourceAction(
  sourceId: string,
  data: {
    name?: string;
    description?: string;
    file?: File;
    url?: string;
    text?: string;
  }
): Promise<SourceResponse> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Prepare form data for multipart/form-data (in case we're uploading a file)
    const formData = new FormData()

    // Add basic fields
    formData.append('source', sourceId)
    if (data.name) {
      formData.append('title', data.name)
    }

    // Determine type and content based on what's provided
    let sourceType = 'text';
    let content = '';
    
    if (data.file) {
      // Handle file upload
      sourceType = 'file';
      const buffer = Buffer.from(await data.file.arrayBuffer())
      formData.append('file', buffer, {
        filename: data.file.name,
        contentType: data.file.type
      })
      content = data.file.name;
    } else if (data.url) {
      sourceType = 'webpage';
      content = data.url.trim();
    } else if (data.text) {
      sourceType = 'text';
      content = data.text.trim();
      
      // Validate that text content is not empty after processing
      if (!content) {
        throw new Error('Text content cannot be empty. Please enter some text.');
      }
    }

    formData.append('type', sourceType)
    formData.append('content', content)

    // Check file size and type for edit
    if (data.file) {
      const fileSizeMB = data.file.size / (1024 * 1024);
      if (fileSizeMB > 100) {
        throw new Error('File size exceeds 100MB limit');
      }
      
      // Check if file type is supported by backend
      const supportedTypes = ['txt', 'md', 'pdf', 'htm', 'html'];
      const fileExtension = data.file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !supportedTypes.includes(fileExtension)) {
        throw new Error(`Unsupported file type. Please upload one of: ${supportedTypes.join(', ').toUpperCase()}`);
      }
    }

    const response = await axios.post(`${API_BASE_URL}/sources/edit`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    })

    revalidatePath('/clients')
    revalidatePath('/clients/fuentes')
    revalidatePath('/clients/dashboards/fuentes')
    revalidatePath('/clients/content-engine')
    return response.data
  } catch (error) {
    console.error('Edit source error:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update source')
    }
    throw new Error('Failed to update source')
  }
}

// Remove a source
export async function removeSourceAction(sourceId: string): Promise<void> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    await axios.post(`${API_BASE_URL}/sources/remove`, {
      source: sourceId,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    revalidatePath('/clients')
    revalidatePath('/clients/fuentes')
    revalidatePath('/clients/dashboards/fuentes')
    revalidatePath('/clients/content-engine')
  } catch (error) {
    console.error('Remove source error:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to remove source')
    }
    throw new Error('Failed to remove source')
  }
}
