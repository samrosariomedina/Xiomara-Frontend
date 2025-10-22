"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/lists-dashboard-layout"
import { DataTable, type Column } from "../lists-tableData"
import { formatDateSafe } from "@/lib/utils"
import SourcesAdministrator from "./dashboardPage-Forms"
import { useClient } from "@/context/ClientContext"
import { useQuery } from '@tanstack/react-query'
import { getSources } from "@/actions/sources"
import { ClientOnly } from "@/components/providers/ClientOnly"

const columns: Column[] = [
  { key: "nombre", label: "Nombre", width: "200px" },
  { key: "tipo", label: "Tipo", width: "80px" },
  { key: "contenido", label: "Contenido", width: "300px" },
  { key: "estado", label: "Estado", width: "100px" },
  { key: "creadoPor", label: "Creado por", width: "180px" },
  { key: "ultimaActualizacion", label: "Última actualización", width: "150px" },
]

function FuentesGeneralesPage() {
  const [isSourcesAdminOpen, setIsSourcesAdminOpen] = useState(false)
  const { selectedClient, isCampaignType, parentClient } = useClient()

  // Dynamic breadcrumbs based on folder type
  const getBreadcrumbs = () => {
    const baseCrumbs = [{ label: "Dashboard" }, { label: "Clientes", href: "/clients/channels" }]
    
    if (isCampaignType && parentClient) {
      return [
        ...baseCrumbs,
        { label: parentClient.title || "Client", href: "/clients/channels" },
        { label: selectedClient?.title || "Campaign" },
        { label: "Listado Fuentes" }
      ]
    }
    
    return [...baseCrumbs, { label: "Listado Fuentes" }]
  }
  
  const breadcrumbs = getBreadcrumbs()

  // Fetch sources for selected client with folder filtering
  const {
    data: sources = [],
    isLoading: sourcesLoading,
    error: sourcesError
  } = useQuery({
    queryKey: ['sources', selectedClient?._id],
    queryFn: async () => {
      if (!selectedClient?._id) return [];
      return await getSources({ folderId: selectedClient._id });
    },
    enabled: !!selectedClient?._id,
    staleTime: 30 * 1000,
    retry: 2,
  })

  // Transform sources to table data format
  const data = sources.map((source) => ({
    id: source._id,
    nombre: source.title || 'Sin título',
    tipo: source.type === 'generales' ? 'General' : source.type,
    contenido: source.content || 'Sin contenido',
    estado: source.edited ? 'Editado' : 'En uso',
    creadoPor: 'Sistema', // Default since user info is not available in current schema
    ultimaActualizacion: source.timestamp ? formatDateSafe(source.timestamp) : 'N/A',
  }))

  const handleAddClick = () => {
    setIsSourcesAdminOpen(true)
  }

  const handleCloseSourcesAdmin = () => {
    setIsSourcesAdminOpen(false)
  }

  // Show loading state if no client selected or data is loading
  if (!selectedClient) {
    return (
      <DashboardLayout
        title="Listado Fuentes Generales"
        breadcrumbs={breadcrumbs}
        onAddClick={handleAddClick}
        addButtonText="Agregar Fuentes"
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Please select a client to view sources</p>
        </div>
      </DashboardLayout>
    );
  }

  // Show loading state while data is being fetched
  if (sourcesLoading) {
    return (
      <DashboardLayout
        title="Listado Fuentes Generales"
        breadcrumbs={breadcrumbs}
        onAddClick={handleAddClick}
        addButtonText="Agregar Fuentes"
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading sources...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state if there's an error
  if (sourcesError) {
    return (
      <DashboardLayout
        title="Listado Fuentes Generales"
        breadcrumbs={breadcrumbs}
        onAddClick={handleAddClick}
        addButtonText="Agregar Fuentes"
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Error loading sources. Please try again.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ClientOnly fallback={
      <DashboardLayout
        title="Listado Fuentes Generales"
        breadcrumbs={breadcrumbs}
        onAddClick={handleAddClick}
        addButtonText="Agregar Fuentes"
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      </DashboardLayout>
    }>
      <DashboardLayout
        title="Listado Fuentes Generales"
        breadcrumbs={breadcrumbs}
        onAddClick={handleAddClick}
        addButtonText="Agregar Fuentes"
      >
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Buscar Fuentes"
          cardType="fuentes"
          showAddButton={true}
          addButtonText="Agregar Fuentes"
        />
      </DashboardLayout>

      <SourcesAdministrator
        isOpen={isSourcesAdminOpen}
        onClose={handleCloseSourcesAdmin}
        references={[]}
        sources={sources}
      />
    </ClientOnly>
  )
}

export default FuentesGeneralesPage
