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
      {/* Mobile & Medium layout (unchanged) */}
      <div className="lg:hidden">
        <div className="max-w-[86rem] mx-auto flex items-start justify-between">
          <div className="min-w-0 flex-1 mr-4">
            <div className="text-xs text-gray-600 truncate">
              <span className="whitespace-nowrap">{t('breadcrumb.clientsList')}</span>
              <span className="mx-2">›</span>
              <span className="whitespace-nowrap">{t('breadcrumb.dashboard')}</span>
              <span className="mx-2">›</span>
              <span className="text-[#31499F] font-medium whitespace-nowrap">{t('breadcrumb.client')}</span>
            </div>

            <div className="mt-2">
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 truncate flex items-center">
                  {t('title')}
                  <span className="ml-3 inline-flex items-center justify-center bg-[#EEF2FF] text-[#31499F] text-xs font-medium px-2 py-0.5 rounded-full">40</span>
                </h1>

                <div className="ml-4">
                  <Button className="rounded-full bg-[#31499F] hover:bg-blue-800 text-white px-4 py-2 flex items-center" aria-label={t('addSources')}>
                    <Plus className="h-4 w-4" />
                    <span className="ml-2 lg:hidden">{t('addSources')}</span>
                    <span className="hidden lg:inline ml-2">{t('addSources')}</span>
                  </Button>
                </div>
              </div>

              {/* Date dropdown below title on mobile, inline on lg+ */}
              <div className="relative mt-3 lg:mt-3 w-full lg:w-auto" ref={ref}>
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
                  <div className="absolute left-0 mt-2 w-full lg:w-48 bg-white border border-gray-100 rounded-md shadow-lg z-20">
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
        </div>
      </div>

      {/* Desktop-only layout (lg and above) */}
      <div className="hidden lg:block">
        <div className="max-w-[86rem] mx-auto">
          {/* Breadcrumb row */}
          <div className="text-xs text-gray-600 mb-2">
            <span className="whitespace-nowrap">{t('breadcrumb.clientsList')}</span>
            <span className="mx-2">›</span>
            <span className="whitespace-nowrap">{t('breadcrumb.dashboard')}</span>
            <span className="mx-2">›</span>
            <span className="text-[#31499F] font-medium whitespace-nowrap">{t('breadcrumb.client')}</span>
          </div>

          {/* Title + controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 truncate flex items-center">
                {t('title')}
                <span className="ml-4 inline-flex items-center justify-center bg-[#EEF2FF] text-[#31499F] text-sm font-medium px-3 py-1 rounded-full">40</span>
              </h1>

              {/* Date dropdown sits just to the right of title */}
              <div className="ml-6" ref={ref}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpen((s) => !s)}
                  className="flex items-center bg-white px-3 py-2 rounded-md shadow-sm space-x-2 text-sm text-gray-700"
                >
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span>{selected}</span>
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                </button>

                {open && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg z-20">
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

            <div className="flex items-center">
              <Button className="rounded-full bg-[#31499F] hover:bg-blue-800 text-white px-4 py-2 flex items-center" aria-label={t('addSources')}>
                <Plus className="h-4 w-4" />
                <span className="ml-2">{t('addSources')}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
