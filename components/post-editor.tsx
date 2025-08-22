"use client"

import React, { useState } from 'react'
import { X, MoreHorizontal, Bold, Italic, Underline, AlignLeft, List, Link, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PostEditorProps {
    isOpen: boolean
    onClose: () => void
    platform?: string
}

export default function PostEditor({ isOpen, onClose }: PostEditorProps) {
    const [selectedPosts, setSelectedPosts] = useState<number[]>([])
    const [postContent, setPostContent] = useState("Lorem ipsum dolor sit amet consectetur. Bibendum arcu pulvinar posuere accumsan facilisis euismod rhoncus. Lectus placerat sit nulla tortor. Nulla.")

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex overflow-hidden shadow-2xl">
                {/* Left Panel - Post Selection */}
                <div className="flex-1 p-6 border-r border-gray-200 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900">Post Editor</h2>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Posts Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        {posts.map((post, index) => (
                            <div 
                                key={post.id}
                                className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                                    selectedPosts.includes(index) 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => togglePostSelection(index)}
                            >
                                {/* Checkbox */}
                                <div className="flex items-start justify-between mb-2">
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                        selectedPosts.includes(index)
                                            ? 'bg-blue-500 border-blue-500'
                                            : 'border-gray-300'
                                    }`}>
                                        {selectedPosts.includes(index) && (
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <button className="p-1 hover:bg-gray-100 rounded">
                                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                    </button>
                                </div>

                                {/* Company Name */}
                                <h4 className="font-medium text-gray-900 text-sm mb-2">{post.company}</h4>

                                {/* Content */}
                                <p className="text-xs text-gray-600 mb-3 line-clamp-3">
                                    {post.content}
                                </p>

                                {/* Image */}
                                <div className="w-full h-24 bg-green-200 rounded overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-green-300 to-green-500"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel - Edit Content */}
                <div className="w-96 p-6 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Edit Content</h3>

                    {/* Post Copy Section */}
                    <div className="mb-6">
                        <label className="text-sm font-medium text-gray-700 mb-3 block">Post Copy</label>
                        
                        {/* Toolbar */}
                        <div className="flex items-center gap-1 p-2 bg-white border border-gray-200 rounded-t-lg">
                            <button className="p-1 hover:bg-gray-100 rounded">
                                <Bold className="h-4 w-4 text-gray-600" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded">
                                <Italic className="h-4 w-4 text-gray-600" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded">
                                <Underline className="h-4 w-4 text-gray-600" />
                            </button>
                            <div className="w-px h-4 bg-gray-300 mx-1"></div>
                            <button className="p-1 hover:bg-gray-100 rounded">
                                <AlignLeft className="h-4 w-4 text-gray-600" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded">
                                <List className="h-4 w-4 text-gray-600" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded">
                                <Link className="h-4 w-4 text-gray-600" />
                            </button>
                        </div>

                        {/* Text Area */}
                        <textarea
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            className="w-full h-32 p-3 border border-t-0 border-gray-200 rounded-b-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Write your post content..."
                        />
                        
                        <div className="text-right text-xs text-gray-500 mt-1">
                            {postContent.length}/3000
                        </div>
                    </div>

                    {/* Hashtags Section */}
                    <div className="mb-6">
                        <label className="text-sm font-medium text-gray-700 mb-3 block">Hashtags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
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
                    <div className="mb-8">
                        <label className="text-sm font-medium text-gray-700 mb-3 block">Media</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                                <Upload className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                                Drag your file(s) or <button className="text-blue-600 hover:text-blue-800">browse</button>
                            </p>
                            <p className="text-xs text-gray-500">Max 10 MB files are allowed</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-auto">
                        <Button 
                            variant="outline" 
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            Generar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
