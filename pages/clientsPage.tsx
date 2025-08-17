"use client"

import { Navbar } from "@/components/Navbar"
import { ClientsHeader } from "@/components/clients-header"
import { SearchFilters } from "@/components/search-filters"
import { EmptyState } from "@/components/empty-state"
import { ClientsList } from "@/components/clients-list"
import { useState, useEffect } from "react"
import { ClientFormModal } from "@/pages/client-form-modals"
import { type ClientInput } from "@/lib/schemas"
import withAuth from "@/lib/withAuth"
import { getClients, createClient, deleteClient } from "@/actions/clients"
import { toast } from "sonner"
import { useTranslations } from 'next-intl'
import { paginateItems } from "@/utils/pagination"
import { Pagination } from "@/components/ui/pagination"

function ClientsPage() {
 const [clients, setClients] = useState<any[]>([])
 const [loading, setLoading] = useState(true)
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [currentPage, setCurrentPage] = useState(1)
 const itemsPerPage = 8
 const t = useTranslations('CLIENTS')

 useEffect(() => {
   fetchClients()
 }, []) // eslint-disable-line react-hooks/exhaustive-deps

 const fetchClients = async () => {
   setLoading(true)
   try {
     const result = await getClients()
     console.log('Client result from API:', result); // Debug log
     if (result.success) {
       // Transform backend data structure to match frontend model
       console.log('Raw data from backend:', result.data); // Debug log
       
       if (!Array.isArray(result.data)) {
         console.error('Expected array of clients, got:', typeof result.data);
         setClients([]);
         return;
       }
       
       // Filter for folders with metadata.type = 'client'
       const clientFolders = result.data.filter(folder => 
         folder && folder.metadata && folder.metadata.type === 'client'
       );
       
       console.log('Filtered client folders:', clientFolders);
       
       if (clientFolders.length === 0) {
         console.log('No clients found in backend');
         setClients([]);
         return;
       }
       
       const transformedClients = clientFolders.map((folder: any) => ({
         id: folder._id,
         name: folder.title,
         contact: folder.metadata?.contact?.name || "",
         createdDate: new Date(folder.timestamp).toLocaleDateString(),
         campaigns: folder.children?.length || 0,
         avatar: "/avatar.svg",
         campaignDetails: folder.children?.map((campaign: any) => ({
           id: campaign._id,
           name: campaign.title,
           createdDate: new Date(campaign.timestamp).toLocaleDateString(),
           connectedSources: {
             whatsapp: campaign.files?.sources?.filter((s: any) => s.type === 'whatsapp').length || 0,
             email: campaign.files?.sources?.filter((s: any) => s.type === 'email').length || 0,
             other: campaign.files?.sources?.filter((s: any) => s.type !== 'whatsapp' && s.type !== 'email').length || 0
           },
           status: campaign.metadata?.status || "Activa"
         })) || []
       }))
       setClients(transformedClients)
     } else {
       toast.error(result.error || t('fetchError'))
     }
   } catch (error) {
     console.error('Error fetching clients:', error)
     toast.error(t('fetchError'))
   } finally {
     setLoading(false)
   }
 }

 const openModal = () => setIsModalOpen(true)
 
 const closeModal = () => setIsModalOpen(false)
 
 const handleCreateClient = async (clientData: ClientInput) => {
   try {
     const result = await createClient(clientData)
     if (result.success) {
       toast.success(t('clientCreated'))
       fetchClients() // Refresh the list
       closeModal()
     } else {
       toast.error(result.error || t('createError'))
     }
   } catch (error) {
     console.error('Error creating client:', error)
     toast.error(t('createError'))
   }
 }

 const handleDeleteClient = async (clientId: string) => {
   try {
     const result = await deleteClient(clientId)
     if (result.success) {
       toast.success(t('clientDeleted'))
       fetchClients() // Refresh the list
     } else {
       toast.error(result.error || t('deleteError'))
     }
   } catch (error) {
     console.error('Error deleting client:', error)
     toast.error(t('deleteError'))
   }
 }
 
 const hasClients = clients && clients.length > 0
 
 // Apply pagination to clients
 const { currentItems: paginatedClients, pagination } = paginateItems(clients, currentPage, itemsPerPage)
 
 // Handle page change
 const handlePageChange = (page: number) => {
   setCurrentPage(page)
 }
 
 console.log('Has clients:', hasClients, 'Clients array:', clients);

 return (
   <div className="min-h-screen bg-[#F7F9FF]">
     <Navbar />
     <main className="px-6 py-8">
       <div className="max-w-[86rem] mx-auto">
         <ClientsHeader onCreateClient={openModal} />
         <SearchFilters />
         
         {loading ? (
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
