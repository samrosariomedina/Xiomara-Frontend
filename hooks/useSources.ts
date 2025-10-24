'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { 
  getSourcesAction, 
  createSourceAction, 
  editSourceAction, 
  removeSourceAction 
} from '@/actions/sources'

// Type for source input
type SourceInputData = {
  name: string;
  description?: string;
  file?: File;
  url?: string;
  text?: string;
  type?: string;
}

// Query key factory
const sourcesKeys = {
  all: ['sources'] as const,
  lists: () => [...sourcesKeys.all, 'list'] as const,
}

// Get all sources (deprecated - use server-side getSources instead)
export function useSources() {
  return useQuery({
    queryKey: sourcesKeys.lists(),
    queryFn: () => getSourcesAction(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Create source mutation
export function useCreateSource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ data, folderId }: { data: SourceInputData; folderId?: string }) =>
      createSourceAction(data, folderId ? { folderId } : undefined),
    onSuccess: () => {
      // Invalidate ALL sources queries (including folder-specific ones)
      queryClient.invalidateQueries({ queryKey: ['sources'] })
      toast.success('Source created successfully')
    },
    onError: (error: Error) => {
      console.error('Create source error:', error)
      toast.error(error.message || 'Failed to create source')
    },
  })
}

// Edit source mutation
export function useEditSource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sourceId, data }: { sourceId: string; data: Partial<SourceInputData> }) =>
      editSourceAction(sourceId, data),
    onSuccess: () => {
      // Invalidate ALL sources queries (including folder-specific ones)
      queryClient.invalidateQueries({ queryKey: ['sources'] })
      toast.success('Source updated successfully')
    },
    onError: (error: Error) => {
      console.error('Edit source error:', error)
      toast.error(error.message || 'Failed to update source')
    },
  })
}

// Remove source mutation
export function useRemoveSource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeSourceAction,
    onSuccess: () => {
      // Invalidate ALL sources queries (including folder-specific ones)
      queryClient.invalidateQueries({ queryKey: ['sources'] })
      toast.success('Source removed successfully')
    },
    onError: (error: Error) => {
      console.error('Remove source error:', error)
      toast.error(error.message || 'Failed to remove source')
    },
  })
}

// Combined hook for sources mutations only (data fetching is now server-side)
export function useSourcesMutations(folderId?: string) {
  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║  useSourcesMutations HOOK                            ║')
  console.log('╠══════════════════════════════════════════════════════╣')
  console.log('║  Folder ID:           ', (folderId || 'UNDEFINED').padEnd(27), '║')
  console.log('╚══════════════════════════════════════════════════════╝')
  
  const createSource = useCreateSource()
  const editSource = useEditSource()
  const removeSource = useRemoveSource()

  return {
    // Mutations
    createSource: (data: SourceInputData) => {
      console.log('╔══════════════════════════════════════════════════════╗')
      console.log('║  createSource WRAPPER CALLED                         ║')
      console.log('╠══════════════════════════════════════════════════════╣')
      console.log('║  Folder ID being sent: ', (folderId || 'UNDEFINED').padEnd(25), '║')
      console.log('║  Data name:            ', (data.name || 'N/A').padEnd(25), '║')
      console.log('╚══════════════════════════════════════════════════════╝')
      return createSource.mutate({ data, folderId })
    },
    editSource: editSource.mutate,
    removeSource: removeSource.mutate,
    
    // Loading states
    isCreating: createSource.isPending,
    isEditing: editSource.isPending,
    isRemoving: removeSource.isPending,
  }
}
