"use client"

import { useState, useCallback } from "react"
import { useTranslations } from 'next-intl'
import { Client, Campaign } from "@/utils/types"
import { ClientCard } from "./clientsPage-clientCard"
import { useMutation } from "@tanstack/react-query"
import { deleteClientAction } from "@/actions/clients"
import { deleteCampaignAction } from "@/actions/campaigns"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { CampaignResponse } from "@/lib/schemas"
import { CreateCampaignDialog } from "./CreateCampaignDialog"

interface ClientsListComponentProps {
  clients: Client[];
  campaigns: CampaignResponse[];
  onEditClient?: (client: Client) => void;
}

export function ClientsList({ clients = [], campaigns = [], onEditClient }: ClientsListComponentProps) {
  
  const t = useTranslations('CLIENTS');
  const [expandedClients, setExpandedClients] = useState<(number | string)[]>([])
  const [editingCampaign, setEditingCampaign] = useState<{
    id: string;
    name: string;
    type: string;
    startDate: string;
    description?: string;
  } | null>(null)
  const [isEditCampaignDialogOpen, setIsEditCampaignDialogOpen] = useState(false)
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
    if (onEditClient) {
      onEditClient(client)
    } else {
      console.log('Edit client:', client)
    }
  }, [onEditClient]); 
  

  const handleDeleteClient = useCallback(async (clientId: string | number) => {
    console.log('[ClientsList] handleDeleteClient called with:', clientId)
    console.log('[ClientsList] clientId type:', typeof clientId)
    
    if (typeof clientId === 'string') {
      console.log('[ClientsList] Calling deleteClientMutation...')
      try {
        await deleteClientMutation.mutateAsync(clientId)
        console.log('[ClientsList] Delete mutation successful')
      } catch (error) {
        console.error('[ClientsList] Delete mutation error:', error)
        throw error // Re-throw to propagate the error
      }
    } else {
      console.error('[ClientsList] Invalid clientId type:', typeof clientId)
    }
  }, [deleteClientMutation]);

  const handleDeleteCampaign = useCallback((campaignId: string) => {
    return deleteCampaignMutation.mutateAsync(campaignId)
  }, [deleteCampaignMutation]); 

  // Handle campaign edit
  const handleEditCampaign = useCallback((campaign: Campaign) => {
    // Find the campaign in the campaigns array to get full data
    const fullCampaign = campaigns.find(c => c._id === campaign.id.toString())
    
    if (fullCampaign) {
      setEditingCampaign({
        id: fullCampaign._id,
        name: fullCampaign.title || campaign.name,
        type: fullCampaign.metadata?.campaignType || 'Comunicado',
        startDate: fullCampaign.metadata?.startDate || fullCampaign.timestamp.split('T')[0],
        description: fullCampaign.metadata?.description || ''
      })
      setIsEditCampaignDialogOpen(true)
    }
  }, [campaigns])


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
                onDeleteCampaign={(campaignId: string) => handleDeleteCampaign(campaignId).then(() => {})}
                onEditClient={handleEditClient}
                onEditCampaign={handleEditCampaign}
                t={t}
              />
            )
          })
        )}
      </div>

      

      {/* Edit Campaign Dialog */}
      {editingCampaign && (
        <CreateCampaignDialog
          isOpen={isEditCampaignDialogOpen}
          onClose={() => {
            setIsEditCampaignDialogOpen(false)
            setEditingCampaign(null)
          }}
          clientId={campaigns.find(cam => cam._id === editingCampaign.id)?.parent || ''}
          clientName={clients.find(c => campaigns.find(cam => cam._id === editingCampaign.id)?.parent === c.id.toString())?.name || 'Client'}
          editCampaign={editingCampaign}
          onSuccess={() => {
            setIsEditCampaignDialogOpen(false)
            setEditingCampaign(null)
          }}
        />
      )}
    </div>
  )
}
