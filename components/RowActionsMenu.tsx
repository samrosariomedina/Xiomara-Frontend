"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from 'react-dom'
import { Edit, FilePlus, Trash2, X } from "lucide-react"
import { type FC } from "react"
import { useTranslations } from 'next-intl'

interface RowActionsMenuProps {
  onEdit?: () => void
  onAddSource?: () => void
  onDelete?: () => void | Promise<void>
  onClose: () => void
  left?: number
  top?: number
  itemName?: string
}

export const RowActionsMenu: FC<RowActionsMenuProps> = ({ onEdit, onAddSource, onDelete, onClose, left = 0, top = 0, itemName = '' }) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const t = useTranslations('CLIENTS')

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [onClose])

  const menu = (
    <div ref={ref} style={{ position: 'fixed', left, top }} className="z-50 w-52 rounded-lg border bg-white shadow-lg p-3">
      <button
        className="flex items-center gap-3 w-full py-2 px-2 hover:bg-gray-50 rounded-md text-sm text-gray-800"
        onClick={() => { onEdit?.(); onClose() }}
        type="button"
      >
        <Edit className="h-5 w-5 text-gray-700" />
        <span className="whitespace-nowrap">{t('actions.editCampaign') || 'Editar Campaña'}</span>
      </button>

      <button
        className="flex items-center gap-3 w-full py-2 px-2 hover:bg-gray-50 rounded-md text-sm text-gray-800"
        onClick={() => { onAddSource?.(); onClose() }}
        type="button"
      >
        <FilePlus className="h-5 w-5 text-gray-700" />
        <span className="whitespace-nowrap">{t('actions.addSource') || 'Agregar Fuente'}</span>
      </button>

      <div className="my-2 border-t" />

      <button
        className="flex items-center gap-3 w-full py-2 px-2 hover:bg-gray-50 rounded-md text-sm text-red-600"
        onClick={() => { setConfirmOpen(true) }}
        type="button"
      >
        <Trash2 className="h-5 w-5 text-red-500" />
        <span className="whitespace-nowrap">{t('actions.delete') || 'Eliminar'}</span>
      </button>
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

  const overlay = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative z-10 max-w-lg w-full mx-4 bg-white rounded-2xl shadow-2xl p-6 text-center">
        {/* inner dashed border to match reference */}
        <div className="mx-6 my-4 rounded-x p-8">
        {/* top-right close button (small square) */}
        <button
          type="button"
          aria-label="Close"
          onClick={() => { setConfirmOpen(false); onClose() }}
          className="absolute top-5 right-5 rounded hover:bg-gray-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 8.586L15.95 2.636a1 1 0 011.414 1.414L11.414 10l5.95 5.95a1 1 0 01-1.414 1.414L10 11.414l-5.95 5.95A1 1 0 012.636 15.95L8.586 10 2.636 4.05A1 1 0 014.05 2.636L10 8.586z" clipRule="evenodd" />
          </svg>
        </button>

        {/* subtle circular icon above title (gray, not blue) */}
          <div className="flex justify-center">
            <div className="rounded-full bg-white p-5 shadow-sm">
              <X className="h-10 w-10 text-gray-500" />
            </div>
          </div>

          <h3 className="mt-6 text-3xl font-bold text-gray-900">{t('confirmDelete.title') || 'Eliminar'}</h3>
          <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-[520px] mx-auto">{t('confirmDelete.message', { name: itemName || '' })}</p>

          <div className="mt-10 pt-10 flex items-center justify-center gap-6">
          <button
            type="button"
            className="min-w-[140px] px-6 py-3 rounded-full bg-[#F7F9FF] text-sm text-[#31499F] shadow-sm"
            onClick={() => setConfirmOpen(false)}
            disabled={isProcessing}
          >
            {t('actions.cancel') || 'Cancelar'}
          </button>

          <button
            type="button"
            className="min-w-[140px] px-6 py-3 rounded-full bg-[#31499F] text-[#F7F9FF] text-sm shadow"
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

  return createPortal(
    <>
      {menu}
      {confirmOpen && overlay}
    </>,
    document.body,
  )
}

export default RowActionsMenu
