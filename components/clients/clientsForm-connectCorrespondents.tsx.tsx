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
import { getShareUrlAction } from "@/actions/corresponsables"
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

  // Edit and create state
  const [editingCorresponsableId, setEditingCorresponsableId] = useState<string | null>(null);
  const [showNewCorresponsableForm, setShowNewCorresponsableForm] = useState(false);
  const [newCorresponsableData, setNewCorresponsableData] = useState<CorrespondentFormData>({
    id: "",
    clientName: "",
    email: "",
    whatsapp: "",
    accountType: "basic",
    invitationMethods: {
      whatsapp: false,
      telegram: false,
      email: false,
      copyLink: false,
    },
  });
  const [editingCorresponsableData, setEditingCorresponsableData] = useState<CorrespondentFormData | null>(null);

  // Use corresponsables hook
  const { 
    createCorresponsablesFromCSV, 
    isCreatingFromCSV,
    isLoading: isLoadingCorresponsables,
    corresponsables: fetchedCorresponsables = [],
    createCorresponsableWithSharing,
    isCreatingWithSharing,
    updateCorresponsable,
    isUpdating,
    refetch
  } = useCorresponsables(folderId || undefined);

  // Convert corresponsables to form format (only existing ones, no empty field)
  const getCorrespondentsFromData = (corresponsablesData: Array<{
    _id: string;
    title?: string;
    origin?: string;
    metadata?: { email?: string };
    email?: string; // Direct email field if available
  }>): CorrespondentFormData[] => {
    return corresponsablesData.map(corresponsable => ({
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
      if (currentTelegramIndex === -1) {
        // Handle new corresponsable
        setNewCorresponsableData(prev => ({
          ...prev,
          telegramToken: token,
          invitationMethods: { ...prev.invitationMethods!, telegram: true }
        }));
      } else {
        // Handle existing corresponsable (either in edit mode or form mode)
        if (editingCorresponsableId && editingCorresponsableData) {
          // Handle edit mode
          setEditingCorresponsableData(prev => prev ? ({
            ...prev,
            telegramToken: token,
            invitationMethods: { ...prev.invitationMethods!, telegram: true }
          }) : null);
        } else {
          // Handle form mode
          setValue(`correspondents.${currentTelegramIndex}.telegramToken`, token);
          setValue(`correspondents.${currentTelegramIndex}.invitationMethods.telegram`, true);
        }
      }
      toast.success('Telegram token saved and enabled');
    }
    setTelegramDialogOpen(false);
    setCurrentTelegramIndex(null);
  };

  const handleTelegramDialogClose = () => {
    // If dialog is closed without confirming, uncheck the telegram option
    if (currentTelegramIndex !== null) {
      if (currentTelegramIndex === -1) {
        // Handle new corresponsable
        setNewCorresponsableData(prev => ({
          ...prev,
          invitationMethods: { ...prev.invitationMethods!, telegram: false }
        }));
      } else {
        // Handle existing corresponsable (either in edit mode or form mode)
        if (editingCorresponsableId && editingCorresponsableData) {
          // Handle edit mode
          setEditingCorresponsableData(prev => prev ? ({
            ...prev,
            invitationMethods: { ...prev.invitationMethods!, telegram: false }
          }) : null);
        } else {
          // Handle form mode
          setValue(`correspondents.${currentTelegramIndex}.invitationMethods.telegram`, false);
        }
      }
      toast.info('Telegram dialog cancelled');
    }
    setTelegramDialogOpen(false);
    setCurrentTelegramIndex(null);
  };

  // Handle editing a specific corresponsable
  const handleEditCorresponsable = async (correspondent: CorrespondentFormData) => {
    if (!folderId || !correspondent.id) return;

    try {
      // Update existing corresponsable using hook mutation
      await updateCorresponsable({
        listenerId: correspondent.id,
        data: {
          title: correspondent.clientName,
          origin: correspondent.whatsapp,
          enabled: true,
          email: correspondent.email || ""
        }
      });

      // Execute sharing for existing corresponsables if methods are selected
      if (correspondent.invitationMethods && (correspondent.invitationMethods.whatsapp || correspondent.invitationMethods.telegram || correspondent.invitationMethods.email || correspondent.invitationMethods.copyLink)) {
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

      // Force refetch to ensure real-time updates
      await refetch();
      
      setEditingCorresponsableId(null);
    } catch (error) {
      console.error('Error updating corresponsable:', error);
      toast.error('Failed to update corresponsable');
    }
  };

  // Handle creating a new corresponsable
  const handleCreateCorresponsable = async (correspondent: CorrespondentFormData) => {
    if (!folderId) return;

    try {
      console.log('Creating corresponsable with data:', {
        clientName: correspondent.clientName,
        email: correspondent.email,
        whatsapp: correspondent.whatsapp,
        accountType: correspondent.accountType,
        telegramToken: correspondent.telegramToken ? 'TOKEN_PROVIDED' : 'NO_TOKEN',
        invitationMethods: correspondent.invitationMethods
      });
      
      const result = await createCorresponsableWithSharing({
        folderId,
        data: {
          clientName: correspondent.clientName,
          email: correspondent.email || "",
          whatsapp: correspondent.whatsapp,
          accountType: correspondent.accountType,
          telegramToken: correspondent.telegramToken,
          invitationMethods: correspondent.invitationMethods
        }
      });

      if (result) {
        const { shareUrl, message, invitationMethods, sharingError, listeners } = result;
        
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

        // Force refetch to ensure real-time updates
        await refetch();
        
        // Reset new corresponsable form
        setNewCorresponsableData({
          id: "",
          clientName: "",
          email: "",
          whatsapp: "",
          accountType: "basic",
          invitationMethods: {
            whatsapp: false,
            telegram: false,
            email: false,
            copyLink: false,
          },
        });
        setShowNewCorresponsableForm(false);
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
      // Since we have individual buttons for edit/create, this submit function is not needed
      // Individual actions are handled by their respective buttons
      return true;
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

      {/* Existing Corresponsables */}
      {fields.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Existing Corresponsables</h3>
          {fields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">
                  {watch(`correspondents.${index}.clientName`) || 'Unnamed Corresponsable'}
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => {
                      const correspondent = watch(`correspondents.${index}`);
                      setEditingCorresponsableId(correspondent.id);
                      setEditingCorresponsableData(correspondent);
                    }}
                    className="h-8 px-3 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => remove(index)}
                    className="h-8 w-8 p-0 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Edit Form - Show when this corresponsable is being edited */}
              {editingCorresponsableId === watch(`correspondents.${index}.id`) && editingCorresponsableData && (
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium text-blue-900">Edit Corresponsable</h5>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => {
                          setEditingCorresponsableId(null);
                          setEditingCorresponsableData(null);
                        }}
                        className="h-7 px-2 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => handleEditCorresponsable(editingCorresponsableData)}
                        disabled={isUpdating}
                        className="h-7 px-2 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200 disabled:opacity-50"
                      >
                        {isUpdating ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>

                  {/* Edit Form Fields */}
                  <div className="grid lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-700 font-medium">Client Name</Label>
                      <Input
                        value={editingCorresponsableData.clientName}
                        onChange={(e) => setEditingCorresponsableData(prev => prev ? { ...prev, clientName: e.target.value } : null)}
                        className="bg-white border-gray-200 h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-700 font-medium">Email</Label>
                      <Input
                        type="email"
                        value={editingCorresponsableData.email}
                        onChange={(e) => setEditingCorresponsableData(prev => prev ? { ...prev, email: e.target.value } : null)}
                        className="bg-white border-gray-200 h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-700 font-medium">WhatsApp Number</Label>
                      <Input
                        value={editingCorresponsableData.whatsapp}
                        onChange={(e) => setEditingCorresponsableData(prev => prev ? { ...prev, whatsapp: e.target.value } : null)}
                        className="bg-white border-gray-200 h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-700 font-medium">Account Type</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="bg-white w-full border-gray-200 h-8 text-sm justify-between"
                          >
                            {editingCorresponsableData.accountType === 'premium' ? 'Premium' :
                             editingCorresponsableData.accountType === 'standard' ? 'Standard' :
                             editingCorresponsableData.accountType === 'basic' ? 'Basic' : 'Select account type'}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          <DropdownMenuItem onSelect={() => setEditingCorresponsableData(prev => prev ? { ...prev, accountType: 'premium' } : null)}>
                            Premium
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setEditingCorresponsableData(prev => prev ? { ...prev, accountType: 'standard' } : null)}>
                            Standard
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setEditingCorresponsableData(prev => prev ? { ...prev, accountType: 'basic' } : null)}>
                            Basic
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Invitation Methods for Edit */}
                  <div className="space-y-3">
                    <Label className="text-xs text-gray-600 font-medium">Invitation Methods</Label>
                    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-6">
                      <label className="flex items-center space-x-2 text-xs text-gray-700">
                        <Checkbox
                          checked={editingCorresponsableData.invitationMethods?.whatsapp || false}
                          onCheckedChange={(checked) => setEditingCorresponsableData(prev => prev ? ({ 
                            ...prev, 
                            invitationMethods: { ...prev.invitationMethods!, whatsapp: !!checked }
                          }) : null)}
                          className="border-gray-300 h-4 w-4"
                        />
                        <span>Send via WhatsApp</span>
                      </label>

                      <label className="flex items-center space-x-2 text-xs text-gray-700">
                        <Checkbox
                          checked={editingCorresponsableData.invitationMethods?.telegram || false}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCurrentTelegramIndex(index);
                              setTelegramDialogOpen(true);
                            } else {
                              setEditingCorresponsableData(prev => prev ? ({ 
                                ...prev, 
                                invitationMethods: { ...prev.invitationMethods!, telegram: false },
                                telegramToken: ""
                              }) : null);
                            }
                          }}
                          className="border-gray-300 h-4 w-4"
                        />
                        <span>Send via Telegram</span>
                        {editingCorresponsableData.telegramToken ? (
                          <span className="text-xs text-green-600 font-medium">✓ Token configured</span>
                        ) : (
                          editingCorresponsableData.invitationMethods?.telegram && (
                            <span className="text-xs text-orange-600">⚠ Token needed</span>
                          )
                        )}
                      </label>

                      <label className="flex items-center space-x-2 text-xs text-gray-700">
                        <Checkbox
                          checked={editingCorresponsableData.invitationMethods?.email || false}
                          onCheckedChange={(checked) => setEditingCorresponsableData(prev => prev ? ({ 
                            ...prev, 
                            invitationMethods: { ...prev.invitationMethods!, email: !!checked }
                          }) : null)}
                          className="border-gray-300 h-4 w-4"
                        />
                        <span>Send via email</span>
                      </label>

                      <label className="flex items-center space-x-2 text-xs text-gray-700">
                        <Checkbox
                          checked={editingCorresponsableData.invitationMethods?.copyLink || false}
                          onCheckedChange={(checked) => setEditingCorresponsableData(prev => prev ? ({ 
                            ...prev, 
                            invitationMethods: { ...prev.invitationMethods!, copyLink: !!checked }
                          }) : null)}
                          className="border-gray-300 h-4 w-4"
                        />
                        <span>Copy the link and share</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

            {/* Display existing corresponsable info */}
            <div className="grid lg:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Email:</span> {watch(`correspondents.${index}.email`) || 'N/A'}
              </div>
              <div>
                <span className="text-gray-600">WhatsApp:</span> {watch(`correspondents.${index}.whatsapp`) || 'N/A'}
              </div>
              <div>
                <span className="text-gray-600">Account Type:</span> {watch(`correspondents.${index}.accountType`) || 'N/A'}
              </div>
              <div>
                <span className="text-gray-600">Status:</span> <span className="text-green-600">Active</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Add New Corresponsable Section */}
      <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Add New Corresponsable</h3>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setShowNewCorresponsableForm(!showNewCorresponsableForm)}
            className="h-8 px-3 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          >
            <Plus className="h-3 w-3 mr-1" />
            {showNewCorresponsableForm ? 'Cancel' : 'Add New'}
          </Button>
        </div>

        {showNewCorresponsableForm && (
          <div className="space-y-4">
            {/* First row */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="newCorresponsable.clientName" className="text-xs text-gray-700 font-medium">
                  Client Name
                </Label>
                <Input
                  id="newCorresponsable.clientName"
                  value={newCorresponsableData.clientName}
                  onChange={(e) => setNewCorresponsableData(prev => ({ ...prev, clientName: e.target.value }))}
                  className="bg-white border-gray-200 h-9 text-sm"
                  placeholder="Enter client name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newCorresponsable.email" className="text-xs text-gray-700 font-medium">
                  Email
                </Label>
                <Input
                  id="newCorresponsable.email"
                  type="email"
                  value={newCorresponsableData.email}
                  onChange={(e) => setNewCorresponsableData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-white border-gray-200 h-9 text-sm"
                  placeholder="Enter email"
                />
              </div>
            </div>

            {/* Second row */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="newCorresponsable.whatsapp" className="text-xs text-gray-700 font-medium">
                  WhatsApp Number
                </Label>
                <Input
                  id="newCorresponsable.whatsapp"
                  value={newCorresponsableData.whatsapp}
                  onChange={(e) => setNewCorresponsableData(prev => ({ ...prev, whatsapp: e.target.value }))}
                  className="bg-white border-gray-200 h-9 text-sm"
                  placeholder="Enter WhatsApp number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newCorresponsable.accountType" className="text-xs text-gray-700 font-medium">
                  Account Type
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="bg-white w-full border-gray-200 h-9 text-sm justify-between"
                    >
                      {newCorresponsableData.accountType === 'premium' ? 'Premium' :
                       newCorresponsableData.accountType === 'standard' ? 'Standard' :
                       newCorresponsableData.accountType === 'basic' ? 'Basic' : 'Select account type'}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem onSelect={() => setNewCorresponsableData(prev => ({ ...prev, accountType: 'premium' }))}>
                      Premium
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setNewCorresponsableData(prev => ({ ...prev, accountType: 'standard' }))}>
                      Standard
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setNewCorresponsableData(prev => ({ ...prev, accountType: 'basic' }))}>
                      Basic
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Invitation Methods */}
            <div className="space-y-3">
              <Label className="text-xs text-gray-600 font-medium">Invitation Methods</Label>
              <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-6">
                <label className="flex items-center space-x-2 text-xs text-gray-700">
                  <Checkbox
                    id="newCorresponsable.whatsapp"
                    checked={newCorresponsableData.invitationMethods?.whatsapp || false}
                    onCheckedChange={(checked) => setNewCorresponsableData(prev => ({ 
                      ...prev, 
                      invitationMethods: { ...prev.invitationMethods!, whatsapp: !!checked }
                    }))}
                    className="border-gray-300 h-4 w-4"
                  />
                  <span>Send via WhatsApp</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-gray-700">
                  <Checkbox
                    id="newCorresponsable.telegram"
                    checked={newCorresponsableData.invitationMethods?.telegram || false}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCurrentTelegramIndex(-1); // Use -1 for new corresponsable
                        setTelegramDialogOpen(true);
                      } else {
                        setNewCorresponsableData(prev => ({ 
                          ...prev, 
                          invitationMethods: { ...prev.invitationMethods!, telegram: false },
                          telegramToken: ""
                        }));
                      }
                    }}
                    className="border-gray-300 h-4 w-4"
                  />
                  <span>Send via Telegram</span>
                  {newCorresponsableData.telegramToken ? (
                    <span className="text-xs text-green-600 font-medium">✓ Token configured</span>
                  ) : (
                    newCorresponsableData.invitationMethods?.telegram && (
                      <span className="text-xs text-orange-600">⚠ Token needed</span>
                    )
                  )}
                </label>

                <label className="flex items-center space-x-2 text-xs text-gray-700">
                  <Checkbox
                    id="newCorresponsable.email"
                    checked={newCorresponsableData.invitationMethods?.email || false}
                    onCheckedChange={(checked) => setNewCorresponsableData(prev => ({ 
                      ...prev, 
                      invitationMethods: { ...prev.invitationMethods!, email: !!checked }
                    }))}
                    className="border-gray-300 h-4 w-4"
                  />
                  <span>Send via email</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-gray-700">
                  <Checkbox
                    id="newCorresponsable.copyLink"
                    checked={newCorresponsableData.invitationMethods?.copyLink || false}
                    onCheckedChange={(checked) => setNewCorresponsableData(prev => ({ 
                      ...prev, 
                      invitationMethods: { ...prev.invitationMethods!, copyLink: !!checked }
                    }))}
                    className="border-gray-300 h-4 w-4"
                  />
                  <span>Copy the link and share</span>
                </label>
              </div>
            </div>

            {/* Create Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => handleCreateCorresponsable(newCorresponsableData)}
                disabled={!newCorresponsableData.clientName.trim() || !newCorresponsableData.whatsapp.trim() || isCreatingWithSharing}
                className="h-8 px-4 text-xs bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                <Plus className="h-3 w-3 mr-1" />
                {isCreatingWithSharing ? 'Creating...' : 'Create Corresponsable'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Telegram Token Dialog */}
      <TelegramTokenDialog
        isOpen={telegramDialogOpen}
        onClose={handleTelegramDialogClose}
        onConfirm={handleTelegramTokenConfirm}
        correspondentName={
          currentTelegramIndex !== null 
            ? currentTelegramIndex === -1 
              ? newCorresponsableData.clientName || 'New Corresponsable'
              : watch(`correspondents.${currentTelegramIndex}.clientName`) || 'Correspondent'
            : 'Correspondent'
        }
      />

    </div>
  );
});
