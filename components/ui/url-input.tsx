"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { ExternalLink, AlertCircle, CheckCircle, Globe } from "lucide-react"

interface UrlInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  showValidation?: boolean
}

export function UrlInput({ 
  value, 
  onChange, 
  placeholder = "https://example.com",
  className = "",
  showValidation = true
}: UrlInputProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
  }

  useEffect(() => {
    if (!showValidation || !value.trim()) {
      setIsValid(null)
      return
    }

    const timeoutId = setTimeout(() => {
      setIsLoading(true)
      const valid = validateUrl(value.trim())
      setIsValid(valid)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [value, showValidation])

  const openUrl = () => {
    if (isValid && value.trim()) {
      window.open(value.trim(), '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type="url"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`bg-[#f7f9ff] pr-16 ${className} ${
            showValidation && isValid === false ? 'border-red-300 focus:border-red-500' : 
            showValidation && isValid === true ? 'border-green-300 focus:border-green-500' : ''
          }`}
        />
        
        {/* Status icons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {showValidation && isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          )}
          
          {showValidation && !isLoading && isValid === true && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          
          {showValidation && !isLoading && isValid === false && value.trim() && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          
          {isValid && (
            <button
              type="button"
              onClick={openUrl}
              className="p-0.5 hover:bg-gray-100 rounded transition-colors"
              title="Open URL in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5 text-gray-400 hover:text-blue-500" />
            </button>
          )}
        </div>
      </div>

      {/* URL preview */}
      {showValidation && isValid && value.trim() && (
        <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <Globe className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{value.trim()}</span>
        </div>
      )}

      {/* Error message */}
      {showValidation && isValid === false && value.trim() && (
        <p className="text-xs text-red-600 flex items-center space-x-1">
          <AlertCircle className="h-3 w-3" />
          <span>Please enter a valid URL starting with http:// or https://</span>
        </p>
      )}

    </div>
  )
}
