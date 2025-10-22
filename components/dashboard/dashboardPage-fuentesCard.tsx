"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronDown, MoreVertical } from "lucide-react"
import { DashboardRowActions } from "@/components/ui/dashboard-rowActions"
import { SectionHeader } from "@/components/ui/dashboardCards-header"
import { useState } from "react"
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { routes, getLocalizedRouteFromPathname } from '@/lib/routes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyFuentesGenerales } from "../icons/icons"
import { formatDateSafe } from '@/lib/utils'
import type { SourceResponse } from '@/lib/schemas'

interface FuentesGeneralesSectionProps {
  sources: SourceResponse[]
  onEdit: (source: SourceResponse) => void
  onDelete: (sourceId: string) => Promise<void>
}

export function FuentesGeneralesSection({ sources, onEdit, onDelete }: FuentesGeneralesSectionProps) {
  // Transform sources to fuentesData format - no caching
  const fuentesData = sources.map((source, index) => ({
    id: index + 1,
    nombre: source.title || 'Sin título',
    tipo: source.type === 'generales' ? 'General' : source.type,
    contenido: source.content || 'Sin contenido',
    estado: source.edited ? 'Editado' : 'En uso',
    creadoPor: 'Sistema', // Default since user info is not available in current schema
    ultimaActualizacion: formatDateSafe(source.timestamp),
  }))
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [selectedSort, setSelectedSort] = useState("Recientes");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [menuOpen, setMenuOpen] = useState<{sourceId: string, left: number, top: number} | null>(null)
  const t = useTranslations('FUENTES')
  const router = useRouter()
  const pathname = usePathname()

  const statusOptions = [
    "Todos",
    "En uso",
    "Pendiente", 
    "Inactivo",
    "Archivado"
  ];

  const sortOptions = [
    "Recientes",
    "Más antiguos",
    "A-Z",
    "Z-A",
    "Por tipo",
    "Por autor"
  ];

  const goToFuentesList = () => {
    const localizedRoute = getLocalizedRouteFromPathname(routes.clients.dashboards.fuentes, pathname || '/')
    router.push(localizedRoute)
  }

  // Filter and sort data
  const filteredData = fuentesData.filter(fuente => {
    const matchesSearch = searchTerm === "" || 
      fuente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fuente.contenido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fuente.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "Todos" || fuente.estado === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    switch (selectedSort) {
      case "Recientes":
        return new Date(b.ultimaActualizacion).getTime() - new Date(a.ultimaActualizacion).getTime();
      case "Más antiguos":
        return new Date(a.ultimaActualizacion).getTime() - new Date(b.ultimaActualizacion).getTime();
      case "A-Z":
        return a.nombre.localeCompare(b.nombre);
      case "Z-A":
        return b.nombre.localeCompare(a.nombre);
      case "Por tipo":
        return a.tipo.localeCompare(b.tipo);
      case "Por autor":
        return a.creadoPor.localeCompare(b.creadoPor);
      default:
        return 0;
    }
  });

  // Handle select all functionality
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedRows(sortedData.map(item => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  // Handle individual row selection
  const handleRowSelection = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => [...prev, id]);
    } else {
      setSelectedRows(prev => prev.filter(rowId => rowId !== id));
    }
  };

  return (
  <Card className="bg-white border border-gray-200 shadow-sm flex flex-col overflow-hidden max-h-[85vh] md:max-h-[75vh] lg:h-[600px] lg:max-h-none">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0">
        <SectionHeader
          title={t('title')}
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
          actions={(
            <div className="hidden lg:flex items-center gap-4 h-full">
              <Button variant="link" className="text-[#192038] underline text-sm p-0 cursor-pointer hover:no-underline" onClick={goToFuentesList}>
                {t('viewAll')}
              </Button>
            </div>
          )}
        />
      </div>
      <>
    {/* Desktop filtering toolbar - hidden on mobile */}
    <div className="hidden sm:flex items-center gap-4 px-6 py-2  top-0 z-10 bg-white  ">
      <div className="flex items-center">
        <Checkbox 
          id="select-all" 
          className="h-4 w-4" 
          checked={selectAll}
          onCheckedChange={handleSelectAll}
        />
        <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
      </div>

      <div className="relative flex-grow ">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 " />
        <Input 
          placeholder={t('searchPlaceholder')} 
          className="pl-10 h-9 max-w-xs bg-[#f7f9ff]" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          suppressHydrationWarning 
        />
      </div>

      <div className="flex items-center space-x-3">

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 bg-white border-gray-200"
            >
              <span className="text-sm">{selectedStatus}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            {statusOptions.map((option) => (
              <DropdownMenuItem 
                key={option}
                onClick={() => setSelectedStatus(option)}
                className={selectedStatus === option ? "bg-blue-50 text-blue-900" : ""}
              >
                {option}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 bg-white border-gray-200"
            >
              <span className="text-sm">{selectedSort}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            {sortOptions.map((option) => (
              <DropdownMenuItem 
                key={option}
                onClick={() => setSelectedSort(option)}
                className={selectedSort === option ? "bg-blue-50 text-blue-900" : ""}
              >
                {option}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    </>

  {/* Scrollable content area (keeps card height consistent; contents scroll). hide-scrollbar hides native scrollbars */}
  <div className={`${!isExpanded ? 'hidden lg:block' : 'block'} px-2 sm:px-4   flex-1 overflow-y-auto hide-scrollbar min-h-0`}>
    {sortedData.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center">
          <EmptyFuentesGenerales className="mb-4" />
          <p className="text-sm text-gray-500 text-center mb-2">
            {t('emptyState')}
          </p>
          <p className="text-xs text-gray-400 text-center">
            {t('emptySubtitle')}
          </p>
        </div>
      </div>
    ) : (
      <>
        {/* Desktop view - table layout (hidden on mobile) */}
        <div className="hidden sm:block overflow-x-auto overflow-y-auto mt-2 max-h-96">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left w-6">
                  <Checkbox 
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900 w-32">{t('table.name')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900 w-20">{t('table.type')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900 w-64">{t('table.content')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900 w-24">{t('table.status')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900 w-28">{t('table.createdBy')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900 w-32">{t('table.updatedAt')}</th>
                <th className="px-6 py-3 text-left w-6"></th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((fuente) => (
                <tr key={fuente.id} className="hover:bg-gray-50 border-b border-gray-100">
                  <td className="px-6 py-3">
                    <Checkbox 
                      checked={selectedRows.includes(fuente.id)}
                      onCheckedChange={(checked) => handleRowSelection(fuente.id, checked as boolean)}
                    />
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900 truncate" title={fuente.nombre}>
                    {fuente.nombre}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600 truncate" title={fuente.tipo}>
                    {fuente.tipo}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    <div className="max-w-64 overflow-hidden">
                      <p className="truncate" title={fuente.contenido}>
                        {fuente.contenido}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant="outline" className="text-[#192038] border-[#F7F9FF] bg-[#F7F9FF] text-xs">
                      {fuente.estado}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600 truncate" title={fuente.creadoPor}>
                    {fuente.creadoPor}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600 truncate" title={fuente.ultimaActualizacion}>
                    {fuente.ultimaActualizacion}
                  </td>
                  <td className="px-6 py-3">
                    <button 
                      className="text-gray-400 hover:text-gray-600"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const source = sources[fuente.id - 1]
                        if (source) {
                          setMenuOpen({
                            sourceId: source._id,
                            left: rect.left,
                            top: rect.bottom + 8
                          })
                        }
                      }}
                    >
                      <MoreVertical className="h-4 w-4 text-black" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile view - card layout (visible only on mobile and when expanded) */}
        <div className={`sm:hidden ${isExpanded ? 'block' : 'hidden'} overflow-y-auto max-h-96`}>
          <div className="space-y-3 px-3">
            {sortedData.map((fuente) => (
              <div key={fuente.id} className="bg-white border border-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Checkbox 
                      className="mt-1 h-4 w-4 flex-shrink-0"
                      checked={selectedRows.includes(fuente.id)}
                      onCheckedChange={(checked) => handleRowSelection(fuente.id, checked as boolean)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate" title={fuente.nombre}>
                        {fuente.nombre}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2" title={fuente.contenido}>
                        {fuente.contenido}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate" title={fuente.tipo}>
                        {fuente.tipo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="outline" className="text-[#192038] border-[#F7F9FF] bg-[#F7F9FF] text-xs">
                      {fuente.estado}
                    </Badge>
                    <button 
                      className="text-gray-400"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const source = sources[fuente.id - 1]
                        if (source) {
                          setMenuOpen({
                            sourceId: source._id,
                            left: rect.left,
                            top: rect.bottom + 8
                          })
                        }
                      }}
                    >
                      <MoreVertical className="h-4 w-4 text-black" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    )}
  </div>

  {/* bottom 'Ver todos' for mobile/md; header shows it on lg
      placed outside the scroll area so it stays pinned to the card bottom */}
  <div className={`${isExpanded ? 'block' : 'hidden'} px-4 sm:px-6 py-3 border-t border-gray-100 lg:hidden flex-shrink-0`}>
      <div className="text-center">
      <Button variant="link" className="text-[#192038] underline text-sm p-0 cursor-pointer hover:no-underline" onClick={goToFuentesList}>
        {t('viewAll')}
      </Button>
    </div>
  </div>

  {/* Three-dot menu */}
  {menuOpen && (
    <DashboardRowActions
      onEdit={() => {
        const source = sources.find(s => s._id === menuOpen.sourceId)
        if (source) {
          onEdit(source)
        }
      }}
      onDelete={async () => {
        await onDelete(menuOpen.sourceId)
        setMenuOpen(null)
      }}
      onClose={() => setMenuOpen(null)}
      left={menuOpen.left}
      top={menuOpen.top}
      itemName={sources.find(s => s._id === menuOpen.sourceId)?.title || 'Source'}
      pageType="fuentes"
    />
  )}
</Card>
  )
}
