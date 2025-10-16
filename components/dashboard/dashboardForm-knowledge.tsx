"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Plus, Eye, Brain, ChevronDown } from "lucide-react"
import { FileUpload } from "@/components/ui/file-upload"
import { UrlInput } from "@/components/ui/url-input"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslations } from 'next-intl'
import { knowledgeBaseSchema, type KnowledgeBaseInput } from '@/lib/schemas'
import { useKnowledge } from '@/hooks/useKnowledge'
import { useDataWithCache } from '@/hooks/useDataWithCache'
import { useClient } from '@/context/ClientContext'
import type { ReferenceResponse } from '@/lib/schemas'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import HeaderControls from "../ui/formsHeader-dashboard"
import SourcesList, { SourceItem } from "../ui/formsLists-dashboard"

interface KnowledgeBaseFormProps {
  onSubmit?: (data: unknown) => void
  references: ReferenceResponse[]
}

export function KnowledgeBaseForm({ onSubmit, references }: KnowledgeBaseFormProps) {
  // Use caching for references
  const {
    data: cachedReferences
  } = useDataWithCache(references, { cacheKey: 'references' })
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<"file" | "url" | "text">("text")
  
  const { selectedClient } = useClient()
  const { createReference, isCreating } = useKnowledge()
  const router = useRouter()
  
  const form = useForm<KnowledgeBaseInput>({
    resolver: zodResolver(knowledgeBaseSchema),
    defaultValues: {
      name: "",
      accountType: "kb",
      description: "",
      file: null,
      url: "",
      text: "",
    }
  })

  const t = useTranslations('KNOWLEDGE')

  // Account type options
  const accountTypeOptions = [
    { value: "kb", label: "KB Type 1" },
    { value: "article", label: "Article" },
    { value: "document", label: "Document" },
    { value: "reference", label: "Reference" }
  ];

  const getAccountTypeLabel = () => {
    const accountType = form.watch('accountType')
    const found = accountTypeOptions.find(opt => opt.value === accountType)
    return found ? found.label : t('form.selectPlaceholder')
  }

  // Transform references to SourceItem format for display
  const sources: SourceItem[] = cachedReferences.map((ref, index) => {
    // Handle both old string content and new object content
    const displayName = ref.title || `Knowledge Item ${index + 1}`;
    
    return {
      id: index + 1, // Convert to number for SourceItem compatibility
      name: displayName,
      type: ref.type === 'text' ? 'text' : ref.type === 'webpage' ? 'url' : 'image',
      category: "Knowledge",
      timestamp: new Date(ref.timestamp).toLocaleDateString(),
    }
  })

  const headerActions = [
    { icon: <Eye className="h-4 w-4" />, label: t('viewAll'), ariaLabel: t('viewAll'), onClick: () => router.push('/clients/channels/knowledge'), variant: "soft" as const },
    { icon: <Plus className="h-4 w-4" />, label: t('empty.addButton'), ariaLabel: t('empty.addButton'), onClick: () => setShowForm(true), variant: "soft" as const },
  ]
  const headerActionsPlain: { label: string; onClick?: () => void }[] = []

  const handleCancel = () => {
    form.reset()
    form.clearErrors()
    setShowForm(false)
  }

  const handleSubmit = form.handleSubmit((data) => {
    if (!selectedClient) {
      console.error('No client selected')
      return
    }

    // Validate that at least one content type is provided
    if (!data.file && !data.url && !data.text) {
      form.setError('file', { 
        type: 'manual', 
        message: 'At least one source (file, URL, or text) must be provided' 
      })
      return
    }

    createReference(data, {
      onSuccess: () => {
        form.reset()
        setShowForm(false)
        onSubmit?.(data)
      }
    })
  })


  // list view
  if (sources.length > 0 && !showForm) {
    return (
      <div className="h-full flex flex-col">
        <HeaderControls title={t('title')} actions={headerActions} />
        <div className="bg-white rounded-lg p-6 flex-1 overflow-hidden">
          <SourcesList sources={sources} onKebabClick={() => {}} />
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
    <div className="space-y-6 h-full flex flex-col">
      <HeaderControls title={t('title')} actions={headerActionsPlain} />
      {/* Constrain form width on desktop so it fits the panel */}
      <div className="lg:max-w-full lg:mx-auto flex-1 overflow-y-auto">

        <div className="grid  grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">{t('form.nameLabel')}</Label>
          <Input 
            id="name" 
            {...form.register('name')}
            placeholder={t('form.namePlaceholder')} 
            className={`w-full bg-[#f7f9ff] ${form.formState.errors.name ? 'border-red-500' : ''}`} 
          />
          {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">{t('form.accountTypeLabel')}</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`w-full bg-[#f7f9ff] border rounded px-3 py-2 text-sm justify-between ${
                  form.formState.errors.accountType ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                {getAccountTypeLabel()}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[200px]">
              {accountTypeOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => form.setValue('accountType', option.value as 'kb' | 'article')}
                  className="cursor-pointer"
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {form.formState.errors.accountType && <p className="text-red-500 text-xs mt-1">{form.formState.errors.accountType.message}</p>}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">{t('form.descriptionLabel')}</Label>
        <textarea 
          className={`w-full focus:outline-none bg-[#f7f9ff] border rounded px-3 py-2 min-h-[120px] ${form.formState.errors.description ? 'border-red-500' : 'border-gray-200'}`} 
          {...form.register('description')}
        />
        {form.formState.errors.description && <p className="text-red-500 text-xs mt-1">{form.formState.errors.description.message}</p>}
      </div>

      {/* Horizontal tabs */}
      <div>
        <div className="mb-2">
          <div className="inline-flex w-full rounded-lg border border-gray-200 bg-white divide-x divide-gray-200 overflow-hidden">
            <button type="button" onClick={() => {
              setActiveTab("file")
              form.clearErrors(['file', 'url', 'text'])
            }} className={`flex-1 px-4 py-2 text-sm font-medium text-center transition ${activeTab === "file" ? "bg-[#f7f9ff] text-[#31499f]" : "text-gray-500 hover:text-gray-700"}`}>
              {t('form.uploadTab')}
            </button>
            <button type="button" onClick={() => {
              setActiveTab("url")
              form.clearErrors(['file', 'url', 'text'])
            }} className={`flex-1 px-4 py-2 text-sm font-medium text-center transition ${activeTab === "url" ? "bg-[#f7f9ff] text-[#31499f]" : "text-gray-500 hover:text-gray-700"}`}>
              {t('form.urlTab')}
            </button>
            <button type="button" onClick={() => {
              setActiveTab("text")
              form.clearErrors(['file', 'url', 'text'])
            }} className={`flex-1 px-4 py-2 text-sm font-medium text-center transition ${activeTab === "text" ? "bg-[#f7f9ff] text-[#31499f]" : "text-gray-500 hover:text-gray-700"}`}>
              {t('form.textTab')}
            </button>
          </div>
        </div>

        {activeTab === "file" && (
          <div>
            <FileUpload
              selectedFile={form.watch('file') || undefined}
              onFileSelect={(file) => form.setValue('file', file)}
              onRemove={() => form.setValue('file', null)}
              accept=".txt,.md,.pdf,.html,.htm"
              maxSize={100}
            />
            {form.formState.errors.file && <p className="text-red-500 text-xs mt-1">{form.formState.errors.file.message}</p>}
          </div>
        )}

        {activeTab === "url" && (
          <div>
            <UrlInput 
              value={form.watch('url') || ''} 
              onChange={(url) => form.setValue('url', url)} 
              placeholder={t('form.addUrlPlaceholder')} 
            />
            {form.formState.errors.url && <p className="text-red-500 text-xs mt-1">{form.formState.errors.url.message}</p>}
          </div>
        )}

        {activeTab === "text" && (
          <div>
            <RichTextEditor 
              value={form.watch('text') || ''} 
              onChange={(text) => form.setValue('text', text)} 
            />
            {form.formState.errors.text && <p className="text-red-500 text-xs mt-1">{form.formState.errors.text.message}</p>}
          </div>
        )}
      </div>
      </div>

      {/* General validation error */}
      {(form.formState.errors.file || form.formState.errors.url || form.formState.errors.text) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">At least one source (file, URL, or text) must be provided</p>
        </div>
      )}

      {/* Footer: center the buttons inside the same max width on desktop */}
      <div className="fixed bottom-0 left-0 right-0 lg:m-3 bg-white sm:bg-transparent rounded-lg shadow-md sm:shadow-none">
        <div className="max-w-[520px] mx-auto pt-2 flex justify-end gap-3 mb-2 mr-2 px-4 lg:px-0">
          <Button 
            onClick={handleCancel} 
            disabled={isCreating}
            className="px-4 bg-[#f7f9ff] text-[#31499f] rounded-full hover:bg-[#e0e7ff]"
          >
            {t('form.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isCreating}
            className="bg-[#31499f] hover:bg-blue-700 text-white rounded-full px-4"
          >
            {isCreating ? 'Creating...' : t('form.submit')}
          </Button>
        </div>
      </div>
    </div>
  )
}

