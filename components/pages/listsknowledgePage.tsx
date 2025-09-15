"use client"

import { DashboardLayout } from "../lists-dashboard-layout"
import { DataTable, type Column } from "../lists-tableData"
import { formatDateSafe } from "@/lib/utils"
import { useDataWithCache } from "@/hooks/useDataWithCache"
import type { ReferenceResponse } from "@/lib/schemas"

interface KnowledgeBasePageProps {
  references: ReferenceResponse[]
}

function KnowledgeBasePage({ references }: KnowledgeBasePageProps) {
  // Use caching for references
  const {
    data: cachedReferences
  } = useDataWithCache(references, { cacheKey: 'references' })


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


  return (
    <DashboardLayout
      title="Listado Knowledge Base"
      breadcrumbs={[{ label: "Dashboard" }, { label: "Clientes" , href: "/dashboard" }, { label: "Listado Knowledge Base" }]}
      onAddClick={() => {}}
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

export default KnowledgeBasePage