"use client"

import { Plus, Search, Calendar, Filter, Clock, ChevronDown } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { useTranslations } from 'next-intl'

interface ClientsHeaderProps {
  onCreateClient?: () => void;
}

export function ClientsHeader({ onCreateClient }: ClientsHeaderProps) {
  const t = useTranslations('CLIENTS')
  const tFilters = useTranslations('FILTERS')
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined)

  return (
    <div className="mb-8">
      {/* Header with title and create button */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900">{t('title')}</h1>

        <Button className="bg-[#31499F] hover:bg-[#2b3f8f] text-white rounded-full" onClick={onCreateClient}>
          <Plus className="h-5 w-5 mr-2" />
          {t('createClient')}
        </Button>
      </div>

      {/* Search and Filters Section */}
      <div className="flex items-center justify-between gap-3">
        {/* Search on the left */}
        <div className="relative w-100">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={tFilters('search')}
            className="pl-10 bg-white border-gray-200 text-gray-600 placeholder:text-gray-400"
            suppressHydrationWarning
          />
        </div>

        {/* Filters on the right (desktop) and a mobile '+' button */}
        <div className="flex items-center gap-3">
          {/* Desktop filters: hidden on small screens */}
          <div className="hidden sm:flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50">
                  <Calendar className="h-4 w-4 mr-2" />
                  {selectedMonth ? tFilters(`months.${selectedMonth}`) : tFilters('date')}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup value={selectedMonth} onValueChange={(v) => setSelectedMonth(v)}>
                  <DropdownMenuRadioItem value="january">{tFilters('months.january')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="february">{tFilters('months.february')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="march">{tFilters('months.march')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="april">{tFilters('months.april')}</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-2" />
                  {tFilters('status')}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>{tFilters('statuses.active')}</DropdownMenuItem>
                <DropdownMenuItem>{tFilters('statuses.inactive')}</DropdownMenuItem>
                <DropdownMenuItem>{tFilters('statuses.pending')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50">
                  <Clock className="h-4 w-4 mr-2" />
                  {tFilters('recent')}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>{tFilters('sortOptions.mostRecent')}</DropdownMenuItem>
                <DropdownMenuItem>{tFilters('sortOptions.oldest')}</DropdownMenuItem>
                <DropdownMenuItem>{tFilters('sortOptions.alphabetical')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile: show a single plus button to open filters/controls */}
          <Button variant="ghost" className="sm:hidden h-8 w-8 p-0 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">
            <Plus className="h-4 w-4 text-[#1B1D29]" />
          </Button>
        </div>
      </div>
    </div>
  )
}
