'use server'

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import axios from "axios";

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
 * Server action to create a new campaign (folder with type "campaign")
 */
export async function createCampaignAction(clientId: string, data: {
  name: string;
  type: string;
  startDate: string;
  description?: string;
}) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Prepare metadata for the campaign folder
    const metadata = {
      type: "campaign",
      campaignType: data.type,
      startDate: data.startDate,
      description: data.description || null
    };

    // Create the campaign folder with parent set to client
    const requestData = {
      title: data.name,
      parent: clientId,
      metadata: metadata
    };

    console.log('Creating campaign with data:', requestData);
    console.log('Client ID type:', typeof clientId, 'Value:', clientId);

    const response = await axios.post(`${BACKEND_URL}/folders/create`, requestData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      const campaignData = response.data;
      console.log('Campaign created successfully:', campaignData);

      // Revalidate the clients page to show the new campaign
      revalidatePath('/clients');
      revalidatePath('/[locale]/clients', 'page');

      return {
        success: true,
        data: campaignData
      };
    } else {
      throw new Error('Failed to create campaign');
    }
  } catch (error: unknown) {
    console.error('Create campaign error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: any } };
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
      } else if (axiosError.response?.status === 404) {
        return {
          success: false,
          error: 'Client not found'
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create campaign'
    };
  }
}

/**
 * Server action to fetch campaigns for a specific client
 */
export async function getCampaignsByClientAction(clientId: string) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Fetch all folders with parent set to the client ID
    const response = await axios.post(`${BACKEND_URL}/folders`, {
      parent: clientId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      // Filter for campaign folders on the frontend
      const allFolders = response.data;
      console.log('All folders for client:', clientId, allFolders);

      const campaignFolders = allFolders.filter((folder: { _id: string; metadata?: { type?: string } }) => {
        const isCampaign = folder.metadata && folder.metadata.type === "campaign";
        console.log(`Folder ${folder._id}: metadata=`, folder.metadata, 'isCampaign=', isCampaign);
        return isCampaign;
      });

      console.log('Filtered campaign folders:', campaignFolders);

      return {
        success: true,
        data: campaignFolders,
        campaigns: campaignFolders // Add campaigns property for compatibility
      };
    } else {
      throw new Error('Failed to fetch campaigns');
    }
  } catch (error: unknown) {
    console.error('Get campaigns error:', error);

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
      error: error instanceof Error ? error.message : 'Failed to fetch campaigns'
    };
  }
}

/**
 * Server action to fetch all campaigns (across all clients)
 */
export async function getAllCampaignsAction() {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Fetch all folders, then filter for campaigns on the frontend
    const response = await axios.post(`${BACKEND_URL}/folders`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      // Filter for campaign folders on the frontend
      const allFolders = response.data;
      console.log('All folders from backend:', allFolders);

      const campaignFolders = allFolders.filter((folder: { _id: string; metadata?: { type?: string } }) => {
        const isCampaign = folder.metadata && folder.metadata.type === "campaign";
        console.log(`Folder ${folder._id}: metadata=`, folder.metadata, 'isCampaign=', isCampaign);
        return isCampaign;
      });

      console.log('Filtered campaign folders:', campaignFolders);

      return {
        success: true,
        data: campaignFolders,
        campaigns: campaignFolders // Add campaigns property for compatibility
      };
    } else {
      throw new Error('Failed to fetch campaigns');
    }
  } catch (error: unknown) {
    console.error('Get all campaigns error:', error);

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
      error: error instanceof Error ? error.message : 'Failed to fetch campaigns'
    };
  }
}
