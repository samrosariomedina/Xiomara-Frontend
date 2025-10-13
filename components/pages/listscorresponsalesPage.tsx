"use client"
import withAuth from "@/lib/withAuth"
import { useState } from "react"
import { DashboardLayout } from   "@/components/dashboard/lists-dashboard-layout"
import { DataTable, type Column } from "../lists-tableData"
import { useClient } from "@/context/ClientContext"
import { useCorresponsables } from "@/hooks/useCorresponsables"
import { formatDateSafe } from "@/lib/utils"

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
    fuentesCreadas: "0", // This would need to be calculated from actual sources
    estado: corresponsable.approved ? "Activo" : "Pendiente",
    celular: corresponsable.origin || "N/A",
    ubicacion: "N/A", // This field doesn't exist in corresponsables data
    ultimaActualizacion: formatDateSafe(corresponsable.timestamp),
    email: corresponsable.metadata?.email || "N/A"
  }))
}

// Mock fuentes data (since we don't have sources data yet)
const fuentesData = Array.from({ length: 25 }, () => ({
  nombre: "Nombre",
  tipo: "PDF",
  contenido: "Lorem ipsum dolor sit",
  estado: "En uso",
  creadoPor: "Nombre de la persona",
  ultimaActualizacion: "16/06/2025",
}))

 function CorresponsalesPage() {
  const [activeTab, setActiveTab] = useState("usuarios")
  const { selectedClient, isClientSelected } = useClient()
  
  // Fetch corresponsables data using React Query
  const { 
    corresponsables = [], 
    isLoading, 
    error 
  } = useCorresponsables(selectedClient?._id)

  // Transform data based on active tab
  const currentColumns = activeTab === "usuarios" ? usuariosColumns : fuentesColumns
  const currentData = activeTab === "usuarios" 
    ? transformCorresponsablesData(corresponsables) 
    : fuentesData

  return (
    <DashboardLayout
      title={`Listado Corresponsales${isClientSelected ? ` - ${selectedClient?.title || 'Cliente'}` : ''}`}
      breadcrumbs={[
        { label: "Dashboard" }, 
        { label: "Clientes" , href: "/clients/channels" }, 
        { label: "Listado Corresponsales" }
      ]}
      onAddClick={() => console.log("Add clicked")}
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
      />
    </DashboardLayout>
  )
}

export default withAuth(CorresponsalesPage)
