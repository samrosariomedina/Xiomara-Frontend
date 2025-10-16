'use client'
import React from "react"
import { Button } from "@/components/ui/button"

interface ClientFormActionsProps {
  activeTab: string
  isEditMode: boolean
  isLoading: boolean
  onClose: () => void
  onSubmit: () => void
  t: (key: string) => string
}

export const ClientFormActions = React.memo(function ClientFormActions({
  activeTab,
  isEditMode,
  isLoading,
  onClose,
  onSubmit,
  t
}: ClientFormActionsProps) {
  const getButtonText = (): string => {
    if (isLoading) {
      return isEditMode ? (t('updating') || 'Updating...') : (t('creating') || 'Creating...')
    }
    
    if (activeTab === "general") {
      return isEditMode ? (t('form.update') || 'Update') : (t('form.submit') || 'Submit')
    }
    
    if (activeTab === "connect") {
      return t('correspondents.createCorresponsables') || 'Create Corresponsables'
    }
    
    return t('form.submit') || 'Submit'
  }

  return (
    <div className="mt-8 flex justify-end gap-3">
      <Button
        onClick={onClose}
        className="px-4 bg-[#f7f9ff] text-[#31499f] rounded-full hover:bg-[#e0e7ff]"
        disabled={isLoading}
      >
        {t('form.cancel')}
      </Button>
      <Button
        onClick={onSubmit}
        className="bg-[#31499f] hover:bg-blue-700 text-white rounded-full px-4"
        disabled={isLoading}
      >
        {getButtonText()}
      </Button>
    </div>
  )
})
