"use client"

import { useState } from "react"
import {
  ChevronRight,
  ChevronDown,
  Edit,
  LineChart,
  BarChart3,
  Plus,
  ChevronLeft,
  ChevronRightIcon,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  MoreHorizontal,
  Users,
  Globe,
  Ear,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from 'next-intl'
import { type ClientInput } from "@/lib/schemas"
import RowActionsMenu from "./RowActionsMenu"

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

// Default mock data for when not receiving props
const defaultClientsData = [
  {
    id: 1,
    name: "Nombre cliente",
    contact: "Nombre contacto",
    createdDate: "16/06/2025",
    campaigns: 1,
    avatar: "/professional-business-person.png",
    campaignDetails: [
      {
        id: 1,
        name: "Nombre campaña",
        createdDate: "16/06/2025",
        connectedSources: { whatsapp: 2, email: 2, other: 2 },
        status: "Activa",
      },
      {
        id: 2,
        name: "Nombre campaña",
        createdDate: "16/06/2025",
        connectedSources: { whatsapp: 2, email: 3, other: 2 },
        status: "Activa",
      },
    ],
  },
  {
    id: 2,
    name: "NC Nombre cliente",
    contact: "Nombre contacto",
    createdDate: "16/06/2025",
    campaigns: 1,
    campaignDetails: [],
  },
  {
    id: 3,
    name: "NC Nombre cliente",
    contact: "Nombre contacto",
    createdDate: "16/06/2025", 
    campaigns: 1,
    campaignDetails: [],
  },
]

export function ClientsList({ clients = [] }: ClientsListProps) {
  const t = useTranslations('CLIENTS');
  const [expandedClients, setExpandedClients] = useState<number[]>([])
  const [openMenuFor, setOpenMenuFor] = useState<{
    clientId: number
    campaignId: number
    left?: number
    top?: number
  } | null>(null)

  const toggleClient = (clientId: number) => {
    setExpandedClients((prev) => (prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]))
  }

  // Use mock data if no clients are provided, otherwise transform props
  const clientsData = clients.length > 0
    ? clients.map((client, index) => ({
        id: index + 1,
        name: client.clientName,
        contact: client.contactName,
        email: client.email,
        createdDate: new Date().toLocaleDateString(),
        campaigns: Math.floor(Math.random() * 3) + 1,
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
        ] as Campaign[],
      }))
    : defaultClientsData;

  // Top-level wrapper: proper margins from Figma
  return (
    <div className="mt-6">
      {/* Client List */}
      <div className="space-y-3">
        {clientsData.map((client) => {
          const isExpanded = expandedClients.includes(client.id)
          return (
            <div key={client.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Main Client Row */}
              <div className="p-4 hover:bg-gray-50 transition-colors">
                {/* Desktop Layout */}
                <div className="hidden md:flex items-center w-full">
                  {/* Left Section - Client Info (equal width) */}
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {/* Expand Arrow */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-gray-100"
                      onClick={() => toggleClient(client.id)}
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
                          .map((n) => n[0])
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
                    <div className="text-xs text-gray-400 mb-1">{t('campaigns')}</div>
                    <div className="flex items-center justify-center space-x-3">
                      <div className="flex items-center space-x-2 bg-[#F7F9FF] rounded-lg px-2 py-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-sm text-gray-900 font-medium">{client.campaigns}</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-[#F7F9FF] rounded-lg px-2 py-1">
                        <TrendingDown className="h-3 w-3 text-red-500" />
                        <span className="text-sm text-gray-900 font-medium">1</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Actions (equal width) */}
                  <div className="flex-1 flex items-center justify-end space-x-4">
                    {/* Edit Button */}
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-[#f7f9ff]">
                      <Edit className="h-4 w-4 text-gray-400" />
                    </Button>

                    {/* Analytics Button */}
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-[#f7f9ff]">
                      <LineChart className="h-4 w-4 text-gray-400" />
                    </Button>

                    {/* Create Campaign Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent rounded-full"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {t('createCampaign')}
                    </Button>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {/* Expand Arrow */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-gray-100 mt-1"
                        onClick={() => toggleClient(client.id)}
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
                            .map((n) => n[0])
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

                  {/* Mobile Actions - aligned to right */}
                  <div className="flex justify-end mt-3 space-x-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                      <Edit className="h-4 w-4 text-gray-400" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Campaign Details */}
              {isExpanded && client.campaignDetails.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50/30">
                  {client.campaignDetails.map((campaign, index) => (
                    <div key={campaign.id} className="px-4 py-4 hover:bg-gray-50 transition-colors">
                      {/* Desktop Campaign Layout */}
                      <div className="hidden md:flex items-center w-full">
                        {/* Campaign Number and Name (30% width) */}
                        <div className="flex items-start space-x-4 w-[30%]">
                          <div className="w-6 flex justify-center pt-1">
                            <span className="text-sm font-medium text-gray-900">{index + 1}</span>
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
                                  ? "bg-green-100 text-green-800 hover:bg-green-100 text-xs px-2 py-1"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-100 text-xs px-2 py-1"
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
                              const rect = (e.target as HTMLElement).closest('button')?.getBoundingClientRect()
                              const left = rect ? rect.right - 208 : window.innerWidth - 208
                              const top = rect ? rect.bottom + 8 : 100
                              setOpenMenuFor({ clientId: client.id, campaignId: campaign.id, left, top })
                            }}
                          >
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </Button>
                        </div>
                      </div>

                      {/* Mobile Campaign Layout */}
                      <div className="md:hidden space-y-3">
                        {/* Campaign Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-xs text-gray-400">Campaña</div>
                            <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400">{t('creationDate')}</div>
                            <div className="text-sm text-gray-900">{campaign.createdDate}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full"
                            onClick={(e) => {
                              const rect = (e.target as HTMLElement).closest('button')?.getBoundingClientRect()
                              const left = rect ? rect.right - 208 : window.innerWidth - 208
                              const top = rect ? rect.bottom + 8 : 100
                              setOpenMenuFor({ clientId: client.id, campaignId: campaign.id, left, top })
                            }}
                          >
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </Button>
                        </div>

                        {/* Connected Sources and Status */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-gray-400 mb-2">Fuentes conectadas</div>
                            <div className="flex flex-wrap gap-2">
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
                          <div className="text-right">
                            <div className="text-xs text-gray-400 mb-2">Status</div>
                            <Badge
                              variant={campaign.status === "Activa" ? "default" : "secondary"}
                              className={
                                campaign.status === "Activa"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100 text-xs px-2 py-1"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-100 text-xs px-2 py-1"
                              }
                            >
                              {campaign.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Row Actions Menu */}
                      {openMenuFor && openMenuFor.clientId === client.id && openMenuFor.campaignId === campaign.id && (
                        <RowActionsMenu
                          left={openMenuFor.left}
                          top={openMenuFor.top}
                          onEdit={() => console.log('edit', client.id, campaign.id)}
                          onAddSource={() => console.log('add source', client.id, campaign.id)}
                          onDelete={() => console.log('delete', client.id, campaign.id)}
                          onClose={() => setOpenMenuFor(null)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-end justify-end space-x-2 mt-8">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button variant="default" size="sm" className="h-8 w-8 p-0 bg-blue-900 hover:bg-blue-800">
          1
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          2
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          3
        </Button>
        <span className="text-gray-400 text-sm">...</span>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          10
        </Button>

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
