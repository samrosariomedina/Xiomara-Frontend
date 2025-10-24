"use client"

import React, { useState, useImperativeHandle, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Plus, Eye } from "lucide-react"
import { FileUpload } from "@/components/ui/file-upload"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { UrlInput } from "@/components/ui/url-input"
import HeaderControls from "../ui/formsHeader-dashboard"
import { useTranslations } from 'next-intl'
import SourcesList from "../ui/formsLists-dashboard"
import { fuentesGeneralesSchema, validateForm } from '@/lib/schemas'
import { useSourcesMutations } from '@/hooks/useSources'
import { formatDateSafe } from '@/lib/utils'
import type { SourceResponse } from '@/lib/schemas'
import { useRouter } from 'next/navigation'

interface FormData {
  name: string
  file: File | null
  url: string
  text: string
}

interface FuentesGeneralesFormProps {
  onSubmit: (data: FormData) => void
  sources: SourceResponse[]
  folderId: string
  editSource?: SourceResponse | null
}

interface Source {
  id: number
  name: string
  type: "image" | "text" | "url"
  category: string
  timestamp: string
}

export const FuentesGeneralesForm = forwardRef(function FuentesGeneralesForm(
  { onSubmit, sources, folderId, editSource = null }: FuentesGeneralesFormProps,
  ref
) {
  // Debug logging
  console.log('🟠 FuentesGeneralesForm rendered with editSource:', editSource);
  
  // Local edit state for list-based editing
  const [localEditSource, setLocalEditSource] = useState<SourceResponse | null>(null);
  
  // Determine if we're in edit mode (either from prop or local state)
  const currentEditSource = editSource || localEditSource;
  const isEditMode = !!currentEditSource
  
  // Initialize form state based on edit mode
  const [showForm, setShowForm] = useState(isEditMode) // Auto-show form in edit mode
  const [activeTab, setActiveTab] = useState<"file" | "url" | "text">(
    isEditMode && currentEditSource?.type === 'text' ? 'text' : 
    isEditMode && currentEditSource?.type === 'url' ? 'url' : 'file'
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: isEditMode ? (currentEditSource?.title || "") : "",
    file: null as File | null,
    url: isEditMode && currentEditSource?.type === 'url' ? (currentEditSource?.content || "") : "",
    text: isEditMode && currentEditSource?.type === 'text' ? (currentEditSource?.content || "") : "",
  })

  const { createSource, editSource: editSourceMutation, removeSource, isCreating, isEditing } = useSourcesMutations(folderId)
  const router = useRouter()
  
  // Reset form when editSource or localEditSource changes
  React.useEffect(() => {
    console.log('🟠 currentEditSource changed:', currentEditSource);
    if (currentEditSource) {
      console.log('🟠 Setting form to edit mode with data:', {
        name: currentEditSource.title,
        type: currentEditSource.type,
        content: currentEditSource.content
      });
      setShowForm(true)
      setFormData({
        name: currentEditSource.title || "",
        file: null,
        url: currentEditSource.type === 'url' ? (currentEditSource.content || "") : "",
        text: currentEditSource.type === 'text' ? (currentEditSource.content || "") : "",
      })
      setActiveTab(
        currentEditSource.type === 'text' ? 'text' : 
        currentEditSource.type === 'url' ? 'url' : 'file'
      )
      setErrors({})
    }
  }, [currentEditSource])

  // Debug logging for folderId
  console.log('╔═══════════════════════════════════════════════════╗')
  console.log('║        FUENTES FORM DEBUG                         ║')
  console.log('╠═══════════════════════════════════════════════════╣')
  console.log('║  Folder ID for mutations: ', (folderId || 'N/A').padEnd(20), '║')
  console.log('╚═══════════════════════════════════════════════════╝')

  // Utility function to strip HTML and clean text content
  const stripHtmlAndCleanText = (htmlText: string): string => {
    if (!htmlText) return '';
    
    // First check if it's just empty HTML tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlText;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    if (!textContent.trim()) return '';
    
    return textContent
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
      .replace(/&amp;/g, '&') // Decode &amp;
      .replace(/&lt;/g, '<') // Decode &lt;
      .replace(/&gt;/g, '>') // Decode &gt;
      .replace(/&quot;/g, '"') // Decode &quot;
      .replace(/&#39;/g, "'") // Decode &#39;
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim(); // Remove leading/trailing whitespace
  }

  // Transform sources to SourceItem format for display - no caching
  const sourcesList: Source[] = sources.map((source, index) => ({
    id: index + 1,
    name: source.title || 'Sin título',
    type: source.type === 'generales' ? 'text' : source.type as "image" | "text" | "url",
    category: "General",
    timestamp: formatDateSafe(source.timestamp),
  }))

  const handleSubmit = async () => {
    // Validate form data
    const validation = validateForm(fuentesGeneralesSchema, formData)
    
    if (!validation.success) {
      setErrors(validation.errors || {})
      return
    }

    setErrors({}) // Clear any previous errors
    
    try {
      // Process text content to strip HTML tags for backend
      const processedText = stripHtmlAndCleanText(formData.text);
      
      // Validate that we have content after processing
      if (activeTab === 'text') {
        if (!processedText) {
          setErrors({ text: 'Please enter some text content' });
          return;
        }
        
        // Additional validation for minimum content length
        if (processedText.length < 3) {
          setErrors({ text: 'Text content must be at least 3 characters long' });
          return;
        }
      }
      
      // Prepare source data
      const sourceData = {
        name: formData.name,
        file: formData.file || undefined,
        url: formData.url || undefined,
        text: processedText || undefined,
      }
      
      if (isEditMode && currentEditSource) {
        // Edit existing source
        console.log('Editing source with data:', sourceData)
        await editSourceMutation({ sourceId: currentEditSource._id, data: sourceData })
      } else {
        // Create new source
        console.log('╔═══════════════════════════════════════════════════╗')
        console.log('║  CREATING NEW SOURCE                              ║')
        console.log('╠═══════════════════════════════════════════════════╣')
        console.log('║  Source Data:', JSON.stringify(sourceData).substring(0, 40).padEnd(20), '║')
        console.log('║  Folder ID:     ', (folderId || 'N/A').padEnd(27), '║')
        console.log('╚═══════════════════════════════════════════════════╝')
        await createSource(sourceData)
      }
      
      // Call the parent onSubmit for any additional handling
      onSubmit(formData)
      
      // Reset form
      setFormData({ name: "", file: null, url: "", text: "" })
      setLocalEditSource(null) // Clear local edit state
      setShowForm(false) // Close form and show sources list
    } catch (error) {
      console.error(`Error ${isEditMode ? 'editing' : 'creating'} source:`, error)
      setErrors({ general: `Failed to ${isEditMode ? 'edit' : 'create'} source` })
    }
  }

  const handleCancel = () => {
    setErrors({}) // Clear validation errors
    setFormData({ name: "", file: null, url: "", text: "" })
    setShowForm(false) // Just close the form without creating a source
  }

  const handleAddMore = () => {
    setShowForm(true)
    setFormData({ name: "", file: null, url: "", text: "" })
  }

  const t = useTranslations('FUENTES')

  const headerActions = [
    { icon: <Eye className="h-4 w-4" />, label: t('viewAll'), ariaLabel: t('viewAll'), onClick: () => router.push('/clients/fuentes') , variant: "soft" as const },
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

  const handleEditFromList = (id: number | string) => {
    console.log('🟠 handleEditFromList called with id:', id);
    // sourcesList uses index + 1 as id, so we need to find by index
    const index = typeof id === 'number' ? id - 1 : parseInt(String(id)) - 1;
    const source = sources[index];
    console.log('🟠 Found source:', source);
    if (source) {
      // Set local edit state to trigger edit mode
      setLocalEditSource(source);
    }
  };

  const handleDeleteFromList = async (id: number | string) => {
    console.log('🟠 handleDeleteFromList called with id:', id);
    
    try {
      // sourcesList uses index + 1 as id, so we need to find the actual source
      const index = typeof id === 'number' ? id - 1 : parseInt(String(id)) - 1;
      const source = sources[index];
      
      if (source) {
        console.log('🟠 Deleting source:', source._id);
        await removeSource(source._id);
        console.log('🟠 Source deleted successfully');
        // React Query will automatically refetch and update the list
      }
    } catch (error) {
      console.error('🟠 Error deleting source:', error);
      // Error toast is already shown by the mutation
    }
  };

  // Image 5: Sources list view
  if (sourcesList.length > 0 && !showForm) {
    return (
      <div className="space-y-2 h-full flex flex-col">
  <HeaderControls title={t('title')} actions={headerActions} />
  <div className="flex-1 overflow-hidden">
    <SourcesList sources={sourcesList} pageType="fuentes" onEdit={handleEditFromList} onDelete={handleDeleteFromList} />
  </div>
      </div>
    )
  }

  // Image 1: Empty state
  if (!showForm && sourcesList.length === 0) {
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
    <div className="space-y-6 h-full flex flex-col">
  <HeaderControls title={t('title')} actions={headerActionsPlain} />
  <div className="flex-1 overflow-y-auto">
      {/* Name input */}
      <div>
        <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
          {t('form.nameLabel')}
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full bg-[#f7f9ff] ${errors.name ? 'border-red-500' : ''}`}
          placeholder={t('form.namePlaceholder')}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Horizontal tabs */}
      <div>
        <div className="my-6">
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
          <div className="space-y-3">
            <FileUpload
              selectedFile={formData.file || undefined}
              onFileSelect={(file) => setFormData({ ...formData, file })}
              onRemove={() => setFormData({ ...formData, file: null })}
              accept=".txt,.md,.pdf,.htm,.html"
              maxSize={100}
            />
            <p className="text-xs text-gray-500 text-center">
              Supported file types: TXT, MD, PDF, HTM, HTML (Max 100MB)
            </p>
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
            {errors.text && <p className="text-red-500 text-xs mt-1">{errors.text}</p>}
            
          </div>
        )}
      </div>
      
      {/* General validation error */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{errors.general}</p>
        </div>
      )}
      
            {/* Inline action buttons (no fixed footer) */}
            <div className="fixed bottom-0 left-0 right-0 m-1  lg:m-3 bg-white sm:bg-transparent rounded-lg  shadow-md sm:shadow-none">
                     <div className="pt-2 flex justify-end gap-3 mb-2 mr-2">
                       <Button onClick={handleCancel} className="px-4 bg-[#f7f9ff] text-[#31499f] rounded-full hover:bg-[#e0e7ff]">{t('form.cancel')}</Button>
                       <Button onClick={handleSubmit} disabled={isCreating || isEditing} className="bg-[#31499f] hover:bg-blue-700 text-white rounded-full px-4">
                         {isCreating || isEditing ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Source' : t('form.submit'))}
                       </Button>
                     </div>
                   </div>
  </div>
    </div>
  )
})

FuentesGeneralesForm.displayName = "FuentesGeneralesForm"
