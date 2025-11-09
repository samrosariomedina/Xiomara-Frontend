"use client"

import { useState } from "react"
import withAuth from "@/lib/withAuth"
import { DashboardLayout } from "@/components/dashboard/lists-dashboard-layout"
import { DataTable, type Column } from "../lists-tableData"
import { useClient } from "@/context/ClientContext"
import { routes } from "@/lib/routes"
import { useQuery } from "@tanstack/react-query"
import { getSources } from "@/actions/sources"
import { getReferences } from "@/actions/knowledge"
import SourcesAdministrator from "./dashboardPage-Forms"
import type { SourceResponse, ReferenceResponse } from "@/lib/schemas"

const columns: Column[] = [
  { key: "nombre", label: "Nombre", width: "200px" },
  { key: "tipo", label: "Tipo", width: "80px" },
  { key: "contenido", label: "Contenido", width: "300px" },
  { key: "estado", label: "Estado", width: "100px" },
  { key: "creadoPor", label: "Creado por", width: "180px" },
  { key: "ultimaActualizacion", label: "Última actualización", width: "150px" },
]

const data = Array.from({ length: 25 }, () => ({
  nombre: "Nombre",
  tipo: "PDF",
  contenido: "Lorem ipsum dolor sit",
  estado: "En uso",
  creadoPor: "Nombre de la persona",
  ultimaActualizacion: "16/06/2025",
}))

function MediaListeningPage({ clientId, campaignId }: { clientId: string, campaignId?: string }) {
  const { isCampaignType, parentClient } = useClient()
  const [isSourcesAdminOpen, setIsSourcesAdminOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<SourceResponse | null>(null)
  const [editingReference, setEditingReference] = useState<ReferenceResponse | null>(null)
  
  // Determine folder ID - campaignId takes priority over clientId
  const folderId = campaignId || clientId
  
  // Dynamic breadcrumbs based on folder type
  const getBreadcrumbs = () => {
    const baseCrumbs = [
      { label: "Clients list", href: routes.clients.page },
      { label: "Dashboard", href: routes.clients.clientDashboard(clientId) },
      { label: "Client", href: routes.clients.clientDashboard(clientId) }
    ]
    
    if (isCampaignType && parentClient && campaignId) {
      return [
        ...baseCrumbs,
        { label: "Campaign", href: routes.clients.campaignDashboard(clientId, campaignId) },
        { label: "Listado Media Listening" }
      ]
    }
    
    return [...baseCrumbs, { label: "Listado Media Listening" }]
  }
  
  const breadcrumbs = getBreadcrumbs()

  // Fetch sources for the drawer to show complete data
  const {
    data: sources = []
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

  // Fetch references for the drawer to show complete data
  const {
    data: references = []
  } = useQuery({
    queryKey: ['references', folderId],
    queryFn: async () => {
      if (!folderId) return [];
      return await getReferences({ folderId });
    },
    enabled: !!folderId,
    staleTime: 30 * 1000,
    retry: 2,
  })

  const handleAddClick = () => {
    setEditingSource(null)
    setEditingReference(null)
    setIsSourcesAdminOpen(true)
  }

  const handleCloseSourcesAdmin = () => {
    setIsSourcesAdminOpen(false)
    setEditingSource(null)
    setEditingReference(null)
  }
  
  return (
    <>
      <DashboardLayout
        title="Listado Media Listening"
        breadcrumbs={breadcrumbs}
        onAddClick={handleAddClick}
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
        />
      </DashboardLayout>

      {folderId && (
        <SourcesAdministrator
          isOpen={isSourcesAdminOpen}
          onClose={handleCloseSourcesAdmin}
          references={references}
          sources={sources}
          defaultTab="media-listening"
          folderId={folderId}
          clientId={clientId}
          campaignId={campaignId}
          editSource={editingSource}
          editReference={editingReference}
        />
      )}
    </>
  )
}

export default withAuth(MediaListeningPage)