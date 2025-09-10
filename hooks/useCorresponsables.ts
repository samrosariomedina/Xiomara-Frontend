'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  createCorresponsablesAction, 
  createCorresponsablesFromCSVAction,
  getCorresponsablesAction,
  removeCorresponsableAction
} from '@/actions/corresponsables'
import { ConnectCorrespondentsInput } from '@/lib/schemas'
import { toast } from 'sonner'

/**
 * Custom hook for managing corresponsables with React Query
 */
export function useCorresponsables(folderId?: string) {
  const queryClient = useQueryClient()

  // Query to fetch corresponsables for a folder
  const {
    data: corresponsables = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['corresponsables', folderId],
    queryFn: async () => {
      if (!folderId) return []
      const result = await getCorresponsablesAction(folderId)
      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || 'Failed to fetch corresponsables')
      }
    },
    enabled: !!folderId,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000 // 1 minute
  })

  // Mutation to create corresponsables from form data
  const createCorresponsablesMutation = useMutation({
    mutationFn: async ({ 
      folderId, 
      correspondents 
    }: { 
      folderId: string
      correspondents: ConnectCorrespondentsInput['correspondents']
    }) => {
      const result = await createCorresponsablesAction(folderId, correspondents)
      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || 'Failed to create corresponsables')
      }
    },
    onSuccess: (data) => {
      toast.success(`Successfully created ${data.length} corresponsables`)
      // Invalidate and refetch corresponsables
      queryClient.invalidateQueries({ queryKey: ['corresponsables'] })
    },
    onError: (error: Error) => {
      console.error('Create corresponsables error:', error)
      toast.error(error.message || 'Failed to create corresponsables')
    }
  })

  // Mutation to create corresponsables from CSV
  const createCorresponsablesFromCSVMutation = useMutation({
    mutationFn: async ({ 
      folderId, 
      csvFile, 
      enabled 
    }: { 
      folderId: string
      csvFile: File
      enabled: boolean
    }) => {
      const result = await createCorresponsablesFromCSVAction(folderId, csvFile, enabled)
      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || 'Failed to create corresponsables from CSV')
      }
    },
    onSuccess: (data) => {
      toast.success(`Successfully created ${data.length} corresponsables from CSV`)
      // Invalidate and refetch corresponsables
      queryClient.invalidateQueries({ queryKey: ['corresponsables'] })
    },
    onError: (error: Error) => {
      console.error('Create corresponsables from CSV error:', error)
      toast.error(error.message || 'Failed to create corresponsables from CSV')
    }
  })

  // Mutation to remove a corresponsable
  const removeCorresponsableMutation = useMutation({
    mutationFn: async ({ 
      listenerId, 
      folderId 
    }: { 
      listenerId: string
      folderId: string
    }) => {
      const result = await removeCorresponsableAction(listenerId, folderId)
      if (result.success) {
        return result
      } else {
        throw new Error(result.error || 'Failed to remove corresponsable')
      }
    },
    onSuccess: () => {
      toast.success('Corresponsable removed successfully')
      // Invalidate and refetch corresponsables
      queryClient.invalidateQueries({ queryKey: ['corresponsables'] })
    },
    onError: (error: Error) => {
      console.error('Remove corresponsable error:', error)
      toast.error(error.message || 'Failed to remove corresponsable')
    }
  })

  return {
    // Data
    corresponsables,
    isLoading,
    error,
    
    // Actions
    refetch,
    createCorresponsables: createCorresponsablesMutation.mutateAsync,
    createCorresponsablesFromCSV: createCorresponsablesFromCSVMutation.mutateAsync,
    removeCorresponsable: removeCorresponsableMutation.mutateAsync,
    
    // Loading states
    isCreating: createCorresponsablesMutation.isPending,
    isCreatingFromCSV: createCorresponsablesFromCSVMutation.isPending,
    isRemoving: removeCorresponsableMutation.isPending
  }
}
