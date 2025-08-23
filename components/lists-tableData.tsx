"use client"

import { useState } from "react"
import { Search, MoreVertical, Plus, Calendar, SlidersHorizontal, RotateCcw, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { usePagination } from "@/hooks/usePagination"
import RowActionsMenu from "@/components/cards-rowActions"
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
  const itemsPerPage = 10

  const filteredData = data.filter((row) =>
    Object.values(row).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const { currentItems, currentPage, totalPages, goToPage } = usePagination(filteredData, itemsPerPage, 1)
  const startIndex = (currentPage - 1) * itemsPerPage

  // Row actions menu state (shared between mobile cards and desktop rows)
  const [menuFor, setMenuFor] = useState<number | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<{ left: number; top: number } | null>(null)
  const [menuItemName, setMenuItemName] = useState<string>("")
  const [menuActions, setMenuActions] = useState<Array<"edit" | "addSource" | "delete"> | undefined>(undefined)
  const [menuAlign, setMenuAlign] = useState<"left" | "right" | undefined>(undefined)
  // filter UI state
  const [dateFilter, setDateFilter] = useState<string>("abril-2025")
  const [stateFilter, setStateFilter] = useState<string>("todos")
  const [sortFilter, setSortFilter] = useState<string>("recientes")

  // Filter options
  const dateOptions = [
    { value: "abril-2025", label: "Abril 2025" },
    { value: "marzo-2025", label: "Marzo 2025" },
    { value: "febrero-2025", label: "Febrero 2025" },
    { value: "enero-2025", label: "Enero 2025" },
    { value: "diciembre-2024", label: "Diciembre 2024" },
    { value: "noviembre-2024", label: "Noviembre 2024" }
  ];

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
  const getDateLabel = () => dateOptions.find(opt => opt.value === dateFilter)?.label || "Abril 2025"
  const getStateLabel = () => stateOptions.find(opt => opt.value === stateFilter)?.label || "Todos"  
  const getSortLabel = () => sortOptions.find(opt => opt.value === sortFilter)?.label || "Más recientes"

  const openRowMenu = (index: number, row: TableRow, e: React.MouseEvent, actions?: Array<"edit" | "addSource" | "delete">, align?: "left" | "right") => {
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    setMenuFor(index)
    setMenuAnchor({ left: rect.left, top: rect.bottom })
    setMenuItemName(row?.nombre || row?.name || "")
    setMenuActions(actions)
    setMenuAlign(align)
  }

  const closeRowMenu = () => {
    setMenuFor(null)
    setMenuAnchor(null)
    setMenuItemName("")
    setMenuActions(undefined)
    setMenuAlign(undefined)
  }

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
    if (selectedRows.size === currentItems.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(currentItems.map((_, index) => index)))
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

    return String(value || "")
  }

  const renderMobileCard = (row: TableRow, index: number) => {
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
              <Checkbox checked={selectedRows.has(index)} onCheckedChange={() => toggleRowSelection(index)} />
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
                    Ubicación: <span className="font-medium">{row.ubicacion}</span>
                  </p>
                  <p>
                    Última actualización: <span className="font-medium">{row.ultimaActualizacion}</span>
                  </p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="p-1" onClick={(e) => openRowMenu(index, row, e)}>
              <MoreVertical className="h-4 w-4" />
            </Button>
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
            <Button variant="ghost" size="sm" className="p-1" onClick={(e) => openRowMenu(index, row, e)}>
              <MoreVertical className="h-4 w-4" />
            </Button>
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
                <Badge className={`${statusColors[row.estado || ""] || "bg-gray-100 text-gray-800"} border-0 ml-2`}>
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
            <Button variant="ghost" size="sm" className="p-1" onClick={(e) => openRowMenu(startIndex + index, row, e, ["edit","delete"], "right")}>
              <MoreVertical className="h-4 w-4" />
            </Button>
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
                checked={selectedRows.size === currentItems.length && currentItems.length > 0}
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
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{getDateLabel()}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[150px]">
                  {dateOptions.map((option) => (
                    <DropdownMenuItem 
                      key={option.value}
                      onClick={() => setDateFilter(option.value)}
                      className={dateFilter === option.value ? "bg-blue-50 text-blue-900" : ""}
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

              <Button variant="outline" size="sm" className=" border-white text-[#31499f] bg-[#f7f8ff] rounded-full flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Crear Corresponsal
              </Button>
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
  <div className="md:hidden p-6 bg-gray-50">{currentItems.map((row, index) => renderMobileCard(row, index))}</div>

      {/* Desktop Table */}
      <div className="hidden md:block px-6 py-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-white rounded-lg">
              <TableHead className="w-12 py-3">
                <Checkbox
                  checked={selectedRows.size === currentItems.length && currentItems.length > 0}
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
            {currentItems.map((row, index) => (
              <TableRow key={index} className="hover:bg-[#f7f9ff] border-0">
                <TableCell className="py-4 border-0">
                  <Checkbox checked={selectedRows.has(index)} onCheckedChange={() => toggleRowSelection(index)} />
                </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.key} className="py-4 border-0">{renderCellContent(column, row[column.key], row)}</TableCell>
                  ))}
                <TableCell className="py-4 border-0">
                  <Button variant="ghost" size="sm" className="p-1" onClick={(e) => openRowMenu(startIndex + index, row, e, ["edit", "delete"], "right")}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* end main container */}
    </div>

    {/* Pagination (rendered outside the main container) */}
    <div className="flex flex-col items-end justify-end md:flex-row md:items-center md:justify-end px-6 py-4 space-y-4 md:space-y-0">
      <div className="mt-2 md:mt-0">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
      </div>
    </div>

    {/* Row actions menu portal */}
    {menuAnchor && menuFor !== null && (
      <RowActionsMenu
        left={Math.round(menuAnchor!.left)}
        top={Math.round(menuAnchor!.top)}
        itemName={menuItemName}
        actions={menuActions}
        align={menuAlign}
        onClose={closeRowMenu}
        onEdit={() => Promise.resolve()} // implement actual edit handler; don't close menu here
        onAddSource={() => Promise.resolve()} // implement add source; don't close menu here
        onDelete={async () => {
          // perform deletion work here (API call etc.). Return a promise.
          // RowActionsMenu will call onClose() after the promise resolves.
          return Promise.resolve()
        }}
      />
    )}
    </>
  )
}
