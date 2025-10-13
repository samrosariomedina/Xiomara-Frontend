"use client"

import { Users, Plus } from "lucide-react"
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  onCreateClient: () => void
}

export function EmptyState({ onCreateClient }: EmptyStateProps) {
  const t = useTranslations('CLIENTS')
  
  return (
    <>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-6">
          <Users className="h-16 w-16 text-gray-300 mx-auto" />
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('empty')}</h3>

        <p className="text-gray-500 text-sm mb-6">{t('emptyAction')}</p>
        
        <Button 
          className="bg-[#31499F] hover:bg-[#2b3f8f] text-white rounded-full" 
          onClick={onCreateClient}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('createClient')}
        </Button>
      </div>
    </>
  )
}
