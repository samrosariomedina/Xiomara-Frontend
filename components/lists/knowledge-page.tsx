"use client"

import { DashboardLayout } from "./Dashboard-layout"
import { DataTable, type Column } from "./Data-table"

const columns: Column[] = [
  {
    key: "nombre",
    label: "Nombre",
    width: "250px",
    render: (value, row) => (
      <div>
        <div className="font-medium">{value}</div>
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

export default function KnowledgeBasePage() {
  return (
    <DashboardLayout
      title="Listado Knowledge Base"
      breadcrumbs={[{ label: "Dashboard" }, { label: "Clientes" }, { label: "Listado Knowledge Base" }]}
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
