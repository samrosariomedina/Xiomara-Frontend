'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from "next/headers"
import axios from 'axios'
import FormData from 'form-data'
import type { KnowledgeBaseInput, ReferenceResponse } from '@/lib/schemas'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888'
console.log('API_BASE_URL:', API_BASE_URL)

/**
 * Get authentication token from cookies
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value || null;
    console.log('Auth token check:', token ? 'Found token' : 'No token found');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Get all references/knowledge base items (server-side)
export async function getReferencesAction(): Promise<ReferenceResponse[]> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.post(`${API_BASE_URL}/references`, {
      types: ['text', 'webpage', 'file'] // Filter for knowledge base types
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('References API response:', {
      status: response.status,
      dataLength: response.data?.length || 0,
      data: response.data
    })
    
    return response.data
  } catch (error) {
    console.error('Get references error:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch knowledge base items')
    }
    throw new Error('Failed to fetch knowledge base items')
  }
}

// Server-side function to get references (for use in server components)
export async function getReferences(): Promise<ReferenceResponse[]> {
  try {
    const token = await getAuthToken();
    console.log('Server-side getReferences - token:', token ? 'Found' : 'Not found');
    
    if (!token) {
      console.log('No auth token found, returning empty array');
      return [];
    }

    console.log('Making API call to:', `${API_BASE_URL}/references`);
    const response = await axios.post(`${API_BASE_URL}/references`, {
      types: ['text', 'webpage', 'file']
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Server-side API response:', {
      status: response.status,
      dataLength: response.data?.length || 0,
      data: response.data
    });
    
    return response.data || []
  } catch (error) {
    console.error('Get references server error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Server-side API error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    return []
  }
}

// Create a new reference/knowledge base item
export async function createReferenceAction(data: KnowledgeBaseInput): Promise<ReferenceResponse> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Prepare form data for multipart/form-data
    const formData = new FormData()

    // Add basic fields
    formData.append('title', data.name)

    // Determine type and handle content based on what's provided
    const contentObject = {
      description: data.description || '',
      text: '',
      webUrl: '',
      fileContent: ''
    }
    let referenceType = 'text' // Default type

    if (data.file) {
      // Handle file upload - send as file type with proper file structure
      referenceType = 'file'
      const buffer = Buffer.from(await data.file.arrayBuffer())
      // Send file with a consistent field name 'file' (this creates con.files.file)
      formData.append('file', buffer, {
        filename: data.file.name,
        contentType: data.file.type
      })
      // For file uploads, the backend will process the file and populate fileContent
    } else if (data.text) {
      referenceType = 'text'
      contentObject.text = data.text
    } else if (data.url) {
      referenceType = 'webpage'  // Backend uses 'webpage' type for URLs
      contentObject.webUrl = data.url
    }

    formData.append('type', referenceType)
    formData.append('content', JSON.stringify(contentObject))

    // Debug logging
    console.log('Sending to backend:', {
      type: referenceType,
      contentObject: contentObject,
      hasFile: !!data.file,
      fileName: data.file?.name,
      fileSize: data.file?.size,
      title: data.name,
      description: data.description,
      formDataKeys: ['title', 'type', 'content', ...(data.file ? ['file'] : [])]
    })
    
    // Check file size
    if (data.file) {
      const fileSizeMB = data.file.size / (1024 * 1024);
      console.log(`File size: ${fileSizeMB.toFixed(2)} MB`);
      if (fileSizeMB > 100) {
        throw new Error('File size exceeds 100MB limit');
      }
    }

    const response = await axios.post(`${API_BASE_URL}/references/add`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
    })
    
    console.log('Backend response:', response.data)
    revalidatePath('/clients')
    revalidatePath('/clients/knowledge')
    revalidatePath('/clients/dashboards/knowledge')
    return response.data
  } catch (error) {
    console.error('Create reference error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to create knowledge base item')
    }
    throw new Error('Failed to create knowledge base item')
  }
}

// Edit an existing reference
export async function editReferenceAction(
  referenceId: string,
  data: Partial<KnowledgeBaseInput>
): Promise<ReferenceResponse> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Prepare form data for multipart/form-data (in case we're uploading a file)
    const formData = new FormData()

    // Add basic fields
    formData.append('reference', referenceId)
    if (data.name) {
      formData.append('title', data.name)
    }

    // Determine content based on what's provided
    const contentObject = {
      description: data.description || '',
      text: '',
      webUrl: '',
      fileContent: ''
    }

    if (data.file) {
      // Handle file upload - send as file type with proper file structure
      const buffer = Buffer.from(await data.file.arrayBuffer())
      // Send file with consistent field name 'file' (this creates con.files.file)
      formData.append('file', buffer, {
        filename: data.file.name,
        contentType: data.file.type
      })
      // For file uploads, the backend will process the file and populate fileContent
    } else if (data.text) {
      contentObject.text = data.text
    } else if (data.url) {
      contentObject.webUrl = data.url
    }

    formData.append('content', JSON.stringify(contentObject))

    const response = await axios.post(`${API_BASE_URL}/references/edit`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    })

    revalidatePath('/clients')
    revalidatePath('/clients/knowledge')
    revalidatePath('/clients/dashboards/knowledge')
    return response.data
  } catch (error) {
    console.error('Edit reference error:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update knowledge base item')
    }
    throw new Error('Failed to update knowledge base item')
  }
}

// Remove a reference
export async function removeReferenceAction(referenceId: string): Promise<void> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    await axios.post(`${API_BASE_URL}/references/remove`, {
      reference: referenceId,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    revalidatePath('/clients')
    revalidatePath('/clients/knowledge')
    revalidatePath('/clients/dashboards/knowledge')
  } catch (error) {
    console.error('Remove reference error:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to remove knowledge base item')
    }
    throw new Error('Failed to remove knowledge base item')
  }
}
