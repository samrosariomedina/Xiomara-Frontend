"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Bold, Italic, Underline, Link, List, AlignLeft, Smile, Paperclip } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  maxLength?: number
  placeholder?: string
  minHeight?: number
}

export function RichTextEditor({ 
  value, 
  onChange, 
  maxLength = 300,
  placeholder = "Escribe tu texto aquí...",
  minHeight = 128
}: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
  const textAreaRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  
  // Sync external value changes without disturbing cursor
  useEffect(() => {
    const editor = textAreaRef.current
    if (!editor || isFocused) return
    
    if (editor.innerHTML !== value) {
      editor.innerHTML = value || ''
    }
  }, [value, isFocused])

  // Update active formats based on cursor position
  const updateActiveFormats = () => {
    const formats = new Set<string>()
    
    if (document.queryCommandState('bold')) formats.add('bold')
    if (document.queryCommandState('italic')) formats.add('italic')
    if (document.queryCommandState('underline')) formats.add('underline')
    if (document.queryCommandState('insertUnorderedList')) formats.add('list')
    
    setActiveFormats(formats)
  }
  

  const formatText = (format: string) => {
    const editor = textAreaRef.current
    if (!editor) return

    editor.focus()

    switch (format) {
      case 'bold':
        document.execCommand('bold', false)
        break
      case 'italic':
        document.execCommand('italic', false)
        break
      case 'underline':
        document.execCommand('underline', false)
        break
      case 'link': {
        const url = prompt('Enter URL:')
        if (url) {
          document.execCommand('createLink', false, url)
        }
        break
      }
      case 'list':
        document.execCommand('insertUnorderedList', false)
        break
      case 'alignLeft':
        document.execCommand('justifyLeft', false)
        break
      default:
        break
    }
    
    // Update active formats after formatting
    setTimeout(updateActiveFormats, 0)
  }

  const insertEmoji = () => {
    const editor = textAreaRef.current
    if (!editor) return
    
    const emojis = ['😀', '😃', '😄', '😁', '😊', '😉', '👍', '👎', '❤️', '🎉', '🔥', '⭐', '💡', '✨']
    const emoji = emojis[Math.floor(Math.random() * emojis.length)]
    
    editor.focus()
    document.execCommand('insertText', false, emoji)
    
    // Trigger onChange
    onChange(editor.innerHTML)
    setTimeout(updateActiveFormats, 0)
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const editor = textAreaRef.current
    if (!editor) return

    // For images, create an img tag
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = `<img src="${event.target?.result}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0;" />`
        editor.focus()
        document.execCommand('insertHTML', false, img)
        onChange(editor.innerHTML)
      }
      reader.readAsDataURL(file)
    } else {
      // For other files, insert a file link
      const fileLink = `<a href="#" title="${file.name}" style="color: blue; text-decoration: underline;">📎 ${file.name}</a>`
      editor.focus()
      document.execCommand('insertHTML', false, fileLink)
      onChange(editor.innerHTML)
    }
  }

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const html = target.innerHTML
    
    // Check length limit
    const textLength = target.textContent?.length || 0
    if (maxLength && textLength > maxLength) {
      // Restore previous content if over limit
      target.innerHTML = value
      return
    }
    
    onChange(html)
    
    // Update active formats after input
    setTimeout(updateActiveFormats, 0)
  }

  const triggerChange = () => {
    const editor = textAreaRef.current
    if (editor) {
      onChange(editor.innerHTML)
      setTimeout(updateActiveFormats, 0)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd shortcuts - let execCommand handle formatting
    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'i' || e.key === 'u')) {
      e.preventDefault()
      if (e.key === 'b') formatText('bold')
      if (e.key === 'i') formatText('italic')
      if (e.key === 'u') formatText('underline')
    }
  }

  return (
    <div className={`border rounded-lg bg-[#f7f9ff] overflow-hidden transition-colors ${
      isFocused ? 'border-blue-100' : 'border-gray-300'
    }`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <button 
          type="button"
          onClick={() => formatText('bold')}
          className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${
            activeFormats.has('bold') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button 
          type="button"
          onClick={() => formatText('italic')}
          className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${
            activeFormats.has('italic') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button 
          type="button"
          onClick={() => formatText('underline')}
          className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${
            activeFormats.has('underline') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title="Underline (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button 
          type="button"
          onClick={() => formatText('link')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-600"
          title="Add Link"
        >
          <Link className="h-4 w-4" />
        </button>
        <button 
          type="button"
          onClick={() => formatText('list')}
          className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${
            activeFormats.has('list') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title="Add List"
        >
          <List className="h-4 w-4" />
        </button>
        <button 
          type="button"
          onClick={() => formatText('alignLeft')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-600"
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button 
          type="button"
          onClick={insertEmoji}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-600"
          title="Add Emoji"
        >
          <Smile className="h-4 w-4" />
        </button>
        <button 
          type="button"
          onClick={handleFileUpload}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-600"
          title="Attach File"
        >
          <Paperclip className="h-4 w-4" />
        </button>
      </div>

      {/* Text Area */}
      <div className="relative">
        {/* contentEditable WYSIWYG editor */}
        <div
          ref={textAreaRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          onFocus={() => {
            setIsFocused(true)
            setTimeout(updateActiveFormats, 0)
          }}
          onBlur={() => setIsFocused(false)}
          className={`w-full p-3 resize-none border-none outline-none min-h-[128px] prose max-w-none focus:ring-0 ${
            !value && !isFocused ? 'text-gray-500' : 'text-gray-900'
          }`}
          style={{ 
            minHeight: `${minHeight}px`,
            userSelect: 'text',
            WebkitUserSelect: 'text'
          }}
        />

        {/* Placeholder overlay */}
        {!value && !isFocused && (
          <div 
            className="absolute top-3 left-3 pointer-events-none text-gray-500 select-none"
            style={{ fontSize: 'inherit', lineHeight: 'inherit' }}
          >
            {placeholder}
          </div>
        )}

        {/* Character Count */}
        <div className="absolute bottom-2 right-3 text-xs text-gray-500 pointer-events-none select-none">
          <span className={(textAreaRef.current?.textContent?.length || 0) > maxLength * 0.9 ? 'text-orange-500' : ''}>
            {textAreaRef.current?.textContent?.length || 0}
          </span>
          <span className={(textAreaRef.current?.textContent?.length || 0) >= maxLength ? 'text-red-500' : ''}>
            /{maxLength}
          </span>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
      </div>
    </div>
  )
}