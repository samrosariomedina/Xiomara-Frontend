"use client"

import { useRef, useState } from "react"
import { createPortal } from 'react-dom'
import { Edit, Trash2, MoreVertical } from "lucide-react"
import { type FC } from "react"
import { useTranslations } from 'next-intl'

interface DashboardRowActionsProps {
  onEdit?: () => void | Promise<void>
  onDelete?: () => void | Promise<void>
  onClose: () => void
  left?: number
  top?: number
  itemName?: string
  pageType?: "fuentes" | "knowledge" | "corresponsables"
  actions?: Array<"edit" | "delete">
}

export const DashboardRowActions: FC<DashboardRowActionsProps> = ({ 
  onEdit, 
  onDelete, 
  onClose, 
  left = 0, 
  top = 0, 
  itemName = '', 
  pageType = "fuentes",
  actions = ["edit", "delete"] 
}) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const t = useTranslations('DASHBOARD')

  // Get appropriate text based on page type
  const getEditText = () => {
    switch (pageType) {
      case "fuentes":
        return t('actions.editSource') || 'Editar Fuente'
      case "knowledge":
        return t('actions.editKnowledge') || 'Editar Knowledge Base'
      case "corresponsables":
        return t('actions.editCorresponsable') || 'Editar Corresponsable'
      default:
        return t('actions.edit') || 'Editar'
    }
  }

  const getDeleteText = () => {
    switch (pageType) {
      case "fuentes":
        return t('actions.deleteSource') || 'Eliminar Fuente'
      case "knowledge":
        return t('actions.deleteKnowledge') || 'Eliminar Knowledge Base'
      case "corresponsables":
        return t('actions.deleteCorresponsable') || 'Eliminar Corresponsable'
      default:
        return t('actions.delete') || 'Eliminar'
    }
  }

  const menu = (
    <div
      ref={ref}
      style={{ position: 'fixed', left, top }}
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
          <span className="whitespace-nowrap">{getEditText()}</span>
        </button>
      )}

      <div className="my-2 border-t text-gray-300" />

      {actions.includes('delete') && (
        <button
          className="flex items-center gap-3 w-full py-2 px-2 hover:bg-gray-50 rounded-md text-sm text-gray-700"
          onClick={() => setConfirmOpen(true)}
          type="button"
        >
          <Trash2 className="h-5 w-5 text-gray-700" />
          <span className="whitespace-nowrap">{getDeleteText()}</span>
        </button>
      )}
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
              <Trash2 className="h-10 w-10 text-gray-500" />
            </div>
          </div>

          <h3 className="mt-6 text-3xl font-bold text-gray-900">{t('confirmDelete.title') || 'Eliminar'}</h3>
          <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-[520px] mx-auto">
            {t('confirmDelete.message', { name: itemName || '' }) || `¿Estás seguro de que quieres eliminar ${itemName}?`}
          </p>

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

  return createPortal(
    <>
      {menu}
      {confirmOpen && overlay}
    </>,
    document.body,
  )
}

export default DashboardRowActions

