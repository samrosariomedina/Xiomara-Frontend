"use client"

import React, { useState, useImperativeHandle, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Plus, Eye } from "lucide-react"
import { FileUpload } from "@/components/ui/file-upload"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { UrlInput } from "@/components/ui/url-input"
import HeaderControls from "./header-controls"
import SourcesList from "./sources-list"

interface FormData {
  name: string
  file: File | null
  url: string
  text: string
}

interface FuentesGeneralesFormProps {
  onSubmit: (data: FormData) => void
}

interface Source {
  id: number
  name: string
  type: "image" | "text" | "url"
  category: string
  timestamp: string
}

export const FuentesGeneralesForm = forwardRef(function FuentesGeneralesForm(
  { onSubmit }: FuentesGeneralesFormProps,
  ref
) {
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<"file" | "url" | "text">("file")
  const [sources, setSources] = useState<Source[]>([])
  const [formData, setFormData] = useState({
    name: "",
    file: null as File | null,
    url: "",
    text: "",
  })

  const handleSubmit = () => {
    const newSource: Source = {
      id: sources.length + 1,
      name: formData.name || "Nombre",
      type: activeTab === "file" ? "image" : activeTab === "url" ? "url" : "text",
      category: "Marketing",
      timestamp: "20min"
    }
    
    setSources([...sources, newSource])
    onSubmit(formData)
    setFormData({ name: "", file: null, url: "", text: "" })
    setShowForm(false) // Close form and show sources list
  }

  const handleCancel = () => {
    setFormData({ name: "", file: null, url: "", text: "" })
    setShowForm(false) // Just close the form without creating a source
  }

  const handleAddMore = () => {
    setShowForm(true)
    setFormData({ name: "", file: null, url: "", text: "" })
  }

  const headerActions = [
    { icon: <Eye className="h-4 w-4" />, label: "Ver listado completo", ariaLabel: "Ver listado completo", onClick: () => {} , variant: "soft" as const },
    { icon: <Plus className="h-4 w-4" />, label: "Agregar", ariaLabel: "Agregar", onClick: handleAddMore, variant: "outline" as const },
  ]

  // expose imperative methods to parent
  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  cancel: handleCancel,
  open: () => setShowForm(true),
  }))

  // header controls are now a reusable component

  // Image 5: Sources list view
  if (sources.length > 0 && !showForm) {
    return (
      <div className="space-y-2">
        <HeaderControls title="Fuentes Generales" actions={headerActions} />

  <SourcesList sources={sources} onKebabClick={(id) => console.log("kebab", id)} />
      </div>
    )
  }

  // Image 1: Empty state
  if (!showForm && sources.length === 0) {
    return (
      <div className="space-y-4">
        <HeaderControls title="Fuentes Generales" actions={headerActions} />
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-2">No se han agregado fuentes</p>
          <p className="text-sm text-gray-400 mb-6">Agregar archivos para comenzar</p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-[#f7f9ff] hover:bg-gray-50 text-[#31499f] rounded-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Fuentes
          </Button>
        </div>
      </div>
    )
  }

  // Images 2-4: Form with tabs
    return (
    <div className="space-y-6 pb-24">
      <HeaderControls title="Fuentes Generales" actions={headerActions} />
      {/* Name input */}
      <div>
        <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
          Nombre
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full bg-[#f7f9ff]"
          placeholder="Ingresa el nombre"
        />
      </div>

      {/* Horizontal tabs */}
      <div>
        <div className="mb-6">
          <div className="inline-flex w-full rounded-lg border border-gray-200 bg-white divide-x divide-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveTab("file")}
              className={`flex-1 px-4 py-2 text-sm font-medium text-center transition ${
                activeTab === "file"
                  ? "bg-[#f7f9ff] text-[#31499f]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Subir Archivo
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("url")}
              className={`flex-1 px-4 py-2 text-sm font-medium text-center transition ${
                activeTab === "url"
                  ? "bg-[#f7f9ff] text-[#31499f]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Web URL
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("text")}
              className={`flex-1 px-4 py-2 text-sm font-medium text-center transition ${
                activeTab === "text"
                  ? "bg-[#f7f9ff] text-[#31499f]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Texto
            </button>
          </div>
        </div>

  {/* Tab content */}
        {activeTab === "file" && (
          <div>
            <FileUpload
              selectedFile={formData.file || undefined}
              onFileSelect={(file) => setFormData({ ...formData, file })}
              onRemove={() => setFormData({ ...formData, file: null })}
            />
          </div>
        )}

        {activeTab === "url" && (
          <div>
            <UrlInput
              value={formData.url}
              onChange={(url) => setFormData({ ...formData, url })}
              placeholder="Add URL"
            />
          </div>
        )}

        {activeTab === "text" && (
          <div>
            <RichTextEditor 
              value={formData.text} 
              onChange={(text) => setFormData({ ...formData, text })} 
            />
          </div>
        )}
      </div>
            {/* Action buttons - fixed to bottom of page */}
      <div className="fixed bottom-0 left-0 right-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-end">
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleCancel}
              className="px-6 bg-[#f7f9ff] text-[#31499f] rounded-full hover:bg-[#e0e7ff]"
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-[#31499f] hover:bg-blue-700 text-white rounded-full px-6">
              Agregar Fuentes
            </Button>
          </div>
        </div>
      </div>


  {/* action bar removed — controlled by parent via ref */}
    </div>
  )
})

FuentesGeneralesForm.displayName = "FuentesGeneralesForm"
