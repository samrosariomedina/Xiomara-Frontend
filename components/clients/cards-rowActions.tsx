"use client"

import { useRef, useState, useEffect } from "react"
import { createPortal } from 'react-dom'
import { Edit, FilePlus, Trash2 } from "lucide-react"
import { type FC } from "react"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

interface RowActionsMenuProps {
  onEdit?: () => void | Promise<void>
  onAddSource?: () => void | Promise<void>
  onDelete?: () => void | Promise<void>
  onClose: () => void
  left?: number
  top?: number
  itemName?: string
  actions?: Array<"edit" | "addSource" | "delete"> // controls which actions to render
  align?: "left" | "right"
  context?: "client" | "campaign" // determines the context for translations
}

export const RowActionsMenu: FC<RowActionsMenuProps> = ({ onEdit, onAddSource, onDelete, onClose, left = 0, top = 0, itemName = '', actions = ["edit", "addSource", "delete"], context = "campaign" }) => {
  console.log('[RowActionsMenu] Component rendered with:', { itemName, context, actions, hasOnDelete: !!onDelete })
  
  const ref = useRef<HTMLDivElement | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  useEffect(() => {
    console.log('[RowActionsMenu] confirmOpen changed to:', confirmOpen)
  }, [confirmOpen])

  // Close menu when clicking outside (but not when dialog is open)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if confirm dialog is open
      if (confirmOpen) {
        console.log('[RowActionsMenu] Click outside ignored - dialog is open')
        return
      }
      
      if (ref.current && !ref.current.contains(event.target as Node)) {
        console.log('[RowActionsMenu] Click outside detected - closing menu')
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose, confirmOpen])

  const menu = (
    <div
      ref={ref}
      style={{ 
        position: 'fixed', 
        left: typeof window !== 'undefined' ? Math.min(left, window.innerWidth - 220) : left, // Ensure menu doesn't go off screen
        top: typeof window !== 'undefined' ? Math.min(top, window.innerHeight - 200) : top, // Ensure menu doesn't go off screen
        maxWidth: '200px',
        display: confirmOpen ? 'none' : 'block' // Hide menu when dialog is open
      }}
      className="z-50 w-52 rounded-lg bg-white shadow-lg p-3"
    >
      {actions.includes('edit') && (
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
          <span className="whitespace-nowrap">
            {context === "client" 
              ? 'Edit client'
              : 'Edit campaign'
            }
          </span>
        </button>
      )}

      {actions.includes('addSource') && (
        <button
          className="flex items-center gap-3 w-full py-2 px-2 hover:bg-gray-50 rounded-md text-sm text-gray-800"
          onClick={async () => {
            if (!onAddSource) return onClose()
            try {
              setIsProcessing(true)
              await Promise.resolve(onAddSource())
            } finally {
              setIsProcessing(false)
              onClose()
            }
          }}
          type="button"
        >
          <FilePlus className="h-5 w-5 text-gray-700" />
          <span className="whitespace-nowrap">Add source</span>
        </button>
      )}

      <div className="my-2 border-t text-gray-300" />

      {actions.includes('delete') && (
        <button
          className="flex items-center gap-3 w-full py-2 px-2 hover:bg-gray-50 rounded-md text-sm text-gray-700"
          onClick={() => {
            console.log('[RowActionsMenu] Delete button clicked in menu')
            setConfirmOpen(true)
          }}
          type="button"
        >
          <Trash2 className="h-5 w-5 text-gray-700" />
          <span className="whitespace-nowrap">Delete</span>
        </button>
      )}
    </div>
  )

  if (typeof document === 'undefined') return null

  const handleDeleteConfirm = async () => {
    console.log('[RowActionsMenu] handleDeleteConfirm called')
    console.log('[RowActionsMenu] onDelete exists:', !!onDelete)
    console.log('[RowActionsMenu] itemName:', itemName)
    console.log('[RowActionsMenu] context:', context)
    
    if (!onDelete) {
      console.error('[RowActionsMenu] No onDelete handler provided!')
      return
    }
    
    setIsProcessing(true)
    try {
      console.log('[RowActionsMenu] Calling onDelete()...')
      await Promise.resolve(onDelete())
      console.log('[RowActionsMenu] onDelete completed successfully')
      setConfirmOpen(false)
      onClose()
    } catch (error: unknown) {
      console.error('[RowActionsMenu] Delete error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      {createPortal(menu, document.body)}
      
      <DeleteConfirmationDialog
        isOpen={confirmOpen}
        onClose={() => {
          console.log('[RowActionsMenu] Dialog onClose called')
          setConfirmOpen(false)
          // Don't call onClose here - let handleDeleteConfirm do it after success
        }}
        onConfirm={handleDeleteConfirm}
        itemName={itemName || 'this item'}
        itemType={context === "client" ? "client" : "campaign"}
      />
    </>
  )
}

export default RowActionsMenu
