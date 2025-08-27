"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getClientsAction, createClientAction, deleteClientAction, type ClientData } from '@/actions/clients'
import { type ClientInput } from '@/lib/schemas'

export function useClients() {
  const queryClient = useQueryClient()

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
      return result.clients || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  })

  // Mutation for creating a client
  const createClientMutation = useMutation({
    mutationFn: async (clientData: ClientInput) => {
      const result = await createClientAction(clientData)
      if (!result.success) {
        throw new Error(result.error || 'Failed to create client')
      }
      return result.client
    },
    onSuccess: () => {
      // Invalidate and refetch clients
      queryClient.invalidateQueries({ queryKey: ['clients'] })
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
    onSuccess: () => {
      // Invalidate and refetch clients
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    }
  })

  return {
    clients,
    isLoading,
    error,
    refetch,
    createClient: createClientMutation.mutateAsync,
    deleteClient: deleteClientMutation.mutateAsync,
    isCreating: createClientMutation.isPending,
    isDeleting: deleteClientMutation.isPending
  }
}
