import { Search, Calendar, Filter, Clock, ChevronDown, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTranslations } from 'next-intl'

export function SearchFilters() {
  const t = useTranslations('FILTERS')
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-3">
        {/* Search on the left */}
        <div className="relative w-100">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t('search')}
            className="pl-10 bg-white border-gray-200 text-gray-600 placeholder:text-gray-400"
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
                  {t('date')}
                  <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>{t('months.january')}</DropdownMenuItem>
              <DropdownMenuItem>{t('months.february')}</DropdownMenuItem>
              <DropdownMenuItem>{t('months.march')}</DropdownMenuItem>
              <DropdownMenuItem>{t('months.april')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-2" />
                  {t('status')}
                  <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>{t('statuses.active')}</DropdownMenuItem>
              <DropdownMenuItem>{t('statuses.inactive')}</DropdownMenuItem>
              <DropdownMenuItem>{t('statuses.pending')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50">
                  <Clock className="h-4 w-4 mr-2" />
                  {t('recent')}
                  <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>{t('sortOptions.mostRecent')}</DropdownMenuItem>
              <DropdownMenuItem>{t('sortOptions.oldest')}</DropdownMenuItem>
              <DropdownMenuItem>{t('sortOptions.alphabetical')}</DropdownMenuItem>
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
