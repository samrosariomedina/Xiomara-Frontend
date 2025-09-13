'use server'

import { cookies } from "next/headers";
import axios from "axios";
import FormData from 'form-data';
import { revalidatePath } from 'next/cache';

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
 * Server action to create individual corresponsables (listeners)
 */
export async function createCorresponsableAction(folderId: string, data: {
  clientName: string;
  email: string;
  whatsapp: string;
  accountType: "premium" | "standard" | "basic";
  invitationMethods?: {
    whatsapp: boolean;
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
    const listenerData = {
      type: "whatsapp",
      origin: data.whatsapp.replace(/[\s\-\+]/g, ""), // Sanitize WhatsApp number
      title: data.clientName,
      enabled: true,
      reference: true, // Create a reference for this listener
      metadata: {
        email: data.email || ""
      }
    };

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

    // First get the folder to get the listener IDs
    const folderResponse = await axios.post(`${BACKEND_URL}/folders`, {
      folders: [folderId]
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (folderResponse.status === 200 && folderResponse.data.length > 0) {
      const folder = folderResponse.data[0];
      const listenerIds = folder.items?.listeners || [];

      if (listenerIds.length === 0) {
        return {
          success: true,
          data: []
        };
      }

      // Fetch the listeners
      const listenersResponse = await axios.post(`${BACKEND_URL}/listeners`, {
        listeners: listenerIds
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (listenersResponse.status === 200) {
        return {
          success: true,
          data: listenersResponse.data
        };
      } else {
        throw new Error('Failed to fetch listeners');
      }
    } else {
      throw new Error('Folder not found');
    }
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
    console.log('Data being sent to backend:', JSON.stringify(updateData, null, 2));

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
          error: `Corresponsable not found. Status: ${axiosError.response.status}, Data: ${JSON.stringify(axiosError.response.data)}`
        };
      } else if (axiosError.response?.status === 400) {
        return {
          success: false,
          error: `Bad request. Status: ${axiosError.response.status}, Data: ${JSON.stringify(axiosError.response.data)}`
        };
      } else if (axiosError.response?.status === 500) {
        return {
          success: false,
          error: `Server error. Status: ${axiosError.response.status}, Data: ${JSON.stringify(axiosError.response.data)}`
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

    // Remove listener from folder first
    await axios.post(`${BACKEND_URL}/folders/pull`, {
      folder: folderId,
      listeners: [listenerId]
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Then delete the listener
    const response = await axios.post(`${BACKEND_URL}/listeners/remove`, {
      listener: listenerId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      // Revalidate the clients page to show fresh data
      revalidatePath('/clients');
      return {
        success: true
      };
    } else {
      throw new Error('Failed to remove corresponsable');
    }
  } catch (error: unknown) {
    console.error('Remove corresponsable error:', error);

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
