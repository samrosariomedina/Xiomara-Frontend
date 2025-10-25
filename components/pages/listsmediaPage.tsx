"use client"

import withAuth from "@/lib/withAuth"
import { DashboardLayout } from "@/components/dashboard/lists-dashboard-layout"
import { DataTable, type Column } from "../lists-tableData"
import { useClient } from "@/context/ClientContext"

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

function MediaListeningPage({ clientId, campaignId }: { clientId: string, campaignId: string }) {
  const { selectedClient, isCampaignType, parentClient } = useClient()
  
  // Dynamic breadcrumbs based on folder type
  const getBreadcrumbs = () => {
    const baseCrumbs = [{ label: "Dashboard" }, { label: "Clientes", href: "/clients/channels" }]
    
    if (isCampaignType && parentClient) {
      return [
        ...baseCrumbs,
        { label: parentClient.title || "Client", href: "/clients/channels" },
        { label: selectedClient?.title || "Campaign" },
        { label: "Listado Media Listening" }
      ]
    }
    
    return [...baseCrumbs, { label: "Listado Media Listening" }]
  }
  
  const breadcrumbs = getBreadcrumbs()
  
  return (
    <DashboardLayout
      title="Listado Media Listening"
      breadcrumbs={breadcrumbs}
      onAddClick={() => console.log("Add clicked")}
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
  )
}
export default withAuth(MediaListeningPage)