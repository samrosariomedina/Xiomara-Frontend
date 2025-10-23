"use client"

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Edit,
  LineChart,
  Plus,
  MoreVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ClientCardProps } from "@/utils/types"
import { CampaignRow } from "./clientPage-campaignRows"
import { useRouter, usePathname } from 'next/navigation'
import { useClient } from '@/context/ClientContext'
import { routes, getLocalizedRouteFromPathname } from '@/lib/routes'
import { CreateCampaignDialog } from "./CreateCampaignDialog"

export function ClientCard({
  client,
  campaigns = [],
  isExpanded,
  onToggle,
  onEditClient,
  onMenuOpen,
  t
}: ClientCardProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Use real campaigns data passed as props
  const campaignDetails = (campaigns || []).map(campaign => ({
    id: campaign._id,
    name: campaign.title || 'Unnamed Campaign',
    createdDate: new Date(campaign.timestamp).toLocaleDateString(),
    connectedSources: { whatsapp: 0, email: 0, other: 0 },
    status: 'Activa',
  }))

  const router = useRouter()
  const pathname = usePathname()
  const { setSelectedClient } = useClient()

  const goToChannels = () => {
    // Set the client context before navigating
    // Convert the client data to ClientResponse format
    const clientResponse = {
      _id: String(client.id),
      title: client.name,
      parent: null,
      items: {},
      metadata: {
        type: "client",
        industry: "General", // Default value, should be updated with actual data
        contactName: client.contact,
        whatsapp: "", // Default value, should be updated with actual data
        position: "", // Default value, should be updated with actual data
        email: "", // Default value, should be updated with actual data
      },
      timestamp: new Date().toISOString(),
    }
    setSelectedClient(clientResponse)
    // Navigate to client dashboard using simplified route structure
    const localizedRoute = getLocalizedRouteFromPathname(routes.clients.clientDashboard(String(client.id)), pathname || '/')
    router.push(localizedRoute)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Main Client Row */}
      <div className="p-4 hover:bg-gray-50 transition-colors">
                {/* Desktop Layout */}
                <div className="hidden lg:flex items-center w-full">
          {/* Left Section - Client Info (equal width) */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Expand Arrow */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-100"
              onClick={() => onToggle(client.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-900" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-900" />
              )}
            </Button>

            {/* Avatar */}
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gray-200 text-gray-500">
                {client.name && client.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Client Name and Contact: name block + contact block to the right with 1rem spacing */}
            <div className="flex-1 min-w-0 flex items-center">
              {/* Name block (takes remaining space) */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate ">{client.name}</div>
              </div>

              {/* Contact block (to the right of name) */}
              <div className="flex-1 text-right">
                <div className="text-xs text-gray-500 font-normal text-center">Contacto principal:</div>
                <div className="text-sm text-gray-900 truncate text-center font-medium">{client.contact}</div>
              </div>
            </div>
          </div>

          {/* Middle Section - Creation Date (equal width) */}
          <div className="flex-1 text-center">
            <div className="text-xs text-gray-400 mb-1">{t('creationDate')}</div>
            <div className="text-sm text-gray-900 font-medium">{client.createdDate}</div>
          </div>

          {/* Campaigns Section (equal width) */}
          <div className="text-center">
            {/* <div className="text-xs text-gray-400 mb-1">{t('campaigns')}</div> */}
            {/* <div className="flex items-center justify-center">
              <div className="flex items-center space-x-2 bg-[#F7F9FF] rounded-full px-3 py-1.5">
                <TrendingUp className="h-3 w-3 text-[#31499F]" />
                <span className="text-sm text-gray-900 font-medium">{client.campaigns}</span>
              </div>
            </div> */}
          </div>

          {/* Right Section - Actions (equal width) */}
          <div className="flex-1 flex items-center justify-end space-x-4">
            {/* Edit Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 w-12 rounded-full p-0 bg-[#f7f9ff]"
              onClick={() => onEditClient?.(client)}
            >
              <Edit className="h-4 w-4 text-[#31499F]" />
            </Button>

            {/* Analytics Button */}
            <Button variant="ghost" size="sm" className="h-9 w-12 rounded-full p-0 bg-[#f7f9ff] hover:cursor-pointer" onClick={goToChannels}>
              <LineChart className="h-4 w-4 text-[#31499F]" />
            </Button>

            {/* Create Campaign Button */}
            <Button
              variant="outline"
              size="sm"
              className="text-[#31499F] border-[#ffff] hover:bg-blue-50 bg-[#f7f9ff] rounded-full"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              {t('createCampaign')}
            </Button>

            {/* Client Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 rounded-full p-0 bg-[#f7f9ff] hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation()
                console.log('[ClientCard] Three-dot menu clicked for client:', client.id, client.name)
                const rect = e.currentTarget.getBoundingClientRect()
                console.log('[ClientCard] Menu position:', { left: rect.left, top: rect.bottom + 8 })
                onMenuOpen({
                  clientId: client.id,
                  left: rect.left,
                  top: rect.bottom + 8
                })
              }}
            >
              <MoreVertical className="h-4 w-4 text-[#31499F]" />
            </Button>
            
          </div>
        </div>

                {/* Mobile Layout (also used on md) */}
                <div className="lg:hidden">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {/* Expand Arrow */}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-100 mt-1"
                onClick={() => onToggle(client.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </Button>

              {/* Avatar */}
              <Avatar className="h-10 w-10 mt-1">
                <AvatarFallback className="bg-blue-500 text-white text-sm font-semibold">
                  {client.name && client.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Client Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">{client.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{client.contact}</div>
              </div>
            </div>

            {/* Creation Date */}
            <div className="text-right">
              <div className="text-xs text-gray-400">{t('creationDate')}</div>
              <div className="text-sm text-gray-900">{client.createdDate}</div>
            </div>
          </div>
    </div>
      </div>

      {/* Expanded Campaign Details */}
      {isExpanded && (
        campaignDetails.length > 0 ? (
          <div className="border-t border-gray-100 bg-gray-50/30">
            {campaignDetails.map((campaign, index) => (
              <CampaignRow
                key={campaign.id}
                campaign={campaign}
                campaignIndex={index}
                clientId={client.id}
                onMenuOpen={onMenuOpen}
                t={t}
              />
            ))}

            {/* Client-level actions shown at the end of the client card on mobile & md */}
            <div className="px-4 py-3 md:px-6 md:py-4 lg:hidden">
              <div className="flex justify-end space-x-3">
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 bg-[#f7f9ff] text-[#31499F] rounded-full" onClick={() => onEditClient?.(client)}>
                  <Edit className="h-5 w-5 " />
                </Button>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 bg-[#f7f9ff] text-[#31499F]  rounded-full hover:cursor-pointer" onClick={goToChannels}>
                  <LineChart className="h-5 w-5 " />
                </Button>
                <Button variant="outline" size="sm" className="h-10 w-10 p-0 text-[#31499F] bg-[#f7f9ff] border-white hover:bg-blue-50 rounded-full" onClick={() => console.log('create campaign for', client.id)}>
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-100 bg-gray-50/30 p-4 text-sm text-gray-500 text-center">
            {t('noCampaignsYet') || 'No campaigns yet'}
          </div>
        )
      )}

      {/* Create Campaign Dialog */}
      <CreateCampaignDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        clientId={String(client.id)}
        clientName={client.name}
      />
    </div>
  )
}
