'use server'

import { cookies } from "next/headers";
import axios from "axios";
import FormData from 'form-data';
import { revalidatePath } from 'next/cache';
import { getFolderFileIds } from './_folders';
import { getCurrentUserIdAction } from './auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888';

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


/**
 * Server action to create Telegram listeners
 */
export async function createTelegramListenerAction(folderId: string, data: {
  clientName: string;
  email: string;
  accountType: "premium" | "standard" | "basic";
  telegramToken: string;
}) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Use the user-provided token as origin - backend handles the rest
    const listenerData = {
      type: "telegram",
      origin: data.telegramToken,
      title: data.clientName,
      enabled: true,
      reference: false, // Create a reference for this listener
      metadata: {
        email: data.email || ""
      }
    };
    
    console.log('Telegram listener data being sent:', listenerData);
    console.log('Backend URL:', BACKEND_URL);

    const response = await axios.post(`${BACKEND_URL}/listeners/add`, listenerData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Backend response status:', response.status);
    console.log('Backend response data:', response.data);

    if (response.status === 200) {
      const createdListener = response.data;
      
      // Link the listener to the client folder
      await axios.post(`${BACKEND_URL}/folders/push`, {
        folder: folderId,
        listeners: [createdListener._id]
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Revalidate the clients page to show fresh data
      revalidatePath('/clients');
      return {
        success: true,
        data: createdListener
      };
    } else {
      throw new Error('Failed to create Telegram listener');
    }
  } catch (error: unknown) {
    console.error('Create Telegram listener error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: unknown } };
      console.error('Axios error details:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data
      });
      
      if (axiosError.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication required'
        };
      } else if (axiosError.response?.status === 400) {
        return {
          success: false,
          error: `Invalid data provided: ${axiosError.response?.data ? String(axiosError.response.data) : 'Unknown error'}`
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create Telegram listener'
    };
  }
}

/**
 * Server action to create individual corresponsables (listeners)
 */
export async function createCorresponsableAction(folderId: string, data: {
  clientName: string;
  email: string;
  whatsapp: string;
  accountType: "premium" | "standard" | "basic";
  invitationMethods?: {
    whatsapp: boolean;
    telegram: boolean;
    email: boolean;
    copyLink: boolean;
  };
}) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Create WhatsApp listener for the corresponsable
    const sanitizedWhatsapp = data.whatsapp.replace(/[\s\-\+]/g, ""); // Sanitize WhatsApp number
    console.log('Original WhatsApp number:', data.whatsapp);
    console.log('Sanitized WhatsApp number:', sanitizedWhatsapp);
    console.log('WhatsApp number length:', sanitizedWhatsapp.length);
    
    const listenerData = {
      type: "whatsapp",
      origin: sanitizedWhatsapp,
      title: data.clientName,
      enabled: true,
      reference: true, // Create a reference for this listener
      metadata: {
        email: data.email || ""
      }
    };
    
    console.log('Listener data being sent:', listenerData);

    const response = await axios.post(`${BACKEND_URL}/listeners/add`, listenerData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      const createdListener = response.data;
      
      // Link the listener to the client folder
      await axios.post(`${BACKEND_URL}/folders/push`, {
        folder: folderId,
        listeners: [createdListener._id]
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Revalidate the clients page to show fresh data
      revalidatePath('/clients');
      return {
        success: true,
        data: createdListener
      };
    } else {
      throw new Error('Failed to create corresponsable');
    }
  } catch (error: unknown) {
    console.error('Create corresponsable error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication required'
        };
      } else if (axiosError.response?.status === 400) {
        return {
          success: false,
          error: 'Invalid data provided'
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create corresponsable'
    };
  }
}

/**
 * Server action to create multiple corresponsables from form data
 */
export async function createCorresponsablesAction(
  folderId: string,
  correspondents: Array<{
    clientName: string;
    email: string;
    whatsapp: string;
    accountType: "premium" | "standard" | "basic";
    invitationMethods?: {
      whatsapp: boolean;
      telegram: boolean;
      email: boolean;
      copyLink: boolean;
    };
  }>
) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    if (!correspondents || correspondents.length === 0) {
      return {
        success: true,
        data: []
      };
    }

    // Create all listeners for the correspondents using the individual function
    const createdListeners = [];

    for (const correspondent of correspondents) {
      const result = await createCorresponsableAction(folderId, correspondent);
      if (result.success) {
        createdListeners.push(result.data);
      } else {
        console.warn(`Failed to create corresponsable ${correspondent.clientName}: ${result.error}`);
      }
    }

    // Revalidate the clients page to show fresh data
    revalidatePath('/clients');
    return {
      success: true,
      data: createdListeners
    };
  } catch (error: unknown) {
    console.error('Create corresponsables error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication required'
        };
      } else if (axiosError.response?.status === 400) {
        return {
          success: false,
          error: 'Invalid data provided'
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create corresponsables'
    };
  }
}

