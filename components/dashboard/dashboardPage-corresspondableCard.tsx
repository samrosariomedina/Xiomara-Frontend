"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Globe, ChevronDown } from "lucide-react"
import { useState } from "react"
import { useTranslations } from 'next-intl'
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { SectionHeader } from "@/components/ui/dashboardCards-header"
import { useRouter, usePathname } from 'next/navigation'
import { routes, getLocalizedRouteFromPathname } from '@/lib/routes'
import { EmptyCorresponsable } from "@/components/icons/icons"
import { useCorresponsables } from "@/hooks/useCorresponsables"
import { formatDateSafe } from "@/lib/utils"
import { ShadcnRowActions } from "@/components/ui/ShadcnRowActions"
import { getShareUrlAction } from "@/actions/corresponsables"
import { ShareLinkDialog } from "@/components/dialogs/ShareLinkDialog"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { useMemo } from "react"

export interface CorresponsableData {
  _id: string;
  type?: string; // "whatsapp" or "telegram"
  title?: string;
  origin?: string;
  approved: boolean;
  timestamp: string;
  metadata?: {
    email?: string;
  };
}

interface CorresponsablesSectionProps {
  folderId: string
  onEdit: (corresponsable: CorresponsableData) => void
  onDelete: (corresponsableId: string) => Promise<void>
  onCreateClick?: () => void
  clientId: string
  campaignId?: string
}

// Function to censor origin for Telegram listeners
const censorOrigin = (origin: string | null, showCensored: boolean = false): string => {
  if (!origin || origin === "N/A") return "N/A"
  if (showCensored) {
    return origin // Show actual value when toggle is on
  }
  // Censor: show first 3 and last 3 characters with asterisks in between
  if (origin.length <= 6) {
    return "***" // Fully censor short values
  }
  const start = origin.substring(0, 3)
  const end = origin.substring(origin.length - 3)
  const middle = "*".repeat(Math.min(origin.length - 6, 8)) // Max 8 asterisks
  return `${start}${middle}${end}`
}

// Helper to determine if a corresponsable is Telegram
const isTelegramListener = (corresponsable: CorresponsableData): boolean => {
  // Check type field first
  if (corresponsable.type === "telegram") return true
  // Fallback: Telegram tokens are usually longer and don't look like phone numbers
  if (corresponsable.origin && 
      corresponsable.origin.length > 20 && 
      !/^\+?[0-9\s\-\(\)]+$/.test(corresponsable.origin)) {
    return true
  }
  return false
}

