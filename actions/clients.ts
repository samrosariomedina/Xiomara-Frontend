'use server'

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import axios from "axios";
import { ClientInput } from "@/lib/schemas";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888';

export interface ClientData {
  _id: string;
  title: string;
  metadata: {
    clientName: string;
    industry: string;
    description?: string;
    contactName: string;
    whatsapp: string;
    position: string;
    email: string;
    corresponsalClientName?: string;
    corresponsalWhatsapp?: string;
    corresponsalClientName2?: string;
    accountType?: string;
    invitationMethods?: {
      whatsapp: boolean;
      email: boolean;
      copyLink: boolean;
    };
  };
  timestamp: string;
  user: string;
}

/**
 * Server action to get all clients (folders)
 */
export async function getClientsAction(): Promise<{ success: boolean; clients?: ClientData[]; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return { success: false, error: 'No authentication token found' };
    }

    const response = await axios.post(`${BACKEND_URL}/folders`, {
      token: token
    });

    if (response.status === 200) {
      return { 
        success: true, 
        clients: response.data 
      };
    } else {
      throw new Error('Failed to fetch clients');
    }
  } catch (error: unknown) {
    console.error('Get clients error:', error);
    
    if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response) {
      if (error.response.status === 401) {
        return { success: false, error: 'Unauthorized' };
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch clients'
    };
  }
}

/**
 * Server action to create a new client (folder)
 */
export async function createClientAction(clientData: ClientInput): Promise<{ success: boolean; client?: ClientData; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return { success: false, error: 'No authentication token found' };
    }

    // Combine all form data into metadata
    const metadata = {
      clientName: clientData.clientName,
      industry: clientData.industry,
      description: clientData.description,
      contactName: clientData.contactName,
      whatsapp: clientData.whatsapp,
      position: clientData.position,
      email: clientData.email,
      corresponsalClientName: clientData.corresponsalClientName,
      corresponsalWhatsapp: clientData.corresponsalWhatsapp,
      corresponsalClientName2: clientData.corresponsalClientName2,
      accountType: clientData.accountType,
      invitationMethods: clientData.invitationMethods
    };

    const response = await axios.post(`${BACKEND_URL}/folders/create`, {
      token: token,
      title: clientData.clientName, // Use client name as folder title
      metadata: metadata
    });

    if (response.status === 200) {
      // Revalidate clients page
      revalidatePath('/clients');
      
      return { 
        success: true, 
        client: response.data 
      };
    } else {
      throw new Error('Failed to create client');
    }
  } catch (error: unknown) {
    console.error('Create client error:', error);
    
    if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response) {
      if (error.response.status === 400) {
        return {
          success: false,
          error: 'Invalid client data provided'
        };
      } else if (error.response.status === 401) {
        return {
          success: false,
          error: 'Unauthorized'
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
 * Server action to delete a client (folder)
 */
export async function deleteClientAction(clientId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return { success: false, error: 'No authentication token found' };
    }

    const response = await axios.post(`${BACKEND_URL}/folders/remove`, {
      token: token,
      folder: clientId
    });

    if (response.status === 200) {
      // Revalidate clients page
      revalidatePath('/clients');
      
      return { success: true };
    } else {
      throw new Error('Failed to delete client');
    }
  } catch (error: unknown) {
    console.error('Delete client error:', error);
    
    if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response) {
      if (error.response.status === 400) {
        return {
          success: false,
          error: 'Invalid client ID provided'
        };
      } else if (error.response.status === 401) {
        return {
          success: false,
          error: 'Unauthorized'
        };
      } else if (error.response.status === 404) {
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
