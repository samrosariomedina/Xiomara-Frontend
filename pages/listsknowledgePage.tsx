"use client"

import withAuth from "@/lib/withAuth"
import { DashboardLayout } from "../components/lists-dashboard-layout"
import { DataTable, type Column } from "../components/lists-tableData"

const columns: Column[] = [
  {
    key: "nombre",
    label: "Nombre",
    width: "250px",
    render: (value, row) => (
      <div>
        <div className="font-medium">{String(value || "")}</div>
        <div className="text-sm text-gray-500">Descripción corta</div>
      </div>
    ),
  },
  { key: "tipo", label: "Tipo", width: "80px" },
  { key: "categoria", label: "Categoría", width: "120px" },
  { key: "estado", label: "Estado", width: "100px" },
  { key: "creadoPor", label: "Creado por", width: "180px" },
  { key: "ultimaActualizacion", label: "Última actualización", width: "150px" },
]

const data = Array.from({ length: 25 }, (_, i) => ({
  nombre: "Nombre",
  tipo: "PDF",
  categoria: "Marketing",
  estado: "Activo",
  creadoPor: "Nombre de la persona",
  ultimaActualizacion: "16/06/2025",
}))

function KnowledgeBasePage() {
  return (
    <DashboardLayout
      title="Listado Knowledge Base"
      breadcrumbs={[{ label: "Dashboard" }, { label: "Clientes" , href: "/dashboard" }, { label: "Listado Knowledge Base" }]}
      onAddClick={() => console.log("Add clicked")}
    >
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Buscar Fuentes"
        cardType="knowledge-base"
        showAddButton={true}
        addButtonText="Agregar Fuentes"
        showUpdateButton={true}
      />
    </DashboardLayout>
  )
}
export default withAuth(KnowledgeBasePage)
