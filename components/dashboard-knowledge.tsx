"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { SectionHeader } from "@/components/ui/section-header"

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

  const headerActions = (
    <div className="hidden sm:flex items-center gap-4 h-full">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 rounded-full px-3 py-1 bg-white border border-gray-100"
      >
        <RefreshCw className="h-4 w-4 text-blue-600" />
        <span className="text-blue-600 text-sm">Actualizar</span>
      </Button>

      <Button variant="link" className="text-blue-600 text-sm p-0">
        Ver todos
      </Button>
    </div>
  )

  return (
  <Card className="bg-white border border-gray-200 shadow-sm flex flex-col overflow-hidden max-h-[70vh] md:max-h-[60vh] lg:h-[600px] lg:max-h-none">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0">
        <SectionHeader
          title="Knowledge Base"
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
          actions={headerActions}
        />
      </div>

  <div className={`${!isExpanded ? "hidden lg:block" : "block"} px-4 sm:px-6 py-3 sm:py-4 flex-1 overflow-y-auto hide-scrollbar`}>
        <div className="space-y-3 sm:space-y-4">
          {knowledgeItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-semibold">NC</div>
                <div>
                  <p className="text-xs text-gray-400">{item.name}</p>
                  <p className="text-sm font-medium text-gray-900">{item.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-400">{item.lastUpdate}</p>
                  <p className="text-sm font-medium text-gray-900">{item.time}</p>
                </div>

                <button className="text-gray-400 hover:text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                    <circle cx="12" cy="5" r="1.5" fill="#64748B"/>
                    <circle cx="12" cy="12" r="1.5" fill="#64748B"/>
                    <circle cx="12" cy="19" r="1.5" fill="#64748B"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
