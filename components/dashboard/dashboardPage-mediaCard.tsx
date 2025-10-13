"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MediaPost } from "@/components/ui/media-post"
import { SectionHeader } from "@/components/ui/dashboardCards-header"
import { useState } from "react"
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { routes, getLocalizedRouteFromPathname } from '@/lib/routes'
import { EmptyMediaListener } from "@/components/icons/icons"

// const mediaItems = [
//   {
//     id: 1,
//     username: "@techreview_sarah",
//     platform: "Twitter",
//     content: "Just tried the new feature update and I'm absolutely loving the improved user...",
//     time: "3 mins",
//     engagement: "+340% mentions in last hour",
//   },
//   {
//     id: 2,
//     username: "@techreview_sarah",
//     platform: "Twitter",
//     content: "Just tried the new feature update and I'm absolutely loving the improved user...",
//     time: "3 mins",
//     engagement: "+340% mentions in last hour",
//   },
//   {
//     id: 3,
//     username: "@techreview_sarah",
//     platform: "Twitter",
//     content: "Just tried the new feature update and I'm absolutely loving the improved user...",
//     time: "1 mins",
//     engagement: "+340% mentions in last hour",
//   },
//   { id: 4, username: "@news_today", platform: "Twitter", content: "Breaking: new release announced today...", time: "5 mins", engagement: "+120% mentions in last hour" },
//   { id: 5, username: "@marketing_guy", platform: "Instagram", content: "Check our new campaign assets...", time: "10 mins", engagement: "+85% mentions in last hour" },
//   { id: 6, username: "@influencer_x", platform: "Twitter", content: "Loving this update — great job team...", time: "12 mins", engagement: "+200% mentions in last hour" },
//   { id: 7, username: "@dailytech", platform: "Twitter", content: "A quick roundup of today's tech news...", time: "20 mins", engagement: "+60% mentions in last hour" },
//   { id: 8, username: "@user_voice", platform: "Facebook", content: "The feature makes my life easier...", time: "30 mins", engagement: "+40% mentions in last hour" },
// ]
const mediaItems: Array<{
  id: number;
  username: string;
  platform: string;
  content: string;
  time: string;
  engagement: string;
}> = [] // Empty state

export function MediaListeningSection() {
  const [isExpanded, setIsExpanded] = useState(false)
  const t = useTranslations('MEDIA')
  const router = useRouter()
  const pathname = usePathname()
  
  // Get selected client from context
  // const { selectedClient } = useClient()

  const goToMediaList = () => {
    const localizedRoute = getLocalizedRouteFromPathname(routes.clients.dashboards.media, pathname || '/')
    router.push(localizedRoute)
  }

  const headerActions = (
    <div className="hidden lg:flex items-center gap-4 h-full">
      <Button variant="link" className="text-[#192038] underline text-sm p-0 cursor-pointer hover:no-underline" onClick={goToMediaList}>
        {t('viewAll')}
      </Button>
    </div>
  )

  return (
  <Card className="bg-white border border-gray-200 shadow-sm flex flex-col overflow-hidden max-h-[85vh] md:max-h-[75vh] lg:h-[600px] lg:max-h-none">
      <div className="sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0">
          <SectionHeader
            title={t('title')}
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
            actions={headerActions}
          />
      </div>

      <div className={`${!isExpanded ? "hidden lg:block" : "block"} px-4 sm:px-6 py-3 sm:py-4 flex-1 overflow-y-auto hide-scrollbar`}>
        {mediaItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <EmptyMediaListener className="mb-4" />
            <p className="text-sm text-gray-500 text-center mb-2">
              {t('emptyState')}
            </p>
            <p className="text-xs text-gray-400 text-center">
              {t('emptySubtitle')}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {mediaItems.map((item) => (
              <MediaPost key={item.id} {...item} />
            ))}
          </div>
        )}
      </div>

      {/* bottom 'Ver todos' for mobile/md; header shows it on lg */}
      <div className={`${!isExpanded ? "hidden lg:block" : "block"} px-4 sm:px-6  `}>
        <div className="text-center lg:hidden">
            <Button variant="link" className="text-[#192038] underline text-sm p-0 cursor-pointer hover:no-underline" onClick={goToMediaList}>
              {t('viewAll')}
            </Button>
        </div>
      </div>
    </Card>
  )
}