/**
 * Server action to upload CSV for corresponsables creation
 */
export async function createCorresponsablesFromCSVAction(
  folderId: string,
  csvFile: File,
  enabled: boolean = true
) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Convert File to Buffer for server-side upload
    const buffer = Buffer.from(await csvFile.arrayBuffer());

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('enabled', enabled.toString());
    formData.append('csv', buffer, {
      filename: csvFile.name,
      contentType: csvFile.type
    });

    const response = await axios.post(`${BACKEND_URL}/listeners/csv`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    if (response.status === 200) {
      // Link created listeners to the client folder
      const createdListeners = response.data;

      if (createdListeners.length > 0) {
        const listenerIds = createdListeners.map((listener: { _id: string }) => listener._id);

        await axios.post(`${BACKEND_URL}/folders/push`, {
          folder: folderId,
          listeners: listenerIds
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      // Revalidate the clients page to show fresh data
      revalidatePath('/clients');
      return {
        success: true,
        data: createdListeners
      };
    } else {
      throw new Error('Failed to create corresponsables from CSV');
    }
  } catch (error: unknown) {
    console.error('Create corresponsables from CSV error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication required'
        };
      } else if (axiosError.response?.status === 400) {
        return {
          success: false,
          error: 'Invalid CSV file or data'
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create corresponsables from CSV'
    };
  }
}

/**
 * Server action to fetch corresponsables for a specific folder
 */
export async function getCorresponsablesAction(folderId: string) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Get listener IDs from folder via helper (uses user filtering internally)
    const files = await getFolderFileIds(folderId);
    const listenerIds = files?.listeners || [];

    if (!listenerIds.length) {
      return { success: true, data: [] };
    }

    // Get current user ID for filtering
    const userIdResult = await getCurrentUserIdAction();
    if (!userIdResult.success || !userIdResult.userId) {
      throw new Error('Failed to get user ID for filtering');
    }

    // Fetch listeners by ids with user in body
    const response = await axios.post(`${BACKEND_URL}/listeners`, {
      listeners: listenerIds,
      user: userIdResult.userId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return { success: true, data: response.data || [] };
  } catch (error: unknown) {
    console.error('Get corresponsables error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication required'
        };
      } else if (axiosError.response?.status === 404) {
        return {
          success: false,
          error: 'Folder not found'
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch corresponsables'
    };
  }
}

/**
 * Server action to update a corresponsable (listener)
 */
export async function updateCorresponsableAction(
  listenerId: string, 
  data: {
    title?: string;
    origin?: string;
    enabled?: boolean;
    email?: string;
  }
) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Prepare update data with all supported fields
    const updateData: {
      listener: string;
      title?: string | null;
      enabled?: boolean;
      origin?: string | null;
      metadata?: { email: string };
    } = {
      listener: listenerId
    };

    // Add standard fields
    if (data.title !== undefined) {
      updateData.title = data.title || null;
    }
    if (data.enabled !== undefined) {
      updateData.enabled = data.enabled;
    }
    if (data.origin !== undefined) {
      updateData.origin = data.origin || null;
    }
    if (data.email !== undefined) {
      updateData.metadata = {
        email: data.email
      };
    }

    console.log('Updating corresponsable with data:', updateData);
    console.log('Listener ID being used:', listenerId);
    console.log('Original data received:', data);
    console.log('Data being sent to backend:', updateData);

    const response = await axios.post(`${BACKEND_URL}/listeners/edit`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      // Revalidate the clients page to show fresh data
      revalidatePath('/clients');
      return {
        success: true,
        data: response.data
      };
    } else {
      throw new Error('Failed to update corresponsable');
    }
  } catch (error: unknown) {
    console.error('Update corresponsable error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { 
        response?: { 
          status?: number;
          data?: unknown;
        } 
      };
      
      console.error('Axios error details:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        fullError: error
      });
      
      if (axiosError.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication required'
        };
      } else if (axiosError.response?.status === 404) {
        return {
          success: false,
          error: `Corresponsable not found. Status: ${axiosError.response.status}, Data: ${axiosError.response.data ? String(axiosError.response.data) : 'Unknown'}`
        };
      } else if (axiosError.response?.status === 400) {
        return {
          success: false,
          error: `Bad request. Status: ${axiosError.response.status}, Data: ${axiosError.response.data ? String(axiosError.response.data) : 'Unknown'}`
        };
      } else if (axiosError.response?.status === 500) {
        return {
          success: false,
          error: `Server error. Status: ${axiosError.response.status}, Data: ${axiosError.response.data ? String(axiosError.response.data) : 'Unknown'}`
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update corresponsable'
    };
  }
}

