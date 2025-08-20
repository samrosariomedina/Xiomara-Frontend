"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Plus, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SourceFormTabs } from "@/components/ui/source-form-tabs"
import { FuentesGeneralesForm } from "@/components/fuentes-generales-form"
import { CorresponsalesForm } from "@/components/corresponables-form"
import { KnowledgeBaseForm } from "@/components/knowledge-base-form"
import { MediaListeningForm } from "@/components/media-base-form"

interface SourcesAdministratorProps {
  isOpen: boolean
  onClose: () => void
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
    const d = data as any
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

    // also listen for resize so behavior updates if viewport changes while open
    window.addEventListener("resize", lockScroll)
    return () => {
      window.removeEventListener("resize", lockScroll)
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
    }
  }, [isOpen])

  return (
    <>
      {/* Backdrop with smooth fade */}
      <div
        className={`fixed inset-0 bg-black/30 lg:backdrop-blur-sm z-40 transition-all duration-300 ease-out ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Side panel with smooth slide */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-4/5 lg:w-1/2 bg-white shadow-2xl z-50 transform transition-all duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header with smooth fade-in */}
          <div className={`flex items-center px-6 py-4  bg-white transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'} flex-shrink-0`}>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded mr-3 transition-colors duration-200">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Administrador de Fuentes</h1>
          </div>

          {/* Tabs section - hidden on mobile, shown on desktop */}
          <div className={`px-6 py-3 bg-white transition-opacity duration-300 delay-100 ${isOpen ? 'opacity-100' : 'opacity-0'} hidden lg:block flex-shrink-0`}>
      <SourceFormTabs 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              renderContent={(tabId) => {
                switch (tabId) {
                  case "fuentes-generales":
        return <FuentesGeneralesForm ref={formRef} onSubmit={handleSubmit} />
                  case "corresponsales":
                    return <CorresponsalesForm onSubmit={handleSubmit} />
                  case "knowledge-base":
                    return <KnowledgeBaseForm onSubmit={handleSubmit} />
                  case "media-listening":
                    return <MediaListeningForm onSubmit={handleSubmit} />
                  default:
                    return null
                }
              }}
            />
          </div>

          {/* Scrollable content area */}
          <div className={`flex-1 overflow-y-auto bg-white transition-opacity duration-300 delay-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div className="p-6 pb-24 lg:pb-6">
              {/* Mobile accordion - show on mobile/tablet */}
              <div className="lg:hidden mb-6">
                <SourceFormTabs 
                  activeTab={activeTab} 
                  onTabChange={setActiveTab}
                  renderContent={(tabId) => {
                    switch (tabId) {
                      case "fuentes-generales":
                        return <FuentesGeneralesForm ref={formRef} onSubmit={handleSubmit} />
                      case "corresponsales":
                        return <CorresponsalesForm onSubmit={handleSubmit} />
                      case "knowledge-base":
                        return <KnowledgeBaseForm onSubmit={handleSubmit} />
                      case "media-listening":
                        return <MediaListeningForm onSubmit={handleSubmit} />
                      default:
                        return null
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
