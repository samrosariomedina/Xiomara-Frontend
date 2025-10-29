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
import { ChevronDown, Trash2, Edit } from "lucide-react"
import { Plus ,Upload } from "lucide-react"
import { useTranslations } from 'next-intl'
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { type ConnectCorrespondentsInput, connectCorrespondentsSchema } from '@/lib/schemas'
import { forwardRef, useImperativeHandle, useState, useRef, useEffect } from "react"
import { useCorresponsables } from "@/hooks/useCorresponsables"
import { createCorresponsableWithSharingAction, updateCorresponsableAction } from "@/actions/corresponsables"
import { toast } from "sonner"
import { ShareLinkDialog } from "@/components/dialogs/ShareLinkDialog"

interface ConnectCorrespondentsFormProps {
  folderId?: string | null;
  initialCorresponsables?: Array<{
    _id: string;
    title: string;
    origin: string;
    enabled: boolean;
    approved: boolean;
    timestamp: string;
    metadata?: {
      email?: string;
    };
  }>;
}

// Use the schema type instead of custom interface
type CorrespondentFormData = ConnectCorrespondentsInput['correspondents'][number] & {
  id?: string; // For existing corresponsables (not in schema but used internally)
}

type ChildFormRef<T = unknown> = {
  validate: () => Promise<boolean>
  getValues: () => T
  reset: () => void
  submit: () => Promise<boolean>
}

