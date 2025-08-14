"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"
import { useTranslations } from 'next-intl'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { generalInformationSchema, type GeneralInformationInput } from '@/lib/formSchemas'
import { useEffect } from "react"

interface GeneralInformationFormProps {
  onFormValid?: (isValid: boolean) => void;
  onDataChange?: (data: GeneralInformationInput) => void;
  initialData?: Partial<GeneralInformationInput>;
}

export function GeneralInformationForm({ 
  onFormValid, 
  onDataChange,
  initialData 
}: GeneralInformationFormProps) {
  const t = useTranslations('CLIENT_FORM');
  
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
        onDataChange(value as GeneralInformationInput);
      }
    });
    
    // Cleanup the subscription on unmount
    return () => subscription.unsubscribe();
  }, [watch, onDataChange]);

  return (
    <div className="space-y-4 mt-6">
      <div className="border border-gray-100 rounded-lg p-6 bg-white">
        <div className="space-y-4">
          {/* --- GENERAL: CLIENT INFORMATION --- */}
          <h3 className="text-sm font-medium text-gray-900">{t('general.clientInfo')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="clientName" className="text-xs text-gray-700 font-medium">
                {t('general.clientName')}
              </Label>
              <Input
                id="clientName"
                {...register("clientName")}
                className={`bg-[#F7F9FF] border-gray-200 h-9 text-sm focus:border-gray-400 focus:ring-0 ${
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
                <SelectTrigger className="bg-[#F7F9FF] border-gray-200 h-9 text-sm focus:border-gray-400 focus:ring-0 w-full">
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
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{t('general.addFile')}</span>
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="text-[#31499F] px-3 bg-white hover:bg-blue-50 border-[#31499F]"
              >
                <Upload className="h-2 w-3 mr-1.5" />
                {t('general.upload')}
              </Button>
            </div>
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
            className={`bg-[#F7F9FF] border-gray-200 h-20 resize-none text-sm focus:border-gray-400 focus:ring-0 ${
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="contactName" className="text-xs text-gray-700 font-medium">
                  {t('contact.fullName')}
                </Label>
                <Input
                  id="contactName"
                  {...register("contactName")}
                  className={`bg-[#F7F9FF] border-gray-200 h-9 text-sm focus:border-gray-400 focus:ring-0 ${
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
                  className={`bg-[#F7F9FF] border-gray-200 h-9 text-sm focus:border-gray-400 focus:ring-0 ${
                    errors.whatsapp ? "border-red-300" : ""
                  }`}
                  placeholder={t('contact.whatsappPlaceholder')}
                />
                {errors.whatsapp && (
                  <p className="text-xs text-red-500 mt-1">{errors.whatsapp.message as string}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="position" className="text-xs text-gray-700 font-medium">
                  {t('contact.position')}
                </Label>
                <Select
                  onValueChange={(value) => setValue("position", value)}
                >
                  <SelectTrigger className="bg-[#F7F9FF] border-gray-200 h-9 text-sm focus:border-gray-400 focus:ring-0 w-full">
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
                  className={`bg-[#F7F9FF] border-gray-200 h-9 text-sm focus:border-gray-400 focus:ring-0 ${
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
}
