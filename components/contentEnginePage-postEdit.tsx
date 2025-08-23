"use client"

import React, { useState } from 'react'
import { X, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RichTextEditor } from './ui/rich-text-editor'
import { FileUpload } from './ui/file-upload'

interface PostEditorProps {
    isOpen: boolean
    onClose: () => void
    platform?: string
}

export default function PostEditor({ isOpen, onClose }: PostEditorProps) {
    const [selectedPosts, setSelectedPosts] = useState<number[]>([])
     const [formData, setFormData] = useState({
        name: "",
        file: null as File | null,
        url: "",
        text: "",
      })

    if (!isOpen) return null

    const togglePostSelection = (index: number) => {
        setSelectedPosts(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index)
                : [...prev, index]
        )
    }

    const posts = Array.from({ length: 9 }, (_, i) => ({
        id: i,
        company: "Your company",
        content: "Lorem ipsum dolor sit amet consectetur. Bibendum arcu pulvinar posuere accumsan facilisis euismod rhoncus. Lectus placerat sit nulla tortor. Nulla.",
        image: "/api/placeholder/240/160"
    }))

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
            <div className="bg-white rounded-xl w-full max-w-screen h-[95vh] flex flex-col lg:flex-row overflow-hidden shadow-2xl">
                {/* Mobile/Medium: Single scrollable form, Large+: Left Panel - Post Selection */}
                <div className="flex-1 p-3 md:p-6 lg:border-r lg:border-gray-200 overflow-y-auto max-h-full lg:max-h-full">
                    <div className="flex items-center justify-between mb-3 md:mb-6">
                        <h2 className="text-lg md:text-2xl font-semibold text-gray-900">Post Editor</h2>
                        <button 
                            onClick={onClose}
                            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Posts Grid */}
                    <div className="flex flex-wrap gap-2 md:gap-4 mb-6 lg:mb-0">
                        {posts.map((post, index) => (
                            <div 
                                key={post.id}
                                className={`border-2 rounded-lg p-2 md:p-3 cursor-pointer transition-all w-full sm:w-[calc(50%-0.25rem)] lg:w-[calc(33.333%-0.667rem)] ${
                                    selectedPosts.includes(index) 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => togglePostSelection(index)}
                            >
                                {/* Checkbox */}
                                <div className="flex items-start justify-between mb-1.5 md:mb-2">
                                    <div className={`w-3 h-3 md:w-4 md:h-4 rounded border-2 flex items-center justify-center ${
                                        selectedPosts.includes(index)
                                            ? 'bg-blue-500 border-blue-500'
                                            : 'border-gray-300'
                                    }`}>
                                        {selectedPosts.includes(index) && (
                                            <svg className="w-2 h-2 md:w-3 md:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <button className="p-0.5 md:p-1 hover:bg-gray-100 rounded">
                                        <MoreHorizontal className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                                    </button>
                                </div>

                                {/* Company Name */}
                                <h4 className="font-medium text-gray-900 text-xs md:text-sm mb-1.5 md:mb-2">{post.company}</h4>

                                {/* Content */}
                                <p className="text-xs text-gray-600 mb-2 md:mb-3 line-clamp-2 md:line-clamp-3">
                                    {post.content}
                                </p>

                                {/* Image */}
                                <div className="w-full h-16 md:h-24 bg-green-200 rounded overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-green-300 to-green-500"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Edit Content Section - Integrated on mobile/medium, separate panel on large screens */}
                    <div className="lg:hidden w-full">
                        <div className="border-t border-gray-200 pt-6 mt-6">
                            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 md:mb-6">Edit Content</h3>

                            {/* Post Copy Section */}
                            <div className="mb-4 md:mb-6 w-full">
                                <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3 block">Post Copy</label>
                                <div className="w-full">
                                    <RichTextEditor 
                                                  value={formData.text} 
                                                  onChange={(text) => setFormData({ ...formData, text })} 
                                    />
                                </div>
                            </div>

                            {/* Hashtags Section */}
                            <div className="mb-4 md:mb-6 w-full">
                                <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3 block">Hashtags</label>
                                <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 w-full">
                                    {['Hashtags', 'Hashtags', 'Hashtags'].map((tag, index) => (
                                        <span 
                                            key={index}
                                            className="inline-flex items-center px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full"
                                        >
                                            {tag}
                                            <button className="ml-1 hover:text-gray-900">
                                                <X className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Media Section */}
                            <div className="mb-6 md:mb-8 w-full">
                                <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3 block">Media</label>
                                <div className="w-full">
                                    <FileUpload
                                                  selectedFile={formData.file || undefined}
                                                  onFileSelect={(file) => setFormData({ ...formData, file })}
                                                  onRemove={() => setFormData({ ...formData, file: null })}
                                                />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full">
                                <Button 
                                    variant="outline" 
                                    onClick={onClose}
                                    className="flex-1 rounded-full bg-[#f7f9ff] text-xs md:text-sm py-2 md:py-3 w-full"
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    className="flex-1 rounded-full bg-[#31499f] hover:bg-blue-900 text-xs md:text-sm py-2 md:py-3 w-full"
                                >
                                    Generar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Edit Content - Only visible on large screens */}
                <div className="hidden lg:flex w-96 p-6 bg-gray-50 overflow-y-auto flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Edit Content</h3>

                    {/* Post Copy Section */}
                    <div className="mb-6 w-full">
                        <label className="text-sm font-medium text-gray-700 mb-3 block">Post Copy</label>
                        <div className="w-full">
                            <RichTextEditor 
                                          value={formData.text} 
                                          onChange={(text) => setFormData({ ...formData, text })} 
                            />
                        </div>
                    </div>

                    {/* Hashtags Section */}
                    <div className="mb-6 w-full">
                        <label className="text-sm font-medium text-gray-700 mb-3 block">Hashtags</label>
                        <div className="flex flex-wrap gap-2 mb-2 w-full">
                            {['Hashtags', 'Hashtags', 'Hashtags'].map((tag, index) => (
                                <span 
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full"
                                >
                                    {tag}
                                    <button className="ml-1 hover:text-gray-900">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Media Section */}
                    <div className="mb-8 w-full">
                        <label className="text-sm font-medium text-gray-700 mb-3 block">Media</label>
                        <div className="w-full">
                            <FileUpload
                                          selectedFile={formData.file || undefined}
                                          onFileSelect={(file) => setFormData({ ...formData, file })}
                                          onRemove={() => setFormData({ ...formData, file: null })}
                                        />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-auto w-full">
                        <Button 
                            variant="outline" 
                            onClick={onClose}
                            className="flex-1 rounded-full bg-[#f7f9ff] text-sm py-3"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            className="flex-1 rounded-full bg-[#31499f] hover:bg-blue-900 text-sm py-3"
                        >
                            Generar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
