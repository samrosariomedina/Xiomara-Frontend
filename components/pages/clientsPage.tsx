"use client"

import { Navbar } from "@/components/navbar"
import { ClientsHeader } from "@/components/clientsPage-header"
import { EmptyState } from "@/components/clientsPage-emptyState"
import { ClientsList } from "@/components/clientsPage-cardWrapper"
import { useState,  useMemo } from "react"
import { ClientFormModal } from "@/components/pages/clientPage-Forms"
import { type ClientInput } from "@/lib/schemas"
import withAuth from "@/lib/withAuth"
import { useClients, useAuth } from "@/hooks/useAPI"
import { toast } from "sonner"
import { useTranslations } from 'next-intl'
import { paginateItems } from "@/utils/pagination"
import { Pagination } from "@/components/ui/pagination"
import { Client } from "@/utils/types"

function ClientsPage() {
 const { clients: clientsData, isLoading,  createClient, deleteClient } = useClients()
 const { token } = useAuth()
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [currentPage, setCurrentPage] = useState(1)
 const itemsPerPage = 8
 const t = useTranslations('CLIENTS')


 // Transform ClientData to Client type for the UI - memoized to prevent unnecessary re-renders
 const clients: Client[] = useMemo(() => {
   return clientsData.map((clientData) => {
     const mockCampaigns = [
       {
         id: `campaign-1-${clientData.id}`,
         name: 'Digital Marketing Campaign',
         createdDate: new Date(Date.now() - 86400000).toLocaleDateString(),
         connectedSources: { whatsapp: 3, email: 2, other: 1 },
         status: 'Activa',
       },
       {
         id: `campaign-2-${clientData.id}`,
         name: 'Brand Awareness Campaign',  
         createdDate: new Date(Date.now() - 2 * 86400000).toLocaleDateString(),
         connectedSources: { whatsapp: 1, email: 4, other: 2 },
         status: 'Inactiva',
       }
     ];
     
     return {
       id: clientData.id || 'unknown',
       name: clientData.name,
       contact: clientData.email || '',
       email: clientData.email,
       createdDate: new Date().toLocaleDateString(),
       campaigns: mockCampaigns.length,
       avatar: "/avatar.svg",
       campaignDetails: mockCampaigns
     };
   })
 }, [clientsData])

 const openModal = () => setIsModalOpen(true)
 
 const closeModal = () => setIsModalOpen(false)
 
 const handleCreateClient = async (clientData: ClientInput) => {
   if (!token) {
     toast.error('Authentication required')
     return
   }
   
   try {
     const newClient = await createClient({
       name: clientData.clientName,
       email: clientData.email,
       description: clientData.description
     }, token)
     if (newClient) {
       toast.success(t('clientCreated'))
       closeModal()
     }
   } catch (error) {
     console.error('Error creating client:', error);
     const errorMessage = error instanceof Error ? error.message : t('createError');
     toast.error(errorMessage);
   }
 }

 const handleDeleteClient = async (clientId: string) => {
   if (!token) {
     toast.error('Authentication required')
     return
   }
   
   try {
     await deleteClient(clientId, token)
     toast.success(t('clientDeleted'))
   } catch (error) {
     console.error('Error deleting client:', error);
     const errorMessage = error instanceof Error ? error.message : t('deleteError');
     toast.error(errorMessage);
   }
 }
 
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
             <ClientsList clients={paginatedClients} onDelete={handleDeleteClient} />
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
       onSubmit={handleCreateClient}
     />
   </div>
 )
}

export default withAuth(ClientsPage);
