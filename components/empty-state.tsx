import { Users } from "lucide-react"
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  onAction?: () => void
}

export function EmptyState({ onAction }: EmptyStateProps) {
  const t = useTranslations('CLIENTS')
  
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6">
        <Users className="h-16 w-16 text-gray-300 mx-auto" />
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">{t('empty')}</h3>

      <p className="text-gray-500 text-sm mb-4">{t('emptyAction')}</p>
      
    </div>
  )
}
