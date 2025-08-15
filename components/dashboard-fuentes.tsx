"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronDown, MoreVertical, Calendar, ChevronUp } from "lucide-react"
import { useState } from "react"

const fuentesData = [
  { id: 1, nombre: "Informe Q1", tipo: "PDF", contenido: "Análisis de mercado Q1", estado: "En uso", creadoPor: "Ana López", ultimaActualizacion: "16/06/2025" },
  { id: 2, nombre: "Presentación Campaña", tipo: "PPT", contenido: "Material creativo campaña", estado: "En uso", creadoPor: "Carlos Ruiz", ultimaActualizacion: "10/06/2025" },
  { id: 3, nombre: "Dataset Usuarios", tipo: "CSV", contenido: "Segmentación usuarios", estado: "En uso", creadoPor: "María Gómez", ultimaActualizacion: "01/06/2025" },
  { id: 4, nombre: "Brief Producto", tipo: "DOCX", contenido: "Especificaciones del producto", estado: "En uso", creadoPor: "Luis Fernández", ultimaActualizacion: "22/05/2025" },
  { id: 5, nombre: "Imagen Campaña 1", tipo: "IMG", contenido: "Banner principal", estado: "En uso", creadoPor: "Sofía Martínez", ultimaActualizacion: "16/04/2025" },
  { id: 6, nombre: "Audio Spot", tipo: "MP3", contenido: "Spot radio 30s", estado: "En uso", creadoPor: "Jorge Díaz", ultimaActualizacion: "03/04/2025" },
  { id: 7, nombre: "Guía de Estilo", tipo: "PDF", contenido: "Lineamientos de marca", estado: "En uso", creadoPor: "Lucía Pérez", ultimaActualizacion: "12/03/2025" },
  { id: 8, nombre: "Reporte SEO", tipo: "PDF", contenido: "Keywords rendimiento", estado: "En uso", creadoPor: "Andrés Soto", ultimaActualizacion: "28/02/2025" },
  { id: 9, nombre: "Notas de Prensa", tipo: "DOCX", contenido: "Lanzamiento producto", estado: "En uso", creadoPor: "Valentina Rivas", ultimaActualizacion: "14/02/2025" },
  { id: 10, nombre: "Resumen Anual", tipo: "PDF", contenido: "Resultados 2024", estado: "En uso", creadoPor: "Miguel Torres", ultimaActualizacion: "01/01/2025" },
]

export function FuentesGeneralesSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
  <Card className="bg-white border border-gray-200 shadow-sm flex flex-col overflow-hidden max-h-[70vh] md:max-h-[60vh] lg:h-[700px]">
      {/* Header with toggle functionality */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Fuentes Generales</h3>
          
          <div className="flex items-center">
            {/* Desktop "Ver todos" button - hidden on mobile */}
            <Button variant="link" className="hidden sm:block text-blue-600 text-sm p-0">
              Ver todos
            </Button>
            
            {/* Mobile dropdown toggle - positioned on the right */}
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="sm:hidden text-gray-500 hover:text-gray-700 ml-4"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable content area (keeps card height consistent; contents scroll). hide-scrollbar hides native scrollbars */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* Desktop filtering toolbar - hidden on mobile */}
        <div className="hidden sm:flex items-center gap-4 px-6 py-3 border-b border-gray-100">
        <div className="flex items-center">
          <Checkbox id="select-all" className="h-4 w-4" />
          <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
        </div>
        
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Buscar Fuentes" className="pl-10 h-9 max-w-xs" />
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 bg-white border-gray-200"
          >
            <Calendar className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-sm">Abril 2025</span>
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 bg-white border-gray-200"
          >
            <span className="text-sm">Estado</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 bg-white border-gray-200"
          >
            <span className="text-sm">Recientes</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

  {/* Desktop view - table layout (hidden on mobile) */}
  <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left w-6">
                <Checkbox />
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Tipo</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Contenido</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Estado</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Creado por</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Última actualización</th>
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
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
  {/* Mobile view - card layout (visible only on mobile and when expanded) */}
  <div className={`sm:hidden ${isExpanded ? 'block' : 'hidden'}`}>
        <div className="divide-y divide-gray-100">
          {fuentesData.map((fuente) => (
            <div key={fuente.id} className="px-4 py-3">
              <div className="flex items-start">
                <Checkbox className="mt-1 h-4 w-4 mr-3" />
                <div className="flex-grow">
                  <p className="font-medium text-gray-900">{fuente.nombre}</p>
                  <p className="text-sm text-gray-600">{fuente.contenido}</p>
                  <p className="text-xs text-gray-500 mt-1">{fuente.tipo}</p>
                </div>
                <div className="flex flex-col items-end ml-3">
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-[#192038] border-[#F7F9FF] bg-[#F7F9FF]">
                      {fuente.estado}
                    </Badge>
                    <button className="text-gray-400 ml-3">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* "Ver todos" link at bottom of mobile view */}
        <div className="p-4 text-center border-t border-gray-100">
          <Button variant="link" className="text-blue-600 text-sm p-0">
            Ver todos
          </Button>
        </div>
        </div>
      </div>
    </Card>
  )
}
