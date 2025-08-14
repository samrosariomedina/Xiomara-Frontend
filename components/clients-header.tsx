import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from 'next-intl'

export function ClientsHeader() {
  const t = useTranslations('CLIENTS')

  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-4xl font-bold text-gray-900">{t('title')}</h1>

      <Button className="bg-[#31499F] hover:bg-[#2b3f8f] text-white rounded-full">
        <Plus className="h-5 w-5 mr-2" />
        {t('createClient')}
      </Button>
    </div>
  )
}
