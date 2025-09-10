"use client"

import {
  Ear,
  Globe,
  Users,
  MoreVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CampaignRowProps } from "../utils/types"

export function CampaignRow({ 
  campaign, 
  campaignIndex, 
  clientId, 
  onMenuOpen, 
  t 
}: CampaignRowProps) {
  return (
    <div className="px-4 py-4 hover:bg-[#f7f9ff] transition-colors">
  {/* Desktop Campaign Layout */}
  <div className="hidden lg:flex items-center w-full">
        {/* Campaign Number and Name (30% width) */}
        <div className="flex items-start space-x-4 w-[30%]">
          <div className="w-6 flex justify-center pt-1">
            <span className="text-sm font-medium text-gray-900">{campaignIndex + 1}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-400 mb-1">Campaña</div>
            <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
          </div>
        </div>

        {/* Campaign Creation Date (20% width) */}
        <div className="w-[20%] text-center">
          <div className="text-xs text-gray-400 mb-1">{t('creationDate')}</div>
          <div className="text-sm text-gray-900">{campaign.createdDate}</div>
        </div>

        {/* Connected Sources (30% width) */}
        <div className="w-[30%] text-center">
          <div className="text-xs text-gray-400 mb-1">Fuentes conectadas</div>
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="flex items-center space-x-1 bg-[#F7F9FF] px-2 py-1 rounded-xl">
                <Ear className="h-3 w-3 text-[#31499F]" />
                <span className="text-xs text-gray-900">{campaign.connectedSources.whatsapp}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="flex items-center space-x-1 bg-[#F7F9FF] px-2 py-1 rounded-xl">
                <Users className="h-3 w-3 text-[#31499F]" />
                <span className="text-xs text-gray-900">{campaign.connectedSources.email}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="flex items-center space-x-1 bg-[#F7F9FF] px-2 py-1 rounded-xl">
                <Globe className="h-3 w-3 text-[#31499F]" />
                <span className="text-xs text-gray-900">{campaign.connectedSources.other}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status and Actions (20% width) */}
        <div className="w-[20%] flex items-center justify-between px-4">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Status</div>
            <Badge
              variant={campaign.status === "Activa" ? "default" : "secondary"}
              className={
                campaign.status === "Activa"
                  ? "bg-[#74DEA4]  rounded-full text-green-800 hover:bg-green-100 text-xs px-2 py-1"
                  : "bg-[#F7F9FF] rounded-full text-gray-600 hover:bg-gray-100 text-xs px-2 py-1"
              }
            >
              {campaign.status}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full"
            onClick={(e) => {
              if (typeof window === 'undefined') return; // Skip on server-side
              
              const rect = (e.target as HTMLElement).closest('button')?.getBoundingClientRect()
              const left = rect ? rect.right - 208 : window.innerWidth - 208
              const top = rect ? rect.bottom + 8 : 100
              onMenuOpen({ clientId, campaignId: campaign.id, left, top })
            }}
          >
            <MoreVertical className="h-4 w-4 text-[#000000] " />
          </Button>
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
        </div>
      </div>
    </div>
  )
}
