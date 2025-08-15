"use client"

import { Navbar } from "@/components/Navbar"
import { ClientsHeader } from "@/components/clients-header"
import { SearchFilters } from "@/components/search-filters"
import { EmptyState } from "@/components/empty-state"
import { ClientsList } from "@/components/clients-list"
import { useState } from "react"
import { ClientFormModal } from "@/pages/client-form-modals"
import { type ClientInput } from "@/lib/schemas"

export default function ClientsPage() {
 const [clients, setClients] = useState<ClientInput[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  
  const closeModal = () => setIsModalOpen(false)
  
  const handleCreateClient = (client: ClientInput) => {
    setClients((prev) => [...prev, client])
    closeModal()
  }
  
  const hasClients = clients.length > 0
  
  return (
    <div className="min-h-screen bg-[#F7F9FF]">
      <Navbar />
      <main className="px-6 py-8">
        <div className="max-w-[86rem] mx-auto">
          <ClientsHeader onCreateClient={openModal} />
          <SearchFilters />
          
          {hasClients ? (
            <ClientsList clients={clients} />
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
