"use client"

import type React from "react"
import { useState, useRef } from "react"
import {  X, File, Image as ImageIcon, CloudUpload } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onRemove: () => void
  selectedFile?: File
  accept?: string
  maxSize?: number // in MB
  multiple?: boolean
}

export function FileUpload({ 
  onFileSelect, 
  onRemove, 
  selectedFile,
  accept = ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi",
  maxSize = 10,
  multiple = false
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSize}MB`
    }
    
    // Check file type if accept is specified
    if (accept && accept !== "*") {
      const acceptedTypes = accept.split(',').map(type => type.trim())
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      const isAccepted = acceptedTypes.some(type => 
        type === fileExtension || 
        file.type.match(type.replace('*', '.*'))
      )
      if (!isAccepted) {
        return `File type not supported. Accepted types: ${accept}`
      }
    }
    
    return null
  }

  const handleFile = (file: File) => {
    setError(null)
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }
    onFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleBrowse = () => {
    setError(null)
    fileInputRef.current?.click()
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4 text-blue-500" />
    }
    return <File className="h-4 w-4 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (selectedFile) {
    return (
      <div className=" border-gray-300 rounded-lg p-6 text-center">
        <div className="flex items-center justify-between bg-[#f7f9ff] rounded-lg p-4">
          <div className="flex items-center space-x-3">
            {getFileIcon(selectedFile)}
            <div className="text-left">
              <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <button 
            onClick={onRemove} 
            className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        className={` bg-[#f7f9ff] rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragOver 
            ? "border-blue-400 bg-blue-50" 
            : error 
            ? "border-red-300 bg-red-50"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowse}
      >
        <CloudUpload className={`h-12 w-12 mx-auto mb-4 ${error ? 'text-red-400' : 'text-gray-400'}`} />
        <p className={`mb-2 ${error ? 'text-red-600' : 'text-gray-600'}`}>
          <span className="font-medium">
            {isDragOver ? 'Drop your file here' : 'Drag your file(s) or browse'}
          </span>
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Max {maxSize} MB files are allowed
        </p>
       
      </div>
      
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept={accept}
        multiple={multiple}
      />
    </div>
  )
}
