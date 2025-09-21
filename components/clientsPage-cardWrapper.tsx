"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl'
import RowActionsMenu from "./cards-rowActions"
import { ClientsListProps, MenuOpenData } from "../utils/types"
import { ClientCard } from "./clientsPage-clientCard"

export function ClientsList({ clients = [], campaigns = [], onDelete, onEdit }: ClientsListProps) {
  
  const t = useTranslations('CLIENTS');
  const [expandedClients, setExpandedClients] = useState<(number | string)[]>([])
  const [openMenuFor, setOpenMenuFor] = useState<MenuOpenData | null>(null)

  const toggleClient = (clientId: number | string) => {
    setExpandedClients((prev) => 
      prev.includes(clientId) 
        ? prev.filter((id) => id !== clientId) 
        : [...prev, clientId]
    )
  }

  // Handle deleting a client
  const handleDeleteClient = async (clientId: string | number) => {
    if (onDelete && typeof clientId === 'string') {
      await onDelete(clientId);
    }
  }

  const handleMenuOpen = (menuData: MenuOpenData) => {
    setOpenMenuFor(menuData)
  }

  // Top-level wrapper: proper margins from Figma
  return (
    <div className="mt-6">
      {/* Client List */}
      <div className="space-y-3">
        {clients.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            {t('noClients') || 'No clients found'}
          </div>
        ) : (
          clients.map((client) => {
            const isExpanded = expandedClients.includes(client.id)
            // Filter campaigns for this client
            const clientCampaigns = (campaigns || []).filter(campaign => {
              console.log('Campaign parent:', campaign.parent, 'Client ID:', client.id, 'Match:', campaign.parent === client.id.toString())
              return campaign.parent === client.id.toString()
            })
            console.log(`Client ${client.id} has ${clientCampaigns.length} campaigns:`, clientCampaigns)
            return (
              <ClientCard
                key={client.id}
                client={client}
                campaigns={clientCampaigns}
                isExpanded={isExpanded}
                onToggle={toggleClient}
                onDeleteClient={handleDeleteClient}
                onEditClient={onEdit}
                onMenuOpen={handleMenuOpen}
                t={t}
              />
            )
          })
        )}
      </div>

      {/* Row Actions Menu for Campaigns */}
      {openMenuFor && openMenuFor.campaignId && (
        <RowActionsMenu
          left={openMenuFor.left}
          top={openMenuFor.top}
          onEdit={() => console.log('edit', openMenuFor.clientId, openMenuFor.campaignId)}
          onAddSource={() => console.log('add source', openMenuFor.clientId, openMenuFor.campaignId)}
          onDelete={() => console.log('delete campaign', openMenuFor.clientId, openMenuFor.campaignId)}
          onClose={() => setOpenMenuFor(null)}
          itemName={`Campaign ${openMenuFor.campaignId}`}
        />
      )}
      
      {/* Row Actions Menu for Clients (no campaignId) */}
      {openMenuFor && openMenuFor.clientId && !openMenuFor.campaignId && (
        <RowActionsMenu
          left={openMenuFor.left}
          top={openMenuFor.top}
          onEdit={() => {
            if (onEdit && openMenuFor.clientId) {
              const client = clients.find(c => c.id === openMenuFor.clientId)
              if (client) {
                onEdit(client)
              }
            }
            setOpenMenuFor(null)
          }}
          onDelete={() => handleDeleteClient(openMenuFor.clientId)}
          onClose={() => setOpenMenuFor(null)}
          itemName={`Client ${openMenuFor.clientId}`}
        />
      )}
    </div>
  )
}
