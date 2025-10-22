"use client"

import React, { useState } from "react"
import { MoreVertical } from "lucide-react"
import DashboardRowActions from "./dashboard-rowActions"

export type SourceItem = {
  id: number | string
  name: string
  type: "image" | "text" | "url" | "corresponsable"
  category: string
  timestamp: string
}

interface SourcesListProps {
  sources: SourceItem[]
  className?: string
  pageType?: "fuentes" | "knowledge" | "corresponsables"
  onEdit?: (id: number | string) => void
  onDelete?: (id: number | string) => void
}

function getInitials(name: string) {
  if (!name) return "NC"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function SourcesList({ sources, className = "", pageType = "fuentes", onEdit, onDelete }: SourcesListProps) {
  const [openMenuFor, setOpenMenuFor] = useState<{ id: number | string; left: number; top: number } | null>(null)

  const handleKebabClick = (source: SourceItem, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    const rect = event.currentTarget.getBoundingClientRect()
    setOpenMenuFor({
      id: source.id,
      left: rect.right - 200, // Position menu to the left of the button
      top: rect.bottom + 4
    })
  }

  const handleEdit = (sourceId: number | string) => {
    console.log('📝 SourcesList handleEdit called with sourceId:', sourceId)
    onEdit?.(sourceId)
    setOpenMenuFor(null)
  }

  const handleDelete = (sourceId: number | string) => {
    console.log('🗑️ SourcesList handleDelete called with sourceId:', sourceId)
    onDelete?.(sourceId)
    setOpenMenuFor(null)
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="-mx-4 max-h-136 overflow-y-auto scrollbar">
        {sources.map((source) => (
          <div
            key={source.id}
            className="bg-white hover:bg-gray-50 px-6 py-4 sm:border-b sm:last:border-b-0 transition-colors"
          >
            {/* Mobile compact row: name left, category + kebab right. Hidden on sm+ where the detailed layout appears. */}
            <div className="flex items-center justify-between sm:hidden">
              <div className="min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">{source.name}</span>
              </div>

              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                  {source.category}
                </span>
                <button
                  className="p-1 hover:bg-gray-100 rounded-full"
                  onClick={(e) => handleKebabClick(source, e)}
                  aria-label={`Más acciones para ${source.name}`}
                >
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Detailed layout for sm+ screens - evenly spaced layout */}
            <div className="hidden sm:flex sm:items-center sm:justify-between">
              {/* Left section: Avatar + Name */}
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"> 
                  <span className="text-blue-600 font-medium text-xs">{getInitials(source.name)}</span>
                </div>
                <span className="text-sm font-medium text-gray-900 truncate">{source.name}</span>
              </div>

              {/* Middle-left section: Type badge */}
              <div className="flex items-center justify-center flex-1">
                {source.type === "image" && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                    <svg className="h-3 w-3 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Imagen</span>
                  </span>
                )}
              </div>

              {/* Middle-right section: Category */}
              <div className="flex items-center justify-center flex-1">
                <span className="text-sm text-gray-700 font-medium">{source.category}</span>
              </div>

              {/* Right section: Timestamp and actions */}
              <div className="flex items-center justify-end space-x-4 flex-1">
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-0.5">Última actualización</div>
                  <div className="text-sm font-medium text-gray-900">{source.timestamp}</div>
                </div>
                <button
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={(e) => handleKebabClick(source, e)}
                  aria-label={`Más acciones para ${source.name}`}
                >
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Row Actions Menu */}
      {openMenuFor && (
        <DashboardRowActions
          left={openMenuFor.left}
          top={openMenuFor.top}
          onEdit={() => handleEdit(openMenuFor.id)}
          onDelete={() => handleDelete(openMenuFor.id)}
          onClose={() => setOpenMenuFor(null)}
          itemName={`Item ${openMenuFor.id}`}
          pageType={pageType}
        />
      )}
    </div>
  )
}