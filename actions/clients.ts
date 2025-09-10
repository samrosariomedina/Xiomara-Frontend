'use server'

import { cookies } from "next/headers";
import axios from "axios";
import FormData from 'form-data';

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
 * Server action to create a new client (folder)
 */
export async function createClientAction(data: {
    clientName: string;
    industry: string;
    description?: string;
    contactName: string;
    whatsapp: string;
    position: string;
    email: string;
  logoFile?: File;
}) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Prepare metadata for the folder
    const metadata = {
      type: "client",
      industry: data.industry,
      description: data.description || null,
      contactName: data.contactName,
      whatsapp: data.whatsapp.replace(/[\s\-\+]/g, ""), // Sanitize WhatsApp number
      position: data.position,
      email: data.email
    };

    // First, create the client folder
    const requestData = {
      title: data.clientName,
      metadata: metadata
    };

    const response = await axios.post(`${BACKEND_URL}/folders/create`, requestData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      const clientData = response.data;
      
      // If logo file is provided, upload it and link to the client
      if (data.logoFile) {
        try {
          // Upload logo to images endpoint
          const logoFormData = new FormData();
          logoFormData.append('title', `${data.clientName} Logo`);
          logoFormData.append('metadata', JSON.stringify({
            type: 'client-logo',
            clientId: clientData._id
          }));
          
          // Convert File to Buffer for server-side upload
          const buffer = Buffer.from(await data.logoFile.arrayBuffer());
          logoFormData.append('logo', buffer, {
            filename: data.logoFile.name,
            contentType: data.logoFile.type
          });

          const logoResponse = await axios.post(`${BACKEND_URL}/images/add`, logoFormData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              ...logoFormData.getHeaders()
            }
          });

          if (logoResponse.status === 200) {
            // Link the uploaded image to the client folder
            await axios.post(`${BACKEND_URL}/folders/push`, {
              folder: clientData._id,
              images: [logoResponse.data._id]
            }, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
          }
        } catch (logoError) {
          console.warn('Failed to upload logo, but client was created successfully:', logoError);
          // Don't fail the entire operation if logo upload fails
        }
      }

      return {
        success: true,
        data: clientData
      };
    } else {
      throw new Error('Failed to create client');
    }
  } catch (error: unknown) {
    console.error('Create client error:', error);

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
      error: error instanceof Error ? error.message : 'Failed to create client'
    };
  }
}

/**
 * Server action to create corresponsales (WhatsApp listeners)
 */
