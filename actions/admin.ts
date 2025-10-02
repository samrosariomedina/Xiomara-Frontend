'use server'

import { cookies } from "next/headers"
import axios from 'axios'

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

// Setup default templates in the database
export async function setupTemplatesAction(): Promise<{ success: boolean, message: string }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('Setting up default templates...');

    const response = await axios.post(`${API_BASE_URL}/admin/setup/templates`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Templates setup completed successfully!');
    
    return {
      success: true,
      message: 'Default templates have been set up successfully! Templates include: X post, News release, Blog post, Instagram post, LinkedIn post, Facebook post, Threads post, and TikTok post.'
    };
  } catch (error) {
    console.error('Setup templates error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        return {
          success: false,
          message: 'Access denied: Admin privileges required to set up templates'
        };
      } else if (error.response?.status === 401) {
        return {
          success: false,
          message: 'Authentication failed: Please log in as an admin user'
        };
      }
    }
    
    return {
      success: false,
      message: `Failed to set up templates: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Setup all admin components (collections, templates, telegram)
export async function setupAllAction(): Promise<{ success: boolean, message: string }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('Running complete admin setup...');

    const response = await axios.post(`${API_BASE_URL}/admin/setup`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Complete admin setup completed successfully!');
    
    return {
      success: true,
      message: 'Complete admin setup completed! Collections, templates, and telegram have been configured.'
    };
  } catch (error) {
    console.error('Setup all error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        return {
          success: false,
          message: 'Access denied: Admin privileges required for setup'
        };
      } else if (error.response?.status === 401) {
        return {
          success: false,
          message: 'Authentication failed: Please log in as an admin user'
        };
      }
    }
    
    return {
      success: false,
      message: `Failed to run admin setup: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
