"use client";

import { type ClientInput } from '@/lib/schemas';

/**
 * Get all clients (folders with metadata.type=client)
 */
export async function getClients() {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Send request to backend through Next.js API route
    const response = await fetch(`/api/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch clients');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

/**
 * Create a new client (folder with client metadata)
 */
export async function createClient(clientData: ClientInput) {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Handle file upload if there's a logo file
    let logoUrl = null;
    if (clientData.logoFile instanceof File) {
      const formData = new FormData();
      formData.append('file', clientData.logoFile);
      formData.append('token', token);
      
      // Upload the file to the backend
      const uploadResponse = await fetch(`/api/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload logo');
      }
      
      const uploadData = await uploadResponse.json();
      logoUrl = uploadData.url; // Get the URL of the uploaded file
    }

    // Prepare client data for backend (transform to folder structure)
    const folderData = {
      token,
      title: clientData.clientName,
      parent: null, // Top-level folder
      metadata: {
        type: 'client',
        industry: clientData.industry,
        description: clientData.description,
        logoUrl, // Add the logo URL to metadata
        contact: {
          name: clientData.contactName,
          whatsapp: clientData.whatsapp,
          position: clientData.position,
          email: clientData.email,
        },
        createdAt: new Date().toISOString()
      }
    };

    // Send request to backend through Next.js API route
    const response = await fetch(`/api/clients/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(folderData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create client');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

/**
 * Update an existing client (folder)
 */
export async function updateClient(clientId: string, clientData: Partial<ClientInput>) {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Prepare update data
    const updateData = {
      token,
      folder: clientId,
      title: clientData.clientName,
      metadata: {
        type: 'client',
        industry: clientData.industry,
        description: clientData.description,
        contact: {
          name: clientData.contactName,
          whatsapp: clientData.whatsapp,
          position: clientData.position,
          email: clientData.email,
        }
      }
    };

    // Send request to backend through Next.js API route
    const response = await fetch(`/api/clients/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update client');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

/**
 * Delete a client (folder)
 */
export async function deleteClient(clientId: string) {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Send delete request
    const response = await fetch(`/api/clients/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        folder: clientId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete client');
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

/**
 * Create a new campaign (subfolder with campaign metadata)
 */
/**
 * Create a new campaign (subfolder with campaign metadata)
 */
export async function createCampaign(clientId: string, campaignName: string, metadata: Record<string, unknown> = {}) {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Prepare campaign data
    const folderData = {
      token,
      title: campaignName,
      parent: clientId,
      metadata: {
        type: 'campaign',
        ...metadata
      }
    };

    // Send request to backend through Next.js API route
    const response = await fetch(`/api/campaigns/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(folderData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create campaign');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
