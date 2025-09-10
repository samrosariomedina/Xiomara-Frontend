'use client'
import { useState, useEffect, useCallback } from "react"
import { ArrowLeft, ChevronDown} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from 'next-intl'
import { type GeneralInformationInput, type ConnectCorrespondentsInput, type BrandGuidesInput } from '@/lib/schemas'
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClientAction, createCorresponsalesAction, editClientAction } from "@/actions/clients"

import { useRef } from 'react'
import { GeneralInformationForm } from "../clientsForm-generalInformation"
import { ConnectCorrespondentsForm } from "../clientsForm-connectCorrespondents.tsx"
import { BrandGuidesForm } from "../clientsForm-brandGuide"

interface ClientFormModalProps {
  isOpen: boolean
  onClose: () => void
  editClient?: {
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

type ChildFormRef<T = unknown> = {
  validate: () => Promise<boolean>
  getValues: () => T
}

export function ClientFormModal({ isOpen, onClose, editClient }: ClientFormModalProps) {
  const t = useTranslations('CLIENT_FORM');
  const [activeTab, setActiveTab] = useState("general")
  const [isAnimating, setIsAnimating] = useState(false)
  // Mobile-specific state: track accordion panels
  const [mobileExpanded, setMobileExpanded] = useState({ general: true, connect: false, brand: false })

  // Direct TanStack Query mutations
  const queryClient = useQueryClient()

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: createClientAction,
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate clients query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['clients'] })
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
        toast.success(t('clientUpdated') || 'Client updated successfully!')
      }
    },
    onError: (error: unknown) => {
      console.error('Edit client error:', error)
      const errorMessage = error instanceof Error ? error.message : (t('validation.error') || 'Failed to update client')
      toast.error(errorMessage)
    }
  })

  // Create corresponsales mutation
  const createCorresponsalesMutation = useMutation({
    mutationFn: ({ folderId, data }: { folderId: string, data: Record<string, unknown> }) =>
      createCorresponsalesAction(folderId, data as never),
    onError: (error: unknown) => {
      console.error('Corresponsales creation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create corresponsales'
      toast.error(errorMessage)
    }
  })

  const [createdFolderId, setCreatedFolderId] = useState<string | null>(null)

  // Form refs - child forms will manage their own states
  const generalFormRef = useRef<ChildFormRef<GeneralInformationInput> | null>(null)
  const connectFormRef = useRef<ChildFormRef<ConnectCorrespondentsInput> | null>(null)
  const brandFormRef = useRef<ChildFormRef<BrandGuidesInput> | null>(null)

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
    } else {
      document.body.style.overflow = "unset"
      document.body.style.paddingRight = ""
      setIsAnimating(false)
    }

    return () => {
      document.body.style.overflow = "unset"
      document.body.style.paddingRight = ""
    }
  }, [isOpen, onClose])

  // Track viewport to switch to mobile accordion behaviour
  // Note: responsive display handled by tailwind classes (md:hidden / md:block)


  const handleClose = useCallback(() => {
    setIsAnimating(false)
    setTimeout(() => {
      // Reset folder ID
      setCreatedFolderId(null)
      // Reset mobile accordion
      setMobileExpanded({ general: true, connect: false, brand: false })
      onClose()
    }, 300)
  }, [onClose])

  const handleSubmit = useCallback(async () => {
    try {
      // Only validate general form (required), others are optional
      const generalValid = await generalFormRef.current?.validate()

      if (!generalValid) {
        toast.error(t('validation.fillRequired') || 'Please fill all required fields in General Information')
        return
      }

      // Connect form is optional - validate but don't block submission
      await connectFormRef.current?.validate()

      // Get all form data with proper typing
      const generalData = generalFormRef.current?.getValues() as GeneralInformationInput || {}
      const connectData = connectFormRef.current?.getValues() as ConnectCorrespondentsInput || {}

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
        // Create mode - create new client
        const clientData = {
          ...generalData,
          logoFile: generalData.logoFile || undefined
        }
        const clientResult = await createClientMutation.mutateAsync(clientData)

        if (!clientResult.success) {
          toast.error(clientResult.error || 'Failed to create client')
          return
        }

        // If corresponsales data is provided, create the listeners
        if (connectData.corresponsalClientName && connectData.corresponsalWhatsapp) {
          await createCorresponsalesMutation.mutateAsync({
            folderId: clientResult.data._id,
            data: {
              corresponsalClientName: connectData.corresponsalClientName,
              corresponsalWhatsapp: connectData.corresponsalWhatsapp,
              corresponsalClientName2: connectData.corresponsalClientName2,
              accountType: connectData.accountType,
              invitationMethods: connectData.invitationMethods || {
                whatsapp: false,
                email: false,
                copyLink: false
              }
            }
          })
        }
      }

      // Show success message and close
      handleClose()
    } catch (error) {
      console.error('Submit error:', error)
      toast.error(error instanceof Error ? error.message : (t('validation.error') || 'An error occurred during submission'))
    }
  }, [createClientMutation, editClientMutation, createCorresponsalesMutation, editClient, t, handleClose])

  if (!isOpen) return null

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
          {/* --- SIDEPANEL HEADER ---
               Back button | Title | Close button
               Edit inside this div to change header UI
           */}
          <div className="flex items-center justify-between px-6 py-6  bg-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClose} 
                className="p-1 h-8 w-8 hover:bg-gray-100"
                type="button"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-2xl font-medium text-gray-600">
                {editClient ? (t('editClient') || 'Edit Client') : (t('createClient') || 'Create Client')}
              </h2>
            </div>
            
          </div>

                     {/* Content - takes remaining space and scrolls if needed */}
           <div className="flex-1 overflow-y-auto">
             <div className="px-4 pb-20">
               {/* --- TABS: General / Brand / Connect --- */}
               {/* Desktop tabs (hidden on medium and below). On mobile/md we render accordion below */}
               <div className="hidden md:block">
                 <div className="flex space-x-8 border-b border-gray-200 justify-around">
                   <button
                     onClick={() => setActiveTab("general")}
                     className={`pb-4 pt-3 text-xs font-medium transition-colors relative ${
                       activeTab === "general" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                     }`}
                     type="button"
                   >
                     {t('tabs.general')}
                     {activeTab === "general" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />}
                   </button>
                   <button
                     onClick={() => setActiveTab("connect")}
                     className={`pb-4 pt-3 text-xs font-medium transition-colors relative ${
                       activeTab === "connect" ? "text-[#31499F]" : "text-gray-500 hover:text-gray-700"
                     }`}
                     type="button"
                   >
                     {t('tabs.connect')}
                     {activeTab === "connect" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#31499F]" />}
                   </button>
                   <button
                     onClick={() => setActiveTab("brand")}
                     className={`pb-4 pt-3 text-xs font-medium transition-colors relative ${
                       activeTab === "brand" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                     }`}
                     type="button"
                   >
                     {t('tabs.brand')}
                     {activeTab === "brand" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />}
                   </button>
                 </div>
               </div>

               {/* Mobile/Medium accordion: stacked dropdown forms */}
               <div className="md:hidden mt-4">
                 {/* General */}
                 <div className=" rounded-lg mb-3 overflow-hidden">
                   <button
                     type="button"
                     className="w-full flex items-center justify-between px-5 py-4 bg-gray-50"
                     onClick={() => setMobileExpanded((s) => ({ ...s, general: !s.general }))}
                   >
                     <div className="text-sm font-medium">{t('tabs.general')}</div>
                     <ChevronDown className={`h-4 w-4 transform transition-transform ${mobileExpanded.general ? 'rotate-180' : ''}`} />
                   </button>
                   {mobileExpanded.general && (
                     <div className="px-4 py-3 bg-white">
                       <GeneralInformationForm
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
                   )}
                 </div>

                 {/* Connect */}
                 <div className=" rounded-lg mb-3 overflow-hidden">
                   <button
                     type="button"
                     className="w-full flex items-center justify-between px-5 py-4 bg-gray-50"
                     onClick={() => setMobileExpanded((s) => ({ ...s, connect: !s.connect }))}
                   >
                     <div className="text-sm font-medium">{t('tabs.connect')}</div>
                     <ChevronDown className={`h-4 w-4 transform transition-transform ${mobileExpanded.connect ? 'rotate-180' : ''}`} />
                   </button>
                   {mobileExpanded.connect && (
                     <div className="px-4 py-3 bg-white">
                       <ConnectCorrespondentsForm
                         ref={connectFormRef}
                         folderId={createdFolderId}
                       />
                     </div>
                   )}
                 </div>

                 {/* Brand */}
                 <div className=" rounded-lg mb-3 overflow-hidden">
                   <button
                     type="button"
                     className="w-full flex items-center justify-between px-5 py-4 bg-gray-50"
                     onClick={() => setMobileExpanded((s) => ({ ...s, brand: !s.brand }))}
                   >
                     <div className="text-sm font-medium">{t('tabs.brand')}</div>
                     <ChevronDown className={`h-4 w-4 transform transition-transform ${mobileExpanded.brand ? 'rotate-180' : ''}`} />
                   </button>
                   {mobileExpanded.brand && (
                     <div className="px-4 py-3 bg-white">
                       <BrandGuidesForm
                         ref={brandFormRef}
                       />
                     </div>
                   )}
                 </div>
               </div>

               {/* --- FORM CONTENT --- */}
               {/* Render the appropriate tab content based on activeTab (desktop/md and up) */}
               <div className="hidden md:block">
                 {activeTab === "general" && (
                   <GeneralInformationForm
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
                 )}
                 {activeTab === "brand" && (
                   <BrandGuidesForm
                     ref={brandFormRef}
                   />
                 )}
                 {activeTab === "connect" && (
                   <ConnectCorrespondentsForm
                     ref={connectFormRef}
                     folderId={createdFolderId}
                   />
                 )}
               </div>

               {/* Buttons positioned below form content */}
               <div className="mt-8 flex justify-end gap-3">
                 <Button
                   onClick={handleClose}
                   className="px-4 bg-[#f7f9ff] text-[#31499f] rounded-full hover:bg-[#e0e7ff]"
                   disabled={createClientMutation.isPending}
                 >
                   {t('form.cancel')}
                 </Button>
                 <Button
                   onClick={handleSubmit}
                   className="bg-[#31499f] hover:bg-blue-700 text-white rounded-full px-4"
                   disabled={createClientMutation.isPending || editClientMutation.isPending}
                 >
                   {createClientMutation.isPending || editClientMutation.isPending 
                     ? (editClient ? (t('updating') || 'Updating...') : (t('creating') || 'Creating...'))
                     : (editClient ? (t('form.update') || 'Update') : (t('form.submit') || 'Submit'))
                   }
                 </Button>
               </div>
             </div>
           </div>
        </div>
      </div>
    </>
  )
}

export default ClientFormModal
