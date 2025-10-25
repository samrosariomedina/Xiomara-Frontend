"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreVertical, RefreshCw } from "lucide-react"
import { useState } from "react"
import { SectionHeader } from "@/components/ui/dashboardCards-header"
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { routes, getLocalizedRouteFromPathname } from '@/lib/routes'
import { EmptyKnowledgeBase } from "@/components/icons/icons"
import { formatDateSafe } from '@/lib/utils'
import type { ReferenceResponse } from '@/lib/schemas'
import { DashboardRowActions } from "@/components/ui/dashboard-rowActions"

// Define types for knowledge base data
interface KnowledgeItem {
  id: string;
  name: string;
  type: string;
  lastUpdate: string;
  time: string;
}

interface KnowledgeBaseSectionProps {
  references: ReferenceResponse[]
  onEdit: (reference: ReferenceResponse) => void
  onDelete: (referenceId: string) => Promise<void>
  clientId: string
  campaignId?: string
}

export function KnowledgeBaseSection({ references, onEdit, onDelete, clientId, campaignId }: KnowledgeBaseSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState<{referenceId: string, left: number, top: number} | null>(null)
  const t = useTranslations('KNOWLEDGE')
  const router = useRouter()
  const pathname = usePathname()

  // Transform references to KnowledgeItem format - no caching
  const knowledgeItems: KnowledgeItem[] = references.map((ref) => {
    // Handle both old string content and new object content
    // const content = typeof ref.content === 'string' ? ref.content : ref.content;
    const displayName = ref.title || 'Untitled';
    
    // Get type display name
    let typeDisplay = 'Text';
    if (ref.type === 'file') {
      typeDisplay = 'File';
    } else if (ref.type === 'webpage') {
      typeDisplay = 'URL';
    } else if (ref.type === 'text') {
      typeDisplay = 'Text';
    }
    
    return {
      id: ref._id,
      name: displayName,
      type: typeDisplay,
      lastUpdate: 'Última actualización',
      time: formatDateSafe(ref.timestamp),
    }
  })

  const goToKnowledgeList = () => {
    const route = routes.clients.getDashboardRoute(clientId, campaignId, 'knowledge')
    const localizedRoute = getLocalizedRouteFromPathname(route, pathname || '/')
    router.push(localizedRoute)
  }

  const headerActions = (
    // show actions only on large screens; md should behave like mobile
    <div className="hidden lg:flex items-center gap-4 h-full">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 rounded-full px-3 py-1 bg-[#f7f9ff] border border-white"
      >
        <RefreshCw className="h-4 w-4 text-[#31499F]" />
        <span className="text-[#31499F] text-sm">{t('refresh')}</span>
      </Button>

      <Button variant="link" className="text-[#192038] underline text-sm p-0 cursor-pointer hover:no-underline" onClick={goToKnowledgeList}>
        {t('viewAll')}
      </Button>
    </div>
  )

  return (
    <Card className="bg-white border border-gray-200 shadow-sm flex flex-col overflow-hidden max-h-[85vh] md:max-h-[75vh] lg:h-[600px] lg:max-h-none">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0">
        <SectionHeader
          title={t('title')}
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
          actions={headerActions}
        />
      </div>



      <div className={`${!isExpanded ? "hidden lg:block" : "block"} px-4 sm:px-6 sm:py-4 flex-1 overflow-y-auto hide-scrollbar`}> 
        {knowledgeItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <EmptyKnowledgeBase className="mb-4" />
            <p className="text-sm text-gray-500 text-center mb-2">
              {t('emptyState')}
            </p>
            <p className="text-xs text-gray-400 text-center">
              {t('emptySubtitle')}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {knowledgeItems.map((item) => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-200" />
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-semibold">NC</div>
                  <div>
        <p className="text-sm font-medium text-gray-900">{item.name}</p>
        <p className="text-xs text-gray-400">{item.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{t('lastUpdate')}</p>
                    <p className="text-sm font-medium text-start text-gray-900">{item.time}</p>
                  </div>

                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setMenuOpen({
                        referenceId: item.id,
                        left: rect.left,
                        top: rect.bottom + 8
                      })
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* bottom link for mobile/md; header contains 'Ver todos' on lg
          hide this bottom link when the section is collapsed */}
      <div className={`${!isExpanded ? "hidden lg:block" : "block"} px-4 sm:px-6   border-gray-100`}>
        <div className="text-center lg:hidden">
          <Button variant="link" className="text-[#192038] underline text-sm cursor-pointer hover:no-underline" onClick={goToKnowledgeList}>
            {t('viewAll')}
          </Button>
        </div>
      </div>

      {/* Three-dot menu */}
      {menuOpen && (
        <DashboardRowActions
          onEdit={() => {
            const reference = references.find(r => r._id === menuOpen.referenceId)
            if (reference) {
              onEdit(reference)
            }
          }}
          onDelete={async () => {
            await onDelete(menuOpen.referenceId)
            setMenuOpen(null)
          }}
          onClose={() => setMenuOpen(null)}
          left={menuOpen.left}
          top={menuOpen.top}
          itemName={references.find(r => r._id === menuOpen.referenceId)?.title || 'Knowledge Base'}
          pageType="knowledge"
        />
      )}
    </Card>
  )
}
