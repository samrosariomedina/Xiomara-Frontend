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
import { useTranslations } from 'next-intl'
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

  const t = useTranslations('FUENTES')

  const headerActions = [
    { icon: <Eye className="h-4 w-4" />, label: t('viewAll'), ariaLabel: t('viewAll'), onClick: () => {} , variant: "soft" as const },
    { icon: <Plus className="h-4 w-4" />, label: t('form.addButton'), ariaLabel: t('form.addButton'), onClick: handleAddMore, variant: "soft" as const },
  ]

  const headerActionsPlain: { label: string; onClick?: () => void }[] = []

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
  <HeaderControls title={t('title')} actions={headerActions} />

  <SourcesList sources={sources} onKebabClick={(id) => console.log("kebab", id)} />
      </div>
    )
  }

  // Image 1: Empty state
  if (!showForm && sources.length === 0) {
    return (
      <>
  <HeaderControls title={t('title')} actions={headerActionsPlain} />
        <div className="bg-white rounded-lg p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">{t('empty.title')}</p>
            <p className="text-sm text-gray-400 mb-6">{t('empty.subtitle')}</p>
            <Button onClick={() => setShowForm(true)} className="bg-[#f7f9ff] hover:bg-gray-50 text-[#31499f] rounded-full inline-flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>{t('empty.addButton')}</span>
            </Button>
          </div>
        </div>
      </>
    )
  }

  // Images 2-4: Form with tabs
    return (
    <div className="space-y-6">
  <HeaderControls title={t('title')} actions={headerActionsPlain} />
      {/* Name input */}
      <div>
        <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
          {t('form.nameLabel')}
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full bg-[#f7f9ff]"
          placeholder={t('form.namePlaceholder')}
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
              {t('form.uploadTab')}
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
              {t('form.urlTab')}
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
              {t('form.textTab')}
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
              placeholder={t('form.addUrlPlaceholder')}
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
            {/* Inline action buttons (no fixed footer) */}
            <div className="fixed bottom-0 left-0 right-0 m-1  lg:m-3 bg-white sm:bg-transparent rounded-lg  shadow-md sm:shadow-none">
                     <div className="pt-2 flex justify-end gap-3 mb-2 mr-2">
                       <Button onClick={handleCancel} className="px-4 bg-[#f7f9ff] text-[#31499f] rounded-full hover:bg-[#e0e7ff]">{t('form.cancel')}</Button>
                       <Button onClick={handleSubmit} className="bg-[#31499f] hover:bg-blue-700 text-white rounded-full px-4">{t('form.submit')}</Button>
                     </div>
                   </div>
    </div>
  )
})

FuentesGeneralesForm.displayName = "FuentesGeneralesForm"
