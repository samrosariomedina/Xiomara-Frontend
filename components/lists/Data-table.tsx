"use client"

import type React from "react"

import { useState } from "react"
import { Search, ChevronDown, MoreHorizontal, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export interface Column {
  key: string
  label: string
  width?: string
  render?: (value: any, row: any) => React.ReactNode
}

export interface DataTableProps {
  columns: Column[]
  data: any[]
  searchPlaceholder?: string
  showFilters?: boolean
  showTabs?: boolean
  tabs?: { key: string; label: string }[]
  activeTab?: string
  onTabChange?: (tab: string) => void
  cardType?: "corresponsales" | "fuentes" | "knowledge-base"
  showAddButton?: boolean
  addButtonText?: string
  showUpdateButton?: boolean
}

export function DataTable({
  columns,
  data,
  searchPlaceholder = "Buscar Fuentes",
  showFilters = true,
  showTabs = false,
  tabs = [],
  activeTab,
  onTabChange,
  cardType = "fuentes",
  showAddButton = false,
  addButtonText = "Crear",
  showUpdateButton = false,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredData = data.filter((row) =>
    Object.values(row).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const toggleRowSelection = (index: number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedRows(newSelected)
  }

  const toggleAllSelection = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginatedData.map((_, index) => index)))
    }
  }

  const renderCellContent = (column: Column, value: any, row: any) => {
    if (column.render) {
      return column.render(value, row)
    }

    // Handle status badges
    if (column.key === "estado" || column.key === "status") {
      const statusColors: Record<string, string> = {
        Activo: "bg-green-100 text-green-800",
        Pendiente: "bg-orange-100 text-orange-800",
        "En uso": "bg-blue-100 text-blue-800",
        Inactivo: "bg-gray-100 text-gray-800",
        Acrobato: "bg-green-100 text-green-800",
      }

      return <Badge className={`${statusColors[value] || "bg-gray-100 text-gray-800"} border-0`}>{value}</Badge>
    }

    return value
  }

  const renderMobileCard = (row: any, index: number) => {
    const statusColors: Record<string, string> = {
      Activo: "bg-green-100 text-green-800",
      Pendiente: "bg-orange-100 text-orange-800",
      "En uso": "bg-blue-100 text-blue-800",
      Inactivo: "bg-gray-100 text-gray-800",
      Acrobato: "bg-green-100 text-green-800",
    }

    if (cardType === "corresponsales") {
      return (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Checkbox checked={selectedRows.has(index)} onCheckedChange={() => toggleRowSelection(index)} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{row.nombre}</h3>
                    <p className="text-sm text-gray-600">{row.celular}</p>
                  </div>
                  <Badge className={`${statusColors[row.estado] || "bg-gray-100 text-gray-800"} border-0 ml-2`}>
                    {row.estado}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    Fuentes creadas: <span className="font-medium">{row.fuentesCreadas}</span>
                  </p>
                  <p>
                    Ubicación: <span className="font-medium">{row.ubicacion}</span>
                  </p>
                  <p>
                    Última actualización: <span className="font-medium">{row.ultimaActualizacion}</span>
                  </p>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                <DropdownMenuItem>Editar</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )
    }

    if (cardType === "knowledge-base") {
      return (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Checkbox checked={selectedRows.has(index)} onCheckedChange={() => toggleRowSelection(index)} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{row.nombre}</h3>
                    <p className="text-sm text-gray-500">Descripción corta</p>
                  </div>
                  <Badge className={`${statusColors[row.estado] || "bg-gray-100 text-gray-800"} border-0 ml-2`}>
                    {row.estado}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    Tipo: <span className="font-medium">{row.tipo}</span>
                  </p>
                  <p>
                    Categoría: <span className="font-medium">{row.categoria}</span>
                  </p>
                  <p>
                    Última actualización: <span className="font-medium">{row.ultimaActualizacion}</span>
                  </p>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                <DropdownMenuItem>Editar</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )
    }

    // Default card type for 'fuentes' (Fuentes Generales, Media Listening)
    return (
      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Checkbox checked={selectedRows.has(index)} onCheckedChange={() => toggleRowSelection(index)} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{row.nombre}</h3>
                <Badge className={`${statusColors[row.estado] || "bg-gray-100 text-gray-800"} border-0 ml-2`}>
                  {row.estado}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{row.contenido}</p>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  Tipo: <span className="font-medium">{row.tipo}</span>
                </p>
                <p>
                  Creado por: <span className="font-medium">{row.creadoPor}</span>
                </p>
                <p>
                  Última actualización: <span className="font-medium">{row.ultimaActualizacion}</span>
                </p>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Ver detalles</DropdownMenuItem>
              <DropdownMenuItem>Editar</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Search and Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <Checkbox
                checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                onCheckedChange={toggleAllSelection}
              />
            </div>
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-64"
              />
            </div>
            <div className="md:hidden">
              <Button variant="outline" size="sm">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="flex items-center space-x-2 overflow-x-auto md:overflow-visible">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="whitespace-nowrap bg-transparent">
                    Abril 2025 <ChevronDown className="ml-2 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Abril 2025</DropdownMenuItem>
                  <DropdownMenuItem>Marzo 2025</DropdownMenuItem>
                  <DropdownMenuItem>Febrero 2025</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="whitespace-nowrap bg-transparent">
                    {cardType === "knowledge-base" ? "Tipo de Source" : "Estado"}{" "}
                    <ChevronDown className="ml-2 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Todos</DropdownMenuItem>
                  <DropdownMenuItem>Activo</DropdownMenuItem>
                  <DropdownMenuItem>Pendiente</DropdownMenuItem>
                  <DropdownMenuItem>En uso</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="whitespace-nowrap bg-transparent">
                    Recientes <ChevronDown className="ml-2 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Más recientes</DropdownMenuItem>
                  <DropdownMenuItem>Más antiguos</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Tabs */}
        {showTabs && tabs.length > 0 && (
          <div className="flex space-x-6 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange?.(tab.key)}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {showAddButton && (
          <div className="md:hidden">
            <Button className="w-full" style={{ backgroundColor: "#31499f" }}>
              <Plus className="h-4 w-4 mr-2" />
              {addButtonText}
            </Button>
          </div>
        )}

        {showUpdateButton && cardType === "knowledge-base" && (
          <div className="md:hidden mb-4">
            <Button variant="outline" className="w-full bg-transparent">
              Actualizar
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden p-4">{paginatedData.map((row, index) => renderMobileCard(row, index))}</div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                  onCheckedChange={toggleAllSelection}
                />
              </TableHead>
              {columns.map((column) => (
                <TableHead key={column.key} style={{ width: column.width }}>
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={index} className="hover:bg-gray-50">
                <TableCell>
                  <Checkbox checked={selectedRows.has(index)} onCheckedChange={() => toggleRowSelection(index)} />
                </TableCell>
                {columns.map((column) => (
                  <TableCell key={column.key}>{renderCellContent(column, row[column.key], row)}</TableCell>
                ))}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-1">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-3 border-t border-gray-200 space-y-4 md:space-y-0">
        <div className="text-sm text-gray-500 text-center md:text-left">
          Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredData.length)} de{" "}
          {filteredData.length} resultados
        </div>

        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                style={currentPage === page ? { backgroundColor: "#31499f" } : {}}
                className={currentPage === page ? "text-white" : ""}
              >
                {page}
              </Button>
            )
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
