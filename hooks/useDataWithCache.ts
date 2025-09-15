'use client'

import { useState, useEffect, useCallback } from 'react'
import { getReferencesFromCache, saveReferencesToCache } from '@/lib/dataPersistence'
import { getSourcesFromCache, saveSourcesToCache } from '@/lib/dataPersistence'
import type { ReferenceResponse, SourceResponse } from '@/lib/schemas'

interface UseDataWithCacheOptions {
  initialData?: any[]
  cacheKey: 'references' | 'sources'
}

/**
 * Custom hook that manages data with localStorage caching
 * Falls back to cached data if server-side data is empty
 */
export function useDataWithCache<T extends ReferenceResponse | SourceResponse>(
  serverData: T[],
  options: UseDataWithCacheOptions
) {
  const [data, setData] = useState<T[]>(serverData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get cached data based on cache key
  const getCachedData = useCallback((): T[] | null => {
    if (options.cacheKey === 'references') {
      return getReferencesFromCache() as T[] | null
    } else if (options.cacheKey === 'sources') {
      return getSourcesFromCache() as T[] | null
    }
    return null
  }, [options.cacheKey])

  // Save data to cache based on cache key
  const saveToCache = useCallback((dataToSave: T[]) => {
    if (options.cacheKey === 'references') {
      saveReferencesToCache(dataToSave as ReferenceResponse[])
    } else if (options.cacheKey === 'sources') {
      saveSourcesToCache(dataToSave as SourceResponse[])
    }
  }, [options.cacheKey])

  // Initialize data on mount
  useEffect(() => {
    const initializeData = () => {
      // If server data is available, use it and cache it
      if (serverData && serverData.length > 0) {
        setData(serverData)
        saveToCache(serverData)
        setError(null)
        return
      }

      // If no server data, try to get from cache
      const cachedData = getCachedData()
      if (cachedData && cachedData.length > 0) {
        setData(cachedData)
        setError(null)
      } else {
        // No data available from server or cache
        setData([])
        setError(`No ${options.cacheKey} data available`)
      }
    }

    initializeData()
  }, [serverData, getCachedData, saveToCache, options.cacheKey])

  // Update data and cache when new data is provided
  const updateData = useCallback((newData: T[]) => {
    setData(newData)
    saveToCache(newData)
    setError(null)
  }, [saveToCache])

  // Refresh data (clear cache and reload)
  const refreshData = useCallback(() => {
    setIsLoading(true)
    setError(null)
    
    // Clear cache
    if (options.cacheKey === 'references') {
      localStorage.removeItem('xiomara_references_cache')
    } else if (options.cacheKey === 'sources') {
      localStorage.removeItem('xiomara_sources_cache')
    }
    
    // Reload the page to trigger server-side data fetching
    window.location.reload()
  }, [options.cacheKey])

  return {
    data,
    isLoading,
    error,
    updateData,
    refreshData
  }
}
