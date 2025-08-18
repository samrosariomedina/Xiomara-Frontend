"use client"

import React from "react"
import { MoreVertical } from "lucide-react"

export type SourceItem = {
  id: number
  name: string
  type: "image" | "text" | "url"
  category: string
  timestamp: string
}

interface SourcesListProps {
  sources: SourceItem[]
  onKebabClick?: (id: number) => void
  className?: string
}

function getInitials(name: string) {
  if (!name) return "NC"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function SourcesList({ sources, onKebabClick, className = "" }: SourcesListProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="-mx-4 overflow-hidden">
        {sources.map((source) => (
          <div
            key={source.id}
            className="bg-white hover:bg-gray-50 px-4 py-3 sm:border-b sm:last:border-b-0"
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
                  onClick={() => onKebabClick?.(source.id)}
                  aria-label={`Más acciones para ${source.name}`}
                >
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Detailed layout for sm+ screens */}
            <div className="hidden sm:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-start sm:items-center min-w-0 space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"> 
                  <span className="text-blue-600 font-medium text-xs">{getInitials(source.name)}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 truncate">{source.name}</span>
                  </div>

                  <div className="mt-1 sm:mt-0 sm:inline-flex sm:items-center sm:space-x-2">
                    {source.type === "image" && (
                      // only show the 'Imagen' badge on md and up to reduce clutter on smaller screens
                      <span className="hidden md:inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        <svg className="h-3 w-3 text-blue-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span>Imagen</span>
                      </span>
                    )}
                    {/* hide category on the smallest screens, show from sm and up */}
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {source.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-4">
                <div className="text-right">
                  {/* show the label only on md+ to save vertical space on small devices */}
                  <div className="hidden md:block text-xs text-gray-500">Última actualización</div>
                  <div className="text-sm font-semibold text-gray-800">{source.timestamp}</div>
                </div>
                <button
                  className="p-1 hover:bg-gray-100 rounded-full"
                  onClick={() => onKebabClick?.(source.id)}
                  aria-label={`Más acciones para ${source.name}`}
                >
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
