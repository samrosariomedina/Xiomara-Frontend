"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronDown, MoreVertical, Calendar } from "lucide-react"
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
import { EmptyFuentesGenerales } from "./icons/icons"

// const fuentesData = [
//   { id: 1, nombre: "Informe Q1", tipo: "PDF", contenido: "Análisis de mercado Q1", estado: "En uso", creadoPor: "Ana López", ultimaActualizacion: "16/06/2025" },
//   { id: 2, nombre: "Presentación Campaña", tipo: "PPT", contenido: "Material creativo campaña", estado: "En uso", creadoPor: "Carlos Ruiz", ultimaActualizacion: "10/06/2025" },
//   { id: 3, nombre: "Dataset Usuarios", tipo: "CSV", contenido: "Segmentación usuarios", estado: "En uso", creadoPor: "María Gómez", ultimaActualizacion: "01/06/2025" },
//   { id: 4, nombre: "Brief Producto", tipo: "DOCX", contenido: "Especificaciones del producto", estado: "En uso", creadoPor: "Luis Fernández", ultimaActualizacion: "22/05/2025" },
//   { id: 5, nombre: "Imagen Campaña 1", tipo: "IMG", contenido: "Banner principal", estado: "En uso", creadoPor: "Sofía Martínez", ultimaActualizacion: "16/04/2025" },
//   { id: 6, nombre: "Audio Spot", tipo: "MP3", contenido: "Spot radio 30s", estado: "En uso", creadoPor: "Jorge Díaz", ultimaActualizacion: "03/04/2025" },
//   { id: 7, nombre: "Guía de Estilo", tipo: "PDF", contenido: "Lineamientos de marca", estado: "En uso", creadoPor: "Lucía Pérez", ultimaActualizacion: "12/03/2025" },
//   { id: 8, nombre: "Reporte SEO", tipo: "PDF", contenido: "Keywords rendimiento", estado: "En uso", creadoPor: "Andrés Soto", ultimaActualizacion: "28/02/2025" },
//   { id: 9, nombre: "Notas de Prensa", tipo: "DOCX", contenido: "Lanzamiento producto", estado: "En uso", creadoPor: "Valentina Rivas", ultimaActualizacion: "14/02/2025" },
//   { id: 10, nombre: "Resumen Anual", tipo: "PDF", contenido: "Resultados 2024", estado: "En uso", creadoPor: "Miguel Torres", ultimaActualizacion: "01/01/2025" },
// ]
const fuentesData: Array<{
  id: number;
  nombre: string;
  tipo: string;
  contenido: string;
  estado: string;
  creadoPor: string;
  ultimaActualizacion: string;
}> = [] // Empty state

export function FuentesGeneralesSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState("Abril 2025");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [selectedSort, setSelectedSort] = useState("Recientes");
  const t = useTranslations('FUENTES')
  const router = useRouter()
  const pathname = usePathname()

  // Options for the dropdowns
  const dateOptions = [
    "Abril 2025",
    "Marzo 2025", 
    "Febrero 2025",
    "Enero 2025",
    "Diciembre 2024",
    "Noviembre 2024"
  ];

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
        <Checkbox id="select-all" className="h-4 w-4" />
        <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
      </div>

      <div className="relative flex-grow ">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 " />
  <Input placeholder={t('searchPlaceholder')} className="pl-10 h-9  max-w-xs bg-[#f7f9ff]" suppressHydrationWarning />
      </div>

      <div className="flex items-center space-x-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 bg-white border-gray-200"
            >
              <Calendar className="h-4 w-4 mr-1 text-gray-500" />
              <span className="text-sm">{selectedDate}</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {dateOptions.map((option) => (
              <DropdownMenuItem 
                key={option}
                onClick={() => setSelectedDate(option)}
                className={selectedDate === option ? "bg-blue-50 text-blue-900" : ""}
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
    {fuentesData.length === 0 ? (
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
        <div className="hidden sm:block overflow-x-auto mt-2 ">
          <table className="w-full">
            <thead className="bg-gray-50 ">
              <tr>
                <th className="px-6 py-3 text-left w-6">
                  <Checkbox />
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">{t('table.name')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">{t('table.type')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">{t('table.content')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">{t('table.status')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">{t('table.createdBy')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">{t('table.updatedAt')}</th>
                <th className="px-6 py-3 text-left w-6"></th>
              </tr>
            </thead>
            <tbody>
              {fuentesData.map((fuente) => (
                <tr key={fuente.id} className="hover:bg-gray-50 border-b border-gray-100">
                  <td className="px-6 py-3">
                    <Checkbox />
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{fuente.nombre}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{fuente.tipo}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{fuente.contenido}</td>
                  <td className="px-6 py-3">
                    <Badge variant="outline" className="text-[#192038] border-[#F7F9FF] bg-[#F7F9FF]">
                      {fuente.estado}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{fuente.creadoPor}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{fuente.ultimaActualizacion}</td>
                  <td className="px-6 py-3">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4 text-black" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile view - card layout (visible only on mobile and when expanded) */}
        <div className={`sm:hidden ${isExpanded ? 'block' : 'hidden'}`}>
          <div className="space-y-3 px-3">
            {fuentesData.map((fuente) => (
              <div key={fuente.id} className="bg-white border border-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Checkbox className="mt-1 h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{fuente.nombre}</p>
                      <p className="text-sm text-gray-600">{fuente.contenido}</p>
                      <p className="text-xs text-gray-500 mt-1">{fuente.tipo}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[#192038] border-[#F7F9FF] bg-[#F7F9FF]">
                      {fuente.estado}
                    </Badge>
                    <button className="text-gray-400">
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
</Card>
  )
}
