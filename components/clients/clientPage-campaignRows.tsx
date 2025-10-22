"use client"

import {
  Ear,
  Globe,
  Users,
  MoreVertical,
  Settings,
  Brain,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter, usePathname } from "next/navigation"
import { CampaignRowProps } from "@/utils/types"
import { useClient } from "@/context/ClientContext"
import { routes, getLocalizedRouteFromPathname } from '@/lib/routes'
import { useQuery } from "@tanstack/react-query"
import { getClientsAction } from "@/actions/clients"
import { getAllCampaignsAction } from "@/actions/campaigns"
import type { ClientResponse, CampaignResponse } from "@/lib/schemas"

export function CampaignRow({ 
  campaign, 
  campaignIndex, 
  clientId, 
  onMenuOpen, 
  t 
}: CampaignRowProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { setSelectedClient, setParentClient } = useClient()

  // Fetch client data to get full client object
  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const result = await getClientsAction()
      return result.success ? result.data : []
    },
    staleTime: 5 * 60 * 1000,
  })

  // Fetch campaigns data to get full campaign object
  const { data: campaignsData } = useQuery({
    queryKey: ['all-campaigns'],
    queryFn: async () => {
      const result = await getAllCampaignsAction()
      return result.success ? result.data : []
    },
    staleTime: 5 * 60 * 1000,
  })

  const handleCampaignClick = () => {
    // Find the parent client
    const parentClientData = clientsData?.find((c: ClientResponse) => c._id === clientId.toString())
    
    // Find the full campaign data
    const fullCampaignData = campaignsData?.find((c: CampaignResponse) => c._id === campaign.id.toString())
    
    if (!fullCampaignData) {
      console.warn('Campaign data not found, using basic data')
    }
    
    // Use full campaign data if available, otherwise construct basic response
    const campaignResponse = fullCampaignData || {
      _id: campaign.id.toString(),
      title: campaign.name,
      parent: clientId.toString(),
      items: {},
      metadata: {
        type: 'campaign',
        campaignType: 'default',
        startDate: campaign.createdDate,
      },
      timestamp: new Date().toISOString()
    }
    
    // Set parent client if found
    if (parentClientData) {
      setParentClient(parentClientData)
    }
    
    // Set campaign as selected client
    setSelectedClient(campaignResponse)
    
    // Navigate to channels dashboard
    const localizedRoute = getLocalizedRouteFromPathname(routes.clients.dashboards.fuentes, pathname)
    router.push(localizedRoute)
  }

  const handleManageCampaign = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click
    
    // Find the parent client
    const parentClientData = clientsData?.find((c: ClientResponse) => c._id === clientId.toString())
    
    // Find the full campaign data
    const fullCampaignData = campaignsData?.find((c: CampaignResponse) => c._id === campaign.id.toString())
    
    if (!fullCampaignData) {
      console.warn('Campaign data not found, using basic data')
    }
    
    // Use full campaign data if available, otherwise construct basic response
    const campaignResponse = fullCampaignData || {
      _id: campaign.id.toString(),
      title: campaign.name,
      parent: clientId.toString(),
      items: {},
      metadata: {
        type: 'campaign',
        campaignType: 'default',
        startDate: campaign.createdDate,
      },
      timestamp: new Date().toISOString()
    }
    
    // Set parent client if found
    if (parentClientData) {
      setParentClient(parentClientData)
    }
    
    // Set campaign as selected client
    setSelectedClient(campaignResponse)
    
    // Navigate to channels dashboard for campaign management
    const localizedRoute = getLocalizedRouteFromPathname(routes.clients.channels, pathname)
    router.push(localizedRoute)
  }

  const handleContentEngine = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click
    router.push(`/clients/content-engine?clientId=${clientId}&campaignId=${campaign.id}`)
  }
  return (
    <div 
      className="px-4 py-4 hover:bg-[#f7f9ff] transition-colors cursor-pointer" 
      onClick={handleCampaignClick}
    >
  {/* Desktop Campaign Layout */}
  <div className="hidden lg:flex items-center w-full gap-4">
        {/* Campaign Number and Name (flex-1) */}
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          <div className="w-6 flex justify-center pt-1">
            <span className="text-sm font-medium text-gray-900">{campaignIndex + 1}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-400 mb-1">Campaña</div>
            <div className="text-sm font-medium text-gray-900 truncate">{campaign.name}</div>
          </div>
        </div>

        {/* Campaign Creation Date (flex-1) */}
        <div className="flex-1 text-center">
          <div className="text-xs text-gray-400 mb-1">{t('creationDate')}</div>
          <div className="text-sm text-gray-900">{campaign.createdDate}</div>
        </div>

        {/* Connected Sources (flex-1) */}
        <div className="flex-1 text-center">
          <div className="text-xs text-gray-400 mb-1">Fuentes conectadas</div>
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center space-x-1 bg-[#F7F9FF] px-2 py-1 rounded-xl">
              <Ear className="h-3 w-3 text-[#31499F]" />
              <span className="text-xs text-gray-900">{campaign.connectedSources.whatsapp}</span>
            </div>
            <div className="flex items-center space-x-1 bg-[#F7F9FF] px-2 py-1 rounded-xl">
              <Users className="h-3 w-3 text-[#31499F]" />
              <span className="text-xs text-gray-900">{campaign.connectedSources.email}</span>
            </div>
            <div className="flex items-center space-x-1 bg-[#F7F9FF] px-2 py-1 rounded-xl">
              <Globe className="h-3 w-3 text-[#31499F]" />
              <span className="text-xs text-gray-900">{campaign.connectedSources.other}</span>
            </div>
          </div>
        </div>

        {/* Status and Actions (flex-1) */}
        <div className="flex-1 flex items-center justify-end gap-2">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Status</div>
            <Badge
              variant={campaign.status === "Activa" ? "default" : "secondary"}
              className={
                campaign.status === "Activa"
                  ? "bg-[#74DEA4] rounded-full text-green-800 hover:bg-green-100 text-xs px-2 py-1"
                  : "bg-[#F7F9FF] rounded-full text-gray-600 hover:bg-gray-100 text-xs px-2 py-1"
              }
            >
              {campaign.status}
            </Badge>
          </div>
          <div className="flex items-center space-x-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs bg-white hover:bg-gray-50 border-gray-300"
              onClick={handleContentEngine}
              title="Content Engine"
            >
              <Brain className="h-3.5 w-3.5" />
              <span className="ml-1.5 hidden xl:inline">Content</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs bg-white hover:bg-gray-50 border-gray-300"
              onClick={handleManageCampaign}
              title="Gestionar Campaña"
            >
              <Settings className="h-3.5 w-3.5" />
              <span className="ml-1.5 hidden xl:inline">Gestionar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation()
                if (typeof window === 'undefined') return;
                
                const rect = (e.target as HTMLElement).closest('button')?.getBoundingClientRect()
                const left = rect ? rect.right - 208 : window.innerWidth - 208
                const top = rect ? rect.bottom + 8 : 100
                onMenuOpen({ clientId, campaignId: campaign.id, left, top })
              }}
              title="Más opciones"
            >
              <MoreVertical className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

  {/* Mobile/Medium Campaign Layout: rounded card per campaign like design */}
  <div className="lg:hidden">
        <div className="m-3 bg-[#f7f9ff] rounded-xl shadow-sm p-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <div className="text-xs text-gray-400">Campaña</div>
              <div className="text-sm font-medium text-gray-900 truncate">{campaign.name}</div>
            </div>

            <div className="flex items-start space-x-2">
              <div className="text-right mr-2">
                <div className="text-xs text-gray-400">{t('creationDate')}</div>
                <div className="text-sm text-gray-900">{campaign.createdDate}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={(e) => {
                  e.stopPropagation() // Prevent row click
                  if (typeof window === 'undefined') return; // Skip on server-side
                  
                  const rect = (e.target as HTMLElement).closest('button')?.getBoundingClientRect()
                  const left = rect ? rect.right - 208 : window.innerWidth - 208
                  const top = rect ? rect.bottom + 8 : 100
                  onMenuOpen({ clientId, campaignId: campaign.id, left, top })
                }}
              >
                <MoreVertical className="h-4 w-4 text-[#000000]" />
              </Button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 mb-2">Fuentes conectadas</div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-1 bg-[#F7F9FF] px-2 py-1 rounded-lg">
                  <Ear className="h-4 w-4 text-[#31499F]" />
                  <span className="text-xs text-gray-900">{campaign.connectedSources.whatsapp}</span>
                </div>
                <div className="flex items-center space-x-1 bg-[#F7F9FF] px-2 py-1 rounded-lg">
                  <Users className="h-4 w-4 text-[#31499F]" />
                  <span className="text-xs text-gray-900">{campaign.connectedSources.email}</span>
                </div>
                <div className="flex items-center space-x-1 bg-[#F7F9FF] px-2 py-1 rounded-lg">
                  <Globe className="h-4 w-4 text-[#31499F]" />
                  <span className="text-xs text-gray-900">{campaign.connectedSources.other}</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs text-gray-400 mb-2">Status</div>
              <Badge
                variant={campaign.status === "Activa" ? "default" : "secondary"}
                className={
                  campaign.status === "Activa"
                    ? "item-start bg-[#74DEA4] rounded-full text-green-800 hover:bg-green-100 text-xs px-2 py-1"
                    : "item-start bg-[#F7F9FF] rounded-full text-gray-600 hover:bg-gray-100 text-xs px-2 py-1"
                }
              >
                {campaign.status}
              </Badge>
            </div>
          </div>

          {/* Campaign Action Buttons for Mobile */}
          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 px-3 text-xs bg-white hover:bg-gray-50 border-gray-300 font-medium"
              onClick={handleContentEngine}
            >
              <Brain className="h-4 w-4 mr-1.5" />
              Content Engine
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 px-3 text-xs bg-white hover:bg-gray-50 border-gray-300 font-medium"
              onClick={handleManageCampaign}
            >
              <Settings className="h-4 w-4 mr-1.5" />
              Gestionar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
