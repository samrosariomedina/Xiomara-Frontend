"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus ,Upload } from "lucide-react"
import { useTranslations } from 'next-intl'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { connectCorrespondentsSchema, type ConnectCorrespondentsInput } from '@/lib/formSchemas'
import { useEffect } from "react"

interface ConnectCorrespondentsFormProps {
  onFormValid?: (isValid: boolean) => void;
  onDataChange?: (data: ConnectCorrespondentsInput) => void;
  initialData?: Partial<ConnectCorrespondentsInput>;
}

export function ConnectCorrespondentsForm({ 
  onFormValid, 
  onDataChange,
  initialData 
}: ConnectCorrespondentsFormProps) {
  const t = useTranslations('CLIENT_FORM');

  const form = useForm<ConnectCorrespondentsInput>({
    resolver: zodResolver(connectCorrespondentsSchema),
    defaultValues: initialData || {
      corresponsalClientName: "",
      corresponsalWhatsapp: "",
      corresponsalClientName2: "",
      accountType: "",
      invitationMethods: {
        whatsapp: false,
        email: false,
        copyLink: false,
      },
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
        onDataChange(value as ConnectCorrespondentsInput);
      }
    });
    
    // Cleanup the subscription on unmount
    return () => subscription.unsubscribe();
  }, [watch, onDataChange]);

  return (
    <div className="space-y-6 mt-4">
      {/* Corresponsales Section */}
      <div className="pl-4 pr-4">
        <div className="flex items-center justify-between">
          {/* --- CONNECT: CORRESPONDENTS HEADER --- */}
          <h3 className="text-sm font-bold text-gray-900">{t('correspondents.title')}</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="text-xs h-8 px-3 bg-[#F7F9FF] hover:bg-gray-50  text-[#31499F] rounded-full"
            >
              <Upload className="h-3 w-3 mr-1.5" />
              {t('correspondents.uploadCSV')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="text-xs h-8 px-3 bg-[#F7F9FF] hover:bg-gray-50  text-[#31499F] rounded-full"
            >
              <Plus className="h-3 w-3 mr-1.5" />
              {t('correspondents.add')}
            </Button>
          </div>
        </div>
      </div>

      {/* Agregar Nuevo Section */}
      {/* --- CONNECT: ADD NEW CORRESPONDENT --- */}
      <div className="border border-gray-100 rounded-lg p-3 bg-white space-y-5">
        <h3 className="text-m font-medium text-gray-900">{t('correspondents.addNew')}</h3>

        <div className="space-y-4">
          {/* First row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="corresponsalClientName" className="text-xs text-gray-700 font-medium">
                {t('correspondents.clientName')}
              </Label>
              <Input
                id="corresponsalClientName"
                {...register("corresponsalClientName")}
                className={`bg-[#F7F9FF] border-gray-200 h-9 text-sm focus:border-gray-400 focus:ring-0 ${
                  errors.corresponsalClientName ? "border-red-300" : ""
                }`}
              />
              {errors.corresponsalClientName && (
                <p className="text-xs text-red-500 mt-1">{errors.corresponsalClientName.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="corresponsalWhatsapp" className="text-xs text-gray-700 font-medium">
                {t('correspondents.whatsapp')}
              </Label>
              <Input
                id="corresponsalWhatsapp"
                {...register("corresponsalWhatsapp")}
                className={`bg-[#F7F9FF] border-gray-200 h-9 text-sm focus:border-gray-400 focus:ring-0 ${
                  errors.corresponsalWhatsapp ? "border-red-300" : ""
                }`}
                placeholder={t('contact.whatsappPlaceholder')}
              />
              {errors.corresponsalWhatsapp && (
                <p className="text-xs text-red-500 mt-1">{errors.corresponsalWhatsapp.message as string}</p>
              )}
            </div>
          </div>

          {/* Second row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="corresponsalClientName2" className="text-xs text-gray-700 font-medium">
                {t('correspondents.clientName')}
              </Label>
              <Input
                id="corresponsalClientName2"
                {...register("corresponsalClientName2")}
                className={`bg-[#F7F9FF] border-gray-200 h-9 text-sm focus:border-gray-400 focus:ring-0 ${
                  errors.corresponsalClientName2 ? "border-red-300" : ""
                }`}
              />
              {errors.corresponsalClientName2 && (
                <p className="text-xs text-red-500 mt-1">{errors.corresponsalClientName2.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountType" className="text-xs text-gray-700 font-medium">
                {t('correspondents.accountType')}
              </Label>
              <Select
                onValueChange={(value) => setValue("accountType", value)}
                defaultValue={initialData?.accountType || ""}
              >
                <SelectTrigger className={`bg-[#F7F9FF] w-full border-gray-200 h-9 text-sm focus:border-gray-400 focus:ring-0 ${
                  errors.accountType ? "border-red-300" : ""
                }`}>
                  <SelectValue placeholder={t('correspondents.accountType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="premium">{t('correspondents.accountTypes.premium')}</SelectItem>
                  <SelectItem value="standard">{t('correspondents.accountTypes.standard')}</SelectItem>
                  <SelectItem value="basic">{t('correspondents.accountTypes.basic')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.accountType && (
                <p className="text-xs text-red-500 mt-1">{errors.accountType.message as string}</p>
              )}
            </div>
          </div>
        </div>

        {/* Invitation Methods */}
        {/* --- CONNECT: INVITATION METHODS --- */}
        <div className="space-y-3 mt-6">
          <Label className="text-xs text-gray-600 font-medium">{t('correspondents.invitationMethods')}</Label>

          <div className="mt-2 flex flex-wrap items-center gap-6">
            <label className="flex items-center space-x-2 text-xs text-gray-700">
              <Checkbox
                id="whatsapp"
                defaultChecked={initialData?.invitationMethods?.whatsapp}
                onCheckedChange={(checked) => setValue("invitationMethods.whatsapp", !!checked)}
                className="border-gray-300 h-4 w-4"
              />
              <span>{t('correspondents.sendWhatsapp')}</span>
            </label>

            <label className="flex items-center space-x-2 text-xs text-gray-700">
              <Checkbox
                id="email"
                defaultChecked={initialData?.invitationMethods?.email}
                onCheckedChange={(checked) => setValue("invitationMethods.email", !!checked)}
                className="border-gray-300 h-4 w-4"
              />
              <span>{t('correspondents.sendEmail')}</span>
            </label>

            <label className="flex items-center space-x-2 text-xs text-gray-700">
              <Checkbox
                id="copyLink"
                defaultChecked={initialData?.invitationMethods?.copyLink}
                onCheckedChange={(checked) => setValue("invitationMethods.copyLink", !!checked)}
                className="border-gray-300 h-4 w-4"
              />
              <span>{t('correspondents.copyLink')}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