/**
 * Server action to remove a corresponsable (listener)
 */
export async function removeCorresponsableAction(listenerId: string, folderId: string) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('🗑️ Attempting to delete corresponsable:', { listenerId, folderId });

    // Try to delete the listener directly first
    const deleteResponse = await axios.post(`${BACKEND_URL}/listeners/remove`, {
      listener: listenerId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🗑️ Delete listener response:', deleteResponse.status);

    // If successful, try to remove from folder (this might fail if already removed, that's ok)
    try {
      await axios.post(`${BACKEND_URL}/folders/pull`, {
        folder: folderId,
        listeners: [listenerId]
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('🗑️ Removed listener from folder');
    } catch (pullError) {
      // Ignore folder pull errors as the listener is already deleted
      console.log('🗑️ Folder pull warning (listener may already be removed):', pullError);
    }

    if (deleteResponse.status === 200) {
      // Revalidate the clients page to show fresh data
      revalidatePath('/clients');
      revalidatePath('/[locale]/clients', 'page');
      console.log('🗑️ Corresponsable deleted successfully');
      return {
        success: true
      };
    } else {
      throw new Error('Failed to remove corresponsable');
    }
  } catch (error: unknown) {
    console.error('❌ Remove corresponsable error:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
    }

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication required'
        };
      } else if (axiosError.response?.status === 404) {
        return {
          success: false,
          error: 'Corresponsable not found'
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove corresponsable'
    };
  }
}

/**
 * Server action to get share URL for a listener
 */
export async function getShareUrlAction(listenerId: string) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.post(`${BACKEND_URL}/listeners/share`, {
      listener: listenerId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data
      };
    } else {
      throw new Error('Failed to get share URL');
    }
  } catch (error: unknown) {
    console.error('Get share URL error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication required'
        };
      } else if (axiosError.response?.status === 404) {
        return {
          success: false,
          error: 'Listener not found'
        };
      } else if (axiosError.response?.status === 501) {
        return {
          success: false,
          error: 'WhatsApp not configured'
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get share URL'
    };
  }
}

/**
 * Server action to create corresponsable with sharing
 */
