'use server'

import { cookies } from "next/headers";
import axios from "axios";
import FormData from 'form-data';
import { revalidatePath } from "next/cache";
import { getCurrentUserIdAction } from "./auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888';

/**
 * Get authentication token from cookies
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value || null;
    // Only log when no token found during non-logout scenarios
    if (!token) {
      console.log('Auth token check: No token found');
    }
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
    whatsapp?: string;
    position: string;
    email?: string;
    logoFile?: File;
    uploadedImageId?: string;
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
      whatsapp: data.whatsapp ? data.whatsapp.replace(/[\s\-\+]/g, "") : null, // Sanitize WhatsApp number if provided
      position: data.position,
      email: data.email || null,
      logoImageId: data.uploadedImageId || null, // Reference to uploaded logo
      createdAt: new Date().toISOString()
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

      // Revalidate the clients page to show the new client immediately
      revalidatePath('/clients');
      revalidatePath('/');
      
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
 * Server action to fetch all clients (folders)
 */
export async function getClientsAction() {
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

    // Fetch folders with user filtering
    const response = await axios.post(`${BACKEND_URL}/folders`, {
      user: userIdResult.userId
    }, {
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
      // Revalidate the clients page to show the updated list
      revalidatePath('/clients');
      revalidatePath('/');
      
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
