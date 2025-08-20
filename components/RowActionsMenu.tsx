"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from 'react-dom'
import { Edit, FilePlus, Trash2, X } from "lucide-react"
import { type FC } from "react"
import { useTranslations } from 'next-intl'

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
}

export const RowActionsMenu: FC<RowActionsMenuProps> = ({ onEdit, onAddSource, onDelete, onClose, left = 0, top = 0, itemName = '', actions = ["edit", "addSource", "delete"], align = "left" }) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const t = useTranslations('CLIENTS')
  const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024)

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [onClose])

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const isMobile = viewportWidth < 768

  // compute adjusted left for right-aligned menus on medium/desktop to avoid overflow
  const computeLeft = () => {
    if (isMobile) return 0
    const menuApproxWidth = 220
    let adjusted = left
    if (align === 'right') adjusted = left - menuApproxWidth + 24 // nudge so menu appears to the left of button
    // clamp using viewportWidth
    const min = 8
    const max = Math.max(8, viewportWidth - menuApproxWidth - 8)
    adjusted = Math.min(Math.max(adjusted, min), max)
    return Math.round(adjusted)
  }

  const menu = (
    <div
      ref={ref}
      style={isMobile ? undefined : { position: 'fixed', left: computeLeft(), top }}
      className={isMobile ? "fixed inset-x-0 bottom-0 z-50 rounded-t-lg bg-white shadow-lg p-4" : "z-50 w-52 rounded-lg bg-white shadow-lg p-3"}
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
          <span className="whitespace-nowrap">{t('actions.editCampaign') || 'Editar Campaña'}</span>
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
          <span className="whitespace-nowrap">{t('actions.addSource') || 'Agregar Fuente'}</span>
        </button>
      )}

      <div className="my-2 border-t text-gray-300" />

      {actions.includes('delete') && (
        <button
          className="flex items-center gap-3 w-full py-2 px-2 hover:bg-gray-50 rounded-md text-sm text-gray-700"
          onClick={() => { setConfirmOpen(true) }}
          type="button"
        >
          <Trash2 className="h-5 w-5 text-gray-700" />
          <span className="whitespace-nowrap">{t('actions.delete') || 'Eliminar'}</span>
        </button>
      )}
    </div>
  )

  if (typeof document === 'undefined') return null

  const handleConfirm = async () => {
    if (!onDelete) return
    try {
      setIsProcessing(true)
      await Promise.resolve(onDelete())
    } finally {
      setIsProcessing(false)
      setConfirmOpen(false)
      onClose()
    }
  }

  const overlay = isMobile ? (
    // Mobile: full-screen sheet-like modal
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => { setConfirmOpen(false); onClose() }} />
      <div className="relative z-10 w-full bg-white rounded-t-2xl shadow-2xl p-6 max-h-[85vh] overflow-auto">
        <div className="flex justify-end">
          <button
            type="button"
            aria-label="Close"
            onClick={() => { setConfirmOpen(false); onClose() }}
            className="rounded p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 hover:text-[#ff0000]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 8.586L15.95 2.636a1 1 0 011.414 1.414L11.414 10l5.95 5.95a1 1 0 01-1.414 1.414L10 11.414l-5.95 5.95A1 1 0 012.636 15.95L8.586 10 2.636 4.05A1 1 0 014.05 2.636L10 8.586z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-[#f7f9ff] p-5">
            <X className="h-10 w-10 text-gray-500" />
          </div>
        </div>

        <h3 className="mt-2 text-2xl font-bold text-gray-900 text-center">{t('confirmDelete.title') || 'Eliminar'}</h3>
        <p className="mt-3 text-sm text-gray-600 leading-relaxed text-center">{t('confirmDelete.message', { name: itemName || '' })}</p>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            className="w-full px-4 py-3 rounded-full bg-[#F7F9FF] text-[#31499F]"
            onClick={() => setConfirmOpen(false)}
            disabled={isProcessing}
          >
            {t('actions.cancel') || 'Cancelar'}
          </button>

          <button
            type="button"
            className="w-full px-4 py-3 rounded-full bg-[#31499F] text-white"
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (t('actions.deleting') || 'Eliminando...') : (t('actions.delete') || 'Eliminar')}
          </button>
        </div>
      </div>
    </div>
  ) : (
    // Desktop: centered dialog
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative z-10 max-w-lg w-full mx-4 bg-white rounded-2xl shadow-2xl p-6 text-center">
        <div className="mx-6 my-4 rounded-x p-8">
          <button
            type="button"
            aria-label="Close"
            onClick={() => { setConfirmOpen(false); onClose() }}
            className="absolute top-8 right-8 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 hover:text-[#ff0000]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 8.586L15.95 2.636a1 1 0 011.414 1.414L11.414 10l5.95 5.95a1 1 0 01-1.414 1.414L10 11.414l-5.95 5.95A1 1 0 012.636 15.95L8.586 10 2.636 4.05A1 1 0 014.05 2.636L10 8.586z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="flex justify-center">
            <div className="rounded-full bg-[#f7f9ff] p-5 ">
              <X className="h-10 w-10 text-gray-500" />
            </div>
          </div>

          <h3 className="mt-6 text-3xl font-bold text-gray-900">{t('confirmDelete.title') || 'Eliminar'}</h3>
          <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-[520px] mx-auto">{t('confirmDelete.message', { name: itemName || '' })}</p>

          <div className="mt-10 pt-10 flex items-center justify-center gap-6">
            <button
              type="button"
              className="min-w-[170px] px-6 py-3 rounded-full bg-[#F7F9FF] hover:bg-[#fff9ff] text-sm text-[#31499F] "
              onClick={() => setConfirmOpen(false)}
              disabled={isProcessing}
            >
              {t('actions.cancel') || 'Cancelar'}
            </button>

            <button
              type="button"
              className="min-w-[170px] px-6 py-3 rounded-full bg-[#31499F] hover:bg-[#253a7a] text-[#F7F9FF] text-sm "
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? (t('actions.deleting') || 'Eliminando...') : (t('actions.delete') || 'Eliminar')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // For mobile, render the menu inside a backdrop container so it feels like a sheet/modal
  if (isMobile) {
    return createPortal(
      <>
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="absolute inset-x-0 bottom-0 z-50">{menu}</div>
        </div>
        {confirmOpen && overlay}
      </>,
      document.body,
    )
  }

  return createPortal(
    <>
      {menu}
      {confirmOpen && overlay}
    </>,
    document.body,
  )
}

export default RowActionsMenu
