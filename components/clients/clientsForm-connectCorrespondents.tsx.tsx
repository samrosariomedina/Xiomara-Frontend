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
import { type ConnectCorrespondentsInput, connectCorrespondentsSchema } from '@/lib/schemas'
import { forwardRef, useImperativeHandle, useState, useRef, useEffect } from "react"
import { useCorresponsables } from "@/hooks/useCorresponsables"
import { useSharing } from "@/hooks/useSharing" 
import { createCorresponsableWithSharingAction, updateCorresponsableAction, getShareUrlAction } from "@/actions/corresponsables"
import { toast } from "sonner"
import { TelegramTokenDialog } from "./TelegramTokenDialog"

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

interface CorrespondentFormData {
  id?: string; // For existing corresponsables
  clientName: string;
  email?: string;
  whatsapp: string;
  accountType: "premium" | "standard" | "basic";
  telegramToken?: string; // Store the telegram bot token
  invitationMethods?: {
    whatsapp: boolean;
    telegram: boolean;
    email: boolean;
    copyLink: boolean;
  };
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
  const { executeSharing } = useSharing();

  // CSV upload state
  const [selectedCsvFile, setSelectedCsvFile] = useState<File | null>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  // Telegram dialog state
  const [telegramDialogOpen, setTelegramDialogOpen] = useState(false);
  const [currentTelegramIndex, setCurrentTelegramIndex] = useState<number | null>(null);

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
    title?: string;
    origin?: string;
    metadata?: { email?: string };
    email?: string; // Direct email field if available
  }>): CorrespondentFormData[] => {
    const correspondents = corresponsablesData.map(corresponsable => ({
      id: corresponsable._id, // Store the original ID for updates
      clientName: corresponsable.title || "",
      email: corresponsable.metadata?.email || corresponsable.email || "", // Get email from metadata or direct field
      whatsapp: corresponsable.origin || "",
      accountType: "basic" as const, // Default account type
      invitationMethods: {
        whatsapp: false,
        telegram: false,
        email: false,
        copyLink: false,
      },
    }));
    
    // Always add an empty field for adding new corresponsables
    correspondents.push({
      id: "", // Empty ID for new corresponsables
      clientName: "",
      email: "",
      whatsapp: "",
      accountType: "basic" as const,
      invitationMethods: {
        whatsapp: false,
        telegram: false,
        email: false,
        copyLink: false,
      },
    });
    
    return correspondents;
  };

  // Use fetched corresponsables or initial corresponsables
  const corresponsablesToUse = fetchedCorresponsables.length > 0 ? fetchedCorresponsables : initialCorresponsables;

  const form = useForm<{ correspondents: CorrespondentFormData[] }>({
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
      whatsapp: "",
      accountType: "basic" as const,
      telegramToken: "",
      invitationMethods: {
        whatsapp: false,
        telegram: false,
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

  // Telegram dialog handlers
  const handleTelegramToggle = (index: number, checked: boolean) => {
    const currentToken = watch(`correspondents.${index}.telegramToken`);
    
    if (checked) {
      // If token already exists, just enable telegram
      if (currentToken && currentToken.trim()) {
        setValue(`correspondents.${index}.invitationMethods.telegram`, true);
        toast.success('Telegram enabled with existing token');
      } else {
        // Open dialog to get token
        setCurrentTelegramIndex(index);
        setTelegramDialogOpen(true);
      }
    } else {
      // Disable telegram and clear token
      setValue(`correspondents.${index}.invitationMethods.telegram`, false);
      setValue(`correspondents.${index}.telegramToken`, "");
      toast.info('Telegram disabled and token cleared');
    }
  };

  const handleTelegramTokenConfirm = (token: string) => {
    if (currentTelegramIndex !== null) {
      setValue(`correspondents.${currentTelegramIndex}.telegramToken`, token);
      setValue(`correspondents.${currentTelegramIndex}.invitationMethods.telegram`, true);
      toast.success('Telegram token saved and enabled');
    }
    setTelegramDialogOpen(false);
    setCurrentTelegramIndex(null);
  };

  const handleTelegramDialogClose = () => {
    // If dialog is closed without confirming, uncheck the telegram option
    if (currentTelegramIndex !== null) {
      setValue(`correspondents.${currentTelegramIndex}.invitationMethods.telegram`, false);
      toast.info('Telegram dialog cancelled');
    }
    setTelegramDialogOpen(false);
    setCurrentTelegramIndex(null);
  };

  // Add sharing execution to form submission
  const handleCorrespondentSubmission = async (correspondent: CorrespondentFormData) => {
    if (!folderId) return;


    try {
      // Check if this is an existing corresponsable (has an ID) or a new one
      if (correspondent.id && correspondent.id.trim() !== "") {
        // Update existing corresponsable
        const updateResult = await updateCorresponsableAction(correspondent.id, {
          title: correspondent.clientName,
          origin: correspondent.whatsapp,
          enabled: true,
          email: correspondent.email || ""
        });

        // Execute sharing for existing corresponsables if methods are selected (regardless of update success)
        if (correspondent.invitationMethods && (correspondent.invitationMethods.whatsapp || correspondent.invitationMethods.telegram || correspondent.invitationMethods.email || correspondent.invitationMethods.copyLink)) {
          // Get share URL for the existing listener
          const shareUrlResult = await getShareUrlAction(correspondent.id);
          
          if (shareUrlResult.success) {
            const shareUrl = shareUrlResult.data;
            const message = `Hola ${correspondent.clientName}, te invito a conectarte con nuestro sistema de corresponsales. ${shareUrl}`;
            
            await executeSharing(
              {
                shareUrl,
                message,
                email: correspondent.email || "",
                clientName: correspondent.clientName
              },
              correspondent.invitationMethods
            );
          } else {
            toast.warning(`Sharing failed: ${shareUrlResult.error}`);
          }
        }

        if (updateResult.success) {
          toast.success(`Corresponsable ${correspondent.clientName} updated successfully`);
        } else {
          toast.error(updateResult.error || 'Failed to update corresponsable');
        }
        return;
      }

      // Create new corresponsable
      console.log('Creating corresponsable with data:', {
        clientName: correspondent.clientName,
        email: correspondent.email,
        whatsapp: correspondent.whatsapp,
        accountType: correspondent.accountType,
        telegramToken: correspondent.telegramToken ? 'TOKEN_PROVIDED' : 'NO_TOKEN',
        invitationMethods: correspondent.invitationMethods
      });
      
      const result = await createCorresponsableWithSharingAction(folderId, {
        clientName: correspondent.clientName,
        email: correspondent.email || "",
        whatsapp: correspondent.whatsapp,
        accountType: correspondent.accountType,
        telegramToken: correspondent.telegramToken,
        invitationMethods: correspondent.invitationMethods
      });

      if (result.success && result.data) {
        const { shareUrl, message, invitationMethods, sharingError, listeners } = result.data;
        
        if (sharingError) {
          toast.error(`Corresponsable created but sharing failed: ${sharingError}`);
        }

        // Execute sharing if methods are selected and we have the data
        if (invitationMethods && (invitationMethods.whatsapp || invitationMethods.telegram || invitationMethods.email || invitationMethods.copyLink)) {
          if (shareUrl && message) {
            await executeSharing(
              {
                shareUrl,
                message,
                email: correspondent.email || "",
                clientName: correspondent.clientName
              },
              invitationMethods
            );
          } else {
            toast.warning('Corresponsable created but sharing data unavailable');
          }
        }

        const listenerCount = listeners ? listeners.length : 1;
        const listenerText = listenerCount > 1 ? `${listenerCount} listeners` : 'listener';
        toast.success(`Corresponsable ${correspondent.clientName} created successfully with ${listenerText}`);
      } else {
        toast.error(result.error || 'Failed to create corresponsable');
      }
    } catch (error) {
      console.error('Error creating corresponsable:', error);
      toast.error('Failed to create corresponsable');
    }
  };

  useImperativeHandle(ref, () => ({
    validate: async () => {
      return await form.trigger();
    },
    getValues: () => form.getValues() as { correspondents: CorrespondentFormData[] },
    reset: () => {
      form.reset();
      setSelectedCsvFile(null);
      if (csvFileInputRef.current) {
        csvFileInputRef.current.value = '';
      }
    },
    submit: async () => {
      const formData = form.getValues();
      const validCorrespondents = formData.correspondents.filter(
        (correspondent) => {
          const hasBasicInfo = correspondent.clientName.trim() && correspondent.whatsapp.trim();
          const hasTelegramWithToken = correspondent.invitationMethods?.telegram ? correspondent.telegramToken?.trim() : true;
          return hasBasicInfo && hasTelegramWithToken;
        }
      );
      
      if (validCorrespondents.length === 0) {
        toast.warning('Please add at least one correspondent with name, WhatsApp number, and valid Telegram token (if Telegram is selected)');
        return false;
      }

      try {
        for (const correspondent of validCorrespondents) {
          await handleCorrespondentSubmission(correspondent);
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

              {/* Second row */}
              <div className="grid lg:grid-cols-2 gap-6">
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
                    checked={watch(`correspondents.${index}.invitationMethods.whatsapp`) || false}
                    onCheckedChange={(checked) => setValue(`correspondents.${index}.invitationMethods.whatsapp`, !!checked)}
                    className="border-gray-300 h-4 w-4"
                  />
                  <span>{t('correspondents.sendWhatsapp')}</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-gray-700">
                  <Checkbox
                    id={`telegram-${index}`}
                    checked={watch(`correspondents.${index}.invitationMethods.telegram`) || false}
                    onCheckedChange={(checked) => handleTelegramToggle(index, !!checked)}
                    className="border-gray-300 h-4 w-4"
                  />
                  <span>{t('correspondents.sendTelegram')}</span>
                  {watch(`correspondents.${index}.telegramToken`) ? (
                    <span className="text-xs text-green-600 font-medium">✓ Token configured</span>
                  ) : (
                    watch(`correspondents.${index}.invitationMethods.telegram`) && (
                      <span className="text-xs text-orange-600">⚠ Token needed</span>
                    )
                  )}
                </label>

                <label className="flex items-center space-x-2 text-xs text-gray-700">
                  <Checkbox
                    id={`email-${index}`}
                    checked={watch(`correspondents.${index}.invitationMethods.email`) || false}
                    onCheckedChange={(checked) => setValue(`correspondents.${index}.invitationMethods.email`, !!checked)}
                    className="border-gray-300 h-4 w-4"
                  />
                  <span>{t('correspondents.sendEmail')}</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-gray-700">
                  <Checkbox
                    id={`copyLink-${index}`}
                    checked={watch(`correspondents.${index}.invitationMethods.copyLink`) || false}
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

      {/* Telegram Token Dialog */}
      <TelegramTokenDialog
        isOpen={telegramDialogOpen}
        onClose={handleTelegramDialogClose}
        onConfirm={handleTelegramTokenConfirm}
        correspondentName={
          currentTelegramIndex !== null 
            ? watch(`correspondents.${currentTelegramIndex}.clientName`) || 'Correspondent'
            : 'Correspondent'
        }
      />

    </div>
  );
});
