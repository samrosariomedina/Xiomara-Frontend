"use client"

import { ClientsHeader } from "@/components/clientsPage-header"
import { EmptyState } from "@/components/clientsPage-emptyState"
import { ClientsList } from "@/components/clientsPage-cardWrapper"
import { useState, useMemo, useCallback } from "react"
import { ClientFormModal } from "@/components/pages/clientPage-Forms"
import { useTranslations } from 'next-intl'
import { paginateItems } from "@/utils/pagination"
import { Pagination } from "@/components/ui/pagination"
import { Client } from "@/utils/types"
import { Navbar } from "@/components/Navbar"
import { toast } from "sonner"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { deleteClientAction, getClientsAction } from "@/actions/clients"
import { ClientResponse } from "@/lib/schemas"
import { formatDateSafe } from "@/lib/utils"

interface ClientsPageProps {
  initialClients: ClientResponse[]
}

function ClientsPage({ initialClients }: ClientsPageProps) {
  const queryClient = useQueryClient()
  const t = useTranslations('CLIENTS')

  // Real-time query for clients with initial data
  const {
    data: clientsData = initialClients,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const result = await getClientsAction()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch clients')
      }
      return result.data || []
    },
    initialData: initialClients,
    staleTime: 30 * 1000, // 30 seconds for more real-time updates
    retry: 2,
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: 60 * 1000 // Refetch every minute for real-time updates
  })

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: deleteClientAction,
    onSuccess: () => {
      // Invalidate and refetch clients
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success(t('clientDeleted') || 'Client deleted successfully')
    },
    onError: (error: unknown) => {
      console.error('Error deleting client:', error)
      const errorMessage = error instanceof Error ? error.message : (t('deleteError') || 'Failed to delete client')
      toast.error(errorMessage)
    }
  })

  // Local state management
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editClient, setEditClient] = useState<{
    id: string
    name: string
    industry: string
    description?: string
    contactName: string
    whatsapp: string
    position: string
    email: string
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 8

  // Transform ClientResponse to Client type for the UI - memoized to prevent unnecessary re-renders
  const clients: Client[] = useMemo(() => {
    return clientsData.map((clientData: ClientResponse) => {
      const mockCampaigns = [
        {
          id: `campaign-1-${clientData._id}`,
          name: 'Digital Marketing Campaign',
          createdDate: '2024-01-15',
          connectedSources: { whatsapp: 3, email: 2, other: 1 },
          status: 'Activa',
        },
        {
          id: `campaign-2-${clientData._id}`,
          name: 'Brand Awareness Campaign',
          createdDate: '2024-01-10',
          connectedSources: { whatsapp: 1, email: 4, other: 2 },
          status: 'Inactiva',
        }
      ];

      return {
        id: clientData._id,
        name: clientData.metadata?.contactName || clientData.title || 'Unnamed Client',
        contact: clientData.metadata?.email || '',
        email: clientData.metadata?.email || '',
        createdDate: formatDateSafe(clientData.timestamp),
        campaigns: mockCampaigns.length,
        avatar: "/avatar.svg",
        campaignDetails: mockCampaigns
      };
    })
  }, [clientsData])

  // Local state handlers with proper error handling
  const openModal = useCallback(() => {
    setEditClient(null)
    setIsModalOpen(true)
  }, [])

  const openEditModal = useCallback((client: Client) => {
    // Find the original client data from clientsData
    const originalClient = clientsData.find((c: ClientResponse) => c._id === client.id)
    if (originalClient) {
      setEditClient({
        id: String(client.id),
        name: client.name,
        industry: originalClient.metadata?.industry || '',
        description: originalClient.metadata?.description || '',
        contactName: originalClient.metadata?.contactName || '',
        whatsapp: originalClient.metadata?.whatsapp || '',
        position: originalClient.metadata?.position || '',
        email: originalClient.metadata?.email || ''
      })
    }
    setIsModalOpen(true)
  }, [clientsData])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setEditClient(null)
  }, [])

  const handleDeleteClient = useCallback(async (clientId: string) => {
    await deleteClientMutation.mutateAsync(clientId)
  }, [deleteClientMutation])
 
 const hasClients = clients && clients.length > 0
 
 // Apply pagination to clients - memoized to prevent unnecessary recalculations
 const { currentItems: paginatedClients, pagination } = useMemo(() => {
   return paginateItems(clients, currentPage, itemsPerPage)
 }, [clients, currentPage, itemsPerPage])
 
 // Handle page change
 const handlePageChange = (page: number) => {
   setCurrentPage(page)
 }

 // Handle error state
 if (error) {
   return (
     <div className="min-h-screen bg-[#F7F9FF]">
       <Navbar />
       <main className="px-6 py-8">
         <div className="max-w-[86rem] mx-auto">
           <div className="text-center py-12">
             <h2 className="text-xl font-semibold text-gray-900 mb-4">
               {t('errorTitle') || 'Error loading clients'}
             </h2>
             <p className="text-gray-600 mb-6">
               {error instanceof Error ? error.message : (t('errorMessage') || 'Something went wrong while loading clients')}
             </p>
             <button
               onClick={() => refetch()}
               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
             >
               {t('retry') || 'Try Again'}
             </button>
           </div>
         </div>
       </main>
     </div>
   )
 }
 


   return (
    <div className="min-h-screen bg-[#F7F9FF]">
      <Navbar />
      <main className="px-6 py-8">
        <div className="max-w-[86rem] mx-auto">
          <ClientsHeader onCreateClient={openModal} />
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">
                {t('loading') || 'Loading clients...'}
              </p>
            </div>
          ) : hasClients ? (
            <>
              <ClientsList 
                clients={paginatedClients} 
                onDelete={handleDeleteClient}
                onEdit={openEditModal}
              />
              {pagination.totalPages > 1 && (
                <Pagination 
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <EmptyState onAction={openModal} />
          )}
        </div>
      </main>
      
      <ClientFormModal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        editClient={editClient}
      />
    </div>
  )
}

export default ClientsPage;
