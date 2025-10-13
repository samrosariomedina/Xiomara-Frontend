"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Upload, X, ChevronDown } from "lucide-react"
import { useTranslations } from 'next-intl'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { generalInformationSchema, type GeneralInformationInput } from '@/lib/schemas'
import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react"
import Image from "next/image"
import { useMutation } from "@tanstack/react-query"
import { uploadImageAction } from '@/actions/images'
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"

type ChildFormRef<T = unknown> = {
  validate: () => Promise<boolean>
  getValues: () => T
  reset: () => void
}

interface GeneralInformationFormProps {
  initialValues?: Partial<GeneralInformationInput>
}

export const GeneralInformationForm = forwardRef<ChildFormRef<GeneralInformationInput>, GeneralInformationFormProps>(function GeneralInformationForm(
  { initialValues },
  ref
) {
  const t = useTranslations('CLIENT_FORM');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string>(initialValues?.industry || "");
  const [selectedPosition, setSelectedPosition] = useState<string>(initialValues?.position || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<GeneralInformationInput>({
    resolver: zodResolver(generalInformationSchema),
    defaultValues: {
      clientName: initialValues?.clientName || "",
      industry: initialValues?.industry || "tecnologia",
      description: initialValues?.description || "",
      contactName: initialValues?.contactName || "",
      whatsapp: initialValues?.whatsapp || undefined, // Optional field
      position: initialValues?.position || "ceo",
      email: initialValues?.email || undefined, // Optional field
    },
    mode: "onChange"
  });
  
  const { register, setValue, formState: { errors }, watch } = form;

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const result = await uploadImageAction({
        file,
        title: file.name,
        metadata: {
          type: 'client_logo',
          clientName: form.getValues('clientName') || 'Unknown Client'
        }
      });
      if (!result.success) {
        throw new Error(result.error || 'Failed to upload image');
      }
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        setUploadedImageId(data._id);
        toast.success('Logo uploaded successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        icon: <AlertCircle className="h-4 w-4" />
      });
    }
  });

  // Expose validate and getValues to parent via ref
  useImperativeHandle(ref, () => ({
    validate: async () => {
      return await form.trigger();
    },
    getValues: () => {
      const values = form.getValues() as GeneralInformationInput;
      return { 
        ...values, 
        logoFile: selectedFile,
        uploadedImageId: uploadedImageId
      };
    },
    reset: () => {
      form.reset();
      setSelectedFile(null);
      setUploadedImageId(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }))
  
  // Form validity is managed internally - no need to notify parent

  // Watch form values to sync with local state
  useEffect(() => {
    const subscription = watch((value) => {
      // Sync dropdown states with form values
      if (value.industry !== selectedIndustry) {
        setSelectedIndustry(value.industry || "");
      }
      if (value.position !== selectedPosition) {
        setSelectedPosition(value.position || "");
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, selectedIndustry, selectedPosition]);
  
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
    
    // Automatically upload the image
    uploadImageMutation.mutate(file);
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
    setUploadedImageId(null);
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
                suppressHydrationWarning
              />
              {errors.clientName && (
                <p className="text-xs text-red-500 mt-1">{errors.clientName.message as string}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="industry" className="text-xs text-gray-700 font-medium">
                {t('general.industry')}
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="bg-[#F7F9FF] h-9 text-sm w-full justify-between"
                  >
                    {selectedIndustry ? (
                      selectedIndustry === 'tecnologia' ? t('general.industries.technology') :
                      selectedIndustry === 'salud' ? t('general.industries.health') :
                      selectedIndustry === 'educacion' ? t('general.industries.education') :
                      selectedIndustry === 'finanzas' ? t('general.industries.finance') :
                      selectedIndustry === 'retail' ? t('general.industries.retail') :
                      selectedIndustry === 'manufactura' ? t('general.industries.manufacturing') :
                      t('general.industry')
                    ) : t('general.industry')}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem onSelect={() => {
                    setSelectedIndustry('tecnologia')
                    setValue("industry", 'tecnologia')
                  }}>
                    {t('general.industries.technology')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {
                    setSelectedIndustry('salud')
                    setValue("industry", 'salud')
                  }}>
                    {t('general.industries.health')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {
                    setSelectedIndustry('educacion')
                    setValue("industry", 'educacion')
                  }}>
                    {t('general.industries.education')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {
                    setSelectedIndustry('finanzas')
                    setValue("industry", 'finanzas')
                  }}>
                    {t('general.industries.finance')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {
                    setSelectedIndustry('retail')
                    setValue("industry", 'retail')
                  }}>
                    {t('general.industries.retail')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {
                    setSelectedIndustry('manufactura')
                    setValue("industry", 'manufactura')
                  }}>
                    {t('general.industries.manufacturing')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                      {uploadImageMutation.isPending && (
                        <p className="text-blue-600 text-xs">Uploading...</p>
                      )}
                      {uploadedImageId && (
                        <p className="text-green-600 text-xs">✓ Uploaded successfully</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 rounded-full hover:bg-gray-200"
                    disabled={uploadImageMutation.isPending}
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
                  suppressHydrationWarning
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
                  suppressHydrationWarning
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="bg-[#F7F9FF] h-9 text-sm w-full justify-between"
                    >
                      {selectedPosition ? (
                        selectedPosition === 'ceo' ? t('contact.positions.ceo') :
                        selectedPosition === 'cto' ? t('contact.positions.cto') :
                        selectedPosition === 'marketing' ? t('contact.positions.marketing') :
                        selectedPosition === 'ventas' ? t('contact.positions.sales') :
                        selectedPosition === 'gerente' ? t('contact.positions.manager') :
                        selectedPosition === 'coordinador' ? t('contact.positions.coordinator') :
                        t('contact.position')
                      ) : t('contact.position')}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem onSelect={() => {
                      setSelectedPosition('ceo')
                      setValue("position", 'ceo')
                    }}>
                      {t('contact.positions.ceo')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => {
                      setSelectedPosition('cto')
                      setValue("position", 'cto')
                    }}>
                      {t('contact.positions.cto')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => {
                      setSelectedPosition('marketing')
                      setValue("position", 'marketing')
                    }}>
                      {t('contact.positions.marketing')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => {
                      setSelectedPosition('ventas')
                      setValue("position", 'ventas')
                    }}>
                      {t('contact.positions.sales')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => {
                      setSelectedPosition('gerente')
                      setValue("position", 'gerente')
                    }}>
                      {t('contact.positions.manager')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => {
                      setSelectedPosition('coordinador')
                      setValue("position", 'coordinador')
                    }}>
                      {t('contact.positions.coordinator')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                  suppressHydrationWarning
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
