"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import { ArrowLeft } from "lucide-react"
import { SourceFormTabs } from "@/components/ui/source-form-tabs"
import { FuentesGeneralesForm } from "@/components/dashboard/dashboardForm-fuentes"
import { CorresponsalesForm } from "@/components/dashboard/dashboardForm-corresponables"
import { KnowledgeBaseForm } from "@/components/dashboard/dashboardForm-knowledge"
import { MediaListeningForm } from "@/components/dashboard/dashboardForm-media"
import { toast } from "sonner"
import type { ReferenceResponse, SourceResponse } from "@/lib/schemas"

interface SourcesAdministratorProps {
  isOpen: boolean
  onClose: () => void
  references: ReferenceResponse[]
  sources: SourceResponse[]
}

interface SourceData {
  name?: string
  [key: string]: unknown
}

export function SourcesAdministrator({ isOpen, onClose, references, sources }: SourcesAdministratorProps) {
  // Animation state: control mounting (`visible`) and the active CSS state (`active`) separately
  const [visible, setVisible] = useState(isOpen)
  const [active, setActive] = useState(isOpen)

  useEffect(() => {
    if (isOpen) {
      // mount first (initially closed), then enable 'active' on next tick to trigger enter transition
      setVisible(true)
      const enter = setTimeout(() => setActive(true), 10)
      return () => clearTimeout(enter)
    } else {
      // start exit animation then unmount after duration
      setActive(false)
      const leave = setTimeout(() => setVisible(false), 300)
      return () => clearTimeout(leave)
    }
  }, [isOpen])
  // Local state management
  const [activeTab, setActiveTab] = useState("fuentes-generales")
  const [localSources, setLocalSources] = useState<
    Array<{
      id: number
      name: string
      type: "image" | "text" | "url"
      category: string
      timestamp: string
    }>
  >([])
  // Loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = useCallback(async (data: unknown) => {
    try {
      setIsSubmitting(true)
      const d = data as SourceData
      
      // Validate data before processing
      if (!d?.name) {
        toast.error('Name is required')
        return
      }
      
      const newSource = {
        id: localSources.length + 1,
        name: d.name,
        type: "image" as const,
        category: "Marketing",
        timestamp: new Date().toISOString(),
      }
      
      setLocalSources(prev => [...prev, newSource])
      toast.success('Source added successfully')
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Failed to add source')
    } finally {
      setIsSubmitting(false)
    }
  }, [localSources.length])


  const renderTabContent = (tabId?: string) => {
    const tab = tabId || activeTab
    switch (tab) {
      
      case "fuentes-generales":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4">
              <FuentesGeneralesForm ref={formRef} onSubmit={handleSubmit} sources={sources} />
            </div>
          </div>
        )

      case "corresponsales":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4">
              <CorresponsalesForm onSubmit={handleSubmit} />
            </div>
          </div>
        )

      case "knowledge-base":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4">
              <KnowledgeBaseForm onSubmit={handleSubmit} references={references} />
            </div>
          </div>
        )

      case "media-listening":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4  ">
              <MediaListeningForm onSubmit={handleSubmit} />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // ref for child form methods
  type FormHandle = { submit: () => void; cancel: () => void; open: () => void } | null
  const formRef = useRef<FormHandle>(null)

  // Lock body scroll on desktop when the panel is open
  useEffect(() => {
    const lockScroll = () => {
      // only lock for desktop widths (lg and above ~ 1024px)
      if (window.innerWidth >= 1024 && isOpen) {
        document.body.style.overflow = "hidden"
        document.documentElement.style.overflow = "hidden"
      } else {
        document.body.style.overflow = ""
        document.documentElement.style.overflow = ""
      }
    }

    lockScroll()

    // Cleanup function to restore scroll when component unmounts or isOpen changes
    return () => {
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
    }
  }, [isOpen])

  if (!visible) return null

  return (
    <>
  <div className={`fixed inset-0 z-50 flex transition-all duration-300 ${active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
        />

        {/* Panel */}
  <div className={`relative flex w-full flex-col bg-white lg:ml-auto lg:w-[600px] transform transition-all duration-300 ${active ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
          {/* Header */}
          <div className="flex items-center justify-between  px-6 py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-lg font-semibold">Administrador de Fuentes</h2>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1  overflow-auto lg:overflow-hidden hide-scrollbar min-h-0 bg-gray-50 lg:bg-white">
            <div className="flex h-full flex-col min-h-0 ">
              {/* Tabs (mobile = accordion, desktop = horizontal tabs + content) */}
              <div>
                <SourceFormTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onClose={onClose}
                  onSave={() => {
                    if (formRef.current) {
                      formRef.current.submit()
                    }
                  }}
                  renderContent={(tabId) => renderTabContent(tabId)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Add default export
export default SourcesAdministrator

