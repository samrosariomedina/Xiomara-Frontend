"use client"

import {
  MoreVertical,
  FileText,
  BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter, usePathname } from "next/navigation"
import { useClient } from "@/context/ClientContext"
import { routes, getLocalizedRouteFromPathname } from '@/lib/routes'
import { useQuery } from "@tanstack/react-query"
import { getClientsAction } from "@/actions/clients"
import { getAllCampaignsAction } from "@/actions/campaigns"
import type { ClientResponse, CampaignResponse } from "@/lib/schemas"

interface CampaignTableProps {
  clientId: string
}

export function CampaignTable({ clientId }: CampaignTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { setSelectedClient, setParentClient, selectedClient } = useClient()

  // Fetch client data
  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const result = await getClientsAction()
      return result.success ? result.data : []
    },
    staleTime: 5 * 60 * 1000,
  })

  // Fetch campaigns data
  const { data: campaignsData } = useQuery({
    queryKey: ['all-campaigns'],
    queryFn: async () => {
      const result = await getAllCampaignsAction()
      return result.success ? result.data : []
    },
    staleTime: 5 * 60 * 1000,
  })

  // Filter campaigns for this client
  const clientCampaigns = campaignsData?.filter((campaign: CampaignResponse) => 
    campaign.parent === clientId
  ) || []

  const handleCampaignClick = (campaign: CampaignResponse) => {
    // Find the parent client
    const parentClientData = clientsData?.find((c: ClientResponse) => c._id === clientId)
    
    // Set parent client if found
    if (parentClientData) {
      setParentClient(parentClientData)
    }
    
    // Set campaign as selected client
    setSelectedClient(parentClientData as ClientResponse)
    
    // Navigate to dashboard with campaign filter
    const localizedRoute = getLocalizedRouteFromPathname(routes.clients.dashboards.fuentes, pathname)
    router.push(localizedRoute)
  }

  const handleContentEngine = (campaign: CampaignResponse, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click
    
    // Find the parent client
    const parentClientData = clientsData?.find((c: ClientResponse) => c._id === clientId)
    
    // Set parent client if found
    if (parentClientData) {
      setParentClient(parentClientData)
    }
    
    // Set campaign as selected client
    setSelectedClient(parentClientData as ClientResponse)
    
    // Navigate to content engine
    const localizedRoute = getLocalizedRouteFromPathname(routes.clients.contentEngine, pathname)
    router.push(localizedRoute)
  }

  const handleDashboard = (campaign: CampaignResponse, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click
    
    // Find the parent client
    const parentClientData = clientsData?.find((c: ClientResponse) => c._id === clientId)
    
    // Set parent client if found
    if (parentClientData) {
      setParentClient(parentClientData)
    }
    
    // Set campaign as selected client
    setSelectedClient(parentClientData as ClientResponse)
    
    // Navigate to campaign dashboard using simplified route structure
    const localizedRoute = getLocalizedRouteFromPathname(routes.clients.campaignDashboard(clientId, campaign._id), pathname)
    router.push(localizedRoute)
  }

  if (clientCampaigns.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Campaigns Found</h3>
            <p className="text-gray-500">This client doesn&apos;t have any campaigns yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Campaigns</h3>
            <p className="text-sm text-gray-500">Manage and navigate to your campaigns</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {clientCampaigns.length} campaign{clientCampaigns.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {clientCampaigns.map((campaign: CampaignResponse, index: number) => (
          <div 
            key={campaign._id}
            className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer" 
            onClick={() => handleCampaignClick(campaign)}
          >
            {/* Desktop Campaign Layout */}
            <div className="hidden lg:flex items-center w-full gap-4">
              {/* Campaign Number and Name */}
              <div className="flex items-start space-x-4 flex-1 min-w-0">
                <div className="w-6 flex justify-center pt-1">
                  <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 mb-1">Campaña</div>
                  <div className="text-sm font-medium text-gray-900 truncate">{campaign.title}</div>
                </div>
              </div>

              {/* Campaign Type */}
              <div className="w-32 min-w-0">
                <div className="text-xs text-gray-400 mb-1">Tipo</div>
                <div className="text-sm text-gray-900 truncate">
                  {campaign.metadata?.campaignType || 'Default'}
                </div>
              </div>

              {/* Start Date */}
              <div className="w-32 min-w-0">
                <div className="text-xs text-gray-400 mb-1">Fecha de Inicio</div>
                <div className="text-sm text-gray-900">
                  {campaign.metadata?.startDate 
                    ? new Date(campaign.metadata.startDate).toLocaleDateString()
                    : new Date(campaign.timestamp).toLocaleDateString()
                  }
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleContentEngine(campaign, e)}
                  className="h-8 px-3 text-xs"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Content Engine
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleDashboard(campaign, e)}
                  className="h-8 px-3 text-xs"
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Dashboard
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Campaign Layout */}
            <div className="lg:hidden">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                    <span className="text-xs text-gray-400">Campaña</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900 truncate">{campaign.title}</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Tipo</div>
                  <div className="text-sm text-gray-900">
                    {campaign.metadata?.campaignType || 'Default'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Fecha de Inicio</div>
                  <div className="text-sm text-gray-900">
                    {campaign.metadata?.startDate 
                      ? new Date(campaign.metadata.startDate).toLocaleDateString()
                      : new Date(campaign.timestamp).toLocaleDateString()
                    }
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleContentEngine(campaign, e)}
                  className="flex-1 h-8 text-xs"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Content Engine
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleDashboard(campaign, e)}
                  className="flex-1 h-8 text-xs"
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Dashboard
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
