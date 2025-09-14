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
export function useReferences() {
  return useQuery({
    queryKey: knowledgeKeys.lists(),
    queryFn: getReferencesAction,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Create reference mutation
export function useCreateReference() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createReferenceAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.lists() })
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.lists() })
      toast.success('Knowledge base item updated successfully')
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
    mutationFn: removeReferenceAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.lists() })
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
    // Mutations
    createReference: createReference.mutate,
    editReference: editReference.mutate,
    removeReference: removeReference.mutate,
    
    // Loading states
    isCreating: createReference.isPending,
    isEditing: editReference.isPending,
    isRemoving: removeReference.isPending,
  }
}
