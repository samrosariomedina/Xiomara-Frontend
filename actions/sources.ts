'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from "next/headers"
import axios from 'axios'
import FormData from 'form-data'
import type { SourceResponse } from '@/lib/schemas'
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

// Get all sources
export async function getSourcesAction(options?: { folderId?: string }): Promise<SourceResponse[]> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Folder-scoped read if folderId provided
    if (options?.folderId) {
      console.log('=== FOLDER-SCOPED READ DEBUG ===')
      console.log('Folder ID:', options.folderId)
      console.log('Folder ID is null?', options.folderId === null || options.folderId === undefined)
      
      const files = await getFolderFileIds(options.folderId)
      console.log('Folder files retrieved:', files)
      console.log('Folder files is null?', files === null || files === undefined)
      
      const ids = files?.sources || []
      console.log('Source IDs from folder:', ids)
      console.log('Source IDs array length:', ids.length)
      console.log('Source IDs is empty?', ids.length === 0)
      
      if (ids.length === 0) {
        console.log('No sources found in folder, returning empty array')
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
        sources: ids,
        user: userIdResult.userId
      }
      console.log('Request data for sources:', JSON.stringify(requestData, null, 2))
      console.log('=====================================')
      
      const response = await axios.post(`${API_BASE_URL}/sources`, requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Sources response status:', response.status)
      console.log('Sources response data length:', response.data?.length || 0)
      return response.data || []
    }

    // Default user-filtered read (manually added types)
    const userIdResult = await getCurrentUserIdAction();
    if (!userIdResult.success || !userIdResult.userId) {
      throw new Error('Failed to get user ID for filtering');
    }
    const requestBody: { types: string[]; user: string } = {
      types: ['text', 'file', 'webpage'],
      user: userIdResult.userId
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
export async function getSources(options?: { folderId?: string }): Promise<SourceResponse[]> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return [];
    }

    if (options?.folderId) {
      const files = await getFolderFileIds(options.folderId)
      console.log('Files:', files); 
      const ids = files?.sources || []
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
      
      const response = await axios.post(`${API_BASE_URL}/sources`, {
        sources: ids,
        user: userIdResult.userId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      return response.data || []
    }

    const userIdResult = await getCurrentUserIdAction();
    if (!userIdResult.success || !userIdResult.userId) {
      console.error('Failed to get user ID for filtering');
      return [];
    }

    const requestBody: { types: string[]; user: string } = {
      types: ['text', 'file', 'webpage'],
      user: userIdResult.userId
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
export async function getContentEngineSources(options?: { folderId?: string }): Promise<SourceResponse[]> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return [];
    }

    // Always require a folderId for content engine sources
    if (!options?.folderId) {
      console.error('Content engine sources require a folderId (client ID)');
      return [];
    }

    const files = await getFolderFileIds(options.folderId)
    const ids = files?.sources || []
    if (ids.length === 0) {
      console.log('No sources found for client folder:', options.folderId)
      return []
    }
    
    // Get current user ID for filtering
    const userIdResult = await getCurrentUserIdAction();
    if (!userIdResult.success || !userIdResult.userId) {
      console.error('Failed to get user ID for filtering');
      return [];
    }
    
    const response = await axios.post(`${API_BASE_URL}/sources`, {
      sources: ids,
      user: userIdResult.userId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Content engine sources fetched:', response.data?.length || 0, 'sources for client:', options.folderId)
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
}, options?: { folderId?: string }): Promise<SourceResponse & { linked?: boolean; linkError?: string }> {
  
  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║  CREATE SOURCE ACTION CALLED                         ║')
  console.log('╠══════════════════════════════════════════════════════╣')
  console.log('║  Folder ID received:   ', (options?.folderId || 'NONE').padEnd(26), '║')
  console.log('║  Folder ID undefined?  ', (options?.folderId === undefined ? 'YES' : 'NO').padEnd(26), '║')
  console.log('║  Options object:       ', (options ? 'EXISTS' : 'NULL').padEnd(26), '║')
  console.log('╚══════════════════════════════════════════════════════╝')
  
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
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 120000, // 2 minutes timeout for large content
    })
    
    const created: SourceResponse = response.data

    // Push to folder if provided
    let linked: boolean | undefined
    let linkError: string | undefined
    if (options?.folderId && created?._id) {
      const pushData = {
        folder: options.folderId,
        sources: [created._id]
      }
      
      console.log('=== PUSH TO FOLDER DEBUG ===')
      console.log('Folder ID:', options.folderId)
      console.log('Created Source ID:', created._id)
      console.log('Push Data:', JSON.stringify(pushData, null, 2))
      console.log('Folder ID is null?', options.folderId === null || options.folderId === undefined)
      console.log('Source ID is null?', created._id === null || created._id === undefined)
      console.log('Sources array:', [created._id])
      console.log('Sources array length:', [created._id].length)
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
      console.log('=== PUSH SKIPPED ===')
      console.log('Folder ID provided?', !!options?.folderId)
      console.log('Created source has ID?', !!created?._id)
      console.log('Options:', options)
      console.log('Created source:', created)
      console.log('===================')
    }

    revalidatePath('/clients')
    revalidatePath('/clients/fuentes')
    revalidatePath('/clients/dashboards/fuentes')
    revalidatePath('/clients/content-engine')
    return { ...created, linked, linkError }
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

    // Backend expects JSON (application/json) per sources.md documentation
    // The edit endpoint only supports updating title and content, not file uploads
    // File uploads would require creating a new source
    
    // Prepare request data according to backend API spec
    const requestData: {
      source: string;
      title?: string | null;
      content?: string;
    } = {
      source: sourceId
    }

    // Handle title - can be null or string (per backend code)
    // Backend: if (con.post.title === null || typeof con.post.title === "string") source.title = con.post.title || null;
    // This means empty string becomes null, so send null to remove title
    if (data.name !== undefined) {
      // Send null to remove title (backend converts empty string to null anyway)
      requestData.title = data.name && data.name.trim() ? data.name.trim() : null;
    }

    // Handle content - determine what content to send
    // Always send content if provided to ensure it's preserved when title changes
    if (data.text !== undefined && data.text !== null) {
      // Text content - send as plain string (backend expects raw text)
      const textContent = data.text.trim();
      
      // Validate that text content is not empty
      if (!textContent) {
        throw new Error('Text content cannot be empty. Please enter some text.');
      }
      
      requestData.content = textContent;
    } else if (data.url !== undefined && data.url !== null) {
      // URL content - send URL as plain string
      const urlContent = data.url.trim();
      
      // Validate URL format
      try {
        new URL(urlContent);
      } catch {
        throw new Error('Invalid URL format. Please enter a valid URL starting with http:// or https://');
      }
      
      requestData.content = urlContent;
    } else if (data.file) {
      // File uploads are not supported in edit endpoint
      // User would need to create a new source instead
      throw new Error('File uploads are not supported when editing. Please create a new source with the file.');
    }

    // Validate that we have at least title or content to update
    if (requestData.title === undefined && !requestData.content) {
      throw new Error('At least title or content must be provided to update the source.');
    }

    // Calculate request body size for large content debugging
    const requestBodyString = JSON.stringify(requestData);
    const requestBodySize = new Blob([requestBodyString]).size;
    const requestBodySizeMB = requestBodySize / (1024 * 1024);

    console.log('=== EDIT SOURCE DEBUG ===')
    console.log('Source ID:', sourceId)
    console.log('Request Data:', {
      source: requestData.source,
      title: requestData.title,
      contentLength: requestData.content?.length || 0,
      contentPreview: requestData.content?.substring(0, 100) + (requestData.content && requestData.content.length > 100 ? '...' : ''),
      requestBodySize: `${requestBodySizeMB.toFixed(2)} MB`,
      requestBodySizeBytes: requestBodySize
    })
    console.log('========================')

    // Verify content is not truncated
    if (requestData.content && data.text) {
      const originalLength = data.text.length;
      const sentLength = requestData.content.length;
      if (sentLength < originalLength * 0.9) { // Allow 10% difference for HTML stripping
        console.warn('⚠️ WARNING: Content may be truncated!', {
          originalLength,
          sentLength,
          difference: originalLength - sentLength
        });
      }
    }

    const response = await axios.post(`${API_BASE_URL}/sources/edit`, requestData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 120000, // 2 minutes timeout for large content
      // Add transform request to log actual payload size
      transformRequest: [(data) => {
        const jsonString = JSON.stringify(data);
        console.log('📤 Actual request payload size:', `${(new Blob([jsonString]).size / (1024 * 1024)).toFixed(2)} MB`);
        return jsonString;
      }]
    })

    console.log('Edit source response status:', response.status)
    console.log('Edit source response data:', response.data)
    
    // Verify the response contains the updated content
    if (response.data && requestData.content) {
      const responseContentLength = response.data.content?.length || 0;
      const sentContentLength = requestData.content.length;
      console.log('📥 Response content verification:', {
        sentLength: sentContentLength,
        receivedLength: responseContentLength,
        match: responseContentLength === sentContentLength
      });
      
      if (Math.abs(responseContentLength - sentContentLength) > sentContentLength * 0.1) {
        console.error('❌ ERROR: Response content length does not match sent content!', {
          sent: sentContentLength,
          received: responseContentLength,
          difference: sentContentLength - responseContentLength
        });
        throw new Error(`Content length mismatch: sent ${sentContentLength} bytes, received ${responseContentLength} bytes. The update may not have been applied correctly.`);
      }
    }

    // Backend returns 200 with updated source object, or 404 if not found
    // Verify we got a valid response
    if (response.status === 200 && response.data) {
      // Double-check that the content was actually updated
      if (requestData.content && response.data.content !== requestData.content) {
        // Content might be processed/stripped by backend, so check length instead
        const responseLength = response.data.content?.length || 0;
        const sentLength = requestData.content.length;
        if (Math.abs(responseLength - sentLength) > sentLength * 0.1) {
          console.error('❌ Content update verification failed:', {
            sentLength,
            responseLength,
            sentPreview: requestData.content.substring(0, 200),
            responsePreview: response.data.content?.substring(0, 200)
          });
        }
      }
      
      revalidatePath('/clients')
      revalidatePath('/clients/fuentes')
      revalidatePath('/clients/dashboards/fuentes')
      revalidatePath('/clients/content-engine')
      return response.data
    } else {
      throw new Error('Source update failed: Invalid response from server')
    }
  } catch (error) {
    console.error('Edit source error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to update source')
    }
    throw new Error('Failed to update source')
  }
}

// Remove a source
export async function removeSourceAction(sourceId: string, options?: { folderId?: string }): Promise<void> {
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
    
    // Pull from folder if provided
    if (options?.folderId) {
      const pullData = {
        folder: options.folderId,
        sources: [sourceId]
      }
      
      console.log('=== PULL FROM FOLDER DEBUG ===')
      console.log('Folder ID:', options.folderId)
      console.log('Source ID to remove:', sourceId)
      console.log('Pull Data:', JSON.stringify(pullData, null, 2))
      console.log('Folder ID is null?', options.folderId === null || options.folderId === undefined)
      console.log('Source ID is null?', sourceId === null || sourceId === undefined)
      console.log('Sources array:', [sourceId])
      console.log('Sources array length:', [sourceId].length)
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
      console.log('=== PULL SKIPPED ===')
      console.log('Folder ID provided?', !!options?.folderId)
      console.log('Source ID:', sourceId)
      console.log('Options:', options)
      console.log('===================')
    }
    
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
