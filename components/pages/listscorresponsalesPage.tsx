"use client"
import withAuth from "@/lib/withAuth"
import { useState, useMemo } from "react"
import { DashboardLayout } from   "@/components/dashboard/lists-dashboard-layout"
import { DataTable, type Column } from "../lists-tableData"
import { useCorresponsables } from "@/hooks/useCorresponsables"
import { formatDateSafe } from "@/lib/utils"
import SourcesAdministrator from "./dashboardPage-Forms"
import { routes } from "@/lib/routes"
import { getShareUrlAction } from "@/actions/corresponsables"
import { ShareLinkDialog } from "@/components/dialogs/ShareLinkDialog"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"
import { getSources } from "@/actions/sources"
import { getReferences } from "@/actions/knowledge"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

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
  type?: string // "whatsapp" or "telegram"
  approved: boolean
  timestamp: string
  metadata?: {
    email?: string
  }
}

// Function to censor origin for Telegram listeners
const censorOrigin = (origin: string | null, showCensored: boolean = false): string => {
  if (!origin || origin === "N/A") return "N/A"
  if (showCensored) {
    return origin // Show actual value when toggle is on
  }
  // Censor: show first 3 and last 3 characters with asterisks in between
  if (origin.length <= 6) {
    return "***" // Fully censor short values
  }
  const start = origin.substring(0, 3)
  const end = origin.substring(origin.length - 3)
  const middle = "*".repeat(Math.min(origin.length - 6, 8)) // Max 8 asterisks
  return `${start}${middle}${end}`
}

// Transform corresponsables data for the table
const transformCorresponsablesData = (corresponsables: CorresponsableData[], showCensored: boolean = false) => {
  return corresponsables.map((corresponsable) => {
    // Determine if it's Telegram: check type field first, then fallback to origin format
    const isTelegram = corresponsable.type === "telegram" || 
      (corresponsable.origin && 
       corresponsable.origin.length > 20 && 
       !/^\+?[0-9\s\-\(\)]+$/.test(corresponsable.origin))
    const origin = corresponsable.origin || "N/A"
    
    return {
      id: corresponsable._id,
      nombre: corresponsable.title,
      fuentesCreadas: "0",
      estado: corresponsable.approved ? "Activo" : "Pendiente",
      celular: isTelegram ? censorOrigin(origin, showCensored) : origin,
      ubicacion: "N/A", // This field doesn't exist in corresponsables data
      ultimaActualizacion: formatDateSafe(corresponsable.timestamp),
      email: corresponsable.metadata?.email || "N/A"
    }
  })
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
  const [showCensoredOrigins, setShowCensoredOrigins] = useState(false) // Toggle for showing censored Telegram origins
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
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareDialogData, setShareDialogData] = useState<{
    shareUrl: string;
    clientName: string;
    email?: string;
    listenerType: "whatsapp" | "telegram";
  } | null>(null)
  
  // Determine folderId from route params
  const folderId = campaignId || clientId;

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
  
  // Dynamic breadcrumbs based on folder type
  const breadcrumbs = campaignId
    ? [
        { label: "Clients list", href: routes.clients.page }, 
        { label: "Dashboard", href: routes.clients.clientDashboard(clientId) }, 
        { label: "Client", href: routes.clients.clientDashboard(clientId) }, 
        { label: "Campaign", href: routes.clients.campaignDashboard(clientId, campaignId) }, 
        { label: "Corresponsables" }
      ]
    : [
        { label: "Clients list", href: routes.clients.page }, 
        { label: "Dashboard", href: routes.clients.clientDashboard(clientId) }, 
        { label: "Client", href: routes.clients.clientDashboard(clientId) }, 
        { label: "Corresponsables" }
      ];
  
  // Fetch corresponsables data using React Query with folderId from route
  const { 
    corresponsables = [], 
    isLoading, 
    error,
    removeCorresponsable
  } = useCorresponsables(folderId)

  // Check if there are any Telegram listeners
  // Telegram tokens typically start with numbers and are longer than phone numbers
  // Also check the type field if available
  const hasTelegramListeners = useMemo(() => {
    const hasTelegram = corresponsables.some((c: CorresponsableData) => {
      // Check type field first
      if (c.type === "telegram") return true
      // Fallback: Telegram tokens are usually longer and don't look like phone numbers
      if (c.origin && c.origin.length > 20 && !/^\+?[0-9\s\-\(\)]+$/.test(c.origin)) {
        return true
      }
      return false
    })
    console.log('🔍 Checking for Telegram listeners:', {
      totalCorresponsables: corresponsables.length,
      hasTelegram,
      corresponsablesTypes: corresponsables.map((c: CorresponsableData) => ({ 
        id: c._id, 
        type: c.type, 
        title: c.title,
        originLength: c.origin?.length,
        originPreview: c.origin ? c.origin.substring(0, 10) + '...' : 'null'
      }))
    })
    return hasTelegram
  }, [corresponsables])

  // Transform data based on active tab - useMemo to ensure it updates when showCensoredOrigins changes
  const currentColumns = activeTab === "usuarios" ? usuariosColumns : fuentesColumns
  const currentData = useMemo(() => {
    if (activeTab === "usuarios") {
      return transformCorresponsablesData(corresponsables, showCensoredOrigins)
    }
    return fuentesData
  }, [activeTab, corresponsables, showCensoredOrigins])

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

  const handleShareCorresponsable = async (rowId: string) => {
    try {
      const corresponsable = corresponsables.find((c: CorresponsableData) => c._id === rowId)
      if (!corresponsable) {
        toast.error('Corresponsable not found')
        return
      }

      const result = await getShareUrlAction(corresponsable._id)
      
      if (result.success && result.data) {
        const listenerType = corresponsable.type === "telegram" ? "telegram" : "whatsapp"
        setShareDialogData({
          shareUrl: result.data,
          clientName: corresponsable.title || 'Corresponsable',
          email: corresponsable.metadata?.email,
          listenerType
        })
        setShowShareDialog(true)
      } else {
        toast.error(result.error || 'Failed to get share link')
      }
    } catch (error) {
      console.error('Error getting share URL:', error)
      toast.error('Failed to get share link. Please try again.')
    }
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
      {/* Toggle button for showing/hiding censored Telegram origins */}
      {activeTab === "usuarios" && hasTelegramListeners && (
        <div className="mb-4 flex items-center justify-end px-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('Toggle clicked, current state:', showCensoredOrigins)
              setShowCensoredOrigins(!showCensoredOrigins)
            }}
            className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
          >
            {showCensoredOrigins ? (
              <>
                <EyeOff className="h-4 w-4" />
                <span>Hide Telegram Tokens</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>Show Telegram Tokens</span>
              </>
            )}
          </Button>
        </div>
      )}
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
        onShareRow={handleShareCorresponsable}
      />
      </DashboardLayout>

      <SourcesAdministrator
        isOpen={isCorresponsablesAdminOpen}
        onClose={handleCloseCorresponsablesAdmin}
        references={references}
        sources={sources}
        defaultTab="corresponsales"
        folderId={folderId}
        clientId={clientId}
        campaignId={campaignId}
        editCorresponsable={editingCorresponsable}
      />

      {/* Share Link Dialog */}
      {shareDialogData && (
        <ShareLinkDialog
          isOpen={showShareDialog}
          onClose={() => {
            setShowShareDialog(false)
            setShareDialogData(null)
          }}
          shareUrl={shareDialogData.shareUrl}
          clientName={shareDialogData.clientName}
          email={shareDialogData.email}
          listenerType={shareDialogData.listenerType}
        />
      )}
    </>
  )
}

export default withAuth(CorresponsalesPage)
