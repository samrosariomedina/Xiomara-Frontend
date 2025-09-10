"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getClientsAction, createClientAction, deleteClientAction } from '@/actions/clients'
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
      return result.data || []
    },
    staleTime: 30 * 1000, // 30 seconds for more real-time updates
    retry: 2,
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: 60 * 1000 // Refetch every minute for real-time updates
  })

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
