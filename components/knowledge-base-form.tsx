"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {  Plus, Eye, Brain } from "lucide-react"
import HeaderControls from "./header-controls"
import SourcesList, { SourceItem } from "./sources-list"
import { FileUpload } from "@/components/ui/file-upload"
import { UrlInput } from "@/components/ui/url-input"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface KnowledgeBaseFormProps {
  onSubmit?: (data: unknown) => void
}

export function KnowledgeBaseForm({ onSubmit }: KnowledgeBaseFormProps) {
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<"file" | "url" | "text">("file")
  const [sources, setSources] = useState<SourceItem[]>([])
  const [formData, setFormData] = useState({
    name: "",
    accountType: "",
    description: "",
    file: null as File | null,
    url: "",
    text: "",
  })

  const headerActions = [
    { icon: <Eye className="h-4 w-4" />, label: "Ver listado completo", ariaLabel: "Ver listado completo", onClick: () => {}, variant: "soft" as const },
    { icon: <Plus className="h-4 w-4" />, label: "Agregar", ariaLabel: "Agregar", onClick: () => setShowForm(true), variant: "outline" as const },
  ]

  const handleCancel = () => {
    setFormData({ name: "", accountType: "", description: "", file: null, url: "", text: "" })
    setShowForm(false)
  }

  const handleSubmit = () => {
    const id = sources.length + 1
    const newItem: SourceItem = {
      id,
      name: formData.name || "Artículo",
      type: activeTab === "file" ? "image" : activeTab === "url" ? "url" : "text",
      category: "Knowledge",
      timestamp: "now",
    }
    setSources([...sources, newItem])
    onSubmit?.(formData)
    setFormData({ name: "", accountType: "", description: "", file: null, url: "", text: "" })
    setShowForm(false)
  }

  // list view
  if (sources.length > 0 && !showForm) {
    return (
      <div>
        <HeaderControls title="Knowledge Base" actions={headerActions} />
        <div className="bg-white rounded-lg p-6">
          <SourcesList sources={sources} onKebabClick={(id) => console.log("kebab", id)} />
        </div>
      </div>
    )
  }

  // empty state
  if (!showForm && sources.length === 0) {
    return (
      <>
        <HeaderControls title="Knowledge Base" actions={headerActions} />
        <div className="bg-white rounded-lg p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
              <Brain className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">No se han agregado artículos</p>
            <p className="text-sm text-gray-400 mb-6">Agregar contenido para comenzar</p>
            <Button onClick={() => setShowForm(true)} className="bg-[#f7f9ff] hover:bg-gray-50 text-[#31499f] rounded-full inline-flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Agregar</span>
            </Button>
          </div>
        </div>
      </>
    )
  }

  // form view
  return (
    <div className="space-y-6 pb-24">
      <HeaderControls title="Knowledge Base" actions={headerActions} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">Nombre</Label>
          <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nombre" className="w-full bg-[#f7f9ff]" />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de cuenta</Label>
          <select id="accountType" className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2" value={formData.accountType} onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}>
            <option value="">Selecciona</option>
            <option value="kb">KB Type 1</option>
            <option value="article">Article</option>
          </select>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Descripción</Label>
        <textarea className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 min-h-[120px]" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
      </div>

      {/* Horizontal tabs */}
      <div>
        <div className="mb-6">
          <div className="inline-flex w-full rounded-lg border border-gray-200 bg-white divide-x divide-gray-200 overflow-hidden">
            <button type="button" onClick={() => setActiveTab("file")} className={`flex-1 px-4 py-2 text-sm font-medium text-center transition ${activeTab === "file" ? "bg-[#f7f9ff] text-[#31499f]" : "text-gray-500 hover:text-gray-700"}`}>
              Subir Archivo
            </button>
            <button type="button" onClick={() => setActiveTab("url")} className={`flex-1 px-4 py-2 text-sm font-medium text-center transition ${activeTab === "url" ? "bg-[#f7f9ff] text-[#31499f]" : "text-gray-500 hover:text-gray-700"}`}>
              Web URL
            </button>
            <button type="button" onClick={() => setActiveTab("text")} className={`flex-1 px-4 py-2 text-sm font-medium text-center transition ${activeTab === "text" ? "bg-[#f7f9ff] text-[#31499f]" : "text-gray-500 hover:text-gray-700"}`}>
              Texto
            </button>
          </div>
        </div>

        {activeTab === "file" && (
          <div>
            <FileUpload selectedFile={formData.file || undefined} onFileSelect={(file) => setFormData({ ...formData, file })} onRemove={() => setFormData({ ...formData, file: null })} />
          </div>
        )}

        {activeTab === "url" && (
          <div>
            <UrlInput value={formData.url} onChange={(url) => setFormData({ ...formData, url })} placeholder="Add URL" />
          </div>
        )}

        {activeTab === "text" && (
          <div>
            <RichTextEditor value={formData.text} onChange={(text) => setFormData({ ...formData, text })} />
          </div>
        )}
      </div>

      {/* fixed bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-end">
          <div className="flex items-center space-x-3">
            <Button onClick={handleCancel} className="px-6 bg-[#f7f9ff] text-[#31499f] rounded-full hover:bg-[#e0e7ff]">Cancelar</Button>
            <Button onClick={handleSubmit} className="bg-[#31499f] hover:bg-blue-700 text-white rounded-full px-6">Agregar Fuentes</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
