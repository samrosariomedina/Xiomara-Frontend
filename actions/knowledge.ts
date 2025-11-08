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

/**
 * Strip HTML tags and clean text content (server-side compatible)
 */
function stripHtmlAndCleanText(htmlText: string): string {
  if (!htmlText) return '';
  
  // Server-side compatible HTML stripping using regex
  const textContent = htmlText
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();
  
  return textContent;
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
    
    // Updated request structure to match backend API documentation
    const requestData = {
      references: ids, // Array of ObjectId strings for specific references
      user: userIdResult.userId // Filter by user (admin only)
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

    // Add basic fields - title is optional and overrides auto-generated display title
    if (data.name) {
      formData.append('title', data.name)
    }

    // Determine type and handle content based on what's provided
    let referenceType = 'text' // Default type
    let content = ''

    if (data.file) {
      // Handle file upload - send as file type with proper file structure
      referenceType = 'file'
      const buffer = Buffer.from(await data.file.arrayBuffer())
      // Send file with a consistent field name 'file' (this creates con.files.file)
      formData.append('file', buffer, {
        filename: data.file.name,
        contentType: data.file.type
      })
      // For file uploads, the backend will process the file and populate content
      content = '' // Backend will populate this from the file
    } else if (data.text) {
      referenceType = 'text'
      // Strip HTML tags and send as plain string (same as edit)
      content = stripHtmlAndCleanText(data.text)
    } else if (data.url) {
      referenceType = 'webpage'  // Backend uses 'webpage' type for URLs
      content = data.url.trim() // Send URL as plain string, trimmed like sources
      
      // Validate URL format before sending (same as sources)
      try {
        new URL(content);
      } catch {
        throw new Error('Invalid URL format. Please enter a valid URL starting with http:// or https://');
      }
    }

    // Add required fields according to backend API
    formData.append('type', referenceType)
    formData.append('content', content)

    // Debug logging (similar to sources)
    console.log('=== CREATE REFERENCE DEBUG ===')
    console.log('Sending reference data:', {
      type: referenceType,
      content: content,
      contentLength: content.length,
      hasFile: !!data.file,
      url: data.url,
      text: data.text ? `Text length: ${data.text.length}` : 'No text',
      title: data.name
    })
    console.log('==============================')
    
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
    
    console.log('=== CREATE REFERENCE RESPONSE ===')
    console.log('Status:', response.status)
    console.log('Response Data:', response.data)
    console.log('================================')
    
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

    // Revalidate all relevant paths to ensure real-time updates
    revalidatePath('/clients')
    revalidatePath('/clients/knowledge')
    revalidatePath('/clients/dashboards/knowledge')
    revalidatePath('/[locale]/clients', 'page')
    revalidatePath('/[locale]/clients/[clientId]', 'page')
    revalidatePath('/[locale]/clients/[clientId]/campaigns/[campaignId]', 'page')
    return { ...created, linked, linkError }
  } catch (error) {
    console.error('=== CREATE REFERENCE ERROR ===')
    console.error('Error:', error)
    if (axios.isAxiosError(error)) {
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('Error headers:', error.response?.headers)
      console.error('Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      })
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to create knowledge base item')
    }
    console.error('================================')
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

    // Backend expects content as plain text string (per references.md docs)
    // Backend code shows content is required: if (con.post.content) { ... }
    // Per docs: "content (string): New raw text content" - required field
    
    // Content is required for references edit (per backend code and docs)
    if (data.text === undefined || data.text === null) {
      throw new Error('Content is required to update a reference. Please provide text content.');
    }
    
    const cleanText = stripHtmlAndCleanText(data.text);
    
    // Validate that content is not empty after cleaning
    if (!cleanText || cleanText.trim().length === 0) {
      throw new Error('Text content cannot be empty. Please enter some text.');
    }
    
    // Prepare request data - content is required per backend
    const requestData: {
      reference: string;
      content: string; // Required per backend code and docs
      title?: string | null;
    } = {
      reference: referenceId, // ObjectId string: Identifier of the reference to edit
      content: cleanText, // Send as plain text string (per docs)
    }
    
    // Handle title - can be null or string (per backend code)
    // Backend: if (con.post.title === null || typeof con.post.title === "string") reference.title = con.post.title || null;
    // This means empty string becomes null, so send null to remove title
    if (data.name !== undefined) {
      // Send null to remove title (backend converts empty string to null anyway)
      requestData.title = data.name && data.name.trim() ? data.name.trim() : null;
    }

    // Calculate request body size for large content debugging
    const requestBodyString = JSON.stringify(requestData);
    const requestBodySize = new Blob([requestBodyString]).size;
    const requestBodySizeMB = requestBodySize / (1024 * 1024);

    console.log('=== EDIT REFERENCE DEBUG ===')
    console.log('Reference ID:', referenceId)
    console.log('Request Data:', {
      reference: requestData.reference,
      title: requestData.title,
      contentLength: requestData.content?.length || 0,
      contentPreview: requestData.content?.substring(0, 100) + (requestData.content && requestData.content.length > 100 ? '...' : ''),
      requestBodySize: `${requestBodySizeMB.toFixed(2)} MB`,
      requestBodySizeBytes: requestBodySize
    })
    console.log('============================')

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

    const response = await axios.post(`${API_BASE_URL}/references/edit`, requestData, {
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

    console.log('Edit reference response status:', response.status)
    console.log('Edit reference response data:', response.data)
    
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

    // Backend returns 200 with updated reference object, or 404 if not found
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
      
      // Revalidate all relevant paths to ensure real-time updates
      revalidatePath('/clients')
      revalidatePath('/clients/knowledge')
      revalidatePath('/clients/dashboards/knowledge')
      revalidatePath('/[locale]/clients', 'page')
      revalidatePath('/[locale]/clients/[clientId]', 'page')
      revalidatePath('/[locale]/clients/[clientId]/campaigns/[campaignId]', 'page')
      return response.data
    } else {
      throw new Error('Reference update failed: Invalid response from server')
    }
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

    // Updated to match backend API documentation structure
    await axios.post(`${API_BASE_URL}/references/remove`, {
      reference: referenceId, // ObjectId string: Identifier of the reference to delete
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
    
    // Revalidate all relevant paths to ensure real-time updates
    revalidatePath('/clients')
    revalidatePath('/clients/knowledge')
    revalidatePath('/clients/dashboards/knowledge')
    revalidatePath('/[locale]/clients', 'page')
    revalidatePath('/[locale]/clients/[clientId]', 'page')
    revalidatePath('/[locale]/clients/[clientId]/campaigns/[campaignId]', 'page')
  } catch (error) {
    console.error('Remove reference error:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to remove knowledge base item')
    }
    throw new Error('Failed to remove knowledge base item')
  }
}
