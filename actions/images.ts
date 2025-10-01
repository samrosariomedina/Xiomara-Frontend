'use server'

import { cookies } from "next/headers";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888';

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
 * Server action to upload an image
 */
export async function uploadImageAction(data: {
  title?: string;
  metadata?: Record<string, unknown>;
  file?: File;
  url?: string;
  buffer?: string;
}): Promise<{ success: boolean; data?: { _id: string; title: string; buffer: string; origin?: string; metadata?: unknown; timestamp: string }; error?: string }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    // Convert file to base64 buffer for upload
    let buffer: string | undefined;
    
    if (data.file) {
      // Convert File to base64 buffer
      const arrayBuffer = await data.file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      buffer = `data:image/${data.file.type.split('/')[1]};base64,${base64}`;
    } else if (data.url) {
      // Use URL directly
      const requestData = {
        url: data.url,
        title: data.title,
        metadata: data.metadata
      };
      
      const response = await axios.post(`${BACKEND_URL}/images/add`, requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        return { success: true, data: response.data };
      } else {
        throw new Error('Failed to upload image');
      }
    } else if (data.buffer) {
      buffer = data.buffer;
    } else {
      return { success: false, error: 'No image data provided' };
    }

    // Prepare request data for base64 buffer upload
    const requestData = {
      buffer: buffer,
      title: data.title,
      metadata: data.metadata
    };

    const response = await axios.post(`${BACKEND_URL}/images/add`, requestData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      throw new Error('Failed to upload image');
    }
  } catch (error: unknown) {
    console.error('Upload image error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: unknown } };
      if (axiosError.response?.status === 401) {
        return { success: false, error: 'Authentication required' };
      } else if (axiosError.response?.status === 400) {
        return { success: false, error: 'Invalid image data provided' };
      } else if (axiosError.response?.status === 413) {
        return { success: false, error: 'Image file too large' };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image'
    };
  }
}

/**
 * Server action to get images
 */
export async function getImagesAction(filters?: {
  images?: string[];
  user?: string;
  metadata?: Record<string, unknown>;
  before?: string;
  after?: string;
}): Promise<{ success: boolean; data?: unknown[]; error?: string }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await axios.post(`${BACKEND_URL}/images`, filters || {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      throw new Error('Failed to fetch images');
    }
  } catch (error: unknown) {
    console.error('Get images error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        return { success: false, error: 'Authentication required' };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch images'
    };
  }
}

/**
 * Server action to edit an image
 */
export async function editImageAction(data: {
  image: string;
  title?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await axios.post(`${BACKEND_URL}/images/edit`, {
      image: data.image,
      title: data.title,
      metadata: data.metadata
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      throw new Error('Failed to edit image');
    }
  } catch (error: unknown) {
    console.error('Edit image error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        return { success: false, error: 'Authentication required' };
      } else if (axiosError.response?.status === 404) {
        return { success: false, error: 'Image not found' };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to edit image'
    };
  }
}

/**
 * Server action to remove an image
 */
export async function removeImageAction(imageId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await axios.post(`${BACKEND_URL}/images/remove`, {
      image: imageId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      return { success: true };
    } else {
      throw new Error('Failed to remove image');
    }
  } catch (error: unknown) {
    console.error('Remove image error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        return { success: false, error: 'Authentication required' };
      } else if (axiosError.response?.status === 404) {
        return { success: false, error: 'Image not found' };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove image'
    };
  }
}

/**
 * Server action to view an image
 */
export async function viewImageAction(imageId: string): Promise<{ success: boolean; data?: { buffer: string; title: string; metadata?: unknown }; error?: string }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await axios.post(`${BACKEND_URL}/images/view`, {
      image: imageId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      throw new Error('Failed to view image');
    }
  } catch (error: unknown) {
    console.error('View image error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        return { success: false, error: 'Authentication required' };
      } else if (axiosError.response?.status === 404) {
        return { success: false, error: 'Image not found' };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to view image'
    };
  }
}
