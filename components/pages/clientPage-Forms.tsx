'use client'
import React, { useState, useEffect, useCallback, useRef } from "react"
import { useTranslations } from 'next-intl'
import { type GeneralInformationInput, type ConnectCorrespondentsInput, type BrandGuidesInput } from '@/lib/schemas'
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClientAction, editClientAction } from "@/actions/clients"
import { useCorresponsables } from "@/hooks/useCorresponsables"
import { useRouter } from "next/navigation"

import { ClientFormHeader } from "@/components/clients/ClientFormHeader"
import { ClientFormTabs } from "@/components/clients/ClientFormTabs"
import { ClientFormAccordion } from "@/components/clients/ClientFormAccordion"
import { ClientFormContent } from "@/components/clients/ClientFormContent"
import { ClientFormActions } from "@/components/clients/ClientFormActions"

interface ClientFormModalProps {
  isOpen: boolean
  onClose: () => void
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
}


export function ClientFormModal({ isOpen, onClose, editClient: initialEditClient }: ClientFormModalProps) {
  const t = useTranslations('CLIENT_FORM')
  const [editClient, setEditClient] = useState(initialEditClient)
  const [activeTab, setActiveTab] = useState("general")
  const [isAnimating, setIsAnimating] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState({ general: true, connect: false, brand: false })

  // Update editClient when initialEditClient changes
  useEffect(() => {
    setEditClient(initialEditClient)
  }, [initialEditClient])

  // Direct TanStack Query mutations
  const queryClient = useQueryClient()
  const router = useRouter()

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: createClientAction,
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate clients query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['clients'] })
        // Refresh the server components to show the new client immediately
        router.refresh()
        toast.success(t('clientCreated') || 'Client created successfully!')
      }
    },
    onError: (error: unknown) => {
      console.error('Create client error:', error)
      const errorMessage = error instanceof Error ? error.message : (t('validation.error') || 'Failed to create client')
      toast.error(errorMessage)
    }
  })

  // Edit client mutation
  const editClientMutation = useMutation({
    mutationFn: ({ clientId, data }: { clientId: string, data: GeneralInformationInput }) => editClientAction(clientId, data),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate clients query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['clients'] })
        // Refresh the server components to show the updated client immediately
        router.refresh()
        toast.success(t('clientUpdated') || 'Client updated successfully!')
      }
    },
    onError: (error: unknown) => {
      console.error('Edit client error:', error)
      const errorMessage = error instanceof Error ? error.message : (t('validation.error') || 'Failed to update client')
      toast.error(errorMessage)
    }
  })


  const [createdFolderId, setCreatedFolderId] = useState<string | null>(null)
  
  // Use corresponsables hook
  const { 
    isCreating: isCreatingCorresponsables,
    isUpdating: isUpdatingCorresponsables,
    corresponsables,
    isLoading: isLoadingCorresponsables 
  } = useCorresponsables(editClient?.id || createdFolderId || undefined)

  // Form refs - child forms will manage their own states
  const generalFormRef = useRef<{
    validate: () => Promise<boolean>
    getValues: () => GeneralInformationInput
    reset: () => void
  } | null>(null)
  const connectFormRef = useRef<{
    validate: () => Promise<boolean>
    getValues: () => ConnectCorrespondentsInput
    reset: () => void
    submit: () => Promise<boolean>
  } | null>(null)
  const brandFormRef = useRef<{
    validate: () => Promise<boolean>
    getValues: () => BrandGuidesInput
    reset: () => void
  } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    if (isOpen) {
      // Prevent layout shift when scrollbar is removed: add right padding equal to scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
      document.body.style.overflow = "hidden"
      setTimeout(() => {
        setIsAnimating(true)
      }, 10)
      
      // Reset to general tab when opening fresh (not in edit mode)
      if (!editClient) {
        setActiveTab("general")
      }
    } else {
      document.body.style.overflow = "unset"
      document.body.style.paddingRight = ""
      setIsAnimating(false)
    }

    return () => {
      document.body.style.overflow = "unset"
      document.body.style.paddingRight = ""
    }
  }, [isOpen, editClient])

  // Track viewport to switch to mobile accordion behaviour
  // Note: responsive display handled by tailwind classes (md:hidden / md:block)


  const handleClose = useCallback(() => {
    setIsAnimating(false)
    setTimeout(() => {
      // Reset folder ID
      setCreatedFolderId(null)
      // Reset mobile accordion
      setMobileExpanded({ general: true, connect: false, brand: false })
      // Reset all forms
      generalFormRef.current?.reset()
      connectFormRef.current?.reset()
      brandFormRef.current?.reset()
      // Reset edit client
      setEditClient(null)
      onClose()
    }, 300)
  }, [onClose])

  const handleSubmit = useCallback(async () => {
    try {
      // Validate based on the current active tab
      if (activeTab === "general") {
        // Only validate general form when on general tab
        const generalValid = await generalFormRef.current?.validate()

        if (!generalValid) {
          toast.error(t('validation.fillRequired') || 'Please fill all required fields in General Information')
          return
        }
      } else if (activeTab === "connect") {
        // For connect tab, try to create corresponsables if we have a folder ID
        // In edit mode, use editClient.id; in create mode, use createdFolderId
        const folderId = editClient ? editClient.id : createdFolderId
        
        if (!folderId) {
          toast.error(t('validation.createClientFirst') || 'Please create a client first by filling out the General Information tab')
          return
        }

        // Use the new submit method from ConnectCorrespondentsForm
        if (!connectFormRef.current) {
          toast.error(t('validation.correspondentsSubmissionFailed') || 'Failed to create corresponsables')
          return
        }
        
        const submitSuccess = await connectFormRef.current.submit()
        if (!submitSuccess) {
          toast.error(t('validation.correspondentsSubmissionFailed') || 'Failed to create corresponsables')
          return
        }

        // If we reach here, the submit was successful
        toast.success('Corresponsables created successfully!')
        handleClose()
        return
      } else if (activeTab === "brand") {
        // For brand tab, just show info message
        toast.info(t('validation.switchToGeneral') || 'Please switch to General Information tab to create the client.')
        return
      }

      // Get only general form data - corresponsables are handled separately
      const generalData = generalFormRef.current?.getValues() as GeneralInformationInput || {}

      if (editClient) {
        // Edit mode - update existing client
        const clientData = {
          ...generalData,
          logoFile: generalData.logoFile || undefined
        }
        const clientResult = await editClientMutation.mutateAsync({
          clientId: editClient.id,
          data: clientData
        })

        if (!clientResult.success) {
          toast.error(clientResult.error || 'Failed to update client')
          return
        }
      } else {
        // Create mode - create new client ONLY
        const clientData = {
          ...generalData,
          logoFile: generalData.logoFile || undefined
        }
        const clientResult = await createClientMutation.mutateAsync(clientData)

        if (!clientResult.success) {
          toast.error(clientResult.error || 'Failed to create client')
          return
        }

        // Set the created folder ID for potential corresponsables creation later
        setCreatedFolderId(clientResult.data._id)
      }

      // Show success message and close
      handleClose()
    } catch (error) {
      console.error('Submit error:', error)
      toast.error(error instanceof Error ? error.message : (t('validation.error') || 'An error occurred during submission'))
    }
  }, [createClientMutation, editClientMutation, editClient, t, handleClose, activeTab, createdFolderId])



  // Optimized callback functions
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab)
  }, [])

  const handleMobileExpandedChange = useCallback((panel: string) => {
    setMobileExpanded(prev => ({ ...prev, [panel]: !prev[panel as keyof typeof prev] }))
  }, [])

  if (!isOpen) return null

  const isLoading = createClientMutation.isPending || editClientMutation.isPending || isCreatingCorresponsables || isUpdatingCorresponsables || isLoadingCorresponsables

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ease-out ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full md:w-1/2 bg-white shadow-2xl z-50 transform transition-all duration-300 ease-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <ClientFormHeader 
            isEditMode={!!editClient}
            onClose={handleClose}
            t={t}
          />

          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pb-20">
              <ClientFormTabs 
                activeTab={activeTab}
                onTabChange={handleTabChange}
                t={t}
              />

              <ClientFormAccordion
                mobileExpanded={mobileExpanded}
                onMobileExpandedChange={handleMobileExpandedChange}
                editClient={editClient}
                createdFolderId={createdFolderId}
                corresponsables={corresponsables}
                generalFormRef={generalFormRef}
                connectFormRef={connectFormRef}
                brandFormRef={brandFormRef}
                t={t}
              />

              <ClientFormContent
                activeTab={activeTab}
                editClient={editClient}
                createdFolderId={createdFolderId}
                corresponsables={corresponsables}
                generalFormRef={generalFormRef}
                connectFormRef={connectFormRef}
                brandFormRef={brandFormRef}
              />

              <ClientFormActions
                activeTab={activeTab}
                isEditMode={!!editClient}
                isLoading={isLoading}
                onClose={handleClose}
                onSubmit={handleSubmit}
                t={t}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ClientFormModal
