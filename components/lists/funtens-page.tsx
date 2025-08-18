"use client"

import { DashboardLayout } from "./Dashboard-layout"
import { DataTable, type Column } from "./Data-table"

const columns: Column[] = [
  { key: "nombre", label: "Nombre", width: "200px" },
  { key: "tipo", label: "Tipo", width: "80px" },
  { key: "contenido", label: "Contenido", width: "300px" },
  { key: "estado", label: "Estado", width: "100px" },
  { key: "creadoPor", label: "Creado por", width: "180px" },
  { key: "ultimaActualizacion", label: "Última actualización", width: "150px" },
]

const data = Array.from({ length: 25 }, (_, i) => ({
  nombre: "Nombre",
  tipo: "PDF",
  contenido: "Lorem ipsum dolor sit",
  estado: "En uso",
  creadoPor: "Nombre de la persona",
  ultimaActualizacion: "16/06/2025",
}))

export default function FuentesGeneralesPage() {
  return (
    <DashboardLayout
      title="Listado Fuentes Generales"
      breadcrumbs={[{ label: "Dashboard" }, { label: "Clientes" }, { label: "Listado Fuentes Generales" }]}
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
