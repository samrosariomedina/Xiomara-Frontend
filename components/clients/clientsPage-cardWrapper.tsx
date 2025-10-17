"use client"

import { useState, useCallback } from "react"
import { useTranslations } from 'next-intl'
import RowActionsMenu from "./cards-rowActions"
import { Client, ClientsListProps, MenuOpenData } from "@/utils/types"
import { ClientCard } from "./clientsPage-clientCard"
import { useMutation } from "@tanstack/react-query"
import { deleteClientAction } from "@/actions/clients"
import { deleteCampaignAction } from "@/actions/campaigns"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ClientsList({ clients = [], campaigns = [] }: Omit<ClientsListProps, 'onDelete' | 'onEdit'>) {
  
  const t = useTranslations('CLIENTS');
  const [expandedClients, setExpandedClients] = useState<(number | string)[]>([])
  const [openMenuFor, setOpenMenuFor] = useState<MenuOpenData | null>(null)
  const router = useRouter(); 

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: deleteClientAction,
    onSuccess: () => {
      toast.success(t('clientDeleted') || 'Client deleted successfully')
      router.refresh();
    },
    onError: (error: unknown) => {
      console.error('Error deleting client:', error)
      const errorMessage = error instanceof Error ? error.message : (t('deleteError') || 'Failed to delete client')
      toast.error(errorMessage)
    }
  })

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: deleteCampaignAction,
    onSuccess: () => {
      toast.success('Campaign deleted successfully')
      setOpenMenuFor(null)
      router.refresh();
    },
    onError: (error: unknown) => {
      console.error('Delete error:', error)
      toast.error('Failed to delete campaign')
    }
  })

  const toggleClient = (clientId: number | string) => {
    setExpandedClients((prev) => 
      prev.includes(clientId) 
        ? prev.filter((id) => id !== clientId) 
        : [...prev, clientId]
    )
  }

  // Local edit and delete functions
  const handleEditClient = useCallback((client: Client) => {
   
    console.log('Edit client:', client)
    // TODO: Implement edit functionality or pass to parent
  }, []); 
  

  const handleDeleteClient = useCallback(async (clientId: string | number) => {
    if (typeof clientId === 'string') {
      await deleteClientMutation.mutateAsync(clientId)
      setOpenMenuFor(null)
    }
  }, [deleteClientMutation]);

  const handleDeleteCampaign = useCallback((campaignId: string) => {
    return deleteCampaignMutation.mutateAsync(campaignId)
  }, [deleteCampaignMutation]); 

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
              return campaign.parent === client.id.toString()
            })
            return (
              <ClientCard
                key={client.id}
                client={client}
                campaigns={clientCampaigns}
                isExpanded={isExpanded}
                onToggle={toggleClient}
                onDeleteClient={handleDeleteClient}
                onEditClient={handleEditClient}
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
          onDelete={async () => {
            await handleDeleteCampaign(openMenuFor.campaignId as string)
          }}
          onClose={() => setOpenMenuFor(null)}
          itemName={campaigns.find(c => c._id === openMenuFor.campaignId)?.title || `Campaign ${openMenuFor.campaignId}`}
          context="campaign"
        />
      )}
      
      {/* Row Actions Menu for Clients (no campaignId) */}
      {openMenuFor && openMenuFor.clientId && !openMenuFor.campaignId && (
        <RowActionsMenu
          left={openMenuFor.left}
          top={openMenuFor.top}
          onEdit={() => {
            if (openMenuFor.clientId) {
              const client = clients.find(c => c.id === openMenuFor.clientId)
              if (client) {
                handleEditClient(client)
              }
            }
            setOpenMenuFor(null)
          }}
          onDelete={() => handleDeleteClient(openMenuFor.clientId)}
          onClose={() => setOpenMenuFor(null)}
          itemName={clients.find(c => c.id === openMenuFor.clientId)?.name || `Client ${openMenuFor.clientId}`}
          actions={["edit", "delete"]}
          context="client"
        />
      )}
    </div>
  )
}
