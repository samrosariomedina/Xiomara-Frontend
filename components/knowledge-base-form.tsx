"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Eye, Brain } from "lucide-react"
import HeaderControls from "./header-controls"
import SourcesList, { SourceItem } from "./sources-list"
import { FileUpload } from "@/components/ui/file-upload"
import { UrlInput } from "@/components/ui/url-input"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslations } from 'next-intl'

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

  const t = useTranslations('KNOWLEDGE')

  const headerActions = [
    { icon: <Eye className="h-4 w-4" />, label: t('viewAll'), ariaLabel: t('viewAll'), onClick: () => {}, variant: "soft" as const },
    { icon: <Plus className="h-4 w-4" />, label: t('empty.addButton'), ariaLabel: t('empty.addButton'), onClick: () => setShowForm(true), variant: "soft" as const },
  ]
  const headerActionsPlain: { label: string; onClick?: () => void }[] = []

  const handleCancel = () => {
    setFormData({ name: "", accountType: "", description: "", file: null, url: "", text: "" })
    setShowForm(false)
  }

  const handleSubmit = () => {
    const id = sources.length + 1
    const newItem: SourceItem = {
      id,
      name: formData.name || t('form.namePlaceholder'),
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
        <HeaderControls title={t('title')} actions={headerActions} />
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
        <HeaderControls title={t('title')} actions={headerActionsPlain} />
        <div className="bg-white rounded-lg p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center">
              <Brain className="h-8 w-8 text-gray-400" />
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

  // form view
  return (
    <div className="space-y-6 border ">
      <HeaderControls title={t('title')} actions={headerActionsPlain} />
      {/* Constrain form width on desktop so it fits the panel */}
      <div className=" lg:max-w-[520px] lg:mx-auto">

        <div className="grid  grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">{t('form.nameLabel')}</Label>
          <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={t('form.namePlaceholder')} className="w-full bg-[#f7f9ff]" />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">{t('form.accountTypeLabel')}</Label>
          <Select onValueChange={(value) => setFormData({ ...formData, accountType: value })} defaultValue={formData.accountType}>
            <SelectTrigger className="w-full bg-[#f7f9ff] border border-gray-200 rounded px-3 py-2 text-sm">
              <SelectValue placeholder={t('form.selectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kb">KB Type 1</SelectItem>
              <SelectItem value="article">Article</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">{t('form.descriptionLabel')}</Label>
        <textarea className="w-full focus:outline-none bg-[#f7f9ff] border border-gray-200 rounded px-3 py-2 min-h-[120px]" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
      </div>

      {/* Horizontal tabs */}
      <div>
        <div className="mb-2">
          <div className="inline-flex w-full rounded-lg border border-gray-200 bg-white divide-x divide-gray-200 overflow-hidden">
            <button type="button" onClick={() => setActiveTab("file")} className={`flex-1 px-4 py-2 text-sm font-medium text-center transition ${activeTab === "file" ? "bg-[#f7f9ff] text-[#31499f]" : "text-gray-500 hover:text-gray-700"}`}>
              {t('form.uploadTab')}
            </button>
            <button type="button" onClick={() => setActiveTab("url")} className={`flex-1 px-4 py-2 text-sm font-medium text-center transition ${activeTab === "url" ? "bg-[#f7f9ff] text-[#31499f]" : "text-gray-500 hover:text-gray-700"}`}>
              {t('form.urlTab')}
            </button>
            <button type="button" onClick={() => setActiveTab("text")} className={`flex-1 px-4 py-2 text-sm font-medium text-center transition ${activeTab === "text" ? "bg-[#f7f9ff] text-[#31499f]" : "text-gray-500 hover:text-gray-700"}`}>
              {t('form.textTab')}
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
            <UrlInput value={formData.url} onChange={(url) => setFormData({ ...formData, url })} placeholder={t('form.addUrlPlaceholder')} />
          </div>
        )}

        {activeTab === "text" && (
          <div>
            <RichTextEditor value={formData.text} onChange={(text) => setFormData({ ...formData, text })} />
          </div>
        )}
      </div>
      </div>

      {/* Footer: center the buttons inside the same max width on desktop */}
      <div className="fixed bottom-0 left-0 right-0 lg:m-3 bg-white sm:bg-transparent rounded-lg shadow-md sm:shadow-none">
        <div className="max-w-[520px] mx-auto pt-2 flex justify-end gap-3 mb-2 mr-2 px-4 lg:px-0">
          <Button onClick={handleCancel} className="px-4 bg-[#f7f9ff] text-[#31499f] rounded-full hover:bg-[#e0e7ff]">{t('form.cancel')}</Button>
          <Button onClick={handleSubmit} className="bg-[#31499f] hover:bg-blue-700 text-white rounded-full px-4">{t('form.submit')}</Button>
        </div>
      </div>
    </div>
  )
}
