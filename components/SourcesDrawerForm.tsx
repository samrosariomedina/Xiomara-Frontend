"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileUpload } from "@/components/ui/file-upload"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { UrlInput } from "@/components/ui/url-input"
import { useTranslations } from 'next-intl'
import { fuentesGeneralesSchema, type FuentesGeneralesInput } from '@/lib/schemas'
import { createSourceAction } from '@/actions/sources'

interface SourcesDrawerFormProps {
  onClose: () => void
  onSuccess?: () => void
  folderId: string
}

export function SourcesDrawerForm({ onClose, onSuccess, folderId }: SourcesDrawerFormProps) {
  const t = useTranslations('FUENTES')
  const [activeTab, setActiveTab] = useState<"file" | "url" | "text">("file")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<FuentesGeneralesInput>({
    resolver: zodResolver(fuentesGeneralesSchema),
    defaultValues: {
      name: "",
      file: null,
      url: "",
      text: ""
    }
  })

  const watchedFile = watch("file")
  const watchedUrl = watch("url")
  const watchedText = watch("text")

  const onSubmit = async (data: FuentesGeneralesInput) => {
    setIsSubmitting(true)
    
    try {
      await createSourceAction({
        name: data.name || "Unnamed Source",
        file: data.file || undefined,
        url: data.url || undefined,
        text: data.text || undefined,
      }, {
        folderId
      })
      
      // Reset form
      reset()
      
      // Close drawer
      onClose()
      
      // Call success callback
      onSuccess?.()
      
      // Path revalidation is handled by the server action
    } catch (error) {
      console.error('Error creating source:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    reset()
    onClose()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Name input */}
      <div>
        <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
          {t('form.nameLabel')} <span className="text-gray-400 font-normal">(optional)</span>
        </Label>
        <Input
          id="name"
          {...register("name")}
          className={`w-full bg-[#f7f9ff] ${errors.name ? 'border-red-500' : ''}`}
          placeholder={t('form.namePlaceholder')}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
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
          <div className="space-y-3">
            <FileUpload
              selectedFile={watchedFile || undefined}
              onFileSelect={(file) => setValue("file", file)}
              onRemove={() => setValue("file", null)}
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
              value={watchedUrl || ""}
              onChange={(url) => setValue("url", url)}
              placeholder={t('form.addUrlPlaceholder')}
            />
            {watchedUrl && (
              <p className="text-xs text-gray-500 mt-2">
                URL will be processed: {watchedUrl}
              </p>
            )}
          </div>
        )}

        {activeTab === "text" && (
          <div>
            <RichTextEditor 
              value={watchedText || ""} 
              onChange={(text) => setValue("text", text)} 
            />
          </div>
        )}
      </div>
      
      
      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button 
          onClick={handleCancel} 
          className="px-4 bg-[#f7f9ff] text-[#31499f] rounded-full hover:bg-[#e0e7ff]"
          disabled={isSubmitting}
        >
          {t('form.cancel')}
        </Button>
        <Button 
          onClick={handleSubmit(onSubmit)} 
          disabled={isSubmitting}
          className="bg-[#31499f] hover:bg-blue-700 text-white rounded-full px-4"
        >
          {isSubmitting ? 'Creating...' : t('form.submit')}
        </Button>
      </div>
    </div>
  )
}
