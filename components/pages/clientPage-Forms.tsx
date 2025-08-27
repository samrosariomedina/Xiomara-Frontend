'use client'
import { useState, useEffect, useCallback } from "react"
import { ArrowLeft, ChevronDown} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from 'next-intl'
import { type ClientInput, clientSchema, validateForm } from '@/lib/schemas'
import { type GeneralInformationInput, type ConnectCorrespondentsInput, type BrandGuidesInput } from '@/lib/schemas'
import { toast } from "sonner"
import { useClients } from '@/hooks/useClients'

import { useRef } from 'react'
import { GeneralInformationForm } from "../clientsForm-generalInformation"
import { ConnectCorrespondentsForm } from "../clientsForm-connectCorrespondents.tsx"
import { BrandGuidesForm } from "../clientsForm-brandGuide"

interface ClientFormModalProps {
  isOpen: boolean
  onClose: () => void
}

type ChildFormRef<T = unknown> = {
  validate: () => Promise<boolean>
  getValues: () => T
}

export function ClientFormModal({ isOpen, onClose }: ClientFormModalProps) {
  const t = useTranslations('CLIENT_FORM');
  const [activeTab, setActiveTab] = useState("general")
  const [isAnimating, setIsAnimating] = useState(false)
  // Mobile-specific state: track accordion panels
  const [mobileExpanded, setMobileExpanded] = useState({ general: true, connect: false, brand: false })
  
  // Use the clients hook for better cache management
  const { createClient, isCreating } = useClients()
  
  // Local state for form data with proper typing
  const [generalFormData, setGeneralFormData] = useState<Partial<GeneralInformationInput>>({})
  const [connectFormData, setConnectFormData] = useState<Partial<ConnectCorrespondentsInput>>({})
  const [brandFormData, setBrandFormData] = useState<Partial<BrandGuidesInput>>({})
  
  // Form validation states - used by child forms
  const [isGeneralFormValid, setIsGeneralFormValid] = useState(false)
  const [isConnectFormValid, setIsConnectFormValid] = useState(true) // Optional, so valid by default
  const [isBrandFormValid, setIsBrandFormValid] = useState(true) // Optional, so valid by default
  const generalFormRef = useRef<ChildFormRef | null>(null)
  const connectFormRef = useRef<ChildFormRef | null>(null)
  const brandFormRef = useRef<ChildFormRef | null>(null)

  useEffect(() => {
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
  }, [isOpen])

  // Track viewport to switch to mobile accordion behaviour
  // Note: responsive display handled by tailwind classes (md:hidden / md:block)


  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      // Clear stored form data so reopening shows empty form
      setGeneralFormData({})
      setConnectFormData({})
      setBrandFormData({})
      // Reset validity trackers
      setIsGeneralFormValid(false)
      setIsConnectFormValid(true) // Optional, so valid by default
      setIsBrandFormValid(true) // Optional, so valid by default
      // Reset mobile accordion
      setMobileExpanded({ general: true, connect: false, brand: false })
      onClose()
    }, 300)
  }

  const handleSubmit = useCallback(async () => {
    try {
      // Only validate general form (required), others are optional
      const generalValid = await generalFormRef.current?.validate()

      if (!generalValid) {
        toast.error(t('validation.fillRequired') || 'Please fill all required fields in General Information')
        return
      }

      // Connect and brand forms are optional - validate but don't block submission
      await connectFormRef.current?.validate()
      await brandFormRef.current?.validate()

      // Get all form data with proper typing
      const generalData = generalFormRef.current?.getValues() as GeneralInformationInput || {}
      const connectData = connectFormRef.current?.getValues() as ConnectCorrespondentsInput || {}
      // Brand data is currently empty but kept for future use
      const _brandData = brandFormRef.current?.getValues() as BrandGuidesInput || {}

      // Combine all data into ClientInput with proper typing
      const clientData: ClientInput = {
        clientName: generalData.clientName || '',
        industry: generalData.industry || 'tecnologia',
        description: generalData.description || '',
        contactName: generalData.contactName || '',
        whatsapp: generalData.whatsapp || '',
        position: generalData.position || 'ceo',
        email: generalData.email || '',
        logoFile: generalData.logoFile,
        // Connect correspondents fields are optional
        corresponsalClientName: connectData.corresponsalClientName || undefined,
        corresponsalWhatsapp: connectData.corresponsalWhatsapp || undefined,
        corresponsalClientName2: connectData.corresponsalClientName2 || undefined,
        accountType: connectData.accountType || undefined,
        invitationMethods: connectData.invitationMethods || undefined
      }

      // Validate the combined data using Zod schema
      const validation = validateForm(clientSchema, clientData)
      if (!validation.success) {
        toast.error(t('validation.error') || 'Validation failed')
        return
      }

      // Submit using the clients hook
      await createClient(validation.data as ClientInput)
      
      // Show success message and close
      toast.success(t('clientCreated') || 'Client created successfully!')
      handleClose()
    } catch (error) {
      console.error('Submit error:', error)
      toast.error(error instanceof Error ? error.message : (t('validation.error') || 'An error occurred during submission'))
    }
  }, [createClient, t, handleClose])

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
              <h2 className="text-2xl font-medium text-gray-600">{t('createClient')}</h2>
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
                         initialData={generalFormData}
                         onDataChange={setGeneralFormData}
                         onFormValid={setIsGeneralFormValid}
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
                         initialData={connectFormData}
                         onDataChange={setConnectFormData}
                         onFormValid={setIsConnectFormValid}
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
                         initialData={brandFormData}
                         onDataChange={setBrandFormData}
                         onFormValid={setIsBrandFormValid}
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
                     initialData={generalFormData} 
                     onDataChange={setGeneralFormData}
                     onFormValid={setIsGeneralFormValid}
                   />
                 )}
                 {activeTab === "brand" && (
                   <BrandGuidesForm 
                     ref={brandFormRef}
                     initialData={brandFormData} 
                     onDataChange={setBrandFormData}
                     onFormValid={setIsBrandFormValid}
                   />
                 )}
                 {activeTab === "connect" && (
                   <ConnectCorrespondentsForm 
                     ref={connectFormRef}
                     initialData={connectFormData} 
                     onDataChange={setConnectFormData}
                     onFormValid={setIsConnectFormValid}
                   />
                 )}
               </div>

               {/* Buttons positioned below form content */}
               <div className="mt-8 flex justify-end gap-3">
                 <Button 
                   onClick={handleClose}
                   className="px-4 bg-[#f7f9ff] text-[#31499f] rounded-full hover:bg-[#e0e7ff]"
                   disabled={isCreating}
                 >
                   {t('form.cancel')}
                 </Button>
                 <Button 
                   onClick={handleSubmit}
                   className="bg-[#31499f] hover:bg-blue-700 text-white rounded-full px-4"
                   disabled={isCreating}
                 >
                   {isCreating ? t('creating') || 'Creating...' : t('form.submit')}
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
