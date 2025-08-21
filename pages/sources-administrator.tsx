"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { SourceFormTabs } from "@/components/ui/source-form-tabs"
import { FuentesGeneralesForm } from "@/components/fuentes-generales-form"
import { CorresponsalesForm } from "@/components/corresponables-form"
import { KnowledgeBaseForm } from "@/components/knowledge-base-form"
import { MediaListeningForm } from "@/components/media-base-form"

interface SourcesAdministratorProps {
  isOpen: boolean
  onClose: () => void
}

interface SourceData {
  name?: string
  [key: string]: unknown
}

export function SourcesAdministrator({ isOpen, onClose }: SourcesAdministratorProps) {
  const [activeTab, setActiveTab] = useState("fuentes-generales")
  const [sources, setSources] = useState<
    Array<{
      id: number
      name: string
      type: "image" | "text" | "url"
      category: string
      timestamp: string
    }>
  >([])

  const handleSubmit = (data: unknown) => {
    const d = data as SourceData
    const newSource = {
      id: sources.length + 1,
      name: d?.name || "Nuevo Nombre",
      type: "image" as const,
      category: "Marketing",
      timestamp: "Ahora",
    }
    setSources([...sources, newSource])
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "fuentes-generales":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg ">
              <FuentesGeneralesForm ref={formRef} onSubmit={handleSubmit} />
            </div>
          </div>
        )

      case "corresponsales":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg ">
              <CorresponsalesForm onSubmit={handleSubmit} />
            </div>
          </div>
        )

      case "knowledge-base":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg ">
              <KnowledgeBaseForm onSubmit={handleSubmit} />
            </div>
          </div>
        )

      case "media-listening":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg ">
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
      if (typeof window === "undefined") return
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
      if (typeof window === "undefined") return
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Panel */}
        <div className="relative flex w-full flex-col bg-white lg:ml-auto lg:w-[600px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-lg font-semibold">Administrador de Fuentes</h2>
                <p className="text-sm text-gray-500">
                  Gestiona tus fuentes de información
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <div className="flex h-full flex-col">
              {/* Mobile tabs */}
              <div className="lg:hidden">
                <SourceFormTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onClose={onClose}
                  onSave={() => {
                    if (formRef.current) {
                      formRef.current.submit()
                    }
                  }}
                />
              </div>

              {/* Desktop content */}
              <div className="hidden lg:block">
                {renderTabContent()}
              </div>
            </div>
          </div>

         
        </div>

        {/* Footer action bar - placed outside scrollable area so it's always visible */}
        
        </div>
    </>
  )
}

// Add default export
export default SourcesAdministrator
