"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { usePathname, useRouter } from 'next/navigation'
import DateDropdown from "@/components/ui/date-dropdown"
import { useTranslations } from 'next-intl'
import { SourcesAdministrator } from '@/pages/sources-administrator'

export function DashboardHeader() {
  const t = useTranslations('DASHBOARD')
  const tFilters = useTranslations('FILTERS')
  const [selected, setSelected] = useState(tFilters('date'))
  const [isSourcesAdminOpen, setIsSourcesAdminOpen] = useState(false)
  const pathname = usePathname()
  const isEs = (pathname || '').split('/').filter(Boolean)[0] === 'es'
  const router = useRouter()

  const goToClients = () => {
    try {
      const seg = (pathname || "/").split('/').filter(Boolean)
      const locale = seg[0] === 'es' ? 'es' : 'en'
      router.push(`/${locale}/clients`)
    } catch {
      router.push('/clients')
    }
  }

  // DateDropdown handles its own click-away and escape handling.

  // Use dataset shape for reuse across the app: { label, value }
  const months = [
    { label: tFilters('months.april'), value: 'april' },
    { label: tFilters('months.march'), value: 'march' },
    { label: tFilters('months.february'), value: 'february' },
  ]

  return (
    <div className="bg-gray-50 rounded-md   mb-4">
      {/* Mobile & Medium layout (unchanged) */}
      <div className="lg:hidden">
        <div className="max-w-[86rem] mx-auto flex items-start justify-between">
          <div className="min-w-0 flex-1 ">
              <div className="text-xs text-gray-600 truncate">
              <span
                className="whitespace-nowrap cursor-pointer hover:underline"
                role="link"
                tabIndex={0}
                onClick={goToClients}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') goToClients() }}
              >
                {t('breadcrumb.clientsList')}
              </span>
              <span className="mx-2">›</span>
              <span className="whitespace-nowrap">{t('breadcrumb.dashboard')}</span>
              <span className="mx-2">›</span>
              <span className="text-[#31499F] font-medium whitespace-nowrap">{t('breadcrumb.client')}</span>
            </div>

            <div className="mt-2">
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 truncate flex items-center">
                  {t('title')}
                </h1>

                <div className="">
                  <Button 
                    className="rounded-full bg-[#31499F] hover:bg-blue-800 text-white  py-2 flex items-center" 
                    aria-label={t('addSources')}
                    onClick={() => setIsSourcesAdminOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="ml-2 lg:hidden">{isEs ? 'Crear' : 'Create'}</span>
                    <span className="hidden lg:inline ml-2">{t('addSources')}</span>
                  </Button>
                </div>
              </div>

              {/* Date dropdown below title on mobile, inline on lg+ */}
              <div className="relative mt-3 lg:mt-3 w-full lg:w-auto">
                <DateDropdown
                  dataset={months}
                  selected={selected}
                  onSelect={(v) => setSelected(v)}
                  showOptions={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop-only layout (lg and above) */}
      <div className="hidden lg:block">
        <div className="max-w-[86rem] ">
          {/* Breadcrumb row */}
          <div className="text-xs text-gray-600 mb-2">
            <span
                className="whitespace-nowrap cursor-pointer hover:underline"
                role="link"
                tabIndex={0}
                onClick={goToClients}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') goToClients() }}
              >
                {t('breadcrumb.clientsList')}
              </span>
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
              </h1>

              {/* Date dropdown sits just to the right of title */}
              <div className="ml-6">
                <DateDropdown
                  dataset={months}
                  selected={selected}
                  onSelect={(v) => setSelected(v)}
                  showOptions={true}
                />
              </div>
            </div>

            <div className="flex items-center">
              <Button 
                className="rounded-full bg-[#31499F] hover:bg-blue-800 text-white px-4 py-2 flex items-center" 
                aria-label={t('addSources')}
                onClick={() => setIsSourcesAdminOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span className="ml-2">{t('addSources')}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <SourcesAdministrator 
        isOpen={isSourcesAdminOpen} 
        onClose={() => setIsSourcesAdminOpen(false)} 
      />
    </div>
  )
}
