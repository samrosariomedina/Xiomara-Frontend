'use client'
import React from "react"
import { GeneralInformationForm } from "./clientsForm-generalInformation"
import { ConnectCorrespondentsForm } from "./clientsForm-connectCorrespondents.tsx"
import { BrandGuidesForm } from "./clientsForm-brandGuide"

interface ClientFormContentProps {
  activeTab: string
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
}

export const ClientFormContent = React.memo(function ClientFormContent({
  activeTab,
  editClient,
  createdFolderId,
  corresponsables,
  generalFormRef,
  connectFormRef,
  brandFormRef
}: ClientFormContentProps) {
  const getInitialValues = () => {
    if (!editClient) return undefined
    
    return {
      clientName: editClient.name,
      industry: editClient.industry as "tecnologia" | "salud" | "educacion" | "finanzas" | "retail" | "manufactura",
      description: editClient.description,
      contactName: editClient.contactName,
      whatsapp: editClient.whatsapp,
      position: editClient.position as "ceo" | "cto" | "marketing" | "ventas" | "gerente" | "coordinador",
      email: editClient.email
    }
  }

  return (
    <div className="hidden md:block">
      <div className={activeTab === "general" ? "block" : "hidden"}>
        <GeneralInformationForm
          // @ts-expect-error - Type compatibility issue with form refs
          ref={generalFormRef}
          initialValues={getInitialValues()}
        />
      </div>
      
      <div className={activeTab === "brand" ? "block" : "hidden"}>
        <BrandGuidesForm
          // @ts-expect-error - Type compatibility issue with form refs
          ref={brandFormRef}
        />
      </div>
      
      <div className={activeTab === "connect" ? "block" : "hidden"}>
        <ConnectCorrespondentsForm
          // @ts-expect-error - Type compatibility issue with form refs
          ref={connectFormRef}
          folderId={editClient ? editClient.id : createdFolderId}
          initialCorresponsables={corresponsables}
        />
      </div>
    </div>
  )
})