export async function createCorresponsalesAction(
  folderId: string,
  data: {
    corresponsalClientName?: string;
    corresponsalWhatsapp?: string;
    corresponsalClientName2?: string;
    accountType?: "premium" | "standard" | "basic";
    invitationMethods?: {
      whatsapp: boolean;
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

    // Create listener for primary corresponsal
    const listeners = [];

    if (data.corresponsalClientName && data.corresponsalWhatsapp) {
      const primaryListener = {
        type: "whatsapp",
        origin: data.corresponsalWhatsapp.replace(/[\s\-\+]/g, ""),
        title: data.corresponsalClientName,
        enabled: true
        // Note: No 'reference' field - we'll link via folders/push
      };
      listeners.push(primaryListener);
    }

    // Create listener for secondary corresponsal if provided
    if (data.corresponsalClientName2 && data.corresponsalWhatsapp) {
      const secondaryListener = {
        type: "whatsapp",
        origin: data.corresponsalWhatsapp.replace(/[\s\-\+]/g, ""),
        title: data.corresponsalClientName2,
        enabled: true
        // Note: No 'reference' field - we'll link via folders/push
      };
      listeners.push(secondaryListener);
    }

    if (listeners.length === 0) {
      throw new Error('At least one corresponsal must be provided');
    }

    // Create all listeners
    const createdListeners = [];

    for (const listener of listeners) {
      const response = await axios.post(`${BACKEND_URL}/listeners/add`, listener, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        createdListeners.push(response.data);
      } else {
        throw new Error('Failed to create corresponsal');
      }
    }

    // ✅ Properly link listeners to folder using /folders/push
    // This stores listener IDs in the folder's files.listeners array
    if (createdListeners.length > 0) {
      const listenerIds = createdListeners.map(listener => listener._id);

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

    return {
      success: true,
      data: createdListeners
    };
  } catch (error: unknown) {
    console.error('Create corresponsales error:', error);

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
      error: error instanceof Error ? error.message : 'Failed to create corresponsales'
    };
  }
}

/**
 * Server action to upload CSV for corresponsales creation
 */
export async function createCorresponsalesFromCSVAction(
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

      // Update each listener to reference the folder
      for (const listener of createdListeners) {
        await axios.post(`${BACKEND_URL}/folders/push`, {
          folder: folderId,
          listeners: [listener._id]
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      return {
        success: true,
        data: createdListeners
      };
    } else {
      throw new Error('Failed to create corresponsales from CSV');
    }
  } catch (error: unknown) {
    console.error('Create corresponsales from CSV error:', error);

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
      error: error instanceof Error ? error.message : 'Failed to create corresponsales from CSV'
    };
  }
}

/**
 * Server action to fetch all clients (folders)
 */
export async function getClientsAction() {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Fetch all folders for the user, then filter for clients on the frontend
    // The backend metadata filter does exact matching, which won't work with additional fields
    const response = await axios.post(`${BACKEND_URL}/folders`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      // Filter for client folders on the frontend
      const allFolders = response.data;
      console.log('All folders from backend:', allFolders);
      
      const clientFolders = allFolders.filter((folder: { _id: string; metadata?: { type?: string } }) => {
        const isClient = folder.metadata && folder.metadata.type === "client";
        console.log(`Folder ${folder._id}: metadata=`, folder.metadata, 'isClient=', isClient);
        return isClient;
      });
      
      console.log('Filtered client folders:', clientFolders);
      
      return { 
        success: true, 
        data: clientFolders,
        clients: clientFolders // Add clients property for compatibility
      };
    } else {
      throw new Error('Failed to fetch clients');
    }
  } catch (error: unknown) {
    console.error('Get clients error:', error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch clients'
    };
  }
}

/**
 * Server action to edit/update a client (folder)
 */
export async function editClientAction(clientId: string, data: {
  clientName?: string;
  industry?: string;
  description?: string;
  contactName?: string;
  whatsapp?: string;
  position?: string;
  email?: string;
  logoFile?: File | null;
}) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Prepare metadata for the folder update
    const metadata: Record<string, string> = {};
    
    if (data.industry !== undefined) metadata.industry = data.industry;
    if (data.description !== undefined) metadata.description = data.description;
    if (data.contactName !== undefined) metadata.contactName = data.contactName;
    if (data.whatsapp !== undefined) metadata.whatsapp = data.whatsapp.replace(/[\s\-\+]/g, "");
    if (data.position !== undefined) metadata.position = data.position;
    if (data.email !== undefined) metadata.email = data.email;

    // Prepare update data
    const updateData: Record<string, string | Record<string, string>> = {};
    if (data.clientName !== undefined) updateData.title = data.clientName;
    if (Object.keys(metadata).length > 0) updateData.metadata = metadata;

    const response = await axios.post(`${BACKEND_URL}/folders/edit`, {
      folder: clientId,
      ...updateData
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
      throw new Error('Failed to update client');
    }
  } catch (error: unknown) {
    console.error('Edit client error:', error);
    
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
          error: 'Client not found'
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
      error: error instanceof Error ? error.message : 'Failed to update client'
    };
  }
}

/**
 * Server action to delete a client (folder)
 */
export async function deleteClientAction(clientId: string) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.post(`${BACKEND_URL}/folders/remove`, {
      folder: clientId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      return {
        success: true
      };
    } else {
      throw new Error('Failed to delete client');
    }
  } catch (error: unknown) {
    console.error('Delete client error:', error);
    
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
          error: 'Client not found'
        };
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete client'
    };
  }
}
