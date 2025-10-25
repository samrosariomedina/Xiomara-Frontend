"use client"

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown, Building2, Target, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useQuery } from '@tanstack/react-query'
import { getClientsAction } from '@/actions/clients'
import { getAllCampaignsAction } from '@/actions/campaigns'
import type { ClientResponse, CampaignResponse } from '@/lib/schemas'
import { getLocalizedRouteFromPathname } from '@/lib/routes'

interface ContentEngineContextSelectorProps {
  clientId: string
  campaignId?: string
}

export default function ContentEngineContextSelector({ 
  clientId, 
  campaignId 
}: ContentEngineContextSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Fetch clients data
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

  // Get current client and campaign info
  const currentClient = clientsData?.find((client: ClientResponse) => client._id === clientId)
  const currentCampaign = campaignId 
    ? campaignsData?.find((campaign: CampaignResponse) => campaign._id === campaignId)
    : null

  // Get campaigns for current client
  const clientCampaigns = campaignsData?.filter((campaign: CampaignResponse) => 
    campaign.parent === clientId
  ) || []

  const handleClientSelect = (client: ClientResponse) => {
    const contentEngineRoute = `/clients/${client._id}/content-engine`
    const localizedRoute = getLocalizedRouteFromPathname(contentEngineRoute, pathname || '/')
    router.push(localizedRoute)
    setIsOpen(false)
  }

  const handleCampaignSelect = (campaign: CampaignResponse) => {
    const contentEngineRoute = `/clients/${clientId}/campaigns/${campaign._id}/content-engine`
    const localizedRoute = getLocalizedRouteFromPathname(contentEngineRoute, pathname || '/')
    router.push(localizedRoute)
    setIsOpen(false)
  }

  const handleBackToClient = () => {
    const contentEngineRoute = `/clients/${clientId}/content-engine`
    const localizedRoute = getLocalizedRouteFromPathname(contentEngineRoute, pathname || '/')
    router.push(localizedRoute)
    setIsOpen(false)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Content Engine</h2>
          <p className="text-sm text-gray-500">Generate content for your selected context</p>
        </div>
        <div className="flex items-center gap-2">
          {currentCampaign ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
              <Target className="h-4 w-4" />
              <span>Campaign Mode</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
              <Building2 className="h-4 w-4" />
              <span>Client Mode</span>
            </div>
          )}
        </div>
      </div>
      
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between bg-white border-gray-200 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              {currentCampaign ? (
                <>
                  <Target className="h-4 w-4 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {currentCampaign.title || 'Unnamed Campaign'}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {currentClient?.title || 'Unknown Client'}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {currentClient?.title || 'Unknown Client'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Client Context
                    </div>
                  </div>
                </>
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-80" align="start">
          {/* Current Context Header */}
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Current Context
            </div>
            <div className="flex items-center gap-2 mt-1">
              {currentCampaign ? (
                <>
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-gray-900">
                    {currentCampaign.title || 'Unnamed Campaign'}
                  </span>
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-gray-900">
                    {currentClient?.title || 'Unknown Client'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Back to Client (only if in campaign context) */}
          {currentCampaign && (
            <>
              <DropdownMenuItem 
                onClick={handleBackToClient}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Building2 className="h-4 w-4 text-green-600" />
                <div>
                  <div className="font-medium">Switch to Client Context</div>
                  <div className="text-xs text-gray-500">
                    {currentClient?.title || 'Unknown Client'}
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Campaign Options */}
          {clientCampaigns.length > 0 && (
            <>
              <div className="px-3 py-2">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Campaigns ({clientCampaigns.length})
                </div>
              </div>
              {clientCampaigns.map((campaign: CampaignResponse) => (
                <DropdownMenuItem 
                  key={campaign._id}
                  onClick={() => handleCampaignSelect(campaign)}
                  className="flex items-center gap-2 cursor-pointer"
                  disabled={campaign._id === campaignId}
                >
                  <Target className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium">
                      {campaign.title || 'Unnamed Campaign'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {campaign.metadata?.campaignType || 'Campaign'}
                    </div>
                  </div>
                  {campaign._id === campaignId && (
                    <div className="text-xs text-blue-600 font-medium">Current</div>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          {/* Other Clients */}
          <div className="px-3 py-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Other Clients ({clientsData?.filter((client: ClientResponse) => client._id !== clientId).length || 0})
            </div>
          </div>
          {clientsData?.filter((client: ClientResponse) => client._id !== clientId).map((client: ClientResponse) => (
            <DropdownMenuItem 
              key={client._id}
              onClick={() => handleClientSelect(client)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Building2 className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <div className="font-medium">
                  {client.title || 'Unnamed Client'}
                </div>
                <div className="text-xs text-gray-500">
                  {client.metadata?.industry || 'Client'}
                </div>
              </div>
              <ArrowRight className="h-3 w-3 text-gray-400" />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
