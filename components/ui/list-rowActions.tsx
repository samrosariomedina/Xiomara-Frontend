"use client"

import { useRef, useState, useEffect } from "react"
import React from "react"
import { createPortal } from 'react-dom'
import { Edit, Trash2 } from "lucide-react"
import { type FC } from "react"

interface ListRowActionsProps {
  onEdit?: () => void | Promise<void>
  onDelete?: () => void | Promise<void>
  onClose: () => void
  left?: number
  top?: number
  itemName?: string
  itemType: "Source" | "Knowledge" | "Corresponsable" | "Media"
}

export const ListRowActions: FC<ListRowActionsProps> = ({ 
  onEdit, 
  onDelete, 
  onClose, 
  left = 0, 
  top = 0, 
  itemName = '', 
  itemType
}) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [adjustedPosition, setAdjustedPosition] = useState({ left, top })

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    // Add event listeners with capture to ensure they fire
    document.addEventListener('mousedown', handleClickOutside, true)
    document.addEventListener('keydown', handleEscape, true)

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true)
      document.removeEventListener('keydown', handleEscape, true)
    }
  }, [onClose])

  // Adjust position to keep menu within viewport
  React.useEffect(() => {
    if (ref.current) {
      const menuRect = ref.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      let adjustedLeft = left
      let adjustedTop = top
      
      // Adjust horizontal position
      if (left + menuRect.width > viewportWidth) {
        adjustedLeft = viewportWidth - menuRect.width - 16 // 16px padding
      }
      if (adjustedLeft < 16) {
        adjustedLeft = 16
      }
      
      // Adjust vertical position
      if (top + menuRect.height > viewportHeight) {
        adjustedTop = viewportHeight - menuRect.height - 16 // 16px padding
      }
      if (adjustedTop < 16) {
        adjustedTop = 16
      }
      
      setAdjustedPosition({ left: adjustedLeft, top: adjustedTop })
    }
  }, [left, top])

  const menu = (
    <div
      ref={ref}
      style={{ 
        position: 'fixed', 
        left: adjustedPosition.left, 
        top: adjustedPosition.top,
        zIndex: 9999
      }}
      className="w-52 rounded-lg bg-white shadow-lg p-3 border border-gray-200"
    >
      <button
        className="flex items-center gap-3 w-full py-2 px-2 hover:bg-gray-50 rounded-md text-sm text-gray-800"
        onClick={async () => {
          if (!onEdit) return onClose()
          try {
            setIsProcessing(true)
            await Promise.resolve(onEdit())
          } finally {
            setIsProcessing(false)
            onClose()
          }
        }}
        type="button"
      >
        <Edit className="h-5 w-5 text-gray-700" />
        <span className="whitespace-nowrap">Edit {itemType}</span>
      </button>

      <div className="my-2 border-t border-gray-200" />

      <button
        className="flex items-center gap-3 w-full py-2 px-2 hover:bg-red-50 rounded-md text-sm text-red-600"
        onClick={() => setConfirmOpen(true)}
        type="button"
      >
        <Trash2 className="h-5 w-5 text-red-600" />
        <span className="whitespace-nowrap">Delete</span>
      </button>
    </div>
  )

  if (typeof document === 'undefined') return null

  const handleConfirm = async () => {
    if (!onDelete) return
    try {
      setIsProcessing(true)
      await onDelete()
    } finally {
      setIsProcessing(false)
      setConfirmOpen(false)
      onClose()
    }
  }

  const overlay = (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 10000 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setConfirmOpen(false)
        }
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative z-10 max-w-lg w-full mx-4 bg-white rounded-2xl shadow-2xl p-6 text-center">
        <div className="mx-6 my-4 rounded-x p-8">
          <button
            type="button"
            aria-label="Close"
            onClick={() => !isProcessing && setConfirmOpen(false)}
            className="absolute top-8 right-8 rounded hover:bg-gray-100 p-1"
            disabled={isProcessing}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 hover:text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 8.586L15.95 2.636a1 1 0 011.414 1.414L11.414 10l5.95 5.95a1 1 0 01-1.414 1.414L10 11.414l-5.95 5.95A1 1 0 012.636 15.95L8.586 10 2.636 4.05A1 1 0 014.05 2.636L10 8.586z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="flex justify-center">
            <div className="rounded-full bg-red-50 p-5 ">
              <Trash2 className="h-10 w-10 text-red-600" />
            </div>
          </div>

          <h3 className="mt-6 text-3xl font-bold text-gray-900">Delete {itemType}</h3>
          <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-[520px] mx-auto">
            Are you sure you want to delete <strong>&quot;{itemName}&quot;</strong>? This action cannot be undone.
          </p>

          <div className="mt-10 pt-10 flex items-center justify-center gap-6">
            <button
              type="button"
              className="min-w-[170px] px-6 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 font-medium"
              onClick={() => setConfirmOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </button>

            <button
              type="button"
              className="min-w-[170px] px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Add backdrop overlay for click-outside functionality
  const backdrop = (
    <div 
      className="fixed inset-0"
      style={{ zIndex: 9998 }}
      onClick={onClose}
    />
  )

  return createPortal(
    <>
      {backdrop}
      {menu}
      {confirmOpen && overlay}
    </>,
    document.body,
  )
}

export default ListRowActions

