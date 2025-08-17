"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X } from "lucide-react"
import { useTranslations } from 'next-intl'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { generalInformationSchema, type GeneralInformationInput } from '@/lib/formSchemas'
import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react"
import Image from "next/image"

interface GeneralInformationFormProps {
  onFormValid?: (isValid: boolean) => void;
  onDataChange?: (data: GeneralInformationInput) => void;
  initialData?: Partial<GeneralInformationInput>;
}

export const GeneralInformationForm = forwardRef(function GeneralInformationForm({ 
  onFormValid, 
  onDataChange,
  initialData 
}: GeneralInformationFormProps, ref) {
  const t = useTranslations('CLIENT_FORM');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<GeneralInformationInput>({
    resolver: zodResolver(generalInformationSchema),
    defaultValues: initialData || {
      clientName: "",
      industry: "",
      description: "",
      contactName: "",
      whatsapp: "",
      position: "",
      email: "",
    },
    mode: "onChange"
  });
  
  const { register, setValue, formState: { errors, isValid }, watch } = form;

  // Expose validate and getValues to parent via ref
  useImperativeHandle(ref, () => ({
    validate: async () => {
      return await form.trigger();
    },
    getValues: () => {
      const values = form.getValues() as GeneralInformationInput;
      return { ...values, logoFile: selectedFile };
    }
  }))
  
  // Watch for form validity changes and notify parent
  useEffect(() => {
    if (onFormValid) {
      onFormValid(isValid);
    }
  }, [isValid, onFormValid]);
  
  // Watch all form values and notify parent on change using subscription
  useEffect(() => {
    // Set up a subscription to form changes
    const subscription = watch((value) => {
      if (onDataChange) {
        // Include the selected file in the data passed to the parent
        const formData = value as GeneralInformationInput;
        onDataChange({
          ...formData,
          logoFile: selectedFile
        });
      }
    });
    
    // Cleanup the subscription on unmount
    return () => subscription.unsubscribe();
  }, [watch, onDataChange, selectedFile]);
  
  // Clean up the preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    // Create preview URL for the image
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
  };
  
  // Trigger the file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // Remove selected file
  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="border border-gray-100 rounded-lg p-6 bg-white">
        <div className="space-y-4">
          {/* --- GENERAL: CLIENT INFORMATION --- */}
          <h3 className="text-sm font-medium text-gray-900">{t('general.clientInfo')}</h3>
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="clientName" className="text-xs text-gray-700 font-medium">
                {t('general.clientName')}
              </Label>
              <Input
                id="clientName"
                {...register("clientName")}
                className={`bg-[#F7F9FF] border-gray-200 h-9 text-sm ${
                  errors.clientName ? "border-red-300" : ""
                }`}
              />
              {errors.clientName && (
                <p className="text-xs text-red-500 mt-1">{errors.clientName.message as string}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="industry" className="text-xs text-gray-700 font-medium">
                {t('general.industry')}
              </Label>
              <Select
                onValueChange={(value) => setValue("industry", value)}
              >
                <SelectTrigger className="bg-[#F7F9FF] h-9 text-sm w-full">
                  <SelectValue placeholder={t('general.industry')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tecnologia">{t('general.industries.technology')}</SelectItem>
                  <SelectItem value="salud">{t('general.industries.health')}</SelectItem>
                  <SelectItem value="educacion">{t('general.industries.education')}</SelectItem>
                  <SelectItem value="finanzas">{t('general.industries.finance')}</SelectItem>
                  <SelectItem value="retail">{t('general.industries.retail')}</SelectItem>
                  <SelectItem value="manufactura">{t('general.industries.manufacturing')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-xs text-red-500 mt-1">{errors.industry.message as string}</p>
              )}
            </div>
          </div>
        </div>

        {/* --- GENERAL: LOGO / IMAGE UPLOAD --- */}
        <div className="space-y-3 mt-6">
          <h3 className="text-sm font-medium text-gray-900">{t('general.logo')}</h3>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-[#F7F9FF]">
            {previewUrl ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-16 bg-white rounded border overflow-hidden flex items-center justify-center">
                      <Image 
                        src={previewUrl} 
                        alt="Logo preview" 
                        className="max-w-full max-h-full object-contain"
                        width={64}
                        height={64}
                      />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{selectedFile?.name}</p>
                      <p className="text-gray-500 text-xs">
                        {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 rounded-full hover:bg-gray-200"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('general.addFile')}</span>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  className="text-[#31499F] px-3 bg-white hover:bg-blue-50 border-[#31499F]"
                  onClick={handleUploadClick}
                >
                  <Upload className="h-2 w-3 mr-1.5" />
                  {t('general.upload')}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            )}
          </div>
        </div>

        {/* --- GENERAL: DESCRIPTION --- */}
        <div className="space-y-3 mt-6">
          <Label htmlFor="description" className="text-sm font-medium text-gray-900">
            {t('general.description')}
          </Label>
          <Textarea
            id="description"
            {...register("description")}
                className={`bg-[#F7F9FF] h-20 resize-none text-sm  ${
              errors.description ? "border-red-300" : ""
            }`}
            placeholder={t('general.descriptionPlaceholder')}
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">{errors.description.message as string}</p>
          )}
        </div>
      </div>

      {/* --- GENERAL: MAIN CONTACT --- */}
      <div className="border border-gray-100 rounded-lg p-6 bg-white">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">{t('contact.title')}</h3>
          <div className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="contactName" className="text-xs text-gray-700 font-medium">
                  {t('contact.fullName')}
                </Label>
                <Input
                  id="contactName"
                  {...register("contactName")}
                  className={`bg-[#F7F9FF] border-gray-200 h-9 text-sm ${
                    errors.contactName ? "border-red-300" : ""
                  }`}
                />
                {errors.contactName && (
                  <p className="text-xs text-red-500 mt-1">{errors.contactName.message as string}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="whatsapp" className="text-xs text-gray-700 font-medium">
                  {t('contact.whatsapp')}
                </Label>
                <Input
                  id="whatsapp"
                  {...register("whatsapp")}
                  className={`bg-[#F7F9FF] border-gray-200 h-9 text-sm ${
                    errors.whatsapp ? "border-red-300" : ""
                  }`}
                  placeholder={t('contact.whatsappPlaceholder')}
                />
                {errors.whatsapp && (
                  <p className="text-xs text-red-500 mt-1">{errors.whatsapp.message as string}</p>
                )}
              </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="position" className="text-xs text-gray-700 font-medium">
                  {t('contact.position')}
                </Label>
                <Select
                  onValueChange={(value) => setValue("position", value)}
                >
                  <SelectTrigger className="bg-[#F7F9FF] h-9 text-sm w-full">
                    <SelectValue placeholder={t('contact.position')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ceo">{t('contact.positions.ceo')}</SelectItem>
                    <SelectItem value="cto">{t('contact.positions.cto')}</SelectItem>
                    <SelectItem value="marketing">{t('contact.positions.marketing')}</SelectItem>
                    <SelectItem value="ventas">{t('contact.positions.sales')}</SelectItem>
                    <SelectItem value="gerente">{t('contact.positions.manager')}</SelectItem>
                    <SelectItem value="coordinador">{t('contact.positions.coordinator')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.position && (
                  <p className="text-xs text-red-500 mt-1">{errors.position.message as string}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-gray-700 font-medium">
                  {t('contact.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={`bg-[#F7F9FF] border-gray-200 h-9 text-sm ${
                    errors.email ? "border-red-300" : ""
                  }`}
                  placeholder={t('contact.emailPlaceholder')}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message as string}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
