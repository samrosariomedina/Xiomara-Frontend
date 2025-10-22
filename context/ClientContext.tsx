"use client"

import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react'
import { ClientResponse } from '@/lib/schemas'
import { 
  getSelectedClientFromCache, 
  saveSelectedClientToCache, 
  clearSelectedClientFromCache, 
  getParentClientFromCache,
  saveParentClientToCache,
  clearParentClientFromCache,
  type ClientData 
} from '@/lib/dataPersistence'

// Client context type (supports both clients and campaigns)
export interface ClientContextType {
  selectedClient: ClientResponse | null
  setSelectedClient: (client: ClientResponse | null) => void
  clearSelectedClient: () => void
  isClientSelected: boolean
  isInitialized: boolean
  setDefaultClient: (client: ClientResponse) => void
  // Helper properties to determine folder type
  isClientType: boolean
  isCampaignType: boolean
  parentClient: ClientResponse | null
  setParentClient: (client: ClientResponse | null) => void
}

// Create the context
const ClientContext = createContext<ClientContextType | undefined>(undefined)

// Provider component
interface ClientProviderProps {
  children: ReactNode
}

export function ClientProvider({ children }: ClientProviderProps) {
  const [selectedClient, setSelectedClientState] = useState<ClientResponse | null>(null)
  const [parentClient, setParentClientState] = useState<ClientResponse | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load client and parent client from localStorage on mount (client-side only)
  useEffect(() => {
    // Only run on client side to prevent hydration mismatch
    if (typeof window === 'undefined') return
    
    const savedClient = getSelectedClientFromCache()
    if (savedClient) {
      // Convert ClientData to ClientResponse format
      const clientResponse: ClientResponse = {
        _id: savedClient._id,
        title: savedClient.title,
        parent: savedClient.parent || null,
        items: savedClient.items || {},
        metadata: savedClient.metadata || null,
        timestamp: savedClient.timestamp || new Date().toISOString()
      }
      setSelectedClientState(clientResponse)
      
      // Also set the cookie for middleware to check
      document.cookie = `selectedClientId=${savedClient._id}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
    }

    // Load parent client if exists
    const savedParentClient = getParentClientFromCache()
    if (savedParentClient) {
      const parentResponse: ClientResponse = {
        _id: savedParentClient._id,
        title: savedParentClient.title,
        parent: savedParentClient.parent || null,
        items: savedParentClient.items || {},
        metadata: savedParentClient.metadata || null,
        timestamp: savedParentClient.timestamp || new Date().toISOString()
      }
      setParentClientState(parentResponse)
    }

    setIsInitialized(true)
  }, [])

  // Memoized setter to prevent unnecessary re-renders
  const setSelectedClient = useCallback((client: ClientResponse | null) => {
    setSelectedClientState(client)
    
    // Save to localStorage
    if (client) {
      // Convert ClientResponse to ClientData format
      const clientData: ClientData = {
        _id: client._id,
        title: client.title,
        parent: client.parent,
        items: client.items,
        metadata: client.metadata,
        timestamp: client.timestamp
      }
      saveSelectedClientToCache(clientData)
      
      // Also set a cookie for middleware to check
      if (typeof window !== 'undefined') {
        document.cookie = `selectedClientId=${client._id}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
      }
    } else {
      clearSelectedClientFromCache()
      
      // Clear the cookie
      if (typeof window !== 'undefined') {
        document.cookie = 'selectedClientId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
    }
  }, [])

  // Clear selected client
  const clearSelectedClient = useCallback(() => {
    setSelectedClientState(null)
    setParentClientState(null)
    clearSelectedClientFromCache()
    clearParentClientFromCache()
    
    // Clear the cookie
    if (typeof window !== 'undefined') {
      document.cookie = 'selectedClientId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }, [])

  // Check if a client is selected
  const isClientSelected = selectedClient !== null

  // Determine folder type based on metadata
  const isClientType = selectedClient?.metadata?.type === 'client'
  const isCampaignType = selectedClient?.metadata?.type === 'campaign'

  // Memoized setter for parent client
  const setParentClient = useCallback((client: ClientResponse | null) => {
    setParentClientState(client)
    
    // Save to localStorage
    if (client) {
      const clientData: ClientData = {
        _id: client._id,
        title: client.title,
        parent: client.parent,
        items: client.items,
        metadata: client.metadata,
        timestamp: client.timestamp
      }
      saveParentClientToCache(clientData)
    } else {
      clearParentClientFromCache()
    }
  }, [])

  // Function to set a default client if none is selected
  const setDefaultClient = useCallback((defaultClient: ClientResponse) => {
    if (!selectedClient && isInitialized) {
      setSelectedClient(defaultClient)
    }
  }, [selectedClient, isInitialized, setSelectedClient])

  const value: ClientContextType = {
    selectedClient,
    setSelectedClient,
    clearSelectedClient,
    isClientSelected,
    isInitialized,
    setDefaultClient,
    isClientType,
    isCampaignType,
    parentClient,
    setParentClient,
  }

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  )
}

// Hook to use the client context
export function useClient() {
  const context = useContext(ClientContext)
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider')
  }
  return context
}

