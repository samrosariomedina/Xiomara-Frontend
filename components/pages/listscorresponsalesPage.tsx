"use client"
import withAuth from "@/lib/withAuth"
import { useState } from "react"
import { DashboardLayout } from   "@/components/dashboard/lists-dashboard-layout"
import { DataTable, type Column } from "../lists-tableData"
import { useCorresponsables } from "@/hooks/useCorresponsables"
import { formatDateSafe } from "@/lib/utils"
import SourcesAdministrator from "./dashboardPage-Forms"

const usuariosColumns: Column[] = [
  { key: "nombre", label: "Nombre", width: "200px" },
  { key: "email", label: "Email", width: "200px" },
  { key: "celular", label: "Celular", width: "150px" },
  { key: "fuentesCreadas", label: "No. fuentes creadas", width: "150px" },
  { key: "estado", label: "Estado", width: "100px" },
  { key: "ultimaActualizacion", label: "Última actualización", width: "150px" },
]

const fuentesColumns: Column[] = [
  { key: "nombre", label: "Nombre", width: "200px" },
  { key: "tipo", label: "Tipo", width: "100px" },
  { key: "contenido", label: "Contenido", width: "250px" },
  { key: "estado", label: "Estado", width: "100px" },
  { key: "creadoPor", label: "Creado por", width: "180px" },
  { key: "ultimaActualizacion", label: "Última actualización", width: "150px" },
]

// Define types for corresponsables data
interface CorresponsableData {
  _id: string
  title: string
  origin: string | null
  approved: boolean
  timestamp: string
  metadata?: {
    email?: string
  }
}

// Transform corresponsables data for the table
const transformCorresponsablesData = (corresponsables: CorresponsableData[]) => {
  return corresponsables.map((corresponsable) => ({
    id: corresponsable._id,
    nombre: corresponsable.title,
    fuentesCreadas: "0",
    estado: corresponsable.approved ? "Activo" : "Pendiente",
    celular: corresponsable.origin || "N/A",
    ubicacion: "N/A", // This field doesn't exist in corresponsables data
    ultimaActualizacion: formatDateSafe(corresponsable.timestamp),
    email: corresponsable.metadata?.email || "N/A"
  }))
}

// Empty fuentes data - will be populated from actual sources
const fuentesData: Array<{
  nombre: string;
  tipo: string;
  contenido: string;
  estado: string;
  creadoPor: string;
  ultimaActualizacion: string;
}> = []

interface CorresponsalesPageProps {
  clientId: string;
  campaignId?: string;
}

function CorresponsalesPage({ clientId, campaignId }: CorresponsalesPageProps) {
  const [activeTab, setActiveTab] = useState("usuarios")
  const [isCorresponsablesAdminOpen, setIsCorresponsablesAdminOpen] = useState(false)
  const [editingCorresponsable, setEditingCorresponsable] = useState<{
    _id: string;
    title?: string;
    origin?: string;
    approved: boolean;
    timestamp: string;
    metadata?: {
      email?: string;
    };
  } | null>(null)
  
  // Determine folderId from route params
  const folderId = campaignId || clientId;
  
  // Simple breadcrumbs - can be enhanced later
  const breadcrumbs = campaignId
    ? [{ label: "Dashboard" }, { label: "Clients" }, { label: "Campaign" }, { label: "Corresponsables" }]
    : [{ label: "Dashboard" }, { label: "Clients" }, { label: "Corresponsables" }];
  
  // Fetch corresponsables data using React Query with folderId from route
  const { 
    corresponsables = [], 
    isLoading, 
    error,
    removeCorresponsable
  } = useCorresponsables(folderId)

  // Transform data based on active tab
  const currentColumns = activeTab === "usuarios" ? usuariosColumns : fuentesColumns
  const currentData = activeTab === "usuarios" 
    ? transformCorresponsablesData(corresponsables) 
    : fuentesData

  const handleAddClick = () => {
    setEditingCorresponsable(null)
    setIsCorresponsablesAdminOpen(true)
  }

  const handleEditRow = (rowId: string) => {
    const corresponsable = corresponsables.find((c: CorresponsableData) => c._id === rowId)
    if (corresponsable) {
      setEditingCorresponsable(corresponsable)
      setIsCorresponsablesAdminOpen(true)
    }
  }

  const handleDeleteRow = async (rowId: string) => {
    try {
      await removeCorresponsable({
        listenerId: rowId,
        folderId: folderId
      })
      // Success toast is handled by the mutation
    } catch (error) {
      console.error('Error deleting corresponsable:', error)
      // Error toast is handled by the mutation
    }
  }

  const handleCloseCorresponsablesAdmin = () => {
    setIsCorresponsablesAdminOpen(false)
    setEditingCorresponsable(null)
  }

  return (
    <>
      <DashboardLayout
        title={`Listado Corresponsales${campaignId ? ' - Campaign' : ' - Client'}`}
        breadcrumbs={breadcrumbs}
        onAddClick={handleAddClick}
        addButtonText="Agregar Corresponsable"
        clientId={clientId}
        campaignId={campaignId}
      >
      <DataTable
        columns={currentColumns}
        data={currentData}
        searchPlaceholder="Buscar corresponsables"
        showTabs={true}
        tabs={[
          { key: "usuarios", label: "Usuarios" },
          { key: "fuentes", label: "Fuentes" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cardType="corresponsales"
        showAddButton={true}
        addButtonText="Crear Corresponsal"
        isLoading={isLoading}
        error={error}
        onEditRow={handleEditRow}
        onDeleteRow={handleDeleteRow}
      />
      </DashboardLayout>

      <SourcesAdministrator
        isOpen={isCorresponsablesAdminOpen}
        onClose={handleCloseCorresponsablesAdmin}
        references={[]}
        sources={[]}
        defaultTab="corresponsales"
        folderId={folderId}
        clientId={clientId}
        campaignId={campaignId}
        editCorresponsable={editingCorresponsable}
      />
    </>
  )
}

export default withAuth(CorresponsalesPage)
