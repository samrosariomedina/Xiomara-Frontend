"use client"

import React, { useState } from 'react'
import { X, FileText, Search, Calendar, Eye, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { deleteSummaryAction } from '@/actions/summaries'
import type { SummaryResponse } from '@/actions/summaries'
import { formatDateSafe } from '@/lib/utils'

interface SummariesViewDialogProps {
  summaries: SummaryResponse[]
  isLoadingSummaries: boolean
  onSummarySelected: (summary: SummaryResponse) => void
  onRefreshSummaries: () => void
}

export default function SummariesViewDialog({ summaries, isLoadingSummaries, onSummarySelected, onRefreshSummaries }: SummariesViewDialogProps) {
  // Internal dialog state
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSummary, setSelectedSummary] = useState<SummaryResponse | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list') // New state for view mode

  // Use summaries from props instead of fetching client-side
  const isLoading = isLoadingSummaries

  // Filter summaries based on search query
  const filteredSummaries = summaries.filter(summary => 
    !searchQuery.trim() || 
    summary.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    summary.content?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpen = () => {
    setIsOpen(true)
    setSearchQuery("")
    setSelectedSummary(null)
    setViewMode('list')
    onRefreshSummaries() // Refresh summaries when opening
  }

  const handleClose = () => {
    setIsOpen(false)
    setSearchQuery("")
    setSelectedSummary(null)
    setViewMode('list')
  }

  const handleSummarySelect = (summary: SummaryResponse) => {
    onSummarySelected(summary)
    toast.success('Summary loaded successfully!')
    handleClose()
  }

  const handleViewDetail = (summary: SummaryResponse, event: React.MouseEvent) => {
    event.stopPropagation()
    setSelectedSummary(summary)
    setViewMode('detail')
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedSummary(null)
  }

  const handleDeleteSummary = async (summaryId: string) => {
    if (!confirm('Are you sure you want to delete this summary? This action cannot be undone.')) return

    try {
      await deleteSummaryAction(summaryId)
      toast.success('Summary deleted successfully!')
      onRefreshSummaries() // Refresh the list
      setSelectedSummary(null)
      setViewMode('list')
    } catch (error) {
      console.error('Error deleting summary:', error)
      toast.error('Failed to delete summary')
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDateSafe(dateString)
    } catch {
      return 'Invalid date'
    }
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <>
      {/* Trigger Button */}
      <Button 
        onClick={handleOpen}
        variant="outline"
        size="sm"
        className="text-[#31499f] border-[#31499f] hover:bg-[#f7f9ff]"
      >
        View Summaries
      </Button>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Your Summaries</span>
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
            {viewMode === 'list' ? (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search summaries..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Summary count */}
                <div className="text-sm text-gray-600">
                  {filteredSummaries.length} of {summaries.length} summaries
                </div>

                {/* Summaries List */}
                <div className="flex-1 min-h-0 overflow-auto space-y-3">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#31499f] border-t-transparent"></div>
                    </div>
                  ) : filteredSummaries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <FileText className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 mb-2">
                        {searchQuery ? 'No summaries found matching your search' : 'No summaries created yet'}
                      </p>
                      {!searchQuery && (
                        <p className="text-sm text-gray-400">
                          Generate your first summary to get started
                        </p>
                      )}
                    </div>
                  ) : (
                    filteredSummaries.map((summary) => (
                      <div 
                        key={summary._id} 
                        className="border border-gray-200 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md hover:border-gray-300"
                        onClick={() => handleSummarySelect(summary)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900 truncate pr-2">
                            {summary.title || 'Untitled Summary'}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleViewDetail(summary, e)}
                              className="h-6 w-6 p-0 hover:bg-gray-200"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteSummary(summary._id)
                              }}
                              className="h-6 w-6 p-0 hover:bg-red-100 text-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {truncateContent(summary.content)}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(summary.timestamp)}</span>
                            </div>
                            {summary.sources && summary.sources.length > 0 && (
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                <span>{summary.sources.length} source{summary.sources.length !== 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </div>
                          {summary.edited && (
                            <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded-full text-xs">
                              Edited
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              /* Detail View */
              selectedSummary && (
                <div className="flex-1 min-h-0 flex flex-col">
                  {/* Back Button */}
                  <div className="mb-4">
                    <Button
                      variant="ghost"
                      onClick={handleBackToList}
                      className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Button>
                  </div>

                  {/* Summary Detail */}
                  <div className="flex-1 min-h-0 overflow-auto">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      {/* Header */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-semibold text-gray-900">
                            {selectedSummary.title || 'Untitled Summary'}
                          </h2>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSummary(selectedSummary._id)}
                            className="text-red-500 hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Created: {formatDate(selectedSummary.timestamp)}</span>
                          </div>
                          {selectedSummary.edited && (
                            <div className="flex items-center gap-1">
                              <span>Last edited: {typeof selectedSummary.edited === 'string' ? formatDate(selectedSummary.edited) : 'Recently'}</span>
                            </div>
                          )}
                          {selectedSummary.sources && selectedSummary.sources.length > 0 && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              <span>{selectedSummary.sources.length} source{selectedSummary.sources.length !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {selectedSummary.edited && (
                            <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded-full text-xs">
                              Edited
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="prose prose-sm max-w-none">
                        <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {selectedSummary.content}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Click &quot;Load Summary&quot; to use this summary in the chat
                        </div>
                        <Button
                          onClick={() => handleSummarySelect(selectedSummary)}
                          className="bg-[#31499f] hover:bg-[#2a3d85]"
                        >
                          Load Summary
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Footer */}
          {viewMode === 'list' && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-500">
                Click on a summary to load it into the chat
              </div>
              <Button 
                variant="outline" 
                onClick={handleClose}
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
