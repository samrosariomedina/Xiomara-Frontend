"use client"

import React, { useState, useEffect } from 'react'
import { X, FileText, Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { generateNewSummaryAction } from '@/actions/summaries'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { SourceResponse } from '@/lib/schemas'
import type { SummaryResponse } from '@/actions/summaries'

interface SummarySelectionDialogProps {
  sources: SourceResponse[]
  isLoadingSources: boolean
  onSummaryGenerated: (summary: SummaryResponse) => void
}

export default function SummarySelectionDialog({ sources, isLoadingSources, onSummaryGenerated }: SummarySelectionDialogProps) {
  // Internal dialog state
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredSources, setFilteredSources] = useState<SourceResponse[]>([])

  // Use sources from props instead of fetching client-side
  const isLoading = isLoadingSources

  // Filter sources based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSources(sources)
    } else {
      const filtered = sources.filter(source => 
        source.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredSources(filtered)
    }
  }, [searchQuery, sources])

  // Generate summary mutation
  const generateSummaryMutation = useMutation({
    mutationFn: (sourceIds: string[]) => generateNewSummaryAction(sourceIds),
    onSuccess: (summary) => {
      toast.success('New summary generated successfully!')
      onSummaryGenerated(summary)
      handleClose()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate summary')
    }
  })

  const handleOpen = () => {
    setIsOpen(true)
    setSelectedSourceIds([])
    setSearchQuery("")
  }

  const handleClose = () => {
    setIsOpen(false)
    setSelectedSourceIds([])
    setSearchQuery("")
  }

  const handleSourceSelection = (sourceId: string, isSelected: boolean) => {
    setSelectedSourceIds(prev => 
      isSelected 
        ? [...prev, sourceId]
        : prev.filter(id => id !== sourceId)
    )
  }

  const handleGenerate = () => {
    if (selectedSourceIds.length === 0) {
      toast.error('Please select at least one source')
      return
    }
    generateSummaryMutation.mutate(selectedSourceIds)
  }

  // Dialog is controlled by internal state and trigger button

  return (
    <>
      {/* Trigger Button */}
      <Button 
        onClick={handleOpen}
        variant="outline"
        size="sm"
        className="text-[#31499f] border-[#31499f] hover:bg-[#f7f9ff]"
      >
        Generate New Summary
      </Button>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Select Sources for New Summary</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 min-h-0 flex flex-col space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search sources..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected count */}
            {selectedSourceIds.length > 0 && (
              <div className="text-sm text-[#31499f] bg-[#f7f9ff] px-3 py-2 rounded-lg">
                {selectedSourceIds.length} source{selectedSourceIds.length !== 1 ? 's' : ''} selected
              </div>
            )}

            {/* Sources List */}
            <div className="flex-1 min-h-0 overflow-auto space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#31499f] border-t-transparent"></div>
                </div>
              ) : filteredSources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500">
                    {searchQuery ? 'No sources found matching your search' : 'No sources available'}
                  </p>
                </div>
              ) : (
                filteredSources.map((source) => (
                  <div 
                    key={source._id} 
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={selectedSourceIds.includes(source._id || '')}
                        onChange={(e) => handleSourceSelection(source._id || '', e.target.checked)}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate pr-2">
                            {source.title || 'Untitled'}
                          </h4>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {source.timestamp ? new Date(source.timestamp).toLocaleDateString() : 'No date'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="inline-flex items-center text-xs text-[#31499f] gap-1">
                            <FileText className="h-3 w-3" />
                            <span>
                              {source.type === 'file' ? 'File' : 
                               source.type === 'webpage' ? 'Web' : 
                               source.type === 'text' ? 'Text' : 'Source'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                            {source.type === 'file' ? 'File' : 
                             source.type === 'webpage' ? 'Web' : 
                             source.type === 'text' ? 'Text' : 'General'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={generateSummaryMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={selectedSourceIds.length === 0 || generateSummaryMutation.isPending}
              className="bg-[#31499f] hover:bg-[#2a3d85]"
            >
              {generateSummaryMutation.isPending ? 'Generating...' : `Generate Summary (${selectedSourceIds.length})`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
