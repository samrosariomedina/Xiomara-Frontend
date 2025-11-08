'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { 
  getReferencesAction, 
  createReferenceAction, 
  editReferenceAction, 
  removeReferenceAction 
} from '@/actions/knowledge'
import type { KnowledgeBaseInput } from '@/lib/schemas'

// Query key factory
const knowledgeKeys = {
  all: ['knowledge'] as const,
  lists: () => [...knowledgeKeys.all, 'list'] as const,
}

// Get all references/knowledge base items (deprecated - use server-side getReferences instead)
export function useReferences(folderId?: string) {
  return useQuery({
    queryKey: knowledgeKeys.lists(),
    queryFn: () => getReferencesAction(folderId ? { folderId } : { folderId: '' }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Create reference mutation
export function useCreateReference() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ data, folderId }: { data: KnowledgeBaseInput; folderId: string }) =>
      createReferenceAction(data, { folderId }),
    onSuccess: () => {
      // Invalidate ALL references queries (including folder-specific ones)
      queryClient.invalidateQueries({ queryKey: ['references'] })
      toast.success('Knowledge base item created successfully')
    },
    onError: (error: Error) => {
      console.error('Create reference error:', error)
      toast.error(error.message || 'Failed to create knowledge base item')
    },
  })
}

// Edit reference mutation
export function useEditReference() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ referenceId, data }: { referenceId: string; data: Partial<KnowledgeBaseInput> }) =>
      editReferenceAction(referenceId, data),
    onSuccess: (response) => {
      // Backend returns the updated reference object with updated fields
      // Verify we got a valid response with expected structure
      if (response && typeof response === 'object') {
        // Invalidate ALL references queries (including folder-specific ones)
        queryClient.invalidateQueries({ queryKey: ['references'] })
        toast.success('Knowledge base item updated successfully')
      } else {
        // If response doesn't indicate success, show warning
        console.warn('Reference update response unclear:', response)
        toast.error('Knowledge base update may not have been applied. Please refresh and try again.')
      }
    },
    onError: (error: Error) => {
      console.error('Edit reference error:', error)
      toast.error(error.message || 'Failed to update knowledge base item')
    },
  })
}

// Remove reference mutation
export function useRemoveReference() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ referenceId, folderId }: { referenceId: string; folderId: string }) =>
      removeReferenceAction(referenceId, { folderId }),
    onSuccess: () => {
      // Invalidate ALL references queries (including folder-specific ones)
      queryClient.invalidateQueries({ queryKey: ['references'] })
      toast.success('Knowledge base item removed successfully')
    },
    onError: (error: Error) => {
      console.error('Remove reference error:', error)
      toast.error(error.message || 'Failed to remove knowledge base item')
    },
  })
}

// Combined hook for knowledge base mutations only (data fetching is now server-side)
export function useKnowledge() {
  const createReference = useCreateReference()
  const editReference = useEditReference()
  const removeReference = useRemoveReference()

  return {
    // Mutations with backward compatibility
    createReference: (data: KnowledgeBaseInput, folderId?: string, options?: { onSuccess?: () => void; onError?: (error: Error) => void }) => {
      createReference.mutate(
        { data, folderId: folderId || '' }, // Will be set by the form component
        {
          onSuccess: options?.onSuccess,
          onError: options?.onError,
        }
      )
    },
    editReference: editReference.mutate,
    removeReference: (referenceId: string, folderId?: string, options?: { onSuccess?: () => void; onError?: (error: Error) => void }) => {
      removeReference.mutate(
        { referenceId, folderId: folderId || '' }, // Will be set by the form component
        {
          onSuccess: options?.onSuccess,
          onError: options?.onError,
        }
      )
    },
    
    // Loading states
    isCreating: createReference.isPending,
    isEditing: editReference.isPending,
    isRemoving: removeReference.isPending,
  }
}