export const ConnectCorrespondentsForm = forwardRef<ChildFormRef<ConnectCorrespondentsInput>, ConnectCorrespondentsFormProps>(function ConnectCorrespondentsForm({
  folderId,
  initialCorresponsables = []
}, ref) {
  const t = useTranslations('CLIENT_FORM');

  // CSV upload state
  const [selectedCsvFile, setSelectedCsvFile] = useState<File | null>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  // Telegram dialog state - removed since we have direct input field now
  // const [telegramDialogOpen, setTelegramDialogOpen] = useState(false);
  // const [currentTelegramIndex, setCurrentTelegramIndex] = useState<number | null>(null);
  
  // Share dialog state
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareDialogData, setShareDialogData] = useState<{
    shareUrl: string;
    clientName: string;
    email?: string;
    listenerType: "whatsapp" | "telegram";
  } | null>(null)

  // Use corresponsables hook
  const { 
    createCorresponsablesFromCSV, 
    isCreatingFromCSV,
    isLoading: isLoadingCorresponsables,
    corresponsables: fetchedCorresponsables = []
  } = useCorresponsables(folderId || undefined);

  // Convert corresponsables to form format
  const getCorrespondentsFromData = (corresponsablesData: Array<{
    _id: string;
    type?: string; // "whatsapp" or "telegram"
    title?: string;
    origin?: string;
    metadata?: { email?: string };
    email?: string; // Direct email field if available
  }>): CorrespondentFormData[] => {
    const correspondents = corresponsablesData.map(corresponsable => {
      const listenerType = corresponsable.type === "telegram" ? "telegram" : "whatsapp";
      const isWhatsApp = listenerType === "whatsapp";
      
      return {
        id: corresponsable._id, // Store the original ID for updates
        clientName: corresponsable.title || "",
        email: corresponsable.metadata?.email || corresponsable.email || "",
        listenerType: listenerType as "whatsapp" | "telegram",
        whatsapp: isWhatsApp ? (corresponsable.origin || "") : "",
        telegramToken: !isWhatsApp ? (corresponsable.origin || "") : "",
        accountType: "basic" as const,
      };
    });
    
    // Always add an empty field for adding new corresponsables
    correspondents.push({
      id: "", // Empty ID for new corresponsables
      clientName: "",
      email: "",
      listenerType: "whatsapp",
      whatsapp: "",
      telegramToken: "",
      accountType: "basic" as const,
    });
    
    return correspondents;
  };

  // Use fetched corresponsables or initial corresponsables
  const corresponsablesToUse = fetchedCorresponsables.length > 0 ? fetchedCorresponsables : initialCorresponsables;

  const form = useForm<ConnectCorrespondentsInput>({
    resolver: zodResolver(connectCorrespondentsSchema),
    defaultValues: {
      correspondents: getCorrespondentsFromData(corresponsablesToUse)
    },
    mode: "onChange"
  });
  
  const { register, setValue, formState: { errors }, watch, control } = form;
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "correspondents"
  });

  // Initialize form with corresponsables data when it changes
  const initializedRef = useRef(false);
  
  useEffect(() => {
    // Always reinitialize when corresponsables data changes
    const correspondentsData = getCorrespondentsFromData(corresponsablesToUse);
    form.reset({ correspondents: correspondentsData });
    initializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [corresponsablesToUse, folderId]);
  
  // Form validity is managed internally - no need to notify parent

  // Add new correspondent function
  const addCorrespondent = () => {
    append({
      clientName: "",
      email: "",
      listenerType: "whatsapp",
      whatsapp: "",
      telegramToken: "",
      accountType: "basic" as const,
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
      return;
    }

    if (!folderId) {
      return;
    }

    try {
      await createCorresponsablesFromCSV({
        folderId,
        csvFile: selectedCsvFile,
        enabled: true
      });
      
      // Clear the selected file after successful upload
      setSelectedCsvFile(null);
      if (csvFileInputRef.current) {
        csvFileInputRef.current.value = '';
      }
    } catch (error) {
      // Error handling is done in the hook
      console.error('CSV upload failed:', error);
    }
  };


  // Add sharing execution to form submission
  const handleCorrespondentSubmission = async (correspondent: CorrespondentFormData & { id?: string }): Promise<boolean> => {
    if (!folderId) {
      toast.error('No folder selected');
      return false;
    }

    try {
      // Check if this is an existing corresponsable (has an ID) or a new one
      if (correspondent.id && correspondent.id.trim() !== "") {
        // Update existing corresponsable
        const updateResult = await updateCorresponsableAction(correspondent.id, {
          title: correspondent.clientName,
          origin: correspondent.listenerType === "whatsapp" ? correspondent.whatsapp : correspondent.telegramToken || "",
          enabled: true,
          email: correspondent.email || ""
        });

        if (updateResult.success) {
          toast.success(`Corresponsable ${correspondent.clientName} updated successfully`);
          return true;
        } else {
          toast.error(updateResult.error || 'Failed to update corresponsable');
          return false;
        }
      }

      // Create new corresponsable
      console.log('Creating corresponsable with data:', {
        clientName: correspondent.clientName,
        email: correspondent.email,
        whatsapp: correspondent.whatsapp,
        accountType: correspondent.accountType,
        telegramToken: correspondent.telegramToken ? 'TOKEN_PROVIDED' : 'NO_TOKEN',
      });
      
      const result = await createCorresponsableWithSharingAction(folderId, {
        clientName: correspondent.clientName,
        email: correspondent.email || "",
        listenerType: correspondent.listenerType,
        whatsapp: correspondent.whatsapp,
        telegramToken: correspondent.telegramToken,
        accountType: correspondent.accountType
      });

      if (result.success && result.data) {
        const { shareUrl, sharingError, listeners } = result.data;
        
        if (sharingError) {
          toast.error(`Corresponsable created but sharing failed: ${sharingError}`);
        }

        const listenerCount = listeners ? listeners.length : 1;
        const listenerText = listenerCount > 1 ? `${listenerCount} listeners` : 'listener';
        toast.success(`Corresponsable ${correspondent.clientName} created successfully with ${listenerText}`);
        
        // Show sharing dialog if share URL is available
        if (shareUrl) {
          setShareDialogData({
            shareUrl,
            clientName: correspondent.clientName,
            email: correspondent.email,
            listenerType: correspondent.listenerType
          });
          setShowShareDialog(true);
        }
        
        return true;
      } else {
        toast.error(result.error || 'Failed to create corresponsable');
        return false;
      }
    } catch (error) {
      console.error('Error creating corresponsable:', error);
      toast.error('Failed to create corresponsable');
      return false;
    }
  };

  useImperativeHandle(ref, () => ({
    validate: async () => {
      return await form.trigger();
    },
    getValues: () => form.getValues() as ConnectCorrespondentsInput,
    reset: () => {
      form.reset();
      setSelectedCsvFile(null);
      if (csvFileInputRef.current) {
        csvFileInputRef.current.value = '';
      }
    },
    submit: async () => {
      const formData = form.getValues();
      // Only process NEW correspondents (those without an id)
      // We need to cast because 'id' is not part of the schema type but we add it internally
      const formDataWithIds = formData.correspondents as Array<CorrespondentFormData>;
      const newCorrespondents = formDataWithIds.filter(
        (correspondent) => {
          const isNew = !correspondent.id || correspondent.id.trim() === "";
          const hasBasicInfo = correspondent.clientName.trim() && 
            (correspondent.listenerType === "whatsapp" ? correspondent.whatsapp?.trim() : correspondent.telegramToken?.trim());
          return isNew && hasBasicInfo;
        }
      );
      
      if (newCorrespondents.length === 0) {
        toast.warning('Please add at least one new correspondent with name and contact information');
        return false;
      }

      try {
        for (const correspondent of newCorrespondents) {
          await handleCorrespondentSubmission(correspondent);
        }
        // Remove the created correspondents from the form
        const remainingCorrespondents = formDataWithIds.filter(
          (correspondent) => correspondent.id && correspondent.id.trim() !== ""
        );
        // Always keep at least one empty field for adding new
        if (remainingCorrespondents.length === 0) {
          form.reset({
            correspondents: [{
              clientName: "",
              email: "",
              listenerType: "whatsapp",
              whatsapp: "",
              telegramToken: "",
              accountType: "basic",
            }]
          });
        } else {
          // Remove id before resetting since it's not part of schema
          const correspondentsWithoutId: Omit<CorrespondentFormData, 'id'>[] = remainingCorrespondents.map((correspondent) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...rest } = correspondent;
            return rest;
          });
          form.reset({
            correspondents: correspondentsWithoutId
          });
        }
        return true;
      } catch (error) {
        console.error('Error submitting correspondents:', error);
        return false;
      }
    }
  }))

  return (
    <div className="space-y-6 mt-4">
      {/* Loading state */}
      {isLoadingCorresponsables && (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-gray-500">Loading corresponsables...</div>
        </div>
      )}
      
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
              disabled={isCreatingFromCSV}
              className="flex-1 lg:flex-none text-xs h-8 px-3 bg-[#F7F9FF] hover:bg-gray-50 text-[#31499F] rounded-full flex items-center justify-center border border-white disabled:opacity-50"
            >
              <Upload className="h-3 w-3 mr-1.5" />
              {isCreatingFromCSV ? 'Uploading...' : t('correspondents.uploadCSV')}
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
                  disabled={isCreatingFromCSV || !folderId}
                  className="text-xs h-6 px-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                >
                  {isCreatingFromCSV ? 'Uploading...' : 'Upload'}
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
                {(() => {
                  const correspondent = watch(`correspondents.${index}`) as CorrespondentFormData;
                  const hasId = correspondent?.id && correspondent.id.trim() !== "";
                  return hasId
                    ? (correspondent?.clientName || 'Unnamed Corresponsable')
                    : `${t('correspondents.addNew')} ${index + 1}`;
                })()}
              </h3>
              <div className="flex items-center gap-2">
                {(() => {
                  const correspondent = watch(`correspondents.${index}`) as CorrespondentFormData;
                  const hasId = correspondent?.id && correspondent.id.trim() !== "";
                  
                  if (hasId) {
                    return (
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={async () => {
                          if (correspondent) {
                            await handleCorrespondentSubmission(correspondent);
                          }
                        }}
                        className="h-8 px-3 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 flex items-center gap-1.5"
                        title="Save changes"
                      >
                        <Edit className="h-3 w-3" />
                        <span className="text-xs">Save</span>
                      </Button>
                    );
                  } else {
                    return (
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={async () => {
                          // Validate this specific correspondent
                          const isValid = await form.trigger(`correspondents.${index}`);
                          if (!isValid) {
                            toast.error('Please fill in all required fields');
                            return;
                          }
                          
                          const correspondent = watch(`correspondents.${index}`) as CorrespondentFormData;
                          if (correspondent) {
                            const success = await handleCorrespondentSubmission(correspondent);
                            // Only remove if creation was successful
                            // The hook will refetch and it will reappear as an existing corresponsable
                            if (success) {
                              remove(index);
                            }
                          }
                        }}
                        className="h-8 px-3 rounded-full bg-green-50 hover:bg-green-100 text-green-600 border-green-200 flex items-center gap-1.5"
                        title="Add this corresponsable"
                      >
                        <Plus className="h-3 w-3" />
                        <span className="text-xs">Add</span>
                      </Button>
                    );
                  }
                })()}
                {fields.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => remove(index)}
                    className="h-8 w-8 p-0 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
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
                  <Label htmlFor={`correspondents.${index}.email`} className="text-xs text-gray-700 font-medium">
                    {t('correspondents.email')}
                  </Label>
                  <Input
                    id={`correspondents.${index}.email`}
                    type="email"
                    {...register(`correspondents.${index}.email`)}
                    className={`bg-[#F7F9FF] border-gray-200 h-9 text-sm ${
                      errors.correspondents?.[index]?.email ? "border-red-300" : ""
                    }`}
                    placeholder={t('contact.emailPlaceholder')}
                    suppressHydrationWarning
                  />
                  {errors.correspondents?.[index]?.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.correspondents[index]?.email?.message as string}
                    </p>
                  )}
                </div>
              </div>

              {/* Connection Type Selection */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-700 font-medium">Connection Type</Label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center space-x-2">
                    <input
                      type="radio"
                      {...register(`correspondents.${index}.listenerType`)}
                      value="whatsapp"
                      className="h-4 w-4 text-[#31499F]"
                    />
                    <span className="text-xs">WhatsApp</span>
                  </label>
                  <label className="inline-flex items-center space-x-2">
                    <input
                      type="radio"
                      {...register(`correspondents.${index}.listenerType`)}
                      value="telegram"
                      className="h-4 w-4 text-[#31499F]"
                    />
                    <span className="text-xs">Telegram</span>
                  </label>
                </div>
                {errors.correspondents?.[index]?.listenerType && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.correspondents[index]?.listenerType?.message as string}
                  </p>
                )}
              </div>

              {/* Second row */}
              <div className="grid lg:grid-cols-2 gap-6">
                {watch(`correspondents.${index}.listenerType`) === 'whatsapp' && (
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
                )}

                {watch(`correspondents.${index}.listenerType`) === 'telegram' && (
                  <div className="space-y-2">
                    <Label htmlFor={`correspondents.${index}.telegramToken`} className="text-xs text-gray-700 font-medium">
                      Telegram Bot Token
                    </Label>
                    <Input
                      id={`correspondents.${index}.telegramToken`}
                      type="password"
                      {...register(`correspondents.${index}.telegramToken`)}
                      className={`bg-[#F7F9FF] border-gray-300 h-9 text-sm ${
                        errors.correspondents?.[index]?.telegramToken ? "border-red-300" : ""
                      }`}
                      placeholder="Enter bot token"
                      suppressHydrationWarning
                    />
                    {errors.correspondents?.[index]?.telegramToken && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.correspondents[index]?.telegramToken?.message as string}
                      </p>
                    )}
                  </div>
                )}
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

            {/* Invitation Methods section removed - sharing happens after creation */}
          </div>
        ))}
      </div>

      {/* Share Link Dialog */}
      {shareDialogData && (
        <ShareLinkDialog
          isOpen={showShareDialog}
          onClose={() => {
            setShowShareDialog(false);
            setShareDialogData(null);
          }}
          shareUrl={shareDialogData.shareUrl}
          clientName={shareDialogData.clientName}
          email={shareDialogData.email}
          listenerType={shareDialogData.listenerType}
        />
      )}

    </div>
  );
});
