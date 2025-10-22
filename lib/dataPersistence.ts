'use client'

import type { ReferenceResponse, SourceResponse } from '@/lib/schemas'

// Define a proper type for client data
export interface ClientData {
  _id: string
  title: string | null
  parent?: string | null
  items?: Record<string, string[]>
  metadata?: {
    type: string
    industry: string
    description?: string
    contactName: string
    whatsapp: string
    position: string
    email: string
  } | null
  timestamp?: string
  [key: string]: unknown // Allow additional properties
}

// Cache keys
const CACHE_KEYS = {
  REFERENCES: 'xiomara_references_cache',
  SOURCES: 'xiomara_sources_cache',
  SELECTED_CLIENT: 'xiomara_selected_client',
  CACHE_TIMESTAMP: 'xiomara_cache_timestamp'
} as const

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

interface CacheData<T> {
  data: T[]
  timestamp: number
}

/**
 * Save data to localStorage with timestamp
 */
export function saveToCache<T>(key: string, data: T[]): void {
  // Only run on client side to prevent hydration mismatch
  if (typeof window === 'undefined') return
  
  try {
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(key, JSON.stringify(cacheData))
  } catch {
    // Silently fail for localStorage errors
  }
}

/**
 * Retrieve data from localStorage if it's still valid
 */
export function getFromCache<T>(key: string): T[] | null {
  // Only run on client side to prevent hydration mismatch
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null

    const cacheData: CacheData<T> = JSON.parse(cached)
    const now = Date.now()
    
    // Check if cache is still valid
    if (now - cacheData.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key)
      return null
    }

    return cacheData.data
  } catch {
    return null
  }
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  // Only run on client side to prevent hydration mismatch
  if (typeof window === 'undefined') return
  
  try {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  } catch {
    // Silently fail for localStorage errors
  }
}

/**
 * Save references to cache
 */
export function saveReferencesToCache(references: ReferenceResponse[]): void {
  saveToCache(CACHE_KEYS.REFERENCES, references)
}

/**
 * Get references from cache
 */
export function getReferencesFromCache(): ReferenceResponse[] | null {
  return getFromCache<ReferenceResponse>(CACHE_KEYS.REFERENCES)
}

/**
 * Save sources to cache
 */
export function saveSourcesToCache(sources: SourceResponse[]): void {
  saveToCache(CACHE_KEYS.SOURCES, sources)
}

/**
 * Get sources from cache
 */
export function getSourcesFromCache(): SourceResponse[] | null {
  return getFromCache<SourceResponse>(CACHE_KEYS.SOURCES)
}

/**
 * Check if cache is valid
 */
export function isCacheValid(key: string): boolean {
  // Only run on client side to prevent hydration mismatch
  if (typeof window === 'undefined') return false
  
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return false

    const cacheData: CacheData<unknown> = JSON.parse(cached)
    const now = Date.now()
    
    return (now - cacheData.timestamp) <= CACHE_DURATION
  } catch {
    return false
  }
}

/**
 * Save selected client to cache
 */
export function saveSelectedClientToCache(client: ClientData): void {
  // Only run on client side to prevent hydration mismatch
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(CACHE_KEYS.SELECTED_CLIENT, JSON.stringify(client))
  } catch {
    // Silently fail for localStorage errors
  }
}

/**
 * Get selected client from cache
 */
export function getSelectedClientFromCache(): ClientData | null {
  // Only run on client side to prevent hydration mismatch
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(CACHE_KEYS.SELECTED_CLIENT)
    return cached ? JSON.parse(cached) as ClientData : null
  } catch {
    return null
  }
}

/**
 * Clear selected client from cache
 */
export function clearSelectedClientFromCache(): void {
  // Only run on client side to prevent hydration mismatch
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(CACHE_KEYS.SELECTED_CLIENT)
  } catch {
    // Silently fail for localStorage errors
  }
}
