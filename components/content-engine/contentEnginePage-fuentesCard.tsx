"use client"

import React, { useState } from "react"
import { Plus, Search,  FileText, ImageIcon, SlidersHorizontal, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Drawer } from "@/components/ui/drawer"
import { SourcesDrawerForm } from "@/components/SourcesDrawerForm"
import { useTranslations } from 'next-intl'
import type { SourceResponse } from '@/lib/schemas'
// custom inline list rendering — keep component-specific imports above

interface FuentesCardProps {
  sources: SourceResponse[]
  filteredSources: SourceResponse[]
  selectedSourceIds: string[]
  isLoading: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
  onSourceSelection: (sourceId: string, isSelected: boolean) => void
  onSourceAdded: () => void
  folderId: string
}

export default function FuentesCard({
  sources,
  filteredSources,
  selectedSourceIds,
  isLoading,
  searchQuery,
  onSearchChange,
  onSourceSelection,
  onSourceAdded,
  folderId
}: FuentesCardProps) {
  const t = useTranslations('FUENTES')
  const [selectedGroup, setSelectedGroup] = useState("topic")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  
  console.log('Sources in FuentesCard:', sources.length)

  // Group options
  const groupOptions = [
    { value: "topic", label: "Agrupar por tema" },
    { value: "date", label: "Fecha" }
  ]

  const getGroupLabel = () => {
    const found = groupOptions.find(opt => opt.value === selectedGroup)
    return found ? found.label : "Agrupar por tema"
  }

  const handleFuentesOpen = () => {
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
  }

  const handleSourceAdded = async () => {
    // Call parent handler to refresh sources
    onSourceAdded()
  }

  return (
    <>
    <div className="bg-white rounded-lg p-3 md:p-4 w-full shadow-sm h-full flex flex-col">
      <style>{`.fuentes-scroll::-webkit-scrollbar{display:none;} .fuentes-scroll{-ms-overflow-style:none; scrollbar-width:none;}`}</style>
      <div className="flex items-center justify-between mb-3 md:mb-4 lg:mb-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-900">Fuentes</h3>
        <Button onClick={handleFuentesOpen} className="inline-flex items-center text-[#31499f] bg-[#f7f9ff] hover:bg-[#e7e9ff] p-1.5 md:p-2 rounded-full text-xs md:text-sm" variant="ghost">
          <Plus className="h-3 w-3 md:h-4 md:w-4 mr-0.5 md:mr-1" />
          <span className="font-medium hidden sm:inline">{t('form.addButton') || 'Agregar'}</span>
        </Button>
      </div>

  <div className="space-y-3 md:space-y-4 flex-1 min-h-0 flex flex-col">
        <div>
          <div className="flex items-center gap-1 md:gap-1 mb-3 md:mb-4">
            <div className="flex-1">
              <div className="relative">
                <span className="absolute inset-y-0 left-2 md:left-3 flex items-center pointer-events-none">
                  <Search className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                </span>
                <Input 
                  placeholder="Buscar Fuentes" 
                  className="pl-8 md:pl-10 bg-[#f7f9ff] border-gray-200 text-xs md:text-sm h-8 md:h-10" 
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  suppressHydrationWarning 
                />
              </div>
            </div>
            <button className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 text-gray-600" aria-label="filters">
              <SlidersHorizontal className="h-3 w-3 md:h-4 md:w-4" />
            </button>
          </div>
        </div>

        <div className="mb-3 md:mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full bg-white border border-gray-200 text-xs md:text-sm text-gray-600 h-8 md:h-10 justify-between"
              >
                {getGroupLabel()}
                <ChevronDown className="h-3 w-3 md:h-4 md:w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[200px]">
              {groupOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSelectedGroup(option.value)}
                  className="cursor-pointer"
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-around border-b border-gray-200 mb-3 md:mb-4">
          <button className="text-xs md:text-sm font-medium text-[#31499f] border-b-2 border-[#31499f] pb-1.5 md:pb-2 px-1">
            Tus Fuentes
          </button>
          <button className="text-xs md:text-sm text-gray-500 flex items-center gap-1 md:gap-2 pb-1.5 md:pb-2 px-1">
            <span className="hidden sm:inline">Fuentes externas</span>
            <span className="sm:hidden">Externas</span>
            <span className="bg-gray-100 text-gray-600 px-1.5 md:px-2 py-0.5 rounded-full text-xs font-medium">50</span>
          </button>
        </div>

        {/* central content area: either empty-state or the list (scrollable) */}
        <div className="flex-1 min-h-0 flex flex-col">
          {isLoading ? (
            <div className="flex-1 min-h-0 flex items-center justify-center text-center">
              <div className="flex flex-col items-center gap-3 md:gap-4 px-2">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-2 border-[#31499f] border-t-transparent"></div>
                </div>
                <div>
                  <p className="text-sm md:text-base font-medium text-gray-700 mb-1">Cargando fuentes...</p>
                  <p className="text-xs md:text-sm text-gray-500">Obteniendo tus fuentes</p>
                </div>
              </div>
            </div>
          ) : filteredSources.length === 0 ? (
            <div className="flex-1 min-h-0 flex items-center justify-center text-center">
              <div className="flex flex-col items-center gap-3 md:gap-4 px-2">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 md:h-8 md:w-8 text-gray-300" />
                </div>
                <div>
                  <p className="text-sm md:text-base font-medium text-gray-700 mb-1">No se han agregado fuentes</p>
                  <p className="text-xs md:text-sm text-gray-500">Agrega fuentes para empezar</p>
                </div>
                <Button onClick={handleFuentesOpen} className="mt-2 inline-flex items-center space-x-1 md:space-x-2 bg-[#f7f9ff] text-[#31499f] hover:bg-[#f0f4ff] border border-transparent hover:border-[#31499f] rounded-full px-3 md:px-4 py-2 text-xs md:text-sm" variant="outline">
                  <Plus className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="font-medium">Agregar fuentes</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-auto space-y-2 md:space-y-3 fuentes-scroll" style={{ WebkitOverflowScrolling: 'touch' }}>
              {filteredSources
                .sort((a, b) => {
                  // Sort by timestamp in reverse chronological order (newest first)
                  const dateA = new Date(a.timestamp || 0).getTime()
                  const dateB = new Date(b.timestamp || 0).getTime()
                  return dateB - dateA
                })
                .map((source, idx) => (
                <div 
                  key={source._id || idx} 
                  className="bg-white border border-gray-200 rounded-lg p-2 md:p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    const isSelected = selectedSourceIds.includes(source._id || '')
                    onSourceSelection(source._id || '', !isSelected)
                  }}
                >
                  <div className="flex items-start gap-2 md:gap-3">
                    <input 
                      type="checkbox" 
                      className="h-3 w-3 md:h-4 md:w-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 pointer-events-none"
                      checked={selectedSourceIds.includes(source._id || '')}
                      readOnly
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1.5 md:mb-2">
                        <h4 className="text-xs md:text-sm font-medium text-gray-900 truncate pr-1 md:pr-2">{source.title || 'Sin título'}</h4>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {source.timestamp ? new Date(source.timestamp).toLocaleDateString() : 'Sin fecha'}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start gap-2 md:gap-3">
                        <div className="inline-flex items-center text-xs text-[#31499f] gap-1">
                          {source.type === 'file' ? (
                            <FileText className="h-3 w-3" />
                          ) : source.type === 'webpage' ? (
                            <ImageIcon className="h-3 w-3" />
                          ) : (
                            <FileText className="h-3 w-3" />
                          )}
                          <span>
                            {source.type === 'file' ? 'Archivo' : 
                             source.type === 'webpage' ? 'Web' : 
                             source.type === 'text' ? 'Texto' : 'Fuente'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600 font-medium bg-[#f0f4ff] px-1.5 py-0.5 md:p-1 rounded-full">
                          {source.type === 'file' ? 'Archivo' : 
                           source.type === 'webpage' ? 'Web' : 
                           source.type === 'text' ? 'Texto' : 'General'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  {/* list rendering is now inside the main flex area so it shares the same scrollable space as the empty state */}
    </div>
    
    {/* Sources Drawer */}
    <Drawer
      isOpen={isDrawerOpen}
      onClose={handleDrawerClose}
      title="Agregar Fuente"
    >
      <SourcesDrawerForm
        onClose={handleDrawerClose}
        onSuccess={handleSourceAdded}
        folderId={folderId}
      />
    </Drawer>
  </>
  )
}