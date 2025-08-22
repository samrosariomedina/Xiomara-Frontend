"use client"

import React, { useState } from "react"
import { Plus, Search, Sliders, FileText, ImageIcon, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useTranslations } from 'next-intl'
// custom inline list rendering — keep component-specific imports above

export default function FuentesCard() {
  const t = useTranslations('FUENTES')
  const [sources, setSources] = useState<Array<{ name: string; type: "image" | "text" | "url"; category: string; timestamp: string }>>([])

  const handleFuentesOpen = () => {
    // add some dummy items when user clicks Add
    const dummy = Array.from({ length: 4 }).map((_, i) => ({
      name: `Imagen de campaña publicitaria ${i + 1}`,
      type: "image" as const,
      category: "Tecnologia",
      timestamp: "hace 2 horas",
    }))
    setSources((s) => [...s, ...dummy])
  }

  return (
    <div className="bg-white rounded-lg p-4 w-full shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Fuentes</h3>
        <Button onClick={handleFuentesOpen} className="inline-flex items-center text-[#31499f] bg-transparent hover:bg-[#f7f9ff] p-2" variant="ghost">
          <Plus className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">{t('form.addButton') || 'Agregar'}</span>
        </Button>
      </div>

  <div className="space-y-4 flex-1 min-h-0 flex flex-col">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </span>
                <Input placeholder="Buscar Fuentes" className="pl-10 bg-[#f8f9fa] border-gray-200 text-sm" />
              </div>
            </div>
            <button className="p-2 rounded-lg bg-[#f8f9fa] hover:bg-gray-100 text-gray-600 border border-gray-200" aria-label="filters">
              <Sliders className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <Select>
            <SelectTrigger className="w-full bg-white border border-gray-200 text-sm text-gray-600">
              <SelectValue placeholder="Agrupar por tema">Agrupar por tema</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="topic">Agrupar por tema</SelectItem>
              <SelectItem value="date">Fecha</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-6 border-b border-gray-200 mb-4">
          <button className="text-sm font-medium text-[#31499f] border-b-2 border-[#31499f] pb-2 px-1">
            Tus Fuentes
          </button>
          <button className="text-sm text-gray-500 flex items-center gap-2 pb-2 px-1">
            Fuentes externas 
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">50</span>
          </button>
        </div>

        {/* central content area: either empty-state or the list (scrollable) */}
        <div className="flex-1 min-h-0 flex flex-col">
          {sources.length === 0 ? (
            <div className="flex-1 min-h-0 flex items-center justify-center text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-300" />
                </div>
                <div>
                  <p className="text-base font-medium text-gray-700 mb-1">No se han agregado fuentes</p>
                  <p className="text-sm text-gray-500">Agrega fuentes para empezar</p>
                </div>
                <Button onClick={handleFuentesOpen} className="mt-2 inline-flex items-center space-x-2 bg-transparent text-[#31499f] hover:bg-[#f7f9ff] border border-transparent hover:border-[#31499f]" variant="outline">
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">Agregar fuentes</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-auto space-y-3">
              {sources.map((s, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" className="h-4 w-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate pr-2">{s.name}</h4>
                        <span className="text-xs text-gray-500 flex-shrink-0">{s.timestamp}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="inline-flex items-center text-xs text-[#31499f] gap-1 bg-[#f0f4ff] px-2 py-1 rounded">
                          <ImageIcon className="h-3 w-3" />
                          <span>Imagen</span>
                        </div>
                        <span className="text-xs text-gray-600 font-medium">{s.category}</span>
                      </div>
                    </div>

                    <button className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0">
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  {/* list rendering is now inside the main flex area so it shares the same scrollable space as the empty state */}
    </div>
  )
}