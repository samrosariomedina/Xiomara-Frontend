"use client"

import React, { useState, useEffect } from 'react'
import { Plus, ImageIcon, Mic, Send, Edit, Copy,  Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PostEditor from '@/components/content-engine/contentEnginePage-postEdit'
import EditForm from '@/components/content-engine/contentEnginePage-editForm'
import { useTemplates } from '@/context/TemplatesContext'
import { useAuth } from '@/context/AuthContext'
import { useMutation, useQuery } from '@tanstack/react-query'
import { generateSummaryAction, iterateSummaryAction, getUserSummariesAction, editSummaryAction } from '@/actions/summaries'
import type { SummaryResponse } from '@/actions/summaries'
import { generateOutputAction, getLatestOutputAction } from '@/actions/outputs'
import { toast } from 'sonner'
import SummariesViewDialog from '../dialogs/SummariesViewDialog'
import SummarySelectionDialog from '../dialogs/SummarySelectionDialog'
import { formatDateSafe } from '@/lib/utils'

interface ChatCardProps {
  selectedSourceIds: string[]
  onOutputGenerated?: () => void
  onClearSelectedSources?: () => void
  clearSummary?: boolean // Add prop to trigger summary clearing
  onSummaryChange?: (summary: SummaryResponse | null) => void // Callback when summary changes
  folderId: string
}

export default function ChatCard({
  selectedSourceIds,
  onOutputGenerated,
  onClearSelectedSources,
  clearSummary,
  onSummaryChange,
  folderId
}: ChatCardProps) {
    const { templates } = useTemplates()
    const { user } = useAuth()
    
    console.log('╔══════════════════════════════════════════════════════╗')
    console.log('║  CHAT CARD DEBUG                                     ║')
    console.log('╠══════════════════════════════════════════════════════╣')
    console.log('║  Folder ID:       ', folderId.padEnd(30), '║')
    console.log('║  Templates:       ', String(templates.length).padEnd(30), '║')
    console.log('║  Selected Sources:', String(selectedSourceIds.length).padEnd(30), '║')
    console.log('╚══════════════════════════════════════════════════════╝')
    
    // Local state for this component
    const [showPostEditor, setShowPostEditor] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const selectedPlatform = '';
    const [generatedSummary, setGeneratedSummary] = useState<SummaryResponse | null>(null)
    const [promptText, setPromptText] = useState('')
    const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([])


    // Server-side data fetching for user summaries (folder-scoped)
    const { data: userSummaries = [], isLoading: isLoadingSummaries, refetch: refetchSummaries } = useQuery({
        queryKey: ['user-summaries-for-dialog', folderId],
        queryFn: () => getUserSummariesAction({ folderId }),
        enabled: !!folderId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })

    // Server-side data fetching for latest output (for output card)
    const { refetch: refetchOutput } = useQuery({
        queryKey: ['latest-output', folderId],
        queryFn: () => getLatestOutputAction({ folderId }),
        enabled: !!generatedSummary && !!folderId, // Only fetch when we have a summary and folderId
        staleTime: 30 * 1000, // 30 seconds
    })

    // Load summary from localStorage on mount - but clear if folderId changes
    useEffect(() => {
        const savedSummary = localStorage.getItem('contentEngine_summary')
        if (savedSummary) {
            try {
                // Clear localStorage summary when folderId changes
                localStorage.removeItem('contentEngine_summary')
                setGeneratedSummary(null)
            } catch (error) {
                console.error('Error parsing saved summary:', error)
                localStorage.removeItem('contentEngine_summary')
                setGeneratedSummary(null)
            }
        }
    }, [folderId]) // Clear when folderId changes

    // Clear generated summary when folderId changes or clearSummary prop is true
    useEffect(() => {
        setGeneratedSummary(null)
        localStorage.removeItem('contentEngine_summary')
    }, [folderId, clearSummary])

    // Save summary to localStorage when it changes
    useEffect(() => {
        if (generatedSummary) {
            localStorage.setItem('contentEngine_summary', JSON.stringify(generatedSummary))
        } else {
            localStorage.removeItem('contentEngine_summary')
        }
    }, [generatedSummary])

    // Notify parent when summary changes
    useEffect(() => {
        onSummaryChange?.(generatedSummary)
    }, [generatedSummary, onSummaryChange])

    // React Query mutation for initial summary generation
    const generateSummaryMutation = useMutation({
        mutationFn: ({ sourceIds, prompts }: { sourceIds: string[], prompts?: string[] }) => 
            generateSummaryAction(sourceIds, prompts, undefined, user?._id, { folderId }),
        onSuccess: (summary) => {
            setGeneratedSummary(summary)
            toast.success('Summary generated successfully!')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to generate summary')
        }
    })

    // React Query mutation for saving current summary before generating new one
    const saveSummaryMutation = useMutation({
        mutationFn: (summary: SummaryResponse) => 
            editSummaryAction(summary._id, summary.title, summary.content),
        onSuccess: () => {
            console.log('Current summary saved successfully')
        },
        onError: (error: Error) => {
            console.error('Failed to save current summary:', error)
            toast.error('Failed to save current summary')
        }
    })

    // React Query mutation for chat-based summary modification using iterate endpoint
    const chatMutation = useMutation({
        mutationFn: ({ summary, prompt }: { summary: SummaryResponse, prompt: string }) => 
            iterateSummaryAction(summary._id, [prompt]),
        onSuccess: (updatedSummary) => {
            // Merge the updated content with the existing summary
            setGeneratedSummary(prev => prev ? {
                ...prev,
                content: updatedSummary.content,
                edited: true,
                timestamp: typeof updatedSummary.edited === 'string' ? updatedSummary.edited : new Date().toISOString()
            } : null)
            toast.success('Summary updated successfully!')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update summary')
        }
    })

    // React Query mutation for multiple template-based output generation
    const generateOutputMutation = useMutation({
        mutationFn: ({ summaryId, templateIds }: { summaryId: string, templateIds: string[] }) => 
            generateOutputAction(summaryId, templateIds, undefined, undefined, { folderId }),
        onSuccess: (output) => {
            toast.success('Output generated successfully!')
            console.log('Generated output:', output)
            // Clear selected templates after successful generation
            setSelectedTemplateIds([])
            // Refresh the latest output in parent component
            onOutputGenerated?.()
            // Also refresh local output data
            refetchOutput()
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to generate output')
        }
    })

    // Check if we have content (either generated summary or selected sources)
    const hasContent = generatedSummary !== null

    const handleAddSources = async () => {
        if (selectedSourceIds.length === 0) {
            toast.error('Please select at least one source to generate a summary')
            return
        }
        
        // If there's a current summary, save it first
        if (generatedSummary) {
            try {
                await saveSummaryMutation.mutateAsync(generatedSummary)
                toast.success('Previous summary saved')
            } catch (error) {
                console.error('Failed to save previous summary:', error)
                // Continue with generation even if save fails
            }
        }
        
        // Clear current summary and generate new one
        setGeneratedSummary(null)
        
        // Don't clear selected sources - let user keep their selection
        // onClearSelectedSources?.() // Removed this line that was causing the issue
        
        generateSummaryMutation.mutate({ 
            sourceIds: selectedSourceIds,
            prompts: promptText.trim() ? [promptText.trim()] : undefined
        })
    }

    const handleSendPrompt = async () => {
        if (!promptText.trim()) {
            toast.error('Please enter a prompt')
            return
        }
        
        // If we have an existing summary, use chat functionality
        if (generatedSummary) {
            chatMutation.mutate({ summary: generatedSummary, prompt: promptText.trim() })
        } else {
            // If no existing summary, require source selection for initial generation
            if (selectedSourceIds.length === 0) {
                toast.error('Please select at least one source to generate a summary')
                return
            }
            
            // Save current summary if it exists before generating new one
            if (generatedSummary) {
                try {
                    await saveSummaryMutation.mutateAsync(generatedSummary)
                    toast.success('Previous summary saved')
                } catch (error) {
                    console.error('Failed to save previous summary:', error)
                }
            }
            
            const prompts = [promptText.trim()]
            generateSummaryMutation.mutate({ sourceIds: selectedSourceIds, prompts })
        }
        
        setPromptText('') // Clear the prompt after sending
    }

    const handleTemplateClick = (platform: string) => {
        // Find matching template for the platform
        const matchingTemplate = templates.find(template => {
            const templateTitle = template.title?.toLowerCase() || ''
            const platformLower = platform.toLowerCase()
            
            // Match platform names with template titles
            return templateTitle.includes(platformLower) || 
                   (platformLower === 'x' && templateTitle.includes('twitter')) ||
                   (platformLower === 'blog post' && templateTitle.includes('blog')) ||
                   (platformLower === 'news release' && templateTitle.includes('news')) ||
                   (platformLower === 'article' && templateTitle.includes('article'))
        })

        if (!matchingTemplate) {
            toast.error(`No template found for ${platform}. Please check available templates.`)
            console.log('Available templates:', templates.map(t => ({ id: t._id, title: t.title })))
            return
        }

        // Toggle template selection
        setSelectedTemplateIds(prev => {
            const isSelected = prev.includes(matchingTemplate._id)
            if (isSelected) {
                // Remove from selection
                return prev.filter(id => id !== matchingTemplate._id)
            } else {
                // Add to selection
                return [...prev, matchingTemplate._id]
            }
        })
    }

    const handleGenerateOutput = () => {
        if (!generatedSummary?._id) {
            toast.error('Please generate a summary first')
            return
        }
        
        if (selectedTemplateIds.length === 0) {
            toast.error('Please select at least one template')
            return
        }

        console.log(`Generating output with ${selectedTemplateIds.length} selected templates`)
        
        generateOutputMutation.mutate({
            summaryId: generatedSummary._id,
            templateIds: selectedTemplateIds
        })
    }

    const handleEditClick = () => {
        setShowEditForm(true)
    }


    const handleSaveContent = (updatedSummary: SummaryResponse) => {
        // Update the generated summary with the backend response
        if (generatedSummary) {
            const mergedSummary = {
                ...generatedSummary,
                ...updatedSummary,
                // Preserve important metadata from original
                _id: generatedSummary._id,
                sources: generatedSummary.sources,
                references: generatedSummary.references,
                timestamp: generatedSummary.timestamp,
                edited: true
            }
            setGeneratedSummary(mergedSummary)
        }
    }


    // Handler for when a summary is selected from the view dialog
    const handleSummarySelected = (selectedSummary: SummaryResponse) => {
        // Save current summary to localStorage as backup if it exists and is different
        if (generatedSummary && generatedSummary._id !== selectedSummary._id) {
            const backupKey = `contentEngine_summary_backup_${Date.now()}`
            localStorage.setItem(backupKey, JSON.stringify(generatedSummary))
        }
        
        // Load the selected summary
        setGeneratedSummary(selectedSummary)
    }

    // Handler to refresh sources when needed


    // Helper function to check if a template is selected
    const isTemplateSelected = (platform: string): boolean => {
        const matchingTemplate = templates.find(template => {
            const templateTitle = template.title?.toLowerCase() || ''
            const platformLower = platform.toLowerCase()
            
            return templateTitle.includes(platformLower) || 
                   (platformLower === 'x' && templateTitle.includes('twitter')) ||
                   (platformLower === 'blog post' && templateTitle.includes('blog')) ||
                   (platformLower === 'news release' && templateTitle.includes('news')) ||
                   (platformLower === 'article' && templateTitle.includes('article'))
        })
        
        return matchingTemplate ? selectedTemplateIds.includes(matchingTemplate._id) : false
    }

    return (
        <div className="bg-white rounded-lg p-4 md:p-6 w-full md:w-full shadow-sm h-full flex flex-col">
            <header className="mb-4 md:mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
                        {generatedSummary && (
                            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Chat Mode</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <SummariesViewDialog 
                            summaries={userSummaries as SummaryResponse[]}
                            isLoadingSummaries={isLoadingSummaries}
                            onSummarySelected={handleSummarySelected}
                            onRefreshSummaries={refetchSummaries}
                        />
                        <SummarySelectionDialog 
                            onGenerateNewSummary={() => {
                                // Clear current summary to show empty state
                                setGeneratedSummary(null)
                                // Clear selected sources to allow user to select new ones
                                onClearSelectedSources?.()
                            }}
                        />
                    </div>
                </div>
            </header>

            <main className="flex-1 min-h-0 flex flex-col">
                {(generateSummaryMutation.isPending || chatMutation.isPending) ? (
                    // Loading state
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4 text-center px-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#31499f] border-t-transparent"></div>
                            <p className="text-lg font-medium text-gray-900">
                                {chatMutation.isPending ? 'Updating summary...' : 'Generating summary...'}
                            </p>
                            <p className="text-sm text-gray-500">
                                {chatMutation.isPending 
                                    ? 'Processing your request...' 
                                    : `Processing ${selectedSourceIds.length} source${selectedSourceIds.length !== 1 ? 's' : ''}`
                                }
                            </p>
                        </div>
                    </div>
                ) : !hasContent ? (
                    // Empty state (Image 1)
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4 text-center px-4">
                            <p className="text-lg font-medium text-gray-900">¿En qué puedo ayudarte ?</p>
                            <Button 
                                onClick={handleAddSources}
                                className="inline-flex items-center space-x-2 bg-[#f7f9ff] text-[#31499f] hover:bg-[#e7e9ff] border border-transparent rounded-full" 
                                variant="ghost"
                                disabled={selectedSourceIds.length === 0}
                            >
                                <Plus className="h-4 w-4" />
                                <span className="font-medium">
                                    {selectedSourceIds.length === 0 
                                        ? 'Select sources to generate summary'
                                        : `Generate summary from ${selectedSourceIds.length} source${selectedSourceIds.length !== 1 ? 's' : ''}`
                                    }
                                </span>
                            </Button>
                        </div>
                    </div>
                ) : (
                    // Content state (Image 2)
                    <div className="flex-1 flex flex-col space-y-6 overflow-y-auto">
                        {/* Content Summary */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            {generatedSummary?.title && (
                                <h4 className="text-lg font-semibold text-gray-900 mb-3">{generatedSummary.title}</h4>
                            )}
                            
                            <div className="text-sm text-gray-700 leading-relaxed">
                                <div 
                                    className="whitespace-pre-wrap prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: generatedSummary?.content || '' }}
                                />
                            </div>
                            
                            {generatedSummary?.sources && generatedSummary.sources.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 mb-2">Generated from {generatedSummary.sources.length} source{generatedSummary.sources.length !== 1 ? 's' : ''}</p>
                                    <p className="text-xs text-gray-400">
                                        Created: {formatDateSafe(generatedSummary.timestamp)}
                                    </p>
                                </div>
                            )}
                            
                            {/* Action buttons for content */}
                            <div className="flex items-center justify-end gap-2 mt-4">
                                <button 
                                    onClick={handleEditClick}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <Edit className="h-4 w-4 text-gray-500" />
                                </button>
                                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                                    <Copy className="h-4 w-4 text-gray-500" />
                                </button>
                            </div>
                        </div>
                        
                        {/* Template Selection Buttons */}
                        <div className="flex flex-wrap gap-2 md:gap-3 justify-between">
                            <Button 
                                variant={isTemplateSelected('Blog Post') ? "default" : "outline"}
                                onClick={() => handleTemplateClick('Blog Post')}
                                className={`flex items-center rounded-full flex-1 min-w-0 text-xs md:text-sm ${
                                    isTemplateSelected('Blog Post') 
                                        ? 'bg-[#31499f] text-white hover:bg-[#2a3d85]' 
                                        : 'text-[#31499f] border-[#31499f] hover:bg-[#f7f9ff]'
                                }`}
                            >
                                <Paperclip className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="ml-1 md:ml-2 truncate">Blog Post</span>
                            </Button>
                            <Button 
                                variant={isTemplateSelected('News Release') ? "default" : "outline"}
                                onClick={() => handleTemplateClick('News Release')}
                                className={`flex items-center rounded-full flex-1 min-w-0 text-xs md:text-sm ${
                                    isTemplateSelected('News Release') 
                                        ? 'bg-[#31499f] text-white hover:bg-[#2a3d85]' 
                                        : 'text-[#31499f] border-[#31499f] hover:bg-[#f7f9ff]'
                                }`}
                            >
                                <Paperclip className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="ml-1 md:ml-2 truncate">News Release</span>
                            </Button>
                            <Button 
                                variant={isTemplateSelected('Article') ? "default" : "outline"}
                                onClick={() => handleTemplateClick('Article')}
                                className={`flex items-center rounded-full flex-1 min-w-0 text-xs md:text-sm ${
                                    isTemplateSelected('Article') 
                                        ? 'bg-[#31499f] text-white hover:bg-[#2a3d85]' 
                                        : 'text-[#31499f] border-[#31499f] hover:bg-[#f7f9ff]'
                                }`}
                            >
                                <Paperclip className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="ml-1 md:ml-2 truncate">Article</span>
                            </Button>
                        </div>
                        
                        {/* Selected Templates Indicator */}
                        {selectedTemplateIds.length > 0 && (
                            <div className="flex items-center justify-center gap-2 text-xs text-[#31499f] bg-[#f7f9ff] px-3 py-2 rounded-lg">
                                <span className="font-medium">{selectedTemplateIds.length} template{selectedTemplateIds.length !== 1 ? 's' : ''} selected</span>
                                <button 
                                    onClick={() => setSelectedTemplateIds([])}
                                    className="text-gray-400 hover:text-gray-600 ml-1"
                                    title="Clear selection"
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        {/* Content Generators */}
                        <div className="pt-3 md:pt-4">
                            <h5 className="text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3">Generadores de contenido</h5>
                            <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm">
                                <button 
                                    onClick={() => handleTemplateClick('TikTok')}
                                    className={`flex items-center space-x-1 md:space-x-2 p-1.5 md:p-2 rounded-lg transition-colors ${
                                        isTemplateSelected('TikTok') 
                                            ? 'bg-[#31499f] text-white' 
                                            : 'hover:bg-gray-100'
                                    }`}
                                >
                                    <div className="w-3 h-3 md:w-4 md:h-4 flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" className="w-3 h-3 md:w-4 md:h-4" fill="currentColor">
                                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                                        </svg>
                                    </div>
                                    <span className={isTemplateSelected('TikTok') ? 'text-white' : 'text-gray-600'}>TikTok</span>
                                </button>
                                <button 
                                    onClick={() => handleTemplateClick('LinkedIn')}
                                    className={`flex items-center space-x-1 md:space-x-2 p-1.5 md:p-2 rounded-lg transition-colors ${
                                        isTemplateSelected('LinkedIn') 
                                            ? 'bg-[#31499f] text-white' 
                                            : 'hover:bg-gray-100'
                                    }`}
                                >
                                    <div className={`w-4 h-4 flex items-center justify-center ${isTemplateSelected('LinkedIn') ? 'text-white' : 'text-[#0077B5]'}`}>
                                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                        </svg>
                                    </div>
                                    <span className={isTemplateSelected('LinkedIn') ? 'text-white' : 'text-gray-600'}>LinkedIn</span>
                                </button>
                                <button 
                                    onClick={() => handleTemplateClick('Facebook')}
                                    className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                                        isTemplateSelected('Facebook') 
                                            ? 'bg-[#31499f] text-white' 
                                            : 'hover:bg-gray-100'
                                    }`}
                                >
                                    <div className={`w-4 h-4 flex items-center justify-center ${isTemplateSelected('Facebook') ? 'text-white' : 'text-[#1877F2]'}`}>
                                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                    </div>
                                    <span className={isTemplateSelected('Facebook') ? 'text-white' : 'text-gray-600'}>Facebook</span>
                                </button>
                                <button 
                                    onClick={() => handleTemplateClick('Instagram')}
                                    className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                                        isTemplateSelected('Instagram') 
                                            ? 'bg-[#31499f] text-white' 
                                            : 'hover:bg-gray-100'
                                    }`}
                                >
                                    <div className={`w-4 h-4 flex items-center justify-center ${isTemplateSelected('Instagram') ? 'text-white' : 'text-[#E4405F]'}`}>
                                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z"/>
                                        </svg>
                                    </div>
                                    <span className={isTemplateSelected('Instagram') ? 'text-white' : 'text-gray-600'}>Instagram</span>
                                </button>
                                <button 
                                    onClick={() => handleTemplateClick('X')}
                                    className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                                        isTemplateSelected('X') 
                                            ? 'bg-[#31499f] text-white' 
                                            : 'hover:bg-gray-100'
                                    }`}
                                >
                                    <div className="w-4 h-4 flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                                            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                                        </svg>
                                    </div>
                                    <span className={isTemplateSelected('X') ? 'text-white' : 'text-gray-600'}>X</span>
                                </button>
                            </div>
                            
                        </div>

                        {/* Generate Output Button */}
                        <div className="pt-3 md:pt-4">
                            <Button 
                                onClick={handleGenerateOutput}
                                disabled={!generatedSummary || selectedTemplateIds.length === 0 || generateOutputMutation.isPending}
                                className="w-full bg-[#31499f] hover:bg-[#2a3d85] text-white rounded-full disabled:opacity-50"
                            >
                                {generateOutputMutation.isPending 
                                    ? 'Generating Output...' 
                                    : selectedTemplateIds.length > 0 
                                        ? `Generate Output (${selectedTemplateIds.length} template${selectedTemplateIds.length !== 1 ? 's' : ''})`
                                        : 'Select templates to generate output'
                                }
                            </Button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <footer className="mt-6">
                    <div className="flex items-center gap-3 bg-[#f7f9ff] rounded-full px-4 py-3">
                        <Input 
                            placeholder={
                                generatedSummary 
                                    ? "Chat with your summary..." 
                                    : "Type a prompt to customize your summary..."
                            }
                            className="bg-transparent border-0 ring-0 shadow-none focus-visible:ring-0 px-2 text-sm" 
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSendPrompt()
                                }
                            }}
                            disabled={generateSummaryMutation.isPending || chatMutation.isPending}
                            suppressHydrationWarning 
                        />
                        <button 
                            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                            disabled={generateSummaryMutation.isPending || chatMutation.isPending}
                        >
                            <ImageIcon className="h-4 w-4" />
                        </button>
                        <button 
                            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                            disabled={generateSummaryMutation.isPending || chatMutation.isPending}
                        >
                            <Mic className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={handleSendPrompt}
                            disabled={
                                generateSummaryMutation.isPending || 
                                chatMutation.isPending || 
                                !promptText.trim() ||
                                (!generatedSummary && selectedSourceIds.length === 0)
                            }
                            className="p-2 rounded-full text-white bg-[#31499f] hover:bg-[#2a3d85] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </footer>

                {/* Directives - Now outside the scrollable content area */}
                {hasContent && (
                    <div className="flex gap-2 overflow-x-auto mt-4 pb-2">
                        {[
                            'Directiva 1',
                            'Directiva 2', 
                            'Directiva 3',
                            'Directiva 4',
                            'Directiva 5'
                        ].map((directive, index) => (
                            <button key={index} className="px-3 py-1 text-sm text-[#31499f] bg-[#f0f4ff] rounded-full hover:bg-[#e6efff] transition-colors whitespace-nowrap flex-shrink-0">
                                <span className="mr-1">😊</span>
                                <span>{directive}</span>
                            </button>
                        ))}
                    </div>
                )}
            </main>

            {/* Post Editor Modal */}
            <PostEditor 
                isOpen={showPostEditor}
                onClose={() => setShowPostEditor(false)}
                platform={selectedPlatform}
                onSummarySaved={() => {
                    // Optionally refresh or update something when a summary is saved
                    toast.success('Summary saved to database!')
                }}
            />

            {/* Edit Form Modal */}
            <EditForm 
                isOpen={showEditForm}
                onClose={() => setShowEditForm(false)}
                onSave={handleSaveContent}
                summaryId={generatedSummary?._id}
                initialTitle={generatedSummary?.title || ''}
                initialContent={generatedSummary?.content || ''}
            />
        </div>
    )
}