export async function createCorresponsableWithSharingAction(
  folderId: string, 
  data: {
    clientName: string;
    email: string;
    whatsapp: string;
    accountType: "premium" | "standard" | "basic";
    telegramToken?: string;
    invitationMethods?: {
      whatsapp: boolean;
      telegram: boolean;
      email: boolean;
      copyLink: boolean;
    };
  }
) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const createdListeners = [];
    const listenerIds = [];

    console.log('=== INVITATION METHODS DEBUG ===');
    console.log('Full data received:', data);
    console.log('Invitation methods selected:', data.invitationMethods);
    console.log('Telegram selected:', data.invitationMethods?.telegram);
    console.log('WhatsApp selected:', data.invitationMethods?.whatsapp);
    console.log('Telegram token provided:', data.telegramToken ? 'YES' : 'NO');
    console.log('Telegram token value:', data.telegramToken ? 'TOKEN_EXISTS' : 'NO_TOKEN');

    // Create Telegram listener if requested and token provided
    if (data.invitationMethods?.telegram && data.telegramToken) {
      console.log('Creating Telegram listener for:', data.clientName);
      const telegramResult = await createTelegramListenerAction(folderId, {
        clientName: data.clientName,
        email: data.email,
        accountType: data.accountType,
        telegramToken: data.telegramToken
      });
      
      console.log('Telegram creation result:', telegramResult);
      
      if (telegramResult.success) {
        createdListeners.push(telegramResult.data);
        listenerIds.push(telegramResult.data._id);
        console.log('Telegram listener added to created listeners');
      } else {
        console.error('Telegram listener creation failed:', telegramResult.error);
      }
    }

    // Create WhatsApp listener if requested (and not Telegram-only)
    if (data.invitationMethods?.whatsapp) {
      console.log('Creating WhatsApp listener for:', data.clientName);
      const whatsappResult = await createCorresponsableAction(folderId, data);
      if (whatsappResult.success) {
        createdListeners.push(whatsappResult.data);
        listenerIds.push(whatsappResult.data._id);
        console.log('WhatsApp listener added to created listeners');
      }
    }

    // If no listeners were created, return error instead of creating default
    if (createdListeners.length === 0) {
      console.log('No listeners created - no valid invitation methods selected');
      return {
        success: false,
        error: 'No valid invitation methods selected. Please select WhatsApp or Telegram with a valid token.'
      };
    }

    // Get share URL for the first listener (for sharing operations)
    const primaryListenerId = listenerIds[0];
    // Note: Sharing results are handled by the frontend useSharing hook

    // Get share URL for sharing operations
    const shareUrlResult = await getShareUrlAction(primaryListenerId);
    
    if (shareUrlResult.success) {
      const shareUrl = shareUrlResult.data;
      const message = `Hola ${data.clientName}, te invito a conectarte con nuestro sistema de corresponsales. ${shareUrl}`;
      
      // Return sharing data for frontend execution
      return {
        success: true,
        data: {
          listeners: createdListeners,
          shareUrl,
          message,
          invitationMethods: data.invitationMethods || {
            whatsapp: false,
            telegram: false,
            email: false,
            copyLink: false
          }
        }
      };
    } else {
      // Even if sharing fails, return the created listeners
      return {
        success: true,
        data: {
          listeners: createdListeners,
          shareUrl: null,
          message: null,
          invitationMethods: data.invitationMethods || {
            whatsapp: false,
            telegram: false,
            email: false,
            copyLink: false
          },
          sharingError: shareUrlResult.error
        }
      };
    }
  } catch (error: unknown) {
    console.error('Create corresponsable with sharing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create corresponsable with sharing'
    };
  }
}

/**
 * Server action to create multiple corresponsables with sharing
 */
export async function createCorresponsablesWithSharingAction(
  folderId: string,
  correspondents: Array<{
    clientName: string;
    email: string;
    whatsapp: string;
    accountType: "premium" | "standard" | "basic";
    invitationMethods?: {
      whatsapp: boolean;
      telegram: boolean;
      email: boolean;
      copyLink: boolean;
    };
  }>
) {
  try {
    if (!correspondents || correspondents.length === 0) {
      return {
        success: true,
        data: []
      };
    }

    const results = [];

    for (const correspondent of correspondents) {
      const result = await createCorresponsableWithSharingAction(folderId, correspondent);
      results.push(result);
    }

    // Revalidate the clients page to show fresh data
    revalidatePath('/clients');
    return {
      success: true,
      data: results
    };
  } catch (error: unknown) {
    console.error('Create corresponsables with sharing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create corresponsables with sharing'
    };
  }
}
