"use client"

import { DashboardLayout } from "../lists-dashboard-layout"
import { DataTable, type Column } from "../lists-tableData"
import { formatDateSafe } from "@/lib/utils"
import { useDataWithCache } from "@/hooks/useDataWithCache"
import type { SourceResponse } from "@/lib/schemas"

interface FuentesGeneralesPageProps {
  sources: SourceResponse[]
}

const columns: Column[] = [
  { key: "nombre", label: "Nombre", width: "200px" },
  { key: "tipo", label: "Tipo", width: "80px" },
  { key: "contenido", label: "Contenido", width: "300px" },
  { key: "estado", label: "Estado", width: "100px" },
  { key: "creadoPor", label: "Creado por", width: "180px" },
  { key: "ultimaActualizacion", label: "Última actualización", width: "150px" },
]

function FuentesGeneralesPage({ sources }: FuentesGeneralesPageProps) {
  // Use caching for sources
  const {
    data: cachedSources
  } = useDataWithCache(sources, { cacheKey: 'sources' })

  // Transform sources to table data format
  const data = cachedSources.map((source, index) => ({
    id: source._id,
    nombre: source.title || 'Sin título',
    tipo: source.type === 'generales' ? 'General' : source.type,
    contenido: source.content || 'Sin contenido',
    estado: source.edited ? 'Editado' : 'En uso',
    creadoPor: 'Sistema', // Default since user info is not available in current schema
    ultimaActualizacion: formatDateSafe(source.timestamp),
  }))
  return (
    <DashboardLayout
      title="Listado Fuentes Generales"
      breadcrumbs={[{ label: "Dashboard" }, { label: "Clientes", href :"/dashboard" }, { label: "Listado Fuentes Generales" }]}
      onAddClick={() => {}}
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

export default FuentesGeneralesPage
