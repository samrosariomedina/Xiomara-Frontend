"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { getClientsAction, createClientAction, deleteClientAction } from '@/actions/clients'
import { type ClientInput, type ClientResponse } from '@/lib/schemas'

export function useClients() {
  const queryClient = useQueryClient()
  const [selectedClient, setSelectedClient] = useState<ClientResponse | null>(null)

  // Query for fetching clients
  const {
    data: clients = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const result = await getClientsAction()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch clients')
      }
      return result.data || []
    },
    staleTime: 30 * 1000, // 30 seconds for more real-time updates
    retry: 2,
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: 60 * 1000 // Refetch every minute for real-time updates
  })

  // Auto-select first client if none selected and clients are available
  useEffect(() => {
    if (clients.length > 0 && !selectedClient) {
      setSelectedClient(clients[0])
    }
  }, [clients, selectedClient])

  // Set cookie when client is selected
  useEffect(() => {
    if (selectedClient && typeof window !== 'undefined') {
      document.cookie = `selectedClientId=${selectedClient._id}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
    }
  }, [selectedClient])

  // Mutation for creating a client
  const createClientMutation = useMutation({
    mutationFn: async (clientData: ClientInput) => {
      // Ensure logoFile is not null
      const sanitizedData = {
        ...clientData,
        logoFile: clientData.logoFile || undefined
      }
      const result = await createClientAction(sanitizedData)
      if (!result.success) {
        throw new Error(result.error || 'Failed to create client')
      }
      return result.data
    },
    onSuccess: (newClient) => {
      // Invalidate and refetch clients
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      // Auto-select the newly created client
      if (newClient) {
        setSelectedClient(newClient)
      }
    }
  })

  // Mutation for deleting a client
  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const result = await deleteClientAction(clientId)
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete client')
      }
      return result
    },
    onSuccess: (_, deletedClientId) => {
      // Invalidate and refetch clients
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      // If the deleted client was selected, clear selection
      if (selectedClient?._id === deletedClientId) {
        setSelectedClient(null)
      }
    }
  })

  return {
    clients,
    selectedClient,
    setSelectedClient,
    isLoading,
    error,
    refetch,
    createClient: createClientMutation.mutateAsync,
    deleteClient: deleteClientMutation.mutateAsync,
    isCreating: createClientMutation.isPending,
    isDeleting: deleteClientMutation.isPending
  }
}
