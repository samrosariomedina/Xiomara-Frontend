"use client"

import { useState } from "react"
import { Search, Plus, SlidersHorizontal, RotateCcw, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { usePagination } from "@/hooks/usePagination"
import { ShadcnRowActions } from "@/components/ui/ShadcnRowActions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define proper types for the data table
interface TableRow {
  [key: string]: string | number | boolean | undefined
  id?: string | number
  name?: string
  nombre?: string
  estado?: string
  celular?: string
  email?: string
  fuentesCreadas?: string | number
  ubicacion?: string
  ultimaActualizacion?: string
  tipo?: string
  categoria?: string
  contenido?: string
  creadoPor?: string
}

export interface Column {
  key: string
  label: string
  width?: string
  render?: (value: unknown, row: TableRow) => React.ReactNode
}

export interface DataTableProps {
  columns: Column[]
  data: TableRow[]
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
  isLoading?: boolean
  error?: Error | null
  onEditRow?: (rowId: string) => void
  onDeleteRow?: (rowId: string) => Promise<void>
  onShareRow?: (rowId: string) => void | Promise<void>
}

// Helper function to get item type label based on card type
function getItemTypeLabel(cardType?: string): "Source" | "Knowledge" | "Corresponsable" | "Media" {
  switch (cardType) {
    case "fuentes":
      return "Source"
    case "knowledge-base":
      return "Knowledge"
    case "corresponsales":
      return "Corresponsable"
    default:
      return "Media"
  }
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
  isLoading = false,
  error = null,
  onEditRow,
  onDeleteRow,
  onShareRow,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [rowStates, setRowStates] = useState<Record<number, boolean>>({})
  const itemsPerPage = 10

  // filter UI state
  const [stateFilter, setStateFilter] = useState<string>("todos")
  const [sortFilter, setSortFilter] = useState<string>("recientes")

  // Apply search filter
  const searchFilteredData = data.filter((row) =>
    Object.values(row).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Apply additional filters
  const filteredData = searchFilteredData.filter((row) => {
    // State filter
    if (stateFilter !== "todos") {
      const estado = String(row.estado || "").toLowerCase()
      switch (stateFilter) {
        case "activo":
          return estado === "activo"
        case "pendiente":
          return estado === "pendiente"
        case "en-uso":
          return estado === "en uso"
        case "inactivo":
          return estado === "inactivo"
        case "archivado":
          return estado === "archivado"
        default:
          return true
      }
    }

    return true
  }).sort((a, b) => {
    // Sort filter
    switch (sortFilter) {
      case "recientes":
        return new Date(b.ultimaActualizacion || "").getTime() - new Date(a.ultimaActualizacion || "").getTime()
      case "antiguos":
        return new Date(a.ultimaActualizacion || "").getTime() - new Date(b.ultimaActualizacion || "").getTime()
      case "a-z":
        return String(a.nombre || "").localeCompare(String(b.nombre || ""))
      case "z-a":
        return String(b.nombre || "").localeCompare(String(a.nombre || ""))
      case "tipo":
        return String(a.tipo || "").localeCompare(String(b.tipo || ""))
      case "autor":
        return String(a.creadoPor || "").localeCompare(String(b.creadoPor || ""))
      default:
        return 0
    }
  })

  const { currentItems, currentPage, totalPages } = usePagination(filteredData, itemsPerPage, 1)

  // Handle loading state
  if (isLoading) {
    return (
      <div className="bg-gray-50 lg:bg-white rounded-lg overflow-hidden">
        <div className="px-4 pt-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 lg:flex-none">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={searchPlaceholder}
                  disabled
                  className="pl-12 w-full lg:w-96 bg-[#f7f9ff] rounded-lg py-2"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-sm text-gray-500 text-center">Cargando corresponsables...</p>
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="bg-gray-50 lg:bg-white rounded-lg overflow-hidden">
        <div className="px-4 pt-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 lg:flex-none">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={searchPlaceholder}
                  disabled
                  className="pl-12 w-full lg:w-96 bg-[#f7f9ff] rounded-lg py-2"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-lg flex items-center justify-center">
            <Search className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-red-500 mb-2 text-center">Error al cargar corresponsables</p>
          <p className="text-sm text-gray-400 text-center mb-6">{error.message || 'Por favor, inténtalo de nuevo más tarde'}</p>
        </div>
      </div>
    )
  }


  // Filter options
  const stateOptions = [
    { value: "todos", label: "Todos" },
    { value: "activo", label: "Activo" },
    { value: "pendiente", label: "Pendiente" },
    { value: "en-uso", label: "En uso" },
    { value: "inactivo", label: "Inactivo" },
    { value: "archivado", label: "Archivado" }
  ];

  const sortOptions = [
    { value: "recientes", label: "Más recientes" },
    { value: "antiguos", label: "Más antiguos" },
    { value: "a-z", label: "A-Z" },
    { value: "z-a", label: "Z-A" },
    { value: "tipo", label: "Por tipo" },
    { value: "autor", label: "Por autor" }
  ];

  // Helper functions to get labels
  const getStateLabel = () => stateOptions.find(opt => opt.value === stateFilter)?.label || "Todos"  
  const getSortLabel = () => sortOptions.find(opt => opt.value === sortFilter)?.label || "Más recientes"

  const handleEdit = (rowId: string) => {
    if (onEditRow) {
      onEditRow(rowId)
    }
  }

  const handleDelete = async (rowId: string) => {
    if (onDeleteRow) {
      await onDeleteRow(rowId)
    }
  }

  const toggleRowSelection = (index: number) => {
    setRowStates(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const toggleAllSelection = () => {
    const allSelected = selectedRows.size === filteredData.length
    if (allSelected) {
      // Deselect all
      setSelectedRows(new Set())
      setRowStates({})
    } else {
      // Select all
      setSelectedRows(new Set(filteredData.map((_, index) => index)))
      const newRowStates: Record<number, boolean> = {}
      filteredData.forEach((_, index) => {
        newRowStates[index] = true
      })
      setRowStates(newRowStates)
    }
  }

  const renderCellContent = (column: Column, value: unknown, row: TableRow): React.ReactNode => {
    if (column.render) {
      return column.render(value, row)
    }

    // Handle status badges
    if (column.key === "estado" || column.key === "status") {
      const statusColors: Record<string, string> = {
        Activo: "bg-[#74DEA4] text-[#192038]",
        Pendiente: "bg-[#E9C45E] text-[#192038]",
        "En uso": "bg-[#f7f9ff] text-[#192038]",
        Inactivo: "bg-gray-100 text-gray-800",
        Acrobato: "bg-green-100 text-green-800",
      }

      const statusValue = String(value || "")
      return <Badge className={`${statusColors[statusValue] || "bg-gray-100 text-gray-800"} border-0`}>{statusValue}</Badge>
    }

    // Handle content column with overflow
    if (column.key === "contenido" || column.key === "content") {
      const contentValue = String(value || "")
      return (
        <div className="max-w-xs overflow-hidden">
          <p className="truncate" title={contentValue}>
            {contentValue}
          </p>
        </div>
      )
    }

    // Handle other columns with truncation
    const cellValue = String(value || "")
    return (
      <div className="truncate" title={cellValue}>
        {cellValue}
      </div>
    )
  }

  const renderMobileCard = (row: TableRow, index: number, filteredIndex: number) => {
    const statusColors: Record<string, string> = {
      Activo: "bg-[#74DEA4] text-[#192038]",
      Pendiente: "bg-[#E9C45E] text-[#192038]",
        "En uso": "bg-[#f7f9ff] text-[#192038]",
        Inactivo: "bg-gray-100 text-gray-800",
        Acrobato: "bg-green-100 text-green-800",
    }

    if (cardType === "corresponsales") {
      return (
        <div key={index} className="bg-white rounded-lg p-4 mb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Checkbox checked={rowStates[filteredIndex] || false} onCheckedChange={() => toggleRowSelection(filteredIndex)} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{row.nombre}</h3>
                    <p className="text-sm text-gray-600">{row.celular}</p>
                  </div>
                  <Badge className={`${statusColors[row.estado || ""] || "bg-gray-100 text-gray-800"}  ml-2`}>
                    {row.estado}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    Fuentes creadas: <span className="font-medium">{row.fuentesCreadas}</span>
                  </p>
                  <p>
                    Email: <span className="font-medium">{row.email || 'N/A'}</span>
                  </p>
                  <p>
                    Celular: <span className="font-medium">{row.celular}</span>
                  </p>
                  <p>
                    Última actualización: <span className="font-medium">{row.ultimaActualizacion}</span>
                  </p>
                </div>
              </div>
            </div>
            <ShadcnRowActions
              onEdit={() => handleEdit(String(row.id))}
              onShare={cardType === "corresponsales" && onShareRow ? () => onShareRow(String(row.id)) : undefined}
              onDelete={() => handleDelete(String(row.id))}
              itemName={row.nombre || row.name || ""}
              itemType={getItemTypeLabel(cardType)}
            />
          </div>
        </div>
      )
    }

    if (cardType === "knowledge-base") {
      return (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Checkbox checked={rowStates[filteredIndex] || false} onCheckedChange={() => toggleRowSelection(filteredIndex)} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{row.nombre}</h3>
                    <p className="text-sm text-gray-500">Descripción corta</p>
                  </div>
                  <Badge className={`${statusColors[row.estado || ""] || "bg-gray-100 text-gray-800"} border-0 ml-2`}>
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
            <ShadcnRowActions
              onEdit={() => handleEdit(String(row.id))}
              onDelete={() => handleDelete(String(row.id))}
              itemName={row.nombre || row.name || ""}
              itemType={getItemTypeLabel(cardType)}
            />
          </div>
        </div>
      )
    }

    // Default card type for 'fuentes' (Fuentes Generales, Media Listening)
    return (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <Checkbox checked={selectedRows.has(filteredIndex)} onCheckedChange={() => toggleRowSelection(filteredIndex)} className="flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 truncate" title={row.nombre}>{row.nombre}</h3>
                <Badge className={`${statusColors[row.estado || ""] || "bg-gray-100 text-gray-800"} border-0 ml-2 flex-shrink-0`}>
                  {row.estado}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2" title={row.contenido}>{row.contenido}</p>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="truncate" title={row.tipo}>
                  Tipo: <span className="font-medium">{row.tipo}</span>
                </p>
                <p className="truncate" title={row.creadoPor}>
                  Creado por: <span className="font-medium">{row.creadoPor}</span>
                </p>
                <p className="truncate" title={row.ultimaActualizacion}>
                  Última actualización: <span className="font-medium">{row.ultimaActualizacion}</span>
                </p>
              </div>
            </div>
          </div>
            <ShadcnRowActions
              onEdit={() => handleEdit(String(row.id))}
              onDelete={() => handleDelete(String(row.id))}
              itemName={row.nombre || row.name || ""}
              itemType={getItemTypeLabel(cardType)}
            />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-gray-50 lg:bg-white  rounded-lg overflow-hidden">
      {/* Search and Filters */}
      <div className="px-4 pt-4  ">
        <div className="flex flex-col  md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
            <div className="hidden lg:block">
              <Checkbox
                checked={selectedRows.size === filteredData.length && filteredData.length > 0}
                onCheckedChange={toggleAllSelection}
              />
            </div>
            <div className="relative  flex-1 lg:flex-none">
              <Search className="absolute  left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 w-full lg:w-96 bg-[#f7f9ff] rounded-lg py-2"
              />
            </div>
            {/* compact filter button visible on mobile and md (hidden on lg+) */}
            <div className="lg:hidden">
              <Button variant="ghost" size="sm" className="h-10 w-10 p-2 bg-gray-50 rounded-full ">
                <SlidersHorizontal className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
          </div>

          {showFilters && (
            // large filter controls only on lg+
            <div className="hidden lg:flex items-center space-x-2 overflow-x-auto lg:overflow-visible">

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[150px] justify-between bg-white border-gray-200"
                  >
                    <span>{getStateLabel()}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[150px]">
                  {stateOptions.map((option) => (
                    <DropdownMenuItem 
                      key={option.value}
                      onClick={() => setStateFilter(option.value)}
                      className={stateFilter === option.value ? "bg-blue-50 text-blue-900" : ""}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[140px] justify-between bg-white border-gray-200"
                  >
                    <span>{getSortLabel()}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[140px]">
                  {sortOptions.map((option) => (
                    <DropdownMenuItem 
                      key={option.value}
                      onClick={() => setSortFilter(option.value)}
                      className={sortFilter === option.value ? "bg-blue-50 text-blue-900" : ""}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          )}
        </div>

        {/* Tabs */}
        {showTabs && tabs.length > 0 && (
          <div className="flex space-x-6 mb-4 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange?.(tab.key)}
                className={`p-3  text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-[#31499f] text-[#31499f]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {showAddButton && (
          <div className="md:hidden  ">
            <Button className="w-full rounded-full text-[#31499f] m-1 p-1" style={{ backgroundColor: "#f7f9ff" }}>
              <Plus className="h-4 w-4 mr-2" />
              {addButtonText}
            </Button>
          </div>
        )}

        {showUpdateButton && cardType === "knowledge-base" && (
          <div className="md:hidden mb-4">
            <Button variant="outline" className="w-full  border-white rounded-full text-[#31499f] bg-[#f7f9ff]">
              <RotateCcw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
  <div className="md:hidden p-6 bg-gray-50">{currentItems.map((row, index) => {
    // Find the index of this row in the filtered data
    const filteredIndex = filteredData.findIndex(filteredRow => filteredRow.id === row.id)
    return renderMobileCard(row, index, filteredIndex)
  })}</div>

      {/* Desktop Table */}
      <div className="hidden md:block px-6 py-4 overflow-x-auto">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-white rounded-lg">
              <TableHead className="w-12 py-3">
                <Checkbox
                  checked={selectedRows.size === filteredData.length && filteredData.length > 0}
                  onCheckedChange={toggleAllSelection}
                />
              </TableHead>
              {columns.map((column) => (
                <TableHead key={column.key} style={{ width: column.width }} className="">
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="w-12 "></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y-0">
            {currentItems.map((row, index) => {
              // Find the index of this row in the filtered data
              const filteredIndex = filteredData.findIndex(filteredRow => filteredRow.id === row.id)
              return (
                <TableRow key={index} className="hover:bg-[#f7f9ff] border-0">
                  <TableCell className="py-4 border-0">
                    <Checkbox checked={rowStates[filteredIndex] || false} onCheckedChange={() => toggleRowSelection(filteredIndex)} />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.key} className="py-4 border-0">{renderCellContent(column, row[column.key], row)}</TableCell>
                  ))}
                <TableCell className="py-4 border-0">
                  <ShadcnRowActions
                    onEdit={() => handleEdit(String(row.id))}
                    onShare={cardType === "corresponsales" && onShareRow ? () => onShareRow(String(row.id)) : undefined}
                    onDelete={() => handleDelete(String(row.id))}
                    itemName={row.nombre || row.name || ""}
                    itemType={getItemTypeLabel(cardType)}
                  />
                </TableCell>
              </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* end main container */}
    </div>

    {/* Pagination (rendered outside the main container) */}
    <div className="flex flex-col items-end justify-end md:flex-row md:items-center md:justify-end px-6 py-4 space-y-4 md:space-y-0">
      <div className="mt-2 md:mt-0">
        <Pagination initialPage={currentPage as number} totalPages={totalPages} />
      </div>
    </div>

    </>
  )
}
