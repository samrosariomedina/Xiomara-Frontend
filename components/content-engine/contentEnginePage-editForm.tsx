import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { useMutation } from '@tanstack/react-query'
import { editSummaryAction } from '@/actions/summaries'
import type { SummaryResponse } from '@/actions/summaries'
import { toast } from 'sonner'

interface EditFormProps {
    isOpen: boolean
    onClose: () => void
    onSave: (updatedSummary: SummaryResponse) => void
    summaryId?: string
    initialTitle?: string
    initialContent?: string
}

export default function EditForm({ 
    isOpen, 
    onClose, 
    onSave, 
    summaryId,
    initialTitle = "",
    initialContent = "" 
}: EditFormProps) {
    const [title, setTitle] = useState(initialTitle)
    const [content, setContent] = useState(initialContent)
    const [isAnimating, setIsAnimating] = useState(false)

    // React Query mutation for editing summary
    const editSummaryMutation = useMutation({
        mutationFn: ({ summaryId, title, content }: { summaryId: string, title?: string, content?: string }) => 
            editSummaryAction(summaryId, title, content),
        onSuccess: (updatedData) => {
            toast.success('Summary updated successfully!')
            // Create a complete summary response object
            const updatedSummary: SummaryResponse = {
                _id: summaryId!,
                title: title || initialTitle,
                content: content,
                timestamp: new Date().toISOString(),
                sources: [], // Will be updated by parent with actual data
                edited: true
            }
            onSave(updatedSummary)
            handleClose()
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update summary')
        }
    })

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true)
            // Set content and title properly
            console.log('EditForm received:', { initialTitle, initialContent })
            setTitle(initialTitle || '')
            setContent(initialContent || '')
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden'
        } else {
            // Re-enable body scroll when modal is closed
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, initialTitle, initialContent])

    const handleClose = () => {
        setIsAnimating(false)
        setTimeout(() => {
            onClose()
        }, 300) // Match animation duration
    }

    const handleSave = () => {
        if (!summaryId) {
            toast.error('Cannot save: Summary ID is missing')
            return
        }

        if (!content.trim()) {
            toast.error('Content cannot be empty')
            return
        }

        editSummaryMutation.mutate({
            summaryId,
            title: title.trim() || undefined,
            content: content.trim()
        })
    }

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose()
        }
    }

    if (!isOpen) return null

    return (
        <div 
            className={`fixed inset-0 z-50 transition-all duration-300 ease-out ${
                isAnimating 
                    ? 'bg-black/55 bg-opacity-50 backdrop-blur-sm' 
                    : 'bg-black/55 bg-opacity-0 backdrop-blur-none'
            }`}
            onClick={handleOverlayClick}
        >
            <div 
                className={`fixed top-0 right-0 h-full bg-white shadow-2xl w-full sm:max-w-xl md:max-w-2xl transform transition-all duration-300 ease-out ${
                    isAnimating 
                        ? 'translate-x-0' 
                        : 'translate-x-full'
                } overflow-hidden flex flex-col`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Summary</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        className="rounded-full p-2 hover:bg-gray-200 transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                    <div className="space-y-4 sm:space-y-6">

                        {/* Title Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Title</label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter summary title..."
                                className="w-full"
                            />
                        </div>

                        {/* Content Editor */}
                        <div className="space-y-2">
                            <div className="min-h-[300px] sm:min-h-[400px]">
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <RichTextEditor
                                        value={content}
                                        onChange={setContent}
                                        placeholder="Lorem ipsum dolor sit amet consectetur. Nunc commodo eu arcu orci. Elementum cursus vitae vel lectus lorem malesuada eleifend facilisis urna. Sit sed sed senectus vulputate eu eleifend vestibulum..."
                                        maxLength={2000}
                                        minHeight={400}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-200 bg-white">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-2 order-2 sm:order-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={editSummaryMutation.isPending}
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-[#31499f] hover:bg-[#2a3d85] text-white order-1 sm:order-2 disabled:opacity-50"
                    >
                        {editSummaryMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
