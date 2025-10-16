'use client'
import React from "react"
import { ChevronDown } from "lucide-react"
import { GeneralInformationForm } from "./clientsForm-generalInformation"
import { ConnectCorrespondentsForm } from "./clientsForm-connectCorrespondents.tsx"
import { BrandGuidesForm } from "./clientsForm-brandGuide"

interface ClientFormAccordionProps {
  mobileExpanded: {
    general: boolean
    connect: boolean
    brand: boolean
  }
  onMobileExpandedChange: (panel: string) => void
  editClient: {
    id: string
    name: string
    industry: string
    description?: string
    contactName: string
    whatsapp: string
    position: string
    email: string
  } | null
  createdFolderId: string | null
  corresponsables: Array<{
    _id: string
    title: string
    origin: string
    enabled: boolean
    approved: boolean
    timestamp: string
    metadata?: {
      email?: string
    }
  }>
  generalFormRef: React.RefObject<{
    validate: () => Promise<boolean>
    getValues: () => unknown
    reset: () => void
  } | null>
  connectFormRef: React.RefObject<{
    validate: () => Promise<boolean>
    getValues: () => unknown
    reset: () => void
    submit: () => Promise<boolean>
  } | null>
  brandFormRef: React.RefObject<{
    validate: () => Promise<boolean>
    getValues: () => unknown
    reset: () => void
  } | null>
  t: (key: string) => string
}

export const ClientFormAccordion = React.memo(function ClientFormAccordion({
  mobileExpanded,
  onMobileExpandedChange,
  editClient,
  createdFolderId,
  corresponsables,
  generalFormRef,
  connectFormRef,
  brandFormRef,
  t
}: ClientFormAccordionProps) {
  const handlePanelToggle = (panel: string) => {
    onMobileExpandedChange(panel)
  }

  return (
    <div className="md:hidden mt-4">
      {/* General */}
      <div className="rounded-lg mb-3 overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-5 py-4 bg-gray-50"
          onClick={() => handlePanelToggle('general')}
        >
          <div className="text-sm font-medium">{t('tabs.general')}</div>
          <ChevronDown 
            className={`h-4 w-4 transform transition-transform ${
              mobileExpanded.general ? 'rotate-180' : ''
            }`} 
          />
        </button>
        <div className={`px-4 py-3 bg-white ${mobileExpanded.general ? 'block' : 'hidden'}`}>
          <GeneralInformationForm
            // @ts-expect-error - Type compatibility issue with form refs
            ref={generalFormRef}
            initialValues={editClient ? {
              clientName: editClient.name,
              industry: editClient.industry as "tecnologia" | "salud" | "educacion" | "finanzas" | "retail" | "manufactura",
              description: editClient.description,
              contactName: editClient.contactName,
              whatsapp: editClient.whatsapp,
              position: editClient.position as "ceo" | "cto" | "marketing" | "ventas" | "gerente" | "coordinador",
              email: editClient.email
            } : undefined}
          />
        </div>
      </div>

      {/* Connect */}
      <div className="rounded-lg mb-3 overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-5 py-4 bg-gray-50"
          onClick={() => handlePanelToggle('connect')}
        >
          <div className="text-sm font-medium">{t('tabs.connect')}</div>
          <ChevronDown 
            className={`h-4 w-4 transform transition-transform ${
              mobileExpanded.connect ? 'rotate-180' : ''
            }`} 
          />
        </button>
        <div className={`px-4 py-3 bg-white ${mobileExpanded.connect ? 'block' : 'hidden'}`}>
          <ConnectCorrespondentsForm
            // @ts-expect-error - Type compatibility issue with form refs
            ref={connectFormRef}
            folderId={editClient ? editClient.id : createdFolderId}
            initialCorresponsables={corresponsables}
          />
        </div>
      </div>

      {/* Brand */}
      <div className="rounded-lg mb-3 overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-5 py-4 bg-gray-50"
          onClick={() => handlePanelToggle('brand')}
        >
          <div className="text-sm font-medium">{t('tabs.brand')}</div>
          <ChevronDown 
            className={`h-4 w-4 transform transition-transform ${
              mobileExpanded.brand ? 'rotate-180' : ''
            }`} 
          />
        </button>
        <div className={`px-4 py-3 bg-white ${mobileExpanded.brand ? 'block' : 'hidden'}`}>
          <BrandGuidesForm
            // @ts-expect-error - Type compatibility issue with form refs
            ref={brandFormRef}
          />
        </div>
      </div>
    </div>
  )
})
