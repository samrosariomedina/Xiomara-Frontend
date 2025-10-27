"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Plus, Eye, Brain } from "lucide-react"
import { FileUpload } from "@/components/ui/file-upload"
import { UrlInput } from "@/components/ui/url-input"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslations } from 'next-intl'
import { knowledgeBaseSchema, type KnowledgeBaseInput } from '@/lib/schemas'
import { useKnowledge, useCreateReference, useEditReference, useRemoveReference } from '@/hooks/useKnowledge'
import type { ReferenceResponse } from '@/lib/schemas'
import { useRouter } from 'next/navigation'
import HeaderControls from "../ui/formsHeader-dashboard"
import SourcesList, { SourceItem } from "../ui/formsLists-dashboard"
import { formatDateSafe } from '@/lib/utils'

interface KnowledgeBaseFormProps {
  onSubmit?: (data: unknown) => void
  references: ReferenceResponse[]
  folderId: string
  editReference?: ReferenceResponse | null
}

export function KnowledgeBaseForm({ onSubmit, references, folderId, editReference = null }: KnowledgeBaseFormProps) {
  // Debug logging
  console.log('🔵 KnowledgeBaseForm rendered with editReference:', editReference);
  console.log('🔵 References array:', references);
  console.log('🔵 References length:', references.length);
  
  // Helper function to clean HTML content
  const cleanHtmlContent = (text: string): string => {
    if (!text) return '';
    
    // Remove empty paragraphs and line breaks
    const cleaned = text
      .replace(/<p><br><\/p>/g, '')
      .replace(/<p><\/p>/g, '')
      .replace(/<p>\s*<\/p>/g, '')
      .trim();
    
    return cleaned;
  };
  
  // Local edit state for list-based editing
  const [localEditReference, setLocalEditReference] = useState<ReferenceResponse | null>(null);
  
  // Determine if we're in edit mode (either from prop or local state)
  const currentEditReference = editReference || localEditReference;
  const isEditMode = !!currentEditReference
  
  const [showForm, setShowForm] = useState(isEditMode) // Auto-show form in edit mode
  const [activeTab, setActiveTab] = useState<"file" | "url" | "text">(
    isEditMode && currentEditReference?.type === 'text' ? 'text' : 
    isEditMode && currentEditReference?.type === 'webpage' ? 'url' : 
    isEditMode && currentEditReference?.type === 'file' ? 'file' : 'text'
  )
  
  const {  isCreating } = useKnowledge()
  const router = useRouter()
  
  // Get the mutations directly to have full control
  const createReferenceMutation = useCreateReference()
  const editReferenceMutation = useEditReference()
  const removeReferenceMutation = useRemoveReference()
  const isEditing = editReferenceMutation.isPending
  

  // Helper function to extract content from reference
  const extractContentFromReference = (reference: ReferenceResponse | null) => {
    if (!reference) return { text: "" };
    
    console.log('🔵 Extracting content from reference:', {
      title: reference.title,
      type: reference.type,
      content: reference.content,
      contentType: typeof reference.content
    });
    
    let textContent = "";
    
    // Content is always a string from the backend
    if (typeof reference.content === 'string') {
      textContent = reference.content;
      console.log('🔵 Extracted text content:', textContent);
    } else {
      console.log('🔵 Content is not a string:', reference.content);
    }
    
    return { text: textContent };
  };

  const form = useForm<KnowledgeBaseInput>({
    resolver: zodResolver(knowledgeBaseSchema),
    defaultValues: {
      name: isEditMode ? (currentEditReference?.title || "") : "",
      file: null,
      url: "", // Don't show URL in edit mode
      text: isEditMode ? extractContentFromReference(currentEditReference).text : "",
    }
  })
  
  // Reset form when editReference or localEditReference changes
  React.useEffect(() => {
    console.log('🔵 currentEditReference changed:', currentEditReference);
    if (currentEditReference) {
      console.log('🔵 Setting form to edit mode with data:', {
        name: currentEditReference.title,
        type: currentEditReference.type,
        content: currentEditReference.content,
        contentType: typeof currentEditReference.content
      });
      setShowForm(true)
      
      // Extract content using helper function - for ALL types, show content in text editor
      const { text: textContent } = extractContentFromReference(currentEditReference);
      
      const formData = {
        name: currentEditReference.title || "",
        file: null,
        url: "", // Don't show URL in edit mode
        text: textContent, // Show content in text editor for ALL types
      };
      
      console.log('🔵 Resetting form with data:', formData);
      console.log('🔵 Text content length:', textContent.length);
      console.log('🔵 Text content preview:', textContent.substring(0, 100));
      console.log('🔵 Form reset called with text:', formData.text);
      form.reset(formData);
      setActiveTab('text') // Always use text tab in edit mode
    }
  }, [currentEditReference, form])

  const t = useTranslations('KNOWLEDGE')

  // Watch form values for debugging
  const formValues = form.watch();
  console.log('🔵 Current form values:', formValues);

  // Transform references to SourceItem format for display - no caching
  const sources: SourceItem[] = references.map((ref, index) => {
    // Handle both old string content and new object content
    const displayName = ref.title || `Knowledge Item ${index + 1}`;
    
    return {
      id: ref._id, // Use actual _id instead of index + 1
      name: displayName,
      type: ref.type === 'text' ? 'text' : ref.type === 'webpage' ? 'url' : 'image',
      category: "Knowledge",
      timestamp: formatDateSafe(ref.timestamp),
    }
  })

  const headerActions = [
    { icon: <Eye className="h-4 w-4" />, label: t('viewAll'), ariaLabel: t('viewAll'), onClick: () => router.push(`/clients/${folderId}/knowledge`), variant: "soft" as const },
    { icon: <Plus className="h-4 w-4" />, label: t('empty.addButton'), ariaLabel: t('empty.addButton'), onClick: () => setShowForm(true), variant: "soft" as const },
  ]
  const headerActionsPlain: { label: string; onClick?: () => void }[] = []

  const handleCancel = () => {
    form.reset()
    form.clearErrors()
    setShowForm(false)
  }

  const handleSubmit = form.handleSubmit((data) => {
    console.log('🔵 Knowledge form submit called with data:', data)
    console.log('🔵 Folder ID:', folderId)
    
    if (!folderId) {
      console.error('No folder selected')
      return
    }

    // Clean up the data - remove empty HTML content and normalize
    const cleanedData = {
      ...data,
      text: cleanHtmlContent(data.text || ''),
      url: data.url ? data.url.trim() : '',
    }

    console.log('🔵 Cleaned data:', cleanedData)

    // Validate that at least one content type is provided (only in create mode)
    if (!isEditMode && !cleanedData.file && !cleanedData.url && !cleanedData.text) {
      form.setError('file', { 
        type: 'manual', 
        message: 'At least one source (file, URL, or text) must be provided' 
      })
      return
    }

    // In edit mode, require text content
    if (isEditMode && !cleanedData.text) {
      form.setError('text', { 
        type: 'manual', 
        message: 'Text content is required for editing' 
      })
      return
    }

    if (isEditMode && currentEditReference) {
      // Edit existing reference - send text content (HTML stripping handled in backend)
      const editData = {
        name: cleanedData.name,
        text: cleanedData.text || '', // Send cleaned text content
      }
      
      console.log('🔵 Edit data prepared:', {
        name: editData.name,
        text: editData.text
      });
      
      editReferenceMutation.mutate(
        { referenceId: currentEditReference._id, data: editData },
        {
          onSuccess: () => {
            form.reset()
            setLocalEditReference(null) // Clear local edit state
            setShowForm(false)
            onSubmit?.(cleanedData)
          },
          onError: (error) => {
            console.error('Error updating knowledge base:', error)
          }
        }
      )
    } else {
      // Create new reference - send cleaned data (HTML stripping handled in backend)
      console.log('🔵 Creating new reference with cleaned data:', { data: cleanedData, folderId })
      createReferenceMutation.mutate(
        { data: cleanedData, folderId },
        {
          onSuccess: (result) => {
            console.log('🔵 Create reference success:', result)
            form.reset()
            setShowForm(false)
            onSubmit?.(cleanedData)
          },
          onError: (error) => {
            console.error('🔵 Create reference error:', error)
          }
        }
      )
    }
  })


  const handleEditFromList = (id: number | string) => {
    console.log('🔵 handleEditFromList called with id:', id);
    // Find the reference by _id
    const reference = references.find(r => r._id === String(id));
    console.log('🔵 Found reference:', reference);
    if (reference) {
      // Set local edit state to trigger edit mode
      setLocalEditReference(reference);
    }
  };

  const handleDeleteFromList = async (id: number | string) => {
    console.log('🔵 handleDeleteFromList called with id:', id);
    
    if (!folderId) {
      console.error('🔵 No folder selected');
      return;
    }
    
    try {
      // Find the reference by _id
      const reference = references.find(r => r._id === String(id));
      
      if (reference) {
        console.log('🔵 Deleting reference:', reference._id);
        await removeReferenceMutation.mutateAsync({
          referenceId: reference._id,
          folderId
        });
        console.log('🔵 Reference deleted successfully');
        // React Query will automatically refetch and update the list
      }
    } catch (error) {
      console.error('🔵 Error deleting reference:', error);
      // Error toast is already shown by the mutation
    }
  };

  // list view
  if (sources.length > 0 && !showForm) {
    return (
      <div className="h-full flex flex-col">
        <HeaderControls title={t('title')} actions={headerActions} />
        <div className="bg-white rounded-lg p-6 flex-1 overflow-hidden">
          <SourcesList sources={sources} pageType="knowledge" onEdit={handleEditFromList} onDelete={handleDeleteFromList} />
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
      {/* Form container with consistent width */}
      <div className="w-full flex-1 overflow-y-auto min-h-0">

        <div className="w-full">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">{t('form.nameLabel')}</Label>
          <Input 
            id="name" 
            {...form.register('name')}
            placeholder={t('form.namePlaceholder')} 
            className={`w-full bg-[#f7f9ff] ${form.formState.errors.name ? 'border-red-500' : ''}`} 
          />
          {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
        </div>


      {/* Horizontal tabs - only show in create mode, not edit mode */}
      {!isEditMode && (
        <div className="w-full">
          <div className="mb-4">
            <div className="flex w-full rounded-lg border border-gray-200 bg-white divide-x divide-gray-200 overflow-hidden">
              <button type="button" onClick={() => {
                setActiveTab("file")
                form.clearErrors(['file', 'url', 'text'])
              }} className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors min-w-0 ${activeTab === "file" ? "bg-[#f7f9ff] text-[#31499f]" : "text-gray-500 hover:text-gray-700"}`}>
                {t('form.uploadTab')}
              </button>
              <button type="button" onClick={() => {
                setActiveTab("url")
                form.clearErrors(['file', 'url', 'text'])
              }} className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors min-w-0 ${activeTab === "url" ? "bg-[#f7f9ff] text-[#31499f]" : "text-gray-500 hover:text-gray-700"}`}>
                {t('form.urlTab')}
              </button>
              <button type="button" onClick={() => {
                setActiveTab("text")
                form.clearErrors(['file', 'url', 'text'])
              }} className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors min-w-0 ${activeTab === "text" ? "bg-[#f7f9ff] text-[#31499f]" : "text-gray-500 hover:text-gray-700"}`}>
                {t('form.textTab')}
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Tab content - only show file/url tabs in create mode */}
        {!isEditMode && activeTab === "file" && (
          <div className="w-full min-h-[200px] flex flex-col">
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

        {!isEditMode && activeTab === "url" && (
          <div className="w-full min-h-[200px] flex flex-col">
            <UrlInput 
              value={form.watch('url') || ''} 
              onChange={(url) => form.setValue('url', url)} 
              placeholder={t('form.addUrlPlaceholder')} 
            />
            {form.formState.errors.url && <p className="text-red-500 text-xs mt-1">{form.formState.errors.url.message}</p>}
          </div>
        )}

        {/* Always show text editor in edit mode, or when text tab is active in create mode */}
        {(isEditMode || activeTab === "text") && (
          <div className="w-full min-h-[200px] flex flex-col">
            <RichTextEditor 
              value={form.watch('text') || ''} 
              onChange={(text) => form.setValue('text', text)} 
            />
            {form.formState.errors.text && <p className="text-red-500 text-xs mt-1">{form.formState.errors.text.message}</p>}
          </div>
        )}
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
            disabled={isCreating || isEditing}
            className="px-4 bg-[#f7f9ff] text-[#31499f] rounded-full hover:bg-[#e0e7ff]"
          >
            {t('form.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isCreating || isEditing}
            className="bg-[#31499f] hover:bg-blue-700 text-white rounded-full px-4"
          >
            {isCreating || isEditing ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Knowledge' : t('form.submit'))}
          </Button>
        </div>
      </div>
    </div>
  )
}

