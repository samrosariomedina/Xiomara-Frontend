"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/lists-dashboard-layout"
import { DataTable, type Column } from "../lists-tableData"
import { formatDateSafe } from "@/lib/utils"
import SourcesAdministrator from "./dashboardPage-Forms"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSources, removeSourceAction } from "@/actions/sources"
import { ClientOnly } from "@/components/providers/ClientOnly"
import { toast } from "sonner"
import type { SourceResponse } from "@/lib/schemas"
import { routes } from "@/lib/routes"

const columns: Column[] = [
  { key: "nombre", label: "Nombre", width: "200px" },
  { key: "tipo", label: "Tipo", width: "80px" },
  { key: "contenido", label: "Contenido", width: "300px" },
  { key: "estado", label: "Estado", width: "100px" },
  { key: "creadoPor", label: "Creado por", width: "180px" },
  { key: "ultimaActualizacion", label: "Última actualización", width: "150px" },
]

interface FuentesGeneralesPageProps {
  clientId: string
  campaignId?: string
}

function FuentesGeneralesPage({ clientId, campaignId }: FuentesGeneralesPageProps) {
  const [isSourcesAdminOpen, setIsSourcesAdminOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<SourceResponse | null>(null)
  const queryClient = useQueryClient()

  // Determine folder ID - campaignId takes priority over clientId
  const folderId = campaignId || clientId

  // Dynamic breadcrumbs based on folder type
  const getBreadcrumbs = () => {
    const baseCrumbs = [
      { label: "Clients list", href: routes.clients.page },
      { label: "Dashboard", href: routes.clients.clientDashboard(clientId) },
      { label: "Client", href: routes.clients.clientDashboard(clientId) }
    ]
    
    if (campaignId) {
      return [
        ...baseCrumbs,
        { label: "Campaign", href: routes.clients.campaignDashboard(clientId, campaignId) },
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
    queryKey: ['sources', folderId],
    queryFn: async () => {
      if (!folderId) return [];
      return await getSources({ folderId });
    },
    enabled: !!folderId,
    staleTime: 30 * 1000,
    retry: 2,
  })

  // Delete mutation
  const deleteSourceMutation = useMutation({
    mutationFn: removeSourceAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] })
      toast.success('Source deleted successfully')
    },
    onError: (error: unknown) => {
      console.error('Delete source error:', error)
      toast.error('Failed to delete source')
    }
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
    setEditingSource(null)
    setIsSourcesAdminOpen(true)
  }

  const handleEditRow = (rowId: string) => {
    const source = sources.find(s => s._id === rowId)
    if (source) {
      setEditingSource(source)
      setIsSourcesAdminOpen(true)
    }
  }

  const handleDeleteRow = async (rowId: string) => {
    await deleteSourceMutation.mutateAsync(rowId)
  }

  const handleCloseSourcesAdmin = () => {
    setIsSourcesAdminOpen(false)
    setEditingSource(null)
  }


  // Show loading state while data is being fetched
  if (sourcesLoading) {
    return (
      <DashboardLayout
        title="Listado Fuentes Generales"
        breadcrumbs={breadcrumbs}
        onAddClick={handleAddClick}
        addButtonText="Agregar Fuentes"
        clientId={clientId}
        campaignId={campaignId}
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
        clientId={clientId}
        campaignId={campaignId}
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
        clientId={clientId}
        campaignId={campaignId}
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
        clientId={clientId}
        campaignId={campaignId}
      >
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Buscar Fuentes"
          cardType="fuentes"
          showAddButton={true}
          addButtonText="Agregar Fuentes"
          onEditRow={handleEditRow}
          onDeleteRow={handleDeleteRow}
        />
      </DashboardLayout>

      <SourcesAdministrator
        isOpen={isSourcesAdminOpen}
        onClose={handleCloseSourcesAdmin}
        references={[]}
        sources={sources}
        defaultTab="fuentes-generales"
        editSource={editingSource}
        folderId={folderId}
        clientId={clientId}
        campaignId={campaignId}
      />
    </ClientOnly>
  )
}

export default FuentesGeneralesPage