export function CorresponsablesSection({ folderId, onEdit, onDelete, onCreateClick, clientId, campaignId }: CorresponsablesSectionProps) {
  const [activeTab, setActiveTab] = useState("usuarios")
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCensoredOrigins, setShowCensoredOrigins] = useState(false) // Toggle for showing censored Telegram origins
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareDialogData, setShareDialogData] = useState<{
    shareUrl: string;
    clientName: string;
    email?: string;
    listenerType: "whatsapp" | "telegram";
  } | null>(null)
  // translations scoped to messages/CORRESPONSABLES
  const t = useTranslations('CORRESPONSABLES')
  const router = useRouter()
  const pathname = usePathname()
  
  // Fetch corresponsables for the folder (client or campaign)
  const { 
    corresponsables = [], 
    isLoading, 
    error 
  } = useCorresponsables(folderId)

  // Check if there are any Telegram listeners
  const hasTelegramListeners = useMemo(() => {
    return corresponsables.some((c: CorresponsableData) => isTelegramListener(c))
  }, [corresponsables])

  const goToCorresponsalesList = () => {
    const route = routes.clients.getDashboardRoute(clientId, campaignId, 'corresponsables')
    const localizedRoute = getLocalizedRouteFromPathname(route, pathname || '/')
    router.push(localizedRoute)
  }

  const handleShareCorresponsable = async (corresponsable: CorresponsableData) => {
    try {
      const result = await getShareUrlAction(corresponsable._id)
      
      if (result.success && result.data) {
        const listenerType = corresponsable.type === "telegram" ? "telegram" : "whatsapp"
        setShareDialogData({
          shareUrl: result.data,
          clientName: corresponsable.title || 'Corresponsable',
          email: corresponsable.metadata?.email,
          listenerType
        })
        setShowShareDialog(true)
      } else {
        toast.error(result.error || 'Failed to get share link')
      }
    } catch (error) {
      console.error('Error getting share URL:', error)
      toast.error('Failed to get share link. Please try again.')
    }
  }

  return (
    <>
  <Card className="bg-white border border-gray-200 py-6 shadow-sm flex flex-col overflow-hidden max-h-[85vh] md:max-h-[75vh] lg:h-[600px] lg:max-h-none">
    <div className="px-4 mt-2 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0">
      <SectionHeader
        title={t('title')}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        actions={(
          <div className="hidden lg:flex items-center gap-4 h-full">
            <Button variant="link" className="text-[#192038] text-sm p-0 h-auto font-medium underline cursor-pointer hover:no-underline" onClick={goToCorresponsalesList}>
              {t('viewAll')}
            </Button>
          </div>
        )}
      />
    </div>

      {/* Tabs - Only show when there are corresponsables
          - Change active/inactive tab appearance by editing classes below
          - Active tab currently uses text-blue-600 + border-b-2
          - Only shown on desktop or when expanded on mobile
      */}
  {corresponsables.length > 0 && (
    <div className={`border-b border-gray-200 ${!isExpanded ? 'hidden lg:block' : 'block'}`}>
          {/* Make tabs take equal width: each button gets flex-1 and centered text */}
    <div className="flex w-full">
            <button
              onClick={() => setActiveTab("usuarios")}
              role="tab"
              aria-selected={activeTab === "usuarios"}
              className={`flex-1 text-center mx-1 py-3 text-sm font-medium ${
                activeTab === "usuarios"
                  ? "text-blue-800 border-b-2 border-blue-900"
                  : "text-gray-600"
              }`}
            >
              {t('tabs.usuarios')}
            </button>
            <button
              onClick={() => setActiveTab("fuentes")}
              role="tab"
              aria-selected={activeTab === "fuentes"}
              className={`flex-1 text-center  mx-1 py-3 text-sm font-medium ${
                activeTab === "fuentes"
                  ? "text-blue-800 border-b-2 border-blue-900"
                  : "text-gray-600"
              }`}
            >
              {t('tabs.fuentes')}
            </button>
          </div>
        </div>
      )}

  {/* Scrollable content area (keeps card height consistent; contents scroll). Added hide-scrollbar to keep scroll functional but hide native scrollbars. */}
  <div className={`${!isExpanded ? 'hidden lg:block' : 'block'} px-4 lg:px-6 py-3 lg:py-4 flex-1 overflow-y-auto hide-scrollbar`}>
  {/* Show loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-sm text-gray-500 text-center">
            {t('loading')}
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <p className="text-sm text-red-500 text-center mb-2">
            {t('error')}
          </p>
          <p className="text-xs text-gray-400 text-center">
            {error.message || 'Please try again later'}
          </p>
        </div>
      ) : corresponsables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <EmptyCorresponsable className="mb-4" />
          <p className="text-sm text-gray-500 text-center mb-2">
            {t('emptyState')}
          </p>
          <p className="text-xs text-gray-400 text-center">
            {t('emptySubtitle')}
          </p>
        </div>
      ) : activeTab === "usuarios" ? (
        <div className="p-0">
          {/* Toolbar: left = select / dropdown, right = create button
              - To change the dropdown look: update Checkbox + ChevronDown classes
              - To change Create button: edit Button variant/classes
          */}
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <div className="hidden lg:flex items-center">
                {/* Select all checkbox - visible only on large screens */}
                <Checkbox id="select-all" className="mr-2 h-4 w-4 rounded border-gray-300" />
                {/* This ChevronDown is a visual dropdown icon in the original design */}
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
              
              <div className="flex items-center gap-2">
                {/* Toggle button for showing/hiding censored Telegram origins */}
                {hasTelegramListeners && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCensoredOrigins(!showCensoredOrigins)}
                    className="flex items-center gap-2 border-gray-300 hover:bg-gray-50 h-9 px-3 py-2 text-sm"
                  >
                    {showCensoredOrigins ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        <span className="hidden sm:inline">Hide Tokens</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Show Tokens</span>
                      </>
                    )}
                  </Button>
                )}
                
                {/* Create Corresponsal button - update color/size here */}
                <Button
                  variant="outline"
                  className="w-full lg:w-auto h-9 px-3 py-2 text-sm font-semibold text-[#31499F] flex items-center gap-2 rounded-full bg-[#F7F9FF]  border-white mt-2 lg:mt-0 justify-center"
                  onClick={onCreateClick}
                >
                  <Plus className="h-4 w-4 " />
                  <span className="ml-1">{t('create')}</span>
                </Button>
              </div>
          </div>

          <div className="space-y-4">
              {corresponsables.map((corresponsable: CorresponsableData) => (
                <div key={corresponsable._id} className="flex items-center justify-between py-1">
                  {/* Left column: checkbox + avatar + name + sources */}
                  <div className="flex items-center space-x-3">
                    {/* Individual row checkbox - wire to selection state if needed */}
                    <Checkbox id={`person-${corresponsable._id}`} className="h-4 w-4 rounded border-gray-300" />
                    <div className="flex items-center">
                      {/* Avatar - using next/image for optimization. To change size, adjust width/height and the className */}
                      <Image
                        src="/avatar.svg"
                        alt={corresponsable.title || 'Corresponsable'}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <div>
                        {/* Name text - change font sizes/weights here */}
                        <p className="text-sm font-medium">{corresponsable.title || 'Untitled'}</p>
                        {/* Sources row: globe icon + number. To change color or spacing edit classes below */}
                        <div className="inline-flex bg-[#F7F9FF]  items-center text-xs text-blue-900 w-auto p-1">
                          <Globe className="h-3.5 w-3.5 mr-1" />
                          <span>
                            {isTelegramListener(corresponsable) 
                              ? censorOrigin(corresponsable.origin || null, showCensoredOrigins)
                              : (corresponsable.origin || 'N/A')
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right column: status (stacked) + actions
                      - Badge appears above the timestamp (vertical stack)
                      - Actions button sits to the right of the stack
                  */}
                  <div className="flex items-center space-x-6 ">
                    {/* Vertical stack: badge on top, time below */}
                    <div className="flex flex-col items-center">
                      <Badge
                        className={`px-2 py-1 text-xs font-medium ${
                          corresponsable.approved
                            ? "bg-[#74DEA4] text-[#192038]"
                            : "bg-[#E9C45E] text-[#192038]"
                        }`}
                      >
                        {corresponsable.approved ? t('status.approved') : t('status.pending')}
                      </Badge>
                      <span className="text-xs text-gray-500 mt-1 text-center">
                        {formatDateSafe(corresponsable.timestamp)}
                      </span>
                    </div>

                    {/* Actions menu button */}
                    <ShadcnRowActions
                      onEdit={() => {
                        onEdit(corresponsable)
                      }}
                      onShare={async () => {
                        await handleShareCorresponsable(corresponsable)
                      }}
                      onDelete={async () => {
                        await onDelete(corresponsable._id)
                      }}
                      itemName={corresponsable.title || 'Corresponsable'}
                      itemType="Corresponsable"
                    />
                  </div>
                </div>
              ))}
            </div>
        </div>
      ) : (
        /* "Fuentes" Tab Content - only show when there are corresponsables */
        <div className={`p-4 pt-0 ${!isExpanded ? 'hidden lg:block' : 'block'}`}>
          {/* Toolbar: left = select / dropdown */}
          <div className="flex justify-between items-center mb-4">
            <div className="hidden lg:flex items-center">
              {/* Select all checkbox - visible only on large screens */}
              <Checkbox id="select-all-fuentes" className="mr-2 h-4 w-4 rounded border-gray-300" />
              {/* This ChevronDown is a visual dropdown icon in the original design */}
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* List of campaign images/sources - matches the image layout */}
          <div className="space-y-4">
            {/* Empty state - no sources available */}
            <div className="text-center py-8 text-gray-500">
              <p>No sources available</p>
            </div>
          </div>
        </div>
      )}

    </div>
  {/* Mobile "Ver todos" link at bottom (only when expanded and there are corresponsables) */}
  {isExpanded && corresponsables.length > 0 && (
    <div className="lg:hidden px-4 text-center border-t border-gray-100">
      <Button variant="link" className="text-[#192038] underline hover:no-underline text-sm p-0 cursor-pointer hover:no-underline" onClick={goToCorresponsalesList}>
        {t('viewAll')}
      </Button>
    </div>
  )}

    </Card>

      {/* Share Link Dialog */}
      {shareDialogData && (
        <ShareLinkDialog
          isOpen={showShareDialog}
          onClose={() => {
            setShowShareDialog(false)
            setShareDialogData(null)
          }}
          shareUrl={shareDialogData.shareUrl}
          clientName={shareDialogData.clientName}
          email={shareDialogData.email}
          listenerType={shareDialogData.listenerType}
        />
      )}
    </>
  )
}
