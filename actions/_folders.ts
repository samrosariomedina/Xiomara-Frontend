'use server'

import axios from 'axios'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { getCurrentUserIdAction } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888'

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

export interface FolderFiles {
  references?: string[]
  sources?: string[]
  summaries?: string[]
  outputs?: string[]
  listeners?: string[]
  templates?: string[]
  directives?: string[]
}

export async function getFolderFileIds(folderId: string): Promise<FolderFiles | null> {
  try {
    const token = await getAuthToken();
    if (!token) return null;

    const user = await getCurrentUserIdAction();

    const body: any = { folders: [folderId] };
    if (user?.success && user?.userId) body.user = user.userId;

    const response = await axios.post(`${API_BASE_URL}/folders`, body, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const folder = Array.isArray(response.data) ? response.data[0] : null;
    console.log('Folder data from API:', folder);
    console.log('Folder files:', folder?.files);
    console.log('Folder items:', folder?.items);
    return folder?.files || folder?.items || null;
  } catch (error) {
    console.error('getFolderFileIds error:', error);
    return null;
  }
}

export async function pushToFolder(
  folderId: string,
  payload: Partial<FolderFiles>,
  revalidatePaths: string[] = []
): Promise<{ linked: boolean; linkError?: string }> {
  try {
    const token = await getAuthToken();
    if (!token) return { linked: false, linkError: 'Missing auth token' };

    const body: any = { folder: folderId, ...payload };

    await axios.post(`${API_BASE_URL}/folders/push`, body, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    for (const p of revalidatePaths) revalidatePath(p);
    return { linked: true };
  } catch (error) {
    console.error('pushToFolder error:', error);
    return { linked: false, linkError: 'Failed to link document to folder' };
  }
}

export async function pullFromFolder(
  folderId: string,
  payload: Partial<FolderFiles>,
  revalidatePaths: string[] = []
): Promise<{ unlinked: boolean; unlinkError?: string }> {
  try {
    const token = await getAuthToken();
    if (!token) return { unlinked: false, unlinkError: 'Missing auth token' };

    const body: any = { folder: folderId, ...payload };

    await axios.post(`${API_BASE_URL}/folders/pull`, body, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    for (const p of revalidatePaths) revalidatePath(p);
    return { unlinked: true };
  } catch (error) {
    console.error('pullFromFolder error:', error);
    return { unlinked: false, unlinkError: 'Failed to unlink document from folder' };
  }
}

export async function fetchByIds<T>(
  endpointPath: string,
  payloadKey: keyof FolderFiles,
  ids: string[]
): Promise<T[]> {
  if (!ids || ids.length === 0) return [];

  try {
    const token = await getAuthToken();
    if (!token) return [];

    const user = await getCurrentUserIdAction();
    const body: any = { [payloadKey]: ids };
    if (user?.success && user?.userId) body.user = user.userId;

    const response = await axios.post(`${API_BASE_URL}${endpointPath}`, body, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data || [];
  } catch (error) {
    console.error('fetchByIds error:', endpointPath, error);
    return [];
  }
}


