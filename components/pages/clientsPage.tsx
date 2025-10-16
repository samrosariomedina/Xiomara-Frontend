"use client"

import { ClientsHeader } from "@/components/clients/clientsPage-header"
import { EmptyState } from "@/components/clients/clientsPage-emptyState"
import { ClientsList } from "@/components/clients/clientsPage-cardWrapper"
import { useState, useMemo, useRef, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { paginateItems } from "@/utils/pagination"
import { Pagination } from "@/components/ui/pagination"
import { Navbar } from "@/components/Navbar"
import { ClientResponse, CampaignResponse } from "@/lib/schemas"
import { Client } from "@/utils/types"
import { formatDateSafe } from "@/lib/utils"
import { ClientFormModal } from "@/components/pages/clientPage-Forms"

interface ClientsPageProps {
  initialClients: ClientResponse[]
  initialCampaigns: CampaignResponse[]
}

function ClientsPage({ initialClients, initialCampaigns }: ClientsPageProps) {
  const t = useTranslations('CLIENTS')

  // Use server-fetched data directly
  const clientsData = initialClients
  const isLoading = false

  const itemsPerPage = 8

  // Modal state - only for opening the modal
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  // Use ref to store latest clientsData to avoid dependency issues
  const clientsDataRef = useRef(clientsData)
  useEffect(() => {
    clientsDataRef.current = clientsData
  }, [clientsData])

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

  



 
 const hasClients = clients && clients.length > 0
 

  const currentPage = 1; 
  const { currentItems: paginatedClients, pagination } = useMemo(() => {
    return paginateItems(clients, currentPage, itemsPerPage)
  }, [clients, currentPage, itemsPerPage])
 

// Handle error state

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
                campaigns={initialCampaigns}
              />
              {pagination.totalPages > 1 && (
                <Pagination 
                  totalPages={pagination.totalPages}
                  initialPage={currentPage}
                />
              )}
            </>
          ) : (
              <EmptyState onCreateClient={openModal} />
          )}
        </div>
      </main>
      
      {/* Client Form Modal */}
      <ClientFormModal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        editClient={null}
      />
    </div>
  )
}

export default ClientsPage;
