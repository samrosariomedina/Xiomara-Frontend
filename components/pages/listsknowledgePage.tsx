"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { DashboardLayout } from "@/components/dashboard/lists-dashboard-layout"
import { DataTable, type Column } from "../lists-tableData"
import { formatDateSafe } from "@/lib/utils"
import { useDataWithCache } from "@/hooks/useDataWithCache"
import { getReferencesAction } from "@/actions/knowledge"
import type { ReferenceResponse } from "@/lib/schemas"
import SourcesAdministrator from "./dashboardPage-Forms"
import { useClient } from "@/context/ClientContext"

interface KnowledgeBasePageProps {
  references: ReferenceResponse[]
}

function KnowledgeBasePage({ references }: KnowledgeBasePageProps) {
  const [isKnowledgeAdminOpen, setIsKnowledgeAdminOpen] = useState(false)
  const { selectedClient, isInitialized, isCampaignType, parentClient } = useClient()
  
  // Dynamic breadcrumbs based on folder type
  const getBreadcrumbs = () => {
    const baseCrumbs = [{ label: "Dashboard" }, { label: "Clientes", href: "/clients/channels" }]
    
    if (isCampaignType && parentClient) {
      return [
        ...baseCrumbs,
        { label: parentClient.title || "Client", href: "/clients/channels" },
        { label: selectedClient?.title || "Campaign" },
        { label: "Listado Knowledge Base" }
      ]
    }
    
    return [...baseCrumbs, { label: "Listado Knowledge Base" }]
  }
  
  const breadcrumbs = getBreadcrumbs()
  
  // Fetch client-specific knowledge base data
  const {
    data: clientReferences = [],
    isLoading: isLoadingReferences,
    error: referencesError
  } = useQuery({
    queryKey: ['references', selectedClient?._id],
    queryFn: async () => {
      if (!selectedClient?._id) return [];
      return await getReferencesAction({ folderId: selectedClient._id });
    },
    enabled: !!selectedClient?._id && isInitialized,
    staleTime: 30 * 1000,
    retry: 2,
  });
  
  // Use caching for references
  const {
    data: cachedReferences
  } = useDataWithCache(clientReferences, { cacheKey: 'references' })


  // Create a map to access content by id for the render functions
  const contentMap = new Map(cachedReferences.map(ref => [ref._id, ref.content]))

  // Create columns function that takes contentMap as parameter
  const columns: Column[] = [
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
  ]

  // Transform references to table data format
  const data = cachedReferences.map((ref) => ({
    id: ref._id,
    nombre: ref.title || 'Sin título',
    tipo: ref.type,
    categoria: 'General', // Default category since it's not in the schema
    estado: !ref.edited ? 'Activo' : 'Inactivo', // Convert boolean to string
    creadoPor: 'Sistema', // Default since user info is not available in current schema
    ultimaActualizacion: ref.timestamp,
  }))


  const handleAddClick = () => {
    setIsKnowledgeAdminOpen(true)
  }

  const handleCloseKnowledgeAdmin = () => {
    setIsKnowledgeAdminOpen(false)
  }

  // Show loading state while client context is initializing
  if (!isInitialized) {
    return (
      <DashboardLayout
        title="Listado Knowledge Base"
        breadcrumbs={breadcrumbs}
        onAddClick={handleAddClick}
        addButtonText="Agregar Knowledge Base"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Initializing...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Show message if no client is selected
  if (!selectedClient) {
    return (
      <DashboardLayout
        title="Listado Knowledge Base"
        breadcrumbs={breadcrumbs}
        onAddClick={handleAddClick}
        addButtonText="Agregar Knowledge Base"
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
  if (isLoadingReferences) {
    return (
      <DashboardLayout
        title="Listado Knowledge Base"
        breadcrumbs={breadcrumbs}
        onAddClick={handleAddClick}
        addButtonText="Agregar Knowledge Base"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading knowledge base for {selectedClient.name}...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Show error state if there's an error
  if (referencesError) {
    return (
      <DashboardLayout
        title="Listado Knowledge Base"
        breadcrumbs={breadcrumbs}
        onAddClick={handleAddClick}
        addButtonText="Agregar Knowledge Base"
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
      >
        
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Buscar Knowledge Base"
          cardType="knowledge-base"
          showAddButton={true}
          addButtonText="Agregar Knowledge Base"
          showUpdateButton={true}
        />
      </DashboardLayout>

      <SourcesAdministrator
        isOpen={isKnowledgeAdminOpen}
        onClose={handleCloseKnowledgeAdmin}
        references={cachedReferences}
        sources={[]}
        defaultTab="knowledge-base"
        clientId={selectedClient?._id}
      />
    </>
  )
}

export default KnowledgeBasePage