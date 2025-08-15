"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ChevronDown, Plus, Calendar } from "lucide-react"
import { useTranslations } from 'next-intl'

export function DashboardHeader() {
  const t = useTranslations('DASHBOARD')
  const tFilters = useTranslations('FILTERS')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(tFilters('date'))
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!ref.current) return
      if (e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const months = [tFilters('months.april'), tFilters('months.march'), tFilters('months.february')]

  return (
    <div className="bg-white rounded-md px-4 py-4 mb-4">
      <div className="max-w-[86rem] mx-auto flex items-start justify-between">
        <div className="min-w-0 flex-1 mr-4">
          <div className="text-xs text-gray-600 truncate">
            <span className="whitespace-nowrap">Listado Clientes</span>
            <span className="mx-2">›</span>
            <span className="whitespace-nowrap">Dashboard</span>
            <span className="mx-2">›</span>
            <span className="text-[#31499F] font-medium whitespace-nowrap">Cliente</span>
          </div>

          <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:space-x-4 " >
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">{t('title')}</h1>

            {/* Date dropdown below title on mobile, inline on sm+ */}
            <div className="relative mt-3 sm:mt-0 w-[135%] sm:w-auto" ref={ref}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpen((s) => !s)}
                className="w-full flex justify-between items-center bg-white px-3 py-2 rounded-md shadow-sm space-x-2 text-sm text-gray-700"
              >
                <Calendar className="h-4 w-4 text-gray-600" />
                <span>{selected}</span>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </button>

              {open && (
                <div className="absolute left-0 mt-2 w-full sm:w-48 bg-white border border-gray-100 rounded-md shadow-lg z-20">
                  <ul className="py-1">
                    {months.map((m) => (
                      <li key={m}>
                        <button
                          type="button"
                          onClick={() => { setSelected(m); setOpen(false) }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50"
                        >
                          {m}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <Button className="rounded-full bg-[#31499F] hover:bg-blue-800 text-white px-4 py-2 mt-4" aria-label={t('addSources')}>
            <span className="inline-flex items-center sm:hidden">+ Crear</span>
            <span className="hidden sm:inline-flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>{t('addSources')}</span>
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
