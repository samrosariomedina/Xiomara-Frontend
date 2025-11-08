'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  createCorresponsablesAction, 
  createCorresponsablesFromCSVAction,
  getCorresponsablesAction,
  updateCorresponsableAction,
  removeCorresponsableAction,
  createCorresponsableWithSharingAction
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
      const correspondentsWithEmail = correspondents.map(correspondent => ({
        ...correspondent,
        clientName: correspondent.clientName || '', // Ensure clientName is always a string (can be empty)
        email: correspondent.email || ''
      }))
      const result = await createCorresponsablesAction(folderId, correspondentsWithEmail)
      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || 'Failed to create corresponsables')
      }
    },
    onSuccess: (data, variables) => {
      const count = variables.correspondents.length;
      const countText = count === 1 ? 'corresponsable' : 'corresponsables';
      toast.success(`${count} ${countText} added successfully`)
      // Invalidate and refetch corresponsables
      queryClient.invalidateQueries({ queryKey: ['corresponsables'] })
    },
    onError: (error: Error) => {
      console.error('Create corresponsables error:', error)
      const errorMessage = error.message || 'Failed to create corresponsables';
      
      // Provide more specific error messages
      if (errorMessage.includes('required')) {
        toast.error('Please provide all required information for all corresponsables')
      } else if (errorMessage.includes('Authentication')) {
        toast.error('Your session has expired. Please log in again.')
      } else if (errorMessage.includes('Invalid')) {
        toast.error('Invalid data provided. Please check your input and try again.')
      } else {
        toast.error(`Failed to add corresponsables: ${errorMessage}`)
      }
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
      const count = data?.length || 0;
      if (count > 0) {
        const countText = count === 1 ? 'corresponsable' : 'corresponsables';
        toast.success(`${count} ${countText} imported successfully from CSV`)
      } else {
        toast.success('CSV file processed, but no corresponsables were created')
      }
      // Invalidate and refetch corresponsables
      queryClient.invalidateQueries({ queryKey: ['corresponsables'] })
    },
    onError: (error: Error) => {
      console.error('Create corresponsables from CSV error:', error)
      const errorMessage = error.message || 'Failed to create corresponsables from CSV';
      
      // Provide more specific error messages
      if (errorMessage.includes('CSV') || errorMessage.includes('file')) {
        toast.error('Invalid CSV file format. Please check the file structure and try again.')
      } else if (errorMessage.includes('Authentication')) {
        toast.error('Your session has expired. Please log in again.')
      } else if (errorMessage.includes('Invalid')) {
        toast.error('CSV file contains invalid data. Please check the format and try again.')
      } else {
        toast.error(`Failed to import corresponsables: ${errorMessage}`)
      }
    }
  })

  // Mutation to create a single corresponsable with sharing
  const createCorresponsableWithSharingMutation = useMutation({
    mutationFn: async ({ 
      folderId, 
      data 
    }: { 
      folderId: string
      data: {
        clientName: string;
        email: string;
        listenerType: "whatsapp" | "telegram";
        whatsapp?: string;
        telegramToken?: string;
        accountType: "premium" | "standard" | "basic";
      }
    }) => {
      const result = await createCorresponsableWithSharingAction(folderId, data)
      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || 'Failed to create corresponsable')
      }
    },
    onSuccess: (data, variables) => {
      const clientName = variables.data.clientName?.trim() || 'Corresponsable';
      const listenerType = variables.data.listenerType === 'whatsapp' ? 'WhatsApp' : 'Telegram';
      toast.success(`${clientName} added successfully as ${listenerType} corresponsable`)
      // Invalidate and refetch corresponsables
      queryClient.invalidateQueries({ queryKey: ['corresponsables'] })
    },
    onError: (error: Error, variables) => {
      console.error('Create corresponsable with sharing error:', error)
      const clientName = variables.data.clientName?.trim() || 'Corresponsable';
      const errorMessage = error.message || 'Failed to create corresponsable';
      
      // Provide more specific error messages
      if (errorMessage.includes('required')) {
        toast.error(`Please provide all required information for ${clientName}`)
      } else if (errorMessage.includes('token') || errorMessage.includes('Telegram')) {
        toast.error('Invalid Telegram bot token. Please check your token and try again.')
      } else if (errorMessage.includes('WhatsApp') || errorMessage.includes('whatsapp')) {
        toast.error('Invalid WhatsApp number. Please check the number format and try again.')
      } else if (errorMessage.includes('Authentication')) {
        toast.error('Your session has expired. Please log in again.')
      } else {
        toast.error(`Failed to add ${clientName}: ${errorMessage}`)
      }
    }
  })

  // Mutation to update a corresponsable
  const updateCorresponsableMutation = useMutation({
    mutationFn: async ({ 
      listenerId, 
      data 
    }: { 
      listenerId: string
      data: {
        title?: string | null; // null to remove title, string to set title, undefined to not change
        enabled?: boolean;
        email?: string;
        // Note: origin is intentionally NOT editable for security reasons
      }
    }) => {
      const result = await updateCorresponsableAction(listenerId, data)
      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || 'Failed to update corresponsable')
      }
    },
    onSuccess: (data) => {
      const corresponsableName = data?.title || 'Corresponsable';
      toast.success(`${corresponsableName} updated successfully`)
      // Invalidate and refetch corresponsables to sync data across pages
      queryClient.invalidateQueries({ queryKey: ['corresponsables'] })
    },
    onError: (error: Error) => {
      console.error('Update corresponsable error:', error)
      const errorMessage = error.message || 'Failed to update corresponsable';
      
      // Provide more specific error messages
      if (errorMessage.includes('not found') || errorMessage.includes('permission')) {
        toast.error('Corresponsable not found or you do not have permission to update it.')
      } else if (errorMessage.includes('Authentication')) {
        toast.error('Your session has expired. Please log in again.')
      } else if (errorMessage.includes('Invalid')) {
        toast.error('Invalid data provided. Please check your input and try again.')
      } else {
        toast.error(`Failed to update corresponsable: ${errorMessage}`)
      }
      // Still invalidate queries to refresh data even on error
      queryClient.invalidateQueries({ queryKey: ['corresponsables'] })
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
      console.log('🗑️ Mutation: Attempting to remove corresponsable:', { listenerId, folderId })
      const result = await removeCorresponsableAction(listenerId, folderId)
      console.log('🗑️ Mutation: Result from action:', result)
      if (result.success) {
        return result
      } else {
        throw new Error(result.error || 'Failed to remove corresponsable')
      }
    },
    onSuccess: () => {
      console.log('✅ Mutation: Corresponsable removed successfully, invalidating queries')
      toast.success('Corresponsable removed successfully')
      // Invalidate and refetch all corresponsables queries
      queryClient.invalidateQueries({ queryKey: ['corresponsables'] })
      // Force an immediate refetch
      queryClient.refetchQueries({ queryKey: ['corresponsables', folderId] })
    },
    onError: (error: Error) => {
      console.error('❌ Mutation: Remove corresponsable error:', error)
      const errorMessage = error.message || 'Failed to remove corresponsable';
      
      // Provide more specific error messages
      if (errorMessage.includes('not found')) {
        toast.error('Corresponsable not found. It may have already been deleted.')
      } else if (errorMessage.includes('Authentication')) {
        toast.error('Your session has expired. Please log in again.')
      } else if (errorMessage.includes('permission')) {
        toast.error('You do not have permission to remove this corresponsable.')
      } else {
        toast.error(`Failed to remove corresponsable: ${errorMessage}`)
      }
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
    createCorresponsableWithSharing: createCorresponsableWithSharingMutation.mutateAsync,
    updateCorresponsable: updateCorresponsableMutation.mutateAsync,
    removeCorresponsable: removeCorresponsableMutation.mutateAsync,
    
    // Loading states
    isCreating: createCorresponsablesMutation.isPending,
    isCreatingFromCSV: createCorresponsablesFromCSVMutation.isPending,
    isCreatingWithSharing: createCorresponsableWithSharingMutation.isPending,
    isUpdating: updateCorresponsableMutation.isPending,
    isRemoving: removeCorresponsableMutation.isPending
  }
}
