"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, Trash2 } from "lucide-react"
import { Plus ,Upload } from "lucide-react"
import { useTranslations } from 'next-intl'
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { connectCorrespondentsSchema, type ConnectCorrespondentsInput } from '@/lib/schemas'
import { forwardRef, useImperativeHandle, useState, useRef } from "react"
import { useMutation } from "@tanstack/react-query"
import { createCorresponsalesFromCSVAction } from "@/actions/clients"
import { toast } from "sonner"

interface ConnectCorrespondentsFormProps {
  folderId?: string | null;
}

type ChildFormRef<T = unknown> = {
  validate: () => Promise<boolean>
  getValues: () => T
}

export const ConnectCorrespondentsForm = forwardRef<ChildFormRef<ConnectCorrespondentsInput>, ConnectCorrespondentsFormProps>(function ConnectCorrespondentsForm({
  folderId
}, ref) {
  const t = useTranslations('CLIENT_FORM');

  // CSV upload state
  const [selectedCsvFile, setSelectedCsvFile] = useState<File | null>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  // CSV upload mutation
  const csvUploadMutation = useMutation({
    mutationFn: ({ folderId, csvFile, enabled }: { folderId: string, csvFile: File, enabled: boolean }) =>
      createCorresponsalesFromCSVAction(folderId, csvFile, enabled),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Successfully created ${result.data.length} corresponsales from CSV`);
        setSelectedCsvFile(null);
        if (csvFileInputRef.current) {
          csvFileInputRef.current.value = '';
        }
      }
    },
    onError: (error: unknown) => {
      console.error('CSV upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload CSV';
      toast.error(errorMessage);
    }
  });

  const form = useForm<ConnectCorrespondentsInput>({
    resolver: zodResolver(connectCorrespondentsSchema),
    defaultValues: {
      correspondents: [
        {
          clientName: "",
          whatsapp: "",
          accountType: "basic" as const,
          invitationMethods: {
            whatsapp: false,
            email: false,
            copyLink: false,
          },
        }
      ]
    },
    mode: "onChange"
  });
  
  const { register, setValue, formState: { errors }, watch, control } = form;
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "correspondents"
  });
  
  // Form validity is managed internally - no need to notify parent

  // Add new correspondent function
  const addCorrespondent = () => {
    append({
      clientName: "",
      whatsapp: "",
      accountType: "basic" as const,
      invitationMethods: {
        whatsapp: false,
        email: false,
        copyLink: false,
      },
    });
  };

  // CSV file handling functions
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      toast.error('Please select a valid CSV file');
      return;
    }

    setSelectedCsvFile(file);
  };

  const handleCsvUploadClick = () => {
    csvFileInputRef.current?.click();
  };

  const handleCsvUpload = async () => {
    if (!selectedCsvFile) {
      toast.error('Please select a CSV file first');
      return;
    }

    if (!folderId) {
      toast.error('Please create a client first before uploading CSV');
      return;
    }

    await csvUploadMutation.mutateAsync({
      folderId,
      csvFile: selectedCsvFile,
      enabled: true
    });
  };

  useImperativeHandle(ref, () => ({
    validate: async () => {
      return await form.trigger();
    },
    getValues: () => form.getValues() as ConnectCorrespondentsInput
  }))

  return (
    <div className="space-y-6 mt-4">
      {/* Corresponsales Section */}
    <div className="pl-4 pr-4">
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          {/* --- CONNECT: CORRESPONDENTS HEADER --- */}
          <h3 className="text-sm font-bold text-gray-900">{t('correspondents.title')}</h3>
    <div className="mt-3 lg:mt-0 flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleCsvUploadClick}
              disabled={csvUploadMutation.isPending}
              className="flex-1 lg:flex-none text-xs h-8 px-3 bg-[#F7F9FF] hover:bg-gray-50 text-[#31499F] rounded-full flex items-center justify-center border border-white disabled:opacity-50"
            >
              <Upload className="h-3 w-3 mr-1.5" />
              {csvUploadMutation.isPending ? 'Uploading...' : t('correspondents.uploadCSV')}
            </Button>

            {/* CSV file status and upload button */}
            {selectedCsvFile && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>📄 {selectedCsvFile.name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={handleCsvUpload}
                  disabled={csvUploadMutation.isPending || !folderId}
                  className="text-xs h-6 px-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                >
                  {csvUploadMutation.isPending ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            )}

            {/* Hidden file input for CSV */}
            <input
              type="file"
              ref={csvFileInputRef}
              onChange={handleCsvFileChange}
              accept=".csv,text/csv"
              className="hidden"
            />
            <div className="w-2 lg:w-2" />
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={addCorrespondent}
              className="flex-1 lg:flex-none text-xs h-8 px-3 bg-[#F7F9FF] hover:bg-gray-50 text-[#31499F] rounded-full flex items-center justify-center border border-white"
            >
              <Plus className="h-3 w-3 mr-1.5" />
              {t('correspondents.add')}
            </Button>
          </div>
        </div>
      </div>

      {/* Correspondents List */}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="border border-white rounded-lg p-4 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                {t('correspondents.addNew')} {index + 1}
              </h3>
              {fields.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => remove(index)}
                  className="h-8 w-8 p-0 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {/* First row */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor={`correspondents.${index}.clientName`} className="text-xs text-gray-700 font-medium">
                    {t('correspondents.clientName')}
                  </Label>
                  <Input
                    id={`correspondents.${index}.clientName`}
                    {...register(`correspondents.${index}.clientName`)}
                    className={`bg-[#F7F9FF] border-gray-200 h-9 text-sm ${
                      errors.correspondents?.[index]?.clientName ? "border-red-300" : ""
                    }`}
                    suppressHydrationWarning
                  />
                  {errors.correspondents?.[index]?.clientName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.correspondents[index]?.clientName?.message as string}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`correspondents.${index}.whatsapp`} className="text-xs text-gray-700 font-medium">
                    {t('correspondents.whatsapp')}
                  </Label>
                  <Input
                    id={`correspondents.${index}.whatsapp`}
                    {...register(`correspondents.${index}.whatsapp`)}
                    className={`bg-[#F7F9FF] border-gray-300 h-9 text-sm ${
                      errors.correspondents?.[index]?.whatsapp ? "border-red-300" : ""
                    }`}
                    placeholder={t('contact.whatsappPlaceholder')}
                    suppressHydrationWarning
                  />
                  {errors.correspondents?.[index]?.whatsapp && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.correspondents[index]?.whatsapp?.message as string}
                    </p>
                  )}
                </div>
              </div>

              {/* Second row */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor={`correspondents.${index}.accountType`} className="text-xs text-gray-700 font-medium">
                    {t('correspondents.accountType')}
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={`bg-[#F7F9FF] w-full border-gray-200 h-9 text-sm justify-between ${
                          errors.correspondents?.[index]?.accountType ? "border-red-300" : ""
                        }`}
                      >
                        {watch(`correspondents.${index}.accountType`) ? (
                          watch(`correspondents.${index}.accountType`) === 'premium' ? t('correspondents.accountTypes.premium') :
                          watch(`correspondents.${index}.accountType`) === 'standard' ? t('correspondents.accountTypes.standard') :
                          watch(`correspondents.${index}.accountType`) === 'basic' ? t('correspondents.accountTypes.basic') :
                          t('correspondents.accountType')
                        ) : t('correspondents.accountType')}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuItem onSelect={() => {
                        setValue(`correspondents.${index}.accountType`, 'premium')
                      }}>
                        {t('correspondents.accountTypes.premium')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => {
                        setValue(`correspondents.${index}.accountType`, 'standard')
                      }}>
                        {t('correspondents.accountTypes.standard')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => {
                        setValue(`correspondents.${index}.accountType`, 'basic')
                      }}>
                        {t('correspondents.accountTypes.basic')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {errors.correspondents?.[index]?.accountType && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.correspondents[index]?.accountType?.message as string}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  {/* Empty div for grid alignment */}
                </div>
              </div>
            </div>

            {/* Invitation Methods */}
            <div className="space-y-3 mt-6">
              <Label className="text-xs text-gray-600 font-medium">{t('correspondents.invitationMethods')}</Label>

              <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-6">
                <label className="flex items-center space-x-2 text-xs text-gray-700">
                  <Checkbox
                    id={`whatsapp-${index}`}
                    onCheckedChange={(checked) => setValue(`correspondents.${index}.invitationMethods.whatsapp`, !!checked)}
                    className="border-gray-300 h-4 w-4"
                  />
                  <span>{t('correspondents.sendWhatsapp')}</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-gray-700">
                  <Checkbox
                    id={`email-${index}`}
                    onCheckedChange={(checked) => setValue(`correspondents.${index}.invitationMethods.email`, !!checked)}
                    className="border-gray-300 h-4 w-4"
                  />
                  <span>{t('correspondents.sendEmail')}</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-gray-700">
                  <Checkbox
                    id={`copyLink-${index}`}
                    onCheckedChange={(checked) => setValue(`correspondents.${index}.invitationMethods.copyLink`, !!checked)}
                    className="border-gray-300 h-4 w-4"
                  />
                  <span>{t('correspondents.copyLink')}</span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
});
