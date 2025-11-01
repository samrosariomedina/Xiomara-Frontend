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
    listenerType: "whatsapp" | "telegram";
    whatsapp?: string;
    telegramToken?: string;
    accountType: "premium" | "standard" | "basic";
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
      // Create listener based on listenerType
      if (correspondent.listenerType === 'telegram') {
        if (!correspondent.telegramToken) {
          console.warn(`Skipping corresponsable ${correspondent.clientName}: Telegram token required`);
          continue;
        }
        const telegramResult = await createTelegramListenerAction(folderId, {
          clientName: correspondent.clientName,
          email: correspondent.email,
          accountType: correspondent.accountType,
          telegramToken: correspondent.telegramToken
        });
        if (telegramResult.success) {
          createdListeners.push(telegramResult.data);
        } else {
          console.warn(`Failed to create corresponsable ${correspondent.clientName}: ${telegramResult.error}`);
        }
      } else {
        // WhatsApp
        if (!correspondent.whatsapp) {
          console.warn(`Skipping corresponsable ${correspondent.clientName}: WhatsApp number required`);
          continue;
        }
        const result = await createCorresponsableAction(folderId, {
          clientName: correspondent.clientName,
          email: correspondent.email,
          whatsapp: correspondent.whatsapp,
          accountType: correspondent.accountType
        });
        if (result.success) {
          createdListeners.push(result.data);
        } else {
          console.warn(`Failed to create corresponsable ${correspondent.clientName}: ${result.error}`);
        }
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
    enabled?: boolean;
    email?: string;
  }
) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Prepare update data - only allow title, enabled, and metadata (email)
    // Note: origin is intentionally NOT editable for security reasons
    const updateData: {
      listener: string;
      title?: string | null;
      enabled?: boolean;
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
    // Origin is intentionally excluded - not editable after creation
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
    listenerType: "whatsapp" | "telegram";
    whatsapp?: string;
    telegramToken?: string;
    accountType: "premium" | "standard" | "basic";
  }
) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('=== CREATING CORRESPONSABLE ===');
    console.log('Listener Type:', data.listenerType);
    console.log('Client Name:', data.clientName);
    console.log('WhatsApp:', data.whatsapp ? 'PROVIDED' : 'NOT PROVIDED');
    console.log('Telegram Token:', data.telegramToken ? 'PROVIDED' : 'NOT PROVIDED');

    let createdListener;
    let listenerId: string;

    // Create listener based on listenerType
    if (data.listenerType === 'telegram') {
      if (!data.telegramToken || data.telegramToken.trim() === '') {
        return {
          success: false,
          error: 'Telegram bot token is required when Telegram is selected'
        };
      }

      console.log('Creating Telegram listener for:', data.clientName);
      const telegramResult = await createTelegramListenerAction(folderId, {
        clientName: data.clientName,
        email: data.email,
        accountType: data.accountType,
        telegramToken: data.telegramToken
      });
      
      if (!telegramResult.success) {
        return {
          success: false,
          error: telegramResult.error || 'Failed to create Telegram listener'
        };
      }

      createdListener = telegramResult.data;
      listenerId = createdListener._id;
    } else {
      // WhatsApp listener
      if (!data.whatsapp || data.whatsapp.trim() === '') {
        return {
          success: false,
          error: 'WhatsApp number is required when WhatsApp is selected'
        };
      }

      console.log('Creating WhatsApp listener for:', data.clientName);
      const whatsappResult = await createCorresponsableAction(folderId, {
        clientName: data.clientName,
        email: data.email,
        whatsapp: data.whatsapp,
        accountType: data.accountType
      });

      if (!whatsappResult.success) {
        return {
          success: false,
          error: whatsappResult.error || 'Failed to create WhatsApp listener'
        };
      }

      createdListener = whatsappResult.data;
      listenerId = createdListener._id;
    }

    // Get share URL for sharing operations
    const shareUrlResult = await getShareUrlAction(listenerId);
    
    if (shareUrlResult.success) {
      const shareUrl = shareUrlResult.data;
      
      return {
        success: true,
        data: {
          listeners: [createdListener],
          shareUrl
        }
      };
    } else {
      // Even if sharing fails, return the created listener
      return {
        success: true,
        data: {
          listeners: [createdListener],
          shareUrl: null,
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
    listenerType: "whatsapp" | "telegram";
    whatsapp?: string;
    telegramToken?: string;
    accountType: "premium" | "standard" | "basic";
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
