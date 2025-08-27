import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

interface EditFormProps {
    isOpen: boolean
    onClose: () => void
    onSave: (title: string, content: string) => void
    initialTitle?: string
    initialContent?: string
}

export default function EditForm({ 
    isOpen, 
    onClose, 
    onSave, 
    initialContent = "" 
}: EditFormProps) {
    const [content, setContent] = useState(initialContent)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true)
            setContent(initialContent)
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden'
        } else {
            // Re-enable body scroll when modal is closed
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, initialContent])

    const handleClose = () => {
        setIsAnimating(false)
        setTimeout(() => {
            onClose()
        }, 300) // Match animation duration
    }

    const handleSave = () => {
        onSave("", content)
        handleClose()
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
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">New Post</h2>
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
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-[#31499f] hover:bg-[#2a3d85] text-white order-1 sm:order-2"
                    >
                        Generar
                    </Button>
                </div>
            </div>
        </div>
    )
}
