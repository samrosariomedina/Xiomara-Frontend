"use client"

import { useState } from "react"
import { DashboardLayout } from "../components/lists-dashboard-layout"
import { DataTable, type Column } from "../components/lists-tableData"
import withAuth from "@/lib/withAuth"

const usuariosColumns: Column[] = [
  { key: "nombre", label: "Nombre", width: "200px" },
  { key: "fuentesCreadas", label: "No. fuentes creadas", width: "150px" },
  { key: "estado", label: "Estado", width: "100px" },
  { key: "celular", label: "Celular", width: "150px" },
  { key: "ubicacion", label: "Ubicación", width: "120px" },
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

const usuariosData = [
  {
    nombre: "Nombre de la persona",
    fuentesCreadas: "3",
    estado: "Pendiente",
    celular: "+4444444444",
    ubicacion: "Puerto Rico",
    ultimaActualizacion: "16/06/2025",
  },
  ...Array.from({ length: 24 }, (_, i) => ({
    nombre: "Nombre de la persona",
    fuentesCreadas: "3",
    estado: "Activo",
    celular: "+4444444444",
    ubicacion: "Puerto Rico",
    ultimaActualizacion: "16/06/2025",
  })),
]

const fuentesData = Array.from({ length: 25 }, (_, i) => ({
  nombre: "Nombre",
  tipo: "PDF",
  contenido: "Lorem ipsum dolor sit",
  estado: "En uso",
  creadoPor: "Nombre de la persona",
  ultimaActualizacion: "16/06/2025",
}))

 function CorresponsalesPage() {
  const [activeTab, setActiveTab] = useState("usuarios")

  const currentColumns = activeTab === "usuarios" ? usuariosColumns : fuentesColumns
  const currentData = activeTab === "usuarios" ? usuariosData : fuentesData

  return (
    <DashboardLayout
      title="Listado Corresponsales"
      breadcrumbs={[{ label: "Dashboard" }, { label: "Clientes" , href: "/dashboard" }, { label: "Listado Corresponsales" }]}
      onAddClick={() => console.log("Add clicked")}
    >
      <DataTable
        columns={currentColumns}
        data={currentData}
        searchPlaceholder="Buscar fuentes"
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
      />
    </DashboardLayout>
  )
}

export default withAuth(CorresponsalesPage)
