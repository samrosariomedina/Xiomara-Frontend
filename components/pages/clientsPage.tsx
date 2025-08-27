"use client"

import { ClientsHeader } from "@/components/clientsPage-header"
import { EmptyState } from "@/components/clientsPage-emptyState"
import { ClientsList } from "@/components/clientsPage-cardWrapper"
import { useState, useMemo, useCallback } from "react"
import { ClientFormModal } from "@/components/pages/clientPage-Forms"
import { useClients } from "@/hooks/useClients"
import { useTranslations } from 'next-intl'
import { paginateItems } from "@/utils/pagination"
import { Pagination } from "@/components/ui/pagination"
import { Client } from "@/utils/types"
import { Navbar } from "@/components/Navbar"
import { toast } from "sonner"

function ClientsPage() {
  const { clients: clientsData, isLoading, deleteClient } = useClients()
  
  // Local state management
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  
  const itemsPerPage = 8
  const t = useTranslations('CLIENTS')

  // Transform ClientData to Client type for the UI - memoized to prevent unnecessary re-renders
  const clients: Client[] = useMemo(() => {
    return clientsData.map((clientData) => {
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
        name: clientData.metadata?.clientName || clientData.title,
        contact: clientData.metadata?.email || '',
        email: clientData.metadata?.email || '',
        createdDate: '2024-01-20',
        campaigns: mockCampaigns.length,
        avatar: "/avatar.svg",
        campaignDetails: mockCampaigns
      };
    })
  }, [clientsData])

  // Local state handlers with proper error handling
  const openModal = useCallback(() => setIsModalOpen(true), [])
  
  const closeModal = useCallback(() => setIsModalOpen(false), [])
  
  const handleDeleteClient = useCallback(async (clientId: string) => {
    try {
      await deleteClient(clientId)
      toast.success(t('clientDeleted') || 'Client deleted successfully')
    } catch (error) {
      console.error('Error deleting client:', error)
      toast.error(t('deleteError') || 'Failed to delete client')
    }
  }, [deleteClient, t])
 
 const hasClients = clients && clients.length > 0
 
 // Apply pagination to clients - memoized to prevent unnecessary recalculations
 const { currentItems: paginatedClients, pagination } = useMemo(() => {
   return paginateItems(clients, currentPage, itemsPerPage)
 }, [clients, currentPage, itemsPerPage])
 
 // Handle page change
 const handlePageChange = (page: number) => {
   setCurrentPage(page)
 }
 


   return (
    <div className="min-h-screen bg-[#F7F9FF]">
      <Navbar />
      <main className="px-6 py-8">
        <div className="max-w-[86rem] mx-auto">
          <ClientsHeader onCreateClient={openModal} />
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#31499F]"></div>
            </div>
          ) : hasClients ? (
            <>
              <ClientsList 
                clients={paginatedClients} 
                onDelete={handleDeleteClient}
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
      />
    </div>
  )
}

export default ClientsPage;
