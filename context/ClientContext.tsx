"use client"

import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react'
import { ClientResponse } from '@/lib/schemas'

// Client context type
export interface ClientContextType {
  selectedClient: ClientResponse | null
  setSelectedClient: (client: ClientResponse | null) => void
  clearSelectedClient: () => void
  isClientSelected: boolean
}

// Create the context
const ClientContext = createContext<ClientContextType | undefined>(undefined)

// Provider component
interface ClientProviderProps {
  children: ReactNode
}

export function ClientProvider({ children }: ClientProviderProps) {
  const [selectedClient, setSelectedClientState] = useState<ClientResponse | null>(null)

  // Memoized setter to prevent unnecessary re-renders
  const setSelectedClient = useCallback((client: ClientResponse | null) => {
    setSelectedClientState(client)
  }, [])

  // Clear selected client
  const clearSelectedClient = useCallback(() => {
    setSelectedClientState(null)
  }, [])

  // Check if a client is selected
  const isClientSelected = selectedClient !== null

  const value: ClientContextType = {
    selectedClient,
    setSelectedClient,
    clearSelectedClient,
    isClientSelected,
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

