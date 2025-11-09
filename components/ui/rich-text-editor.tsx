"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-32 bg-gray-50 animate-pulse rounded-lg" />
})

import 'react-quill-new/dist/quill.snow.css'

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
  maxLength, // No default limit - allow unlimited text
  placeholder = "Escribe tu texto aquí...",
  minHeight = 128
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Custom toolbar configuration with all features
  const modules = {
    toolbar: [
      [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'header': 1 }, { 'header': 2 }, 'blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }, { 'align': [] }],
      ['link', 'image', 'video', 'formula'],
      ['clean']
    ],
  }

  const formats = [
    'font', 'size', 'bold', 'italic', 'underline', 'strike', 
    'color', 'background', 'script', 'header', 'blockquote', 'code-block',
      'list', 'indent', 'direction', 'align',
    'link', 'image', 'video', 'formula'
  ]

  const handleChange = (content: string) => {
    // Only check character limit if maxLength is explicitly provided
    // For sources, we want unlimited text, so maxLength should be undefined
    if (maxLength !== undefined) {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content
      const textLength = tempDiv.textContent?.length || 0
      
      if (textLength > maxLength) {
        return // Don't update if over limit
      }
    }
    onChange(content)
  }

  if (!mounted) {
    return <div className="h-32 bg-gray-50 animate-pulse rounded-lg" />
  }

  return (
    <div className="w-full h-full flex flex-col bg-white border border-gray-200 rounded-lg overflow-y-auto max-h-96">
      <style jsx global>{`
        /* Custom Quill styles to match the design */
        .ql-snow .ql-toolbar {
          border: none;
          border-bottom: 1px solid #e5e7eb;
          background: rgba(249, 250, 251, 0.8);
          padding: 8px 12px;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .ql-snow .ql-toolbar .ql-formats {
          margin-right: 8px;
        }
        
        .ql-snow .ql-toolbar button {
          width: 28px;
          height: 28px;
          padding: 3px;
          margin: 0 1px;
          border-radius: 4px;
        }
        
        .ql-snow .ql-toolbar button:hover {
          background-color: #e5e7eb;
        }
        
        .ql-snow .ql-toolbar button.ql-active {
          background-color: #dbeafe;
          color: #2563eb;
        }
        
        .ql-snow .ql-toolbar .ql-picker {
          font-size: 14px;
        }
        
        .ql-snow .ql-toolbar .ql-picker-label {
          padding: 2px 8px;
          border-radius: 4px;
        }
        
        .ql-snow .ql-toolbar .ql-picker-label:hover {
          background-color: #e5e7eb;
        }
        
        .ql-snow .ql-container {
          border: none;
          font-size: 14px;
          line-height: 1.5;
          background: rgba(249, 250, 251, 0.3);
          flex: 1;
        }
        
        .ql-snow .ql-editor {
          padding: 24px;
          color: #374151;
          min-height: ${minHeight}px;
        }
        
        .ql-snow .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
          left: 24px;
          top: 24px;
        }
        
        /* Hide default Quill tooltips and use our own */
        .ql-snow .ql-tooltip {
          display: none;
        }
        
        /* Custom icons to match design */
        .ql-snow .ql-stroke {
          stroke: #6b7280;
        }
        
        .ql-snow .ql-fill {
          fill: #6b7280;
        }
        
        .ql-snow button:hover .ql-stroke,
        .ql-snow button.ql-active .ql-stroke {
          stroke: #374151;
        }
        
        .ql-snow button:hover .ql-fill,
        .ql-snow button.ql-active .ql-fill {
          fill: #374151;
        }
      `}</style>
      
      <ReactQuill
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ 
          height: 'auto', 
          display: 'flex', 
          flexDirection: 'column'
        }}
        theme="snow"
      />

        {/* Character Count */}
      <div className="absolute bottom-4 right-6 text-xs text-gray-400 pointer-events-none select-none">
        Cambios Guardados
      </div>
    </div>
  )
}