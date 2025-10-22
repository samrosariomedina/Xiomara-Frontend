'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from "next/headers"
import axios from 'axios'
import FormData from 'form-data'
import type { KnowledgeBaseInput, ReferenceResponse } from '@/lib/schemas'
import { getCurrentUserIdAction } from "./auth"
import { getFolderFileIds } from './_folders'

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

// Get all references/knowledge base items (server-side)
export async function getReferencesAction(options: { folderId: string }): Promise<ReferenceResponse[]> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Always require folderId for knowledge base
    if (!options.folderId) {
      console.error('Knowledge base requires a folderId (client ID)');
      return [];
    }

    console.log('=== FOLDER-SCOPED KNOWLEDGE READ DEBUG ===')
    console.log('Folder ID:', options.folderId)
    console.log('Folder ID is null?', options.folderId === null || options.folderId === undefined)
    
    const files = await getFolderFileIds(options.folderId)
    console.log('Folder files retrieved:', files)
    console.log('Folder files is null?', files === null || files === undefined)
    
    const ids = files?.references || []
    console.log('Reference IDs from folder:', ids)
    console.log('Reference IDs array length:', ids.length)
    console.log('Reference IDs is empty?', ids.length === 0)
    
    if (ids.length === 0) {
      console.log('No references found in folder, returning empty array')
      return []
    }
    
    // Get current user ID for filtering
    const userIdResult = await getCurrentUserIdAction();
    console.log('User ID result:', userIdResult)
    console.log('User ID success?', userIdResult.success)
    console.log('User ID:', userIdResult.userId)
    
    if (!userIdResult.success || !userIdResult.userId) {
      throw new Error('Failed to get user ID for filtering');
    }
    
    const requestData = {
      references: ids,
      user: userIdResult.userId
    }
    console.log('Request data for references:', JSON.stringify(requestData, null, 2))
    console.log('=====================================')
    
    const response = await axios.post(`${API_BASE_URL}/references`, requestData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('References response status:', response.status)
    console.log('References response data length:', response.data?.length || 0)
    return response.data || []
  } catch (error) {
    console.error('Get references error:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch knowledge base items')
    }
    throw new Error('Failed to fetch knowledge base items')
  }
}

// Server-side function to get references (for use in server components)
export async function getReferences(options: { folderId: string }): Promise<ReferenceResponse[]> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return [];
    }

    // Always require folderId for knowledge base
    if (!options.folderId) {
      console.error('Knowledge base requires a folderId (client ID)');
      return [];
    }

    const files = await getFolderFileIds(options.folderId)
    console.log('Files:', files); 
    const ids = files?.references || []
    console.log('Ids:', ids);
    console.log('Ids length:', ids.length);
    console.log('Ids is empty?', ids.length === 0);
    if (ids.length === 0) {
      return []
    }
    
    // Get current user ID for filtering
    const userIdResult = await getCurrentUserIdAction();
    if (!userIdResult.success || !userIdResult.userId) {
      console.error('Failed to get user ID for filtering');
      return [];
    }
    
    const response = await axios.post(`${API_BASE_URL}/references`, {
      references: ids,
      user: userIdResult.userId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
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
export async function createReferenceAction(data: KnowledgeBaseInput, options: { folderId: string }): Promise<ReferenceResponse & { linked?: boolean; linkError?: string }> {
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
    
    // Check file size
    if (data.file) {
      const fileSizeMB = data.file.size / (1024 * 1024);
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
    
    const created: ReferenceResponse = response.data

    // Push to folder if provided
    let linked: boolean | undefined
    let linkError: string | undefined
    if (options?.folderId && created?._id) {
      const pushData = {
        folder: options.folderId,
        references: [created._id]
      }
      
      console.log('=== PUSH TO FOLDER DEBUG (KNOWLEDGE) ===')
      console.log('Folder ID:', options.folderId)
      console.log('Created Reference ID:', created._id)
      console.log('Push Data:', JSON.stringify(pushData, null, 2))
      console.log('Folder ID is null?', options.folderId === null || options.folderId === undefined)
      console.log('Reference ID is null?', created._id === null || created._id === undefined)
      console.log('References array:', [created._id])
      console.log('References array length:', [created._id].length)
      console.log('================================')
      
      try {
        const pushResponse = await axios.post(`${API_BASE_URL}/folders/push`, pushData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        console.log('Push response status:', pushResponse.status)
        console.log('Push response data:', pushResponse.data)
        linked = true
      } catch (pushError: unknown) {
        console.error('Push to folder error:', pushError)
        console.error('Push error response:', axios.isAxiosError(pushError) ? pushError.response?.data : 'Not an axios error')
        console.error('Push error status:', axios.isAxiosError(pushError) ? pushError.response?.status : 'Not an axios error')
        linked = false
        linkError = axios.isAxiosError(pushError) 
          ? pushError.response?.data?.message || 'Failed to link to folder'
          : 'Failed to link to folder'
      }
    } else {
      console.log('=== PUSH SKIPPED (KNOWLEDGE) ===')
      console.log('Folder ID provided?', !!options?.folderId)
      console.log('Created reference has ID?', !!created?._id)
      console.log('Options:', options)
      console.log('Created reference:', created)
      console.log('===================')
    }

    revalidatePath('/clients')
    revalidatePath('/clients/knowledge')
    revalidatePath('/clients/dashboards/knowledge')
    return { ...created, linked, linkError }
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
export async function removeReferenceAction(referenceId: string, options: { folderId: string }): Promise<void> {
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
    
    // Pull from folder if provided
    if (options?.folderId) {
      const pullData = {
        folder: options.folderId,
        references: [referenceId]
      }
      
      console.log('=== PULL FROM FOLDER DEBUG (KNOWLEDGE) ===')
      console.log('Folder ID:', options.folderId)
      console.log('Reference ID to remove:', referenceId)
      console.log('Pull Data:', JSON.stringify(pullData, null, 2))
      console.log('Folder ID is null?', options.folderId === null || options.folderId === undefined)
      console.log('Reference ID is null?', referenceId === null || referenceId === undefined)
      console.log('References array:', [referenceId])
      console.log('References array length:', [referenceId].length)
      console.log('================================')
      
      try {
        const pullResponse = await axios.post(`${API_BASE_URL}/folders/pull`, pullData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        console.log('Pull response status:', pullResponse.status)
        console.log('Pull response data:', pullResponse.data)
      } catch (pullError: unknown) {
        console.error('Pull from folder error:', pullError)
        console.error('Pull error response:', axios.isAxiosError(pullError) ? pullError.response?.data : 'Not an axios error')
        console.error('Pull error status:', axios.isAxiosError(pullError) ? pullError.response?.status : 'Not an axios error')
        // Don't throw error for pull failure, just log it
      }
    } else {
      console.log('=== PULL SKIPPED (KNOWLEDGE) ===')
      console.log('Folder ID provided?', !!options?.folderId)
      console.log('Reference ID:', referenceId)
      console.log('Options:', options)
      console.log('===================')
    }
    
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
