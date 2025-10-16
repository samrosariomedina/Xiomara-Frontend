'use client'
import React from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ClientFormHeaderProps {
  isEditMode: boolean
  onClose: () => void
  t: (key: string) => string
}

export const ClientFormHeader = React.memo(function ClientFormHeader({
  isEditMode,
  onClose,
  t
}: ClientFormHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-6 bg-white flex-shrink-0">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose} 
          className="p-1 h-8 w-8 hover:bg-gray-100"
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-medium text-gray-600">
          {isEditMode ? (t('editClient') || 'Edit Client') : (t('createClient') || 'Create Client')}
        </h2>
      </div>
    </div>
  )
})
