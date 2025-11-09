"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DashboardLayout } from "@/components/dashboard/lists-dashboard-layout"
import { DataTable, type Column } from "../lists-tableData"
import { formatDateSafe } from "@/lib/utils"
import { getReferencesAction, removeReferenceAction } from "@/actions/knowledge"
import { getSources } from "@/actions/sources"
import type { ReferenceResponse, SourceResponse } from "@/lib/schemas"
import SourcesAdministrator from "./dashboardPage-Forms"
import { toast } from "sonner"
import { routes } from "@/lib/routes"

interface KnowledgeBasePageProps {
  clientId: string
  campaignId?: string
}

function KnowledgeBasePage({ clientId, campaignId }: KnowledgeBasePageProps) {
  const [isKnowledgeAdminOpen, setIsKnowledgeAdminOpen] = useState(false)
  const [editingReference, setEditingReference] = useState<ReferenceResponse | null>(null)
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
        { label: "Listado Knowledge Base" }
      ]
    }
    
    return [...baseCrumbs, { label: "Listado Knowledge Base" }]
  }
  
  const breadcrumbs = getBreadcrumbs()
  
  // Fetch client-specific knowledge base data
  const {
    data: cachedReferences = [],
    isLoading: isLoadingReferences,
    error: referencesError
  } = useQuery({
    queryKey: ['references', folderId],
    queryFn: async () => {
      if (!folderId) return [];
      return await getReferencesAction({ folderId });
    },
    enabled: !!folderId,
    staleTime: 30 * 1000,
    retry: 2,
  });

  // Fetch sources for the drawer to show complete data
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
  });

  // Delete mutation
  const deleteReferenceMutation = useMutation({
    mutationFn: (referenceId: string) => removeReferenceAction(referenceId, { folderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['references'] })
      toast.success('Knowledge base deleted successfully')
    },
    onError: (error: unknown) => {
      console.error('Delete reference error:', error)
      toast.error('Failed to delete knowledge base')
    }
  })

  // Memoize contentMap to prevent recreation on every render
  const contentMap = useMemo(() => 
    new Map(cachedReferences.map(ref => [ref._id, ref.content])),
    [cachedReferences]
  )

  // Memoize columns to prevent recreation on every render
  const columns: Column[] = useMemo(() => [
    {
      key: "nombre",
      label: "Nombre",
      width: "250px",
      render: (value, row) => {
        const content = contentMap.get(row.id as string)
        return (
          <div>
            <div className="font-medium">{String(value || "")}</div>
            <div className="text-sm text-gray-500">
              {typeof content === 'object' && content && 'description' in content
                ? (content as { description: string }).description 
                : 'Sin descripción'}
            </div>
          </div>
        )
      },
    },
    { 
      key: "tipo", 
      label: "Tipo", 
      width: "80px",
      render: (value: unknown) => {
        const typeMap: Record<string, string> = {
          'file': 'Archivo',
          'webpage': 'URL',
          'text': 'Texto'
        }
        return typeMap[value as string] || String(value)
      }
    },
    { key: "categoria", label: "Categoría", width: "120px" },
    { 
      key: "estado", 
      label: "Estado", 
      width: "100px",
      render: (value: unknown) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    { key: "creadoPor", label: "Creado por", width: "180px" },
    { 
      key: "ultimaActualizacion", 
      label: "Última actualización", 
      width: "150px",
      render: (value: unknown) => formatDateSafe(String(value))
    },
  ], [contentMap])

  // Memoize transformed data to prevent recreation on every render
  const data = useMemo(() => cachedReferences.map((ref) => ({
    id: ref._id,
    nombre: ref.title || 'Sin título',
    tipo: ref.type,
    categoria: 'General', // Default category since it's not in the schema
    estado: !ref.edited ? 'Activo' : 'Inactivo', // Convert boolean to string
    creadoPor: 'Sistema', // Default since user info is not available in current schema
    ultimaActualizacion: ref.timestamp,
  })), [cachedReferences])

  const handleAddClick = () => {
    setEditingReference(null)
    setIsKnowledgeAdminOpen(true)
  }

  const handleEditRow = (rowId: string) => {
    const reference = cachedReferences.find(r => r._id === rowId)
    if (reference) {
      setEditingReference(reference)
      setEditingSource(null)
      setIsKnowledgeAdminOpen(true)
    }
  }

  const handleDeleteRow = async (rowId: string) => {
    await deleteReferenceMutation.mutateAsync(rowId)
  }

  const handleCloseKnowledgeAdmin = () => {
    setIsKnowledgeAdminOpen(false)
    setEditingReference(null)
    setEditingSource(null)
  }

  // Show loading state while data is being fetched
  if (isLoadingReferences) {
    return (
        <DashboardLayout
          title="Listado Knowledge Base"
          breadcrumbs={breadcrumbs}
          onAddClick={handleAddClick}
          addButtonText="Agregar Knowledge Base"
          clientId={clientId}
          campaignId={campaignId}
        >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Client Selected</h3>
            <p className="text-gray-600 mb-6">
              Please select a client to view their knowledge base.
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Show loading state while data is loading
  if (isLoadingReferences || sourcesLoading) {
    return (
        <DashboardLayout
          title="Listado Knowledge Base"
          breadcrumbs={breadcrumbs}
          onAddClick={handleAddClick}
          addButtonText="Agregar Knowledge Base"
          clientId={clientId}
          campaignId={campaignId}
        >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading knowledge base...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Show error state if there's an error
  if (referencesError || sourcesError) {
    return (
        <DashboardLayout
          title="Listado Knowledge Base"
          breadcrumbs={breadcrumbs}
          onAddClick={handleAddClick}
          addButtonText="Agregar Knowledge Base"
          clientId={clientId}
          campaignId={campaignId}
        >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500">Error loading knowledge base data</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <>
        <DashboardLayout
          title="Listado Knowledge Base"
          breadcrumbs={breadcrumbs}
          onAddClick={handleAddClick}
          addButtonText="Agregar Knowledge Base"
          clientId={clientId}
          campaignId={campaignId}
        >
        
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Buscar Knowledge Base"
          cardType="knowledge-base"
          showAddButton={true}
          addButtonText="Agregar Knowledge Base"
          showUpdateButton={true}
          onEditRow={handleEditRow}
          onDeleteRow={handleDeleteRow}
        />
      </DashboardLayout>

      <SourcesAdministrator
        isOpen={isKnowledgeAdminOpen}
        onClose={handleCloseKnowledgeAdmin}
        references={cachedReferences}
        sources={sources}
        defaultTab="knowledge-base"
        folderId={folderId}
        clientId={clientId}
        campaignId={campaignId}
        editReference={editingReference}
        editSource={editingSource}
      />
    </>
  )
}

export default KnowledgeBasePage