"use client"

import { useState } from "react"
import {
  ChevronRight,
  ChevronDown,
  Edit,
  LineChart,
  Plus,
  ChevronLeft,
  ChevronRightIcon,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from 'next-intl'
import { type ClientInput } from "@/lib/schemas"

// types used for rendering
type Campaign = {
  id: number
  name: string
  createdDate: string
  connectedSources: { whatsapp: number; email: number; other: number }
  status: string
}

interface ClientsListProps {
  clients: ClientInput[]
}

export function ClientsList({ clients }: ClientsListProps) {
  const t = useTranslations('CLIENTS');
  const [expandedClients, setExpandedClients] = useState<number[]>([])

  const toggleClient = (clientId: number) => {
    setExpandedClients((prev) => (prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]))
  }

  // Transform the clients prop to include necessary display properties
  const clientsData = clients.map((client, index) => ({
    id: index + 1, // Use index as id
    name: client.clientName,
    contact: client.contactName,
    email: client.email,
    createdDate: new Date().toLocaleDateString(), // Use current date for demo
    campaigns: Math.floor(Math.random() * 3) + 1, // Random campaigns for demo
    campaignDetails: [
      {
        id: 1,
        name: "Campaña de Marketing Digital",
        createdDate: new Date().toLocaleDateString(),
        connectedSources: { whatsapp: 2, email: 1, other: 1 },
        status: "Activa"
      },
      {
        id: 2,
        name: "Campaña de Email",
        createdDate: new Date().toLocaleDateString(),
        connectedSources: { whatsapp: 0, email: 3, other: 0 },
        status: "Pausada"
      }
    ] as Campaign[], // Sample campaign details
  }))

  return (
    <div className="mt-6">
      {/* Client List */}
      <div className="space-y-3">
        {clientsData.map((client) => {
          const isExpanded = expandedClients.includes(client.id)
          return (
            <div key={client.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden ">
              {/* Main Client Row */}
              <div className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  {/* Left Section - Client Info */}
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Expand Arrow */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-gray-100"
                      onClick={() => toggleClient(client.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>

                    {/* Avatar */}
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gray-200 text-gray-500">
                        <div className="h-6 w-6 rounded-full bg-gray-300" />
                      </AvatarFallback>
                    </Avatar>

                    {/* Client Name and Contact */}
                    <div className="">
                      <div className="font-medium text-gray-900 text-sm">{client.name}</div>
                    </div>
                    <div className="text-sm text-gray-500 ml-4">
                        <span className="text-gray-400">{t('contact')}</span>
                        <br />
                        <span className="text-black font-semibold">{client.contact}</span>
                    </div>
                  </div>

                  {/* Middle Section - Creation Date */}
                  <div className="px-6 justify-start">
                    <div className="text-xs text-gray-400 mb-1">{t('creationDate')}</div>
                    <div className="text-sm text-gray-900">{client.createdDate}</div>
                  </div>

                  {/* Campaigns Section */}
                  <div className="px-6">
                    <div className="text-xs text-gray-400 mb-1">{t('campaigns')}</div>
                    <div className="flex items-center ">
                        <div className="border rounded-xl p-1 flex items-center space-x-2 mr-2 bg-[#F7F9FF]">
                      <TrendingUp className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-900">{client.campaigns}</span>
                      </div>
                      <div className="border rounded-xl p-1 flex items-center space-x-2 mr-2 bg-[#F7F9FF]">
                      <TrendingDown className="h-3 w-3 text-gray-400 " />
                      <span className="text-sm text-gray-900">1</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex items-center space-x-3">
                    {/* Edit Button */}
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-[#F7F9FF]">
                      <Edit className="h-4 w-4 text-gray-400" />
                    </Button>

                    {/* Analytics Button */}
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-[#F7F9FF]">
                      <LineChart className="h-4 w-4 text-gray-400" />
                    </Button>

                    {/* Create Campaign Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-[#F7F9FF]"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {t('createCampaign')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Campaign Details */}
              {isExpanded && client.campaignDetails.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50/30">
                  {client.campaignDetails.map((campaign, index) => (
                    <div
                      key={campaign.id}
                      className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      {/* Campaign Number and Info */}
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-6 flex justify-center">
                          <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        </div>
                      </div>

                      {/* Campaign Creation Date */}
                      <div className="px-6">
                        <div className="text-xs text-gray-400 mb-1">{t('creationDate')}</div>
                        <div className="text-sm text-gray-900">{campaign.createdDate}</div>
                      </div>

                      {/* Connected Sources */}
                      <div className="px-6">
                        <div className="text-xs text-gray-400 mb-1">Fuentes conectadas</div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                            <span className="text-sm text-gray-900">{campaign.connectedSources.whatsapp}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-sm text-gray-900">{campaign.connectedSources.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-gray-900">{campaign.connectedSources.other}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="px-6">
                        <div className="text-xs text-gray-400 mb-1">Status</div>
                        <Badge
                          variant={campaign.status === "Activa" ? "default" : "secondary"}
                          className={
                            campaign.status === "Activa"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                          }
                        >
                          {campaign.status}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="flex justify-end space-x-2 mt-8">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-[#FFFFFF]">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-[#FFFFFF]">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button variant="default" size="sm" className="h-8 w-8 p-0 bg-[#31499F] hover:bg-blue-700">
          1
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-[#FFFFFF]">
          2
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-[#FFFFFF]">
          3
        </Button>
        <span className="text-gray-400 text-sm">...</span>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-[#FFFFFF]">
          10
        </Button>

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-[#FFFFFF]">
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-[#FFFFFF]">
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
