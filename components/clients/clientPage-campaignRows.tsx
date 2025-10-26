"use client"

import {
  Ear,
  Globe,
  Users,
  Settings,
  Brain,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShadcnRowActions } from "@/components/ui/ShadcnRowActions"
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
  onDeleteCampaign,
  onEditCampaign,
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
    
    // Navigate to campaign channels dashboard using new route structure
    const localizedRoute = getLocalizedRouteFromPathname(routes.clients.campaignDashboard(clientId.toString(), campaign.id.toString()), pathname)
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
    
    // Navigate to campaign channels dashboard using new route structure
    const localizedRoute = getLocalizedRouteFromPathname(routes.clients.campaignDashboard(clientId.toString(), campaign.id.toString()), pathname)
    router.push(localizedRoute)
  }

  const handleContentEngine = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click
    
    // Navigate to campaign-specific content engine using route params
    const contentEngineRoute = `/clients/${clientId}/campaigns/${campaign.id}/content-engine`
    const localizedRoute = getLocalizedRouteFromPathname(contentEngineRoute, pathname)
    router.push(localizedRoute)
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
            <ShadcnRowActions
              onEdit={() => {
                onEditCampaign?.(campaign)
              }}
              onDelete={() => onDeleteCampaign?.(campaign.id.toString())}
              itemName={campaign.name}
              itemType="Campaign"
              className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
            />
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
              <ShadcnRowActions
                onEdit={() => {
                  onEditCampaign?.(campaign)
                }}
                onDelete={() => onDeleteCampaign?.(campaign.id.toString())}
                itemName={campaign.name}
                itemType="Campaign"
                className="h-8 w-8 p-0 rounded-full"
              />
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
