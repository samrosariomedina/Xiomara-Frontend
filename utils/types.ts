// Types used for client and campaign data
export type Campaign = {
  id: number | string
  name: string
  createdDate: string
  connectedSources: { whatsapp: number; email: number; other: number }
  status: string
}

// Type for client data from API
export type Client = {
  id: string | number
  name: string
  contact: string
  email?: string
  createdDate: string
  campaigns: number
  avatar: string
  campaignDetails: Campaign[]
}

export interface ClientsListProps {
  clients?: Client[]
  onDelete?: (clientId: string) => Promise<void>
  onEdit?: (client: Client) => void
  itemsPerPage?: number
}

export interface ClientCardProps {
  client: Client
  isExpanded: boolean
  onToggle: (clientId: number | string) => void
  onDeleteClient: (clientId: string | number) => Promise<void>
  onEditClient?: (client: Client) => void
  onMenuOpen: (menuData: MenuOpenData) => void
  t: (key: string) => string
}

export interface CampaignRowProps {
  campaign: Campaign
  campaignIndex: number
  clientId: string | number
  onMenuOpen: (menuData: MenuOpenData) => void
  t: (key: string) => string
}

export interface MenuOpenData {
  clientId: number | string
  campaignId?: number | string
  left?: number
  top?: number
}
