"use client"

import {
  FileText,
  BarChart3,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShadcnRowActions } from "@/components/ui/ShadcnRowActions"
import { useRouter, usePathname } from "next/navigation"
import { getLocalizedRouteFromPathname } from '@/lib/routes'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAllCampaignsAction, deleteCampaignAction } from "@/actions/campaigns"
import type { CampaignResponse } from "@/lib/schemas"
import { formatDateSafe } from '@/lib/utils'
import { toast } from "sonner"
import { CreateCampaignDialog } from "@/components/clients/CreateCampaignDialog"
import { useState } from "react"
import { useClient } from '@/context/ClientContext'

interface CampaignTableProps {
  clientId: string
}

export function CampaignTable({ clientId }: CampaignTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { selectedClient } = useClient()
  const queryClient = useQueryClient()
  
  // State for edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<{
    id: string;
    name: string;
    type: string;
    startDate: string;
    description?: string;
  } | null>(null)

  // State for create dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)


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
    // Navigate to campaign fuentes using route params (NO CONTEXT NEEDED)
    const localizedRoute = getLocalizedRouteFromPathname(
      `/clients/${clientId}/campaigns/${campaign._id}/fuentes`, 
      pathname
    )
    router.push(localizedRoute)
  }

  const handleContentEngine = (campaign: CampaignResponse, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click
    
    // Navigate to campaign content engine using route params (NO CONTEXT NEEDED)
    const localizedRoute = getLocalizedRouteFromPathname(
      `/clients/${clientId}/campaigns/${campaign._id}/content-engine`, 
      pathname
    )
    router.push(localizedRoute)
  }

  const handleDashboard = (campaign: CampaignResponse, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click
    
    // Navigate to campaign dashboard using route params (NO CONTEXT NEEDED)
    const localizedRoute = getLocalizedRouteFromPathname(
      `/clients/${clientId}/campaigns/${campaign._id}`, 
      pathname
    )
    router.push(localizedRoute)
  }

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: deleteCampaignAction,
    onSuccess: () => {
      // Invalidate and refetch campaigns data
      queryClient.invalidateQueries({ queryKey: ['all-campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campaign deleted successfully')
      router.refresh()
    },
    onError: (error: unknown) => {
      console.error('Delete error:', error)
      toast.error('Failed to delete campaign')
    }
  })

  const handleDeleteCampaign = async (campaignId: string) => {
    await deleteCampaignMutation.mutateAsync(campaignId)
  }

  const handleEditCampaign = (campaign: CampaignResponse) => {
    // Set the campaign data for editing
    setEditingCampaign({
      id: campaign._id,
      name: campaign.title || '',
      type: campaign.metadata?.campaignType || 'Comunicado',
      startDate: campaign.metadata?.startDate || campaign.timestamp.split('T')[0],
      description: campaign.metadata?.description || ''
    })
    setIsEditDialogOpen(true)
  }

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false)
    setEditingCampaign(null)
  }

  const handleEditSuccess = () => {
    // Invalidate and refetch campaigns data when edit is successful
    queryClient.invalidateQueries({ queryKey: ['all-campaigns'] })
    queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    handleCloseEditDialog()
  }

  const handleCreateCampaign = () => {
    setIsCreateDialogOpen(true)
  }

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false)
  }

  const handleCreateSuccess = () => {
    // Invalidate and refetch campaigns data when create is successful
    queryClient.invalidateQueries({ queryKey: ['all-campaigns'] })
    queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    handleCloseCreateDialog()
  }

  if (clientCampaigns.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Campaigns Found</h3>
          <p className="text-gray-500 mb-6">This client doesn&apos;t have any campaigns yet.</p>
          <Button
            onClick={handleCreateCampaign}
            className="bg-[#31499f] hover:bg-blue-700 text-white rounded-full px-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Create Campaign Dialog */}
        <CreateCampaignDialog
          isOpen={isCreateDialogOpen}
          onClose={handleCloseCreateDialog}
          clientId={clientId}
          clientName={selectedClient?.title || 'Client'}
          onSuccess={handleCreateSuccess}
        />
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
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs">
              {clientCampaigns.length} campaign{clientCampaigns.length !== 1 ? 's' : ''}
            </Badge>
            <Button
              onClick={handleCreateCampaign}
              className="bg-[#31499f] hover:bg-blue-700 text-white rounded-full px-4"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
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
                    ? formatDateSafe(campaign.metadata.startDate)
                    : formatDateSafe(campaign.timestamp)
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
                <ShadcnRowActions
                  onEdit={() => handleEditCampaign(campaign)}
                  onDelete={() => handleDeleteCampaign(campaign._id)}
                  itemName={campaign.title || 'Unnamed Campaign'}
                  itemType="Campaign"
                  className="h-8 w-8 p-0"
                />
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
                <ShadcnRowActions
                  onEdit={() => handleEditCampaign(campaign)}
                  onDelete={() => handleDeleteCampaign(campaign._id)}
                  itemName={campaign.title || 'Unnamed Campaign'}
                  itemType="Campaign"
                  className="h-8 w-8 p-0"
                />
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
                      ? formatDateSafe(campaign.metadata.startDate)
                      : formatDateSafe(campaign.timestamp)
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

      {/* Edit Campaign Dialog */}
      {editingCampaign && (
        <CreateCampaignDialog
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          clientId={clientId}
          clientName={selectedClient?.title || 'Client'}
          editCampaign={editingCampaign}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Create Campaign Dialog */}
      <CreateCampaignDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        clientId={clientId}
        clientName={selectedClient?.title || 'Client'}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
