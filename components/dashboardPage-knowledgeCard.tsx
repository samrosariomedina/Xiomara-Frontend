"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreVertical, RefreshCw } from "lucide-react"
import { useState } from "react"
import { SectionHeader } from "@/components/ui/dashboardCards-header"
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'

const knowledgeItems = [
  { id: 1, name: "Cómo configurar X", type: "Knowledge base", lastUpdate: "Última actualización", time: "2 horas" },
  { id: 2, name: "Guía de usuario Y", type: "Knowledge base", lastUpdate: "Última actualización", time: "3 horas" },
  { id: 3, name: "FAQ Z", type: "Knowledge base", lastUpdate: "Última actualización", time: "5 horas" },
  { id: 4, name: "Procedimiento de soporte", type: "Knowledge base", lastUpdate: "Última actualización", time: "1 día" },
  { id: 5, name: "Onboarding cliente", type: "Knowledge base", lastUpdate: "Última actualización", time: "2 días" },
  { id: 6, name: "Política de privacidad", type: "Knowledge base", lastUpdate: "Última actualización", time: "1 semana" },
  { id: 7, name: "Checklist de lanzamiento", type: "Knowledge base", lastUpdate: "Última actualización", time: "3 semanas" },
  { id: 8, name: "Plantilla reportes", type: "Knowledge base", lastUpdate: "Última actualización", time: "1 mes" },
  { id: 9, name: "Manual técnico", type: "Knowledge base", lastUpdate: "Última actualización", time: "2 meses" },
  { id: 10, name: "Glosario", type: "Knowledge base", lastUpdate: "Última actualización", time: "6 meses" },
]

export function KnowledgeBaseSection() {
  const [isExpanded, setIsExpanded] = useState(false)
  const t = useTranslations('KNOWLEDGE')
  const router = useRouter()
  const params = useParams() as { locale?: string } | undefined
  const locale = params?.locale

  const goToKnowledgeList = () => {
    const path = locale ? `/${locale}/lists/knowledge-page` : '/lists/knowledge-page'
    router.push(path)
  }

  const headerActions = (
    // show actions only on large screens; md should behave like mobile
    <div className="hidden lg:flex items-center gap-4 h-full">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 rounded-full px-3 py-1 bg-[#f7f9ff] border border-white"
      >
        <RefreshCw className="h-4 w-4 text-[#31499F]" />
        <span className="text-[#31499F] text-sm">{t('refresh')}</span>
      </Button>

      <Button variant="link" className="text-[#192038] underline text-sm p-0 cursor-pointer hover:no-underline" onClick={goToKnowledgeList}>
        {t('viewAll')}
      </Button>
    </div>
  )

  return (
    <Card className="bg-white border border-gray-200 shadow-sm flex flex-col overflow-hidden max-h-[85vh] md:max-h-[75vh] lg:h-[600px] lg:max-h-none">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0">
        <SectionHeader
          title={t('title')}
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
          actions={headerActions}
        />
      </div>



      <div className={`${!isExpanded ? "hidden lg:block" : "block"} px-4 sm:px-6 sm:py-4 flex-1 overflow-y-auto hide-scrollbar`}> 
  <div className="space-y-3 sm:space-y-4">
          {knowledgeItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-200" />
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-semibold">NC</div>
                <div>
      <p className="text-xs text-gray-400">{item.name}</p>
      <p className="text-sm font-medium text-gray-900">{t('type')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-400">{t('lastUpdate')}</p>
                  <p className="text-sm font-medium text-start text-gray-900">{item.time}</p>
                </div>

                <MoreVertical className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* bottom link for mobile/md; header contains 'Ver todos' on lg
          hide this bottom link when the section is collapsed */}
      <div className={`${!isExpanded ? "hidden lg:block" : "block"} px-4 sm:px-6   border-gray-100`}>
        <div className="text-center lg:hidden">
          <Button variant="link" className="text-[#192038] underline text-sm cursor-pointer hover:no-underline" onClick={goToKnowledgeList}>
            {t('viewAll')}
          </Button>
        </div>
      </div>
    </Card>
  )
}
