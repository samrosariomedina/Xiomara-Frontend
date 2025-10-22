"use client"

import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react'
import { ClientResponse } from '@/lib/schemas'
import { getSelectedClientFromCache, saveSelectedClientToCache, clearSelectedClientFromCache, type ClientData } from '@/lib/dataPersistence'

// Client context type
export interface ClientContextType {
  selectedClient: ClientResponse | null
  setSelectedClient: (client: ClientResponse | null) => void
  clearSelectedClient: () => void
  isClientSelected: boolean
  setDefaultClient: (client: ClientResponse) => void
}

// Create the context
const ClientContext = createContext<ClientContextType | undefined>(undefined)

// Provider component
interface ClientProviderProps {
  children: ReactNode
}

export function ClientProvider({ children }: ClientProviderProps) {
  const [selectedClient, setSelectedClientState] = useState<ClientResponse | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load client from localStorage on mount (client-side only)
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
    } else {
      clearSelectedClientFromCache()
    }
  }, [])

  // Clear selected client
  const clearSelectedClient = useCallback(() => {
    setSelectedClientState(null)
    clearSelectedClientFromCache()
  }, [])

  // Check if a client is selected
  const isClientSelected = selectedClient !== null

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
    setDefaultClient,
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

