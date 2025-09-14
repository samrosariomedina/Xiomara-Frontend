'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from "next/headers"
import axios from 'axios'
import FormData from 'form-data'
import type { SourceResponse } from '@/lib/schemas'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888'
console.log('Sources API_BASE_URL:', API_BASE_URL)

/**
 * Get authentication token from cookies
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value || null;
    console.log('Sources Auth token check:', token ? 'Found token' : 'No token found');
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

    const response = await axios.post(`${API_BASE_URL}/sources`, {
      types: ['generales'] // Filter for general sources
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Sources API response:', {
      status: response.status,
      dataLength: response.data?.length || 0,
      data: response.data
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
    console.log('Server-side getSources - token:', token ? 'Found' : 'Not found');
    
    if (!token) {
      console.log('No auth token found, returning empty array');
      return [];
    }

    console.log('Making API call to:', `${API_BASE_URL}/sources`);
    const response = await axios.post(`${API_BASE_URL}/sources`, {
      types: ['generales']
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Server-side sources API response:', {
      status: response.status,
      dataLength: response.data?.length || 0,
      data: response.data
    });
    
    return response.data || []
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
    formData.append('type', 'generales') // Always set as generales

    // Determine content based on what's provided
    let content = '';
    if (data.file) {
      // Handle file upload
      const buffer = Buffer.from(await data.file.arrayBuffer())
      formData.append('file', buffer, {
        filename: data.file.name,
        contentType: data.file.type
      })
      content = data.file.name; // Use filename as content for now
    } else if (data.url) {
      content = data.url;
    } else if (data.text) {
      content = data.text;
    }

    formData.append('content', content)

    // Debug logging
    console.log('Sending source to backend:', {
      type: 'generales',
      content: content,
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

    const response = await axios.post(`${API_BASE_URL}/sources/add`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
    })
    
    console.log('Sources backend response:', response.data)
    revalidatePath('/clients')
    revalidatePath('/clients/fuentes')
    revalidatePath('/clients/dashboards/fuentes')
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

    // Determine content based on what's provided
    let content = '';
    if (data.file) {
      // Handle file upload
      const buffer = Buffer.from(await data.file.arrayBuffer())
      formData.append('file', buffer, {
        filename: data.file.name,
        contentType: data.file.type
      })
      content = data.file.name;
    } else if (data.url) {
      content = data.url;
    } else if (data.text) {
      content = data.text;
    }

    formData.append('content', content)

    const response = await axios.post(`${API_BASE_URL}/sources/edit`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    })

    revalidatePath('/clients')
    revalidatePath('/clients/fuentes')
    revalidatePath('/clients/dashboards/fuentes')
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
  } catch (error) {
    console.error('Remove source error:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to remove source')
    }
    throw new Error('Failed to remove source')
  }
}
