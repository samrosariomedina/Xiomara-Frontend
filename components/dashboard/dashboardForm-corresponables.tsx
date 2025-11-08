"use client"

import { useState, useEffect } from "react"
import { Plus, Download, Eye, Users, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import HeaderControls from "../ui/formsHeader-dashboard"
import SourcesList, { SourceItem } from "../ui/formsLists-dashboard"
import { useTranslations } from 'next-intl'
import { corresponsablesSchema, type CorresponsablesInput } from '@/lib/schemas'
import { useCorresponsables } from "@/hooks/useCorresponsables"
import { formatDateSafe } from "@/lib/utils"
import { useRouter } from 'next/navigation'
import { ShareLinkDialog } from "@/components/dialogs/ShareLinkDialog"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

interface CorresponsableData {
  _id: string;
  type?: string; // "whatsapp" or "telegram"
  title?: string;
  origin?: string;
  approved: boolean;
  timestamp: string;
  metadata?: {
    email?: string;
  };
}

// Use the schema type directly
type CorresponsableFormData = CorresponsablesInput

interface CorresponsalesFormProps {
  onSubmit?: (data: CorresponsableFormData) => void
  folderId: string
  editCorresponsable?: {
    _id: string;
    type?: string; // "whatsapp" or "telegram"
    title?: string;
    origin?: string;
    approved: boolean;
    timestamp: string;
    metadata?: {
      email?: string;
    };
  } | null
  onClose?: () => void // Callback to close the drawer
}

export function CorresponsalesForm({ onSubmit, folderId, editCorresponsable = null, onClose }: CorresponsalesFormProps) {
  // Debug logging
  console.log('🟣 CorresponsalesForm rendered with editCorresponsable:', editCorresponsable);
  
  // Local edit state for list-based editing
  const [localEditCorresponsable, setLocalEditCorresponsable] = useState<typeof editCorresponsable>(null);
  
  // Determine if we're in edit mode (either from prop or local state)
  const currentEditCorresponsable = editCorresponsable || localEditCorresponsable;
  const isEditMode = !!currentEditCorresponsable
  
  const [showForm, setShowForm] = useState(isEditMode) // Auto-show form in edit mode
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareDialogData, setShareDialogData] = useState<{
    shareUrl: string;
    clientName: string;
    email?: string;
    listenerType: "whatsapp" | "telegram";
  } | null>(null)
  
  // Use react-hook-form like the client form - schema already makes clientName optional
  const form = useForm<CorresponsableFormData>({
    resolver: zodResolver(corresponsablesSchema),
    defaultValues: {
      clientName: isEditMode ? (currentEditCorresponsable?.title || "") : "",
      email: isEditMode ? (currentEditCorresponsable?.metadata?.email || "") : "",
      listenerType: isEditMode ? (currentEditCorresponsable?.type === "telegram" ? "telegram" : "whatsapp") : "whatsapp",
      whatsapp: isEditMode ? (currentEditCorresponsable?.type === "whatsapp" ? (currentEditCorresponsable?.origin || "") : "") : "",
      telegramToken: isEditMode ? (currentEditCorresponsable?.type === "telegram" ? (currentEditCorresponsable?.origin || "") : "") : "",
      accountType: "basic",
    },
    mode: "onSubmit"
  })
  
  const { register, setValue, formState: { errors }, watch, handleSubmit, clearErrors } = form

  const tForm = useTranslations('CORRESPONSABLES_FORM')
  const tMain = useTranslations('CORRESPONSABLES')
  const router = useRouter()

  // Clear errors when form is shown, and always clear clientName errors since it's optional
  useEffect(() => {
    if (showForm) {
      clearErrors()
    }
    // Always clear clientName errors since it's optional and shouldn't show validation errors
    if (form.formState.errors.clientName) {
      form.clearErrors('clientName')
    }
  }, [showForm, clearErrors, form])
  
  // Fetch corresponsables for the folder (client or campaign)
  const { 
    corresponsables = [], 
    isLoading, 
    error,
    updateCorresponsable,
    isUpdating,
    removeCorresponsable,
    createCorresponsableWithSharing,
    isCreatingWithSharing
  } = useCorresponsables(folderId)
  
  // Reset form when editCorresponsable or localEditCorresponsable changes
  useEffect(() => {
    console.log('🟣 currentEditCorresponsable changed:', currentEditCorresponsable);
    if (currentEditCorresponsable) {
      const listenerType = currentEditCorresponsable.type === "telegram" ? "telegram" : "whatsapp";
      const isWhatsApp = listenerType === "whatsapp";
      
      console.log('🟣 Setting form to edit mode with data:', {
        clientName: currentEditCorresponsable.title,
        email: currentEditCorresponsable.metadata?.email,
        listenerType,
        origin: currentEditCorresponsable.origin
      });
      setShowForm(true)
      form.reset({
        clientName: currentEditCorresponsable.title || "",
        email: currentEditCorresponsable.metadata?.email || "",
        listenerType,
        whatsapp: isWhatsApp ? (currentEditCorresponsable.origin || "") : "",
        telegramToken: !isWhatsApp ? (currentEditCorresponsable.origin || "") : "",
        accountType: "basic",
        invitationMethods: {
          whatsapp: false,
          telegram: false,
          email: false,
          copyLink: false,
        },
      })
    }
  }, [currentEditCorresponsable, form])
  
  // Ensure showForm is true whenever we're in edit mode (for tab switching)
  useEffect(() => {
    if (isEditMode && !showForm) {
      console.log('🟣 isEditMode is true but showForm is false - setting showForm to true');
      setShowForm(true);
    }
  }, [isEditMode, showForm])

  // Convert corresponsables to SourceItem format for display
  const sources: SourceItem[] = corresponsables.map((corresponsable: CorresponsableData, ) => ({
    id: corresponsable._id,
    name: corresponsable.title || 'Unnamed',
    type: "corresponsable",
    category: "Corresponsable",
    timestamp: formatDateSafe(corresponsable.timestamp),
  }))

  // Local state for managing sources list
  const [localSources, setLocalSources] = useState<SourceItem[]>(sources)
  
  // Sync localSources with fetched corresponsables data
  useEffect(() => {
    const updatedSources = corresponsables.map((corresponsable: CorresponsableData) => ({
      id: corresponsable._id,
      name: corresponsable.title || 'Unnamed',
      type: "corresponsable" as const,
      category: "Corresponsable",
      timestamp: formatDateSafe(corresponsable.timestamp),
    }));
    setLocalSources(updatedSources);
  }, [corresponsables]);

  // Account type options
  const accountTypeOptions = [
    { value: "premium", label: "Premium" },
    { value: "standard", label: "Standard" },
    { value: "basic", label: "Basic" }
  ]

  const getAccountTypeLabel = () => {
    const currentValue = watch('accountType')
    const found = accountTypeOptions.find(opt => opt.value === currentValue)
    return found ? found.label : "Select account type"
  }

  const handleAddClick = () => {
    // Clear any existing edit state when adding new
    setLocalEditCorresponsable(null);
    // Reset form to default values
    form.reset({
      clientName: "",
      email: "",
      listenerType: "whatsapp",
      whatsapp: "",
      telegramToken: "",
      accountType: "basic",
      invitationMethods: {
        whatsapp: false,
        telegram: false,
        email: false,
        copyLink: false,
      },
    });
    setShowForm(true);
  };

  const headerActions = [
    { icon: <Eye className="h-4 w-4" />, label: tForm('header.viewFullList'), ariaLabel: tForm('header.viewFullList'), onClick: () => router.push(`/clients/${folderId}/corresponsables`), variant: "soft" as const },
    { icon: <Download className="h-4 w-4" />, label: tForm('header.uploadCSV'), ariaLabel: tForm('header.uploadCSV'), onClick: () => {}, variant: "soft" as const },
    { icon: <Plus className="h-4 w-4" />, label: tForm('header.add'), ariaLabel: tForm('header.add'), onClick: handleAddClick, variant: "soft" as const },
  ]

  const headerActionsPlain: { label: string; onClick?: () => void }[] = []

  const handleCancel = () => {
    form.reset({
      clientName: "",
      email: "",
      listenerType: "whatsapp",
      whatsapp: "",
      telegramToken: "",
      accountType: "basic",
      invitationMethods: {
        whatsapp: false,
        telegram: false,
        email: false,
        copyLink: false,
      },
    })
    setShowForm(false)
    setLocalEditCorresponsable(null) // Clear edit state on cancel
    
    // Always close drawer on cancel
    if (onClose) {
      onClose()
    }
  }

  // Form submission handler that matches the client form
  const handleCorrespondentSubmission = async (data: CorresponsableFormData) => {
    if (!folderId) {
      toast.error('No folder selected')
      return
    }

    try {
      if (isEditMode && currentEditCorresponsable) {
        // Edit mode - update existing corresponsable
        console.log('Updating corresponsable with data:', {
          listenerId: currentEditCorresponsable._id,
          title: data.clientName,
          email: data.email,
          origin: data.whatsapp
        });

        await updateCorresponsable({
          listenerId: currentEditCorresponsable._id,
          data: {
            title: (data.clientName && data.clientName.trim()) ? data.clientName.trim() : null, // Send null explicitly to remove title (backend requires null, not undefined)
            enabled: true,
            email: data.email || ""
            // Note: origin is intentionally NOT editable for security reasons (matches client form)
          }
        });

        // Success toast is handled by the mutation
        onSubmit?.(data);
        
        // Clear form and close
        form.reset({
          clientName: "",
          email: "",
          listenerType: "whatsapp",
          whatsapp: "",
          telegramToken: "",
          accountType: "basic",
          invitationMethods: {
            whatsapp: false,
            telegram: false,
            email: false,
            copyLink: false,
          },
        });
        setLocalEditCorresponsable(null); // Clear local edit state
        setShowForm(false);
        
        // Close drawer on successful update
        if (onClose) {
          onClose()
        }
      } else {
        // Create mode
        console.log('Creating corresponsable with data:', {
          clientName: data.clientName,
          email: data.email,
          whatsapp: data.whatsapp,
          accountType: data.accountType,
          telegramToken: data.telegramToken ? 'TOKEN_PROVIDED' : 'NO_TOKEN',
        });
        
        const result = await createCorresponsableWithSharing({
          folderId,
          data: {
            clientName: data.clientName?.trim() || "",
            email: data.email || "",
            listenerType: data.listenerType,
            whatsapp: data.whatsapp || "",
            telegramToken: data.telegramToken || "",
            accountType: data.accountType
          }
        });

        if (result) {
          const { shareUrl, sharingError } = result;
          
          if (sharingError) {
            toast.error(`Corresponsable created but sharing failed: ${sharingError}`);
          }

          // Success toast is handled by the mutation hook, don't show duplicate
          
          // Show sharing dialog if share URL is available
          if (shareUrl) {
            setShareDialogData({
              shareUrl,
              clientName: (data.clientName?.trim() || 'Unnamed') as string,
              email: data.email,
              listenerType: data.listenerType
            });
            setShowShareDialog(true);
          }
          
          // Add to local sources for immediate UI update
          const newItem: SourceItem = {
            id: Date.now(), // Temporary ID for UI
            name: data.clientName?.trim() || 'Unnamed',
            type: "text",
            category: "Corresponsable",
            timestamp: "Just now",
          }
          setLocalSources([...localSources, newItem])
          onSubmit?.(data)
          // Clear form and errors
          form.reset({
            clientName: "",
            email: "",
            listenerType: "whatsapp",
            whatsapp: "",
            telegramToken: "",
            accountType: "basic",
          })
          setShowForm(false)
        }
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} corresponsable:`, error);
      // No error toast for updates - success toast is handled by mutation hook
      // Only show error toast for create mode if needed
      if (!isEditMode) {
        toast.error(`Failed to create corresponsable`);
      }
    }
  }

  const handleAdd = handleSubmit(
    async (data) => {
      // Clear any clientName errors before submission since it's optional
      form.clearErrors('clientName')
      console.log('Form validation passed, data:', data)
      console.log('Current form values:', form.getValues())
      console.log('Current form errors:', form.formState.errors)
      console.log('Is Edit Mode:', isEditMode)
      console.log('Edit Corresponsable:', editCorresponsable)
      await handleCorrespondentSubmission(data)
    },
    (errors) => {
      console.log('Form validation failed, errors:', errors)
      console.log('Current form values:', form.getValues())
      // Immediately clear clientName errors to prevent any toast/UI display
      // This must happen before any toast logic
      form.clearErrors('clientName')
      // Remove clientName from errors object for processing (intentionally unused)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { clientName, ...requiredErrors } = errors
      // No error toasts for updates - only log for debugging
      // For create mode, we can show errors, but for edit mode, suppress all validation error toasts
      if (!isEditMode && Object.keys(requiredErrors).length > 0) {
        toast.error('Please fill in all required fields')
      }
      // clientName errors are completely ignored - no toast, no UI display, no validation
      // Schema already makes clientName optional, so errors should not appear
    }
  )

  // loading state
  if (isLoading) {
    return (
      <div>
        <HeaderControls title={tMain('title')} actions={headerActionsPlain} />
        <div className="bg-white rounded-lg p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 mb-2">{tForm('loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  // error state
  if (error) {
    return (
      <div>
        <HeaderControls title={tMain('title')} actions={headerActionsPlain} />
        <div className="bg-white rounded-lg p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-lg flex items-center justify-center">
              <Users className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-red-500 mb-2">{tForm('error')}</p>
            <p className="text-sm text-gray-400 mb-6">{error.message || 'Please try again later'}</p>
          </div>
        </div>
      </div>
    )
  }

  const handleEditFromList = (id: number | string) => {
    console.log('🟣 handleEditFromList called with id:', id);
    // Find the corresponsable by id
    const corresponsable = corresponsables.find((c: CorresponsableData) => c._id === String(id));
    console.log('🟣 Found corresponsable:', corresponsable);
    if (corresponsable) {
      // Set local edit state to trigger edit mode
      setLocalEditCorresponsable(corresponsable);
      setShowForm(true); // Ensure form is shown when editing from list
      console.log('🟣 localEditCorresponsable state updated, showForm set to true');
    }
  };

  const handleDeleteFromList = async (id: number | string) => {
    console.log('🟣 handleDeleteFromList called with id:', id);
    
    if (!folderId) {
      toast.error('No folder selected');
      return;
    }
    
    try {
      // The id is the listener _id
      await removeCorresponsable({
        listenerId: String(id),
        folderId
      });
      
      console.log('🟣 Corresponsable deleted successfully');
      // Update local sources to reflect the deletion immediately
      setLocalSources(prevSources => prevSources.filter(source => source.id !== id));
    } catch (error) {
      console.error('🟣 Error deleting corresponsable:', error);
      // Error toast is already shown by the mutation
    }
  };

  // list view
  if (localSources.length > 0 && !showForm) {
    return (
      <div className="h-full flex flex-col">
  <HeaderControls title={tMain('title')} actions={headerActions} />
        <div className="bg-white rounded-lg p-6 flex-1 overflow-hidden">
          <SourcesList sources={localSources} pageType="corresponsables" onEdit={handleEditFromList} onDelete={handleDeleteFromList} />
        </div>
      </div>
    )
  }

  // empty state
  if (!showForm && localSources.length === 0) {
    return (
      <>
  <HeaderControls title={tMain('title')} actions={headerActionsPlain} />
        <div className="bg-white rounded-lg p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">{tForm('empty.title')}</p>
            <p className="text-sm text-gray-400 mb-6">{tForm('empty.subtitle')}</p>
            <Button onClick={() => setShowForm(true)} className="bg-[#f7f9ff] hover:bg-gray-50 text-[#31499f] rounded-full inline-flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>{tForm('empty.addButton')}</span>
            </Button>
          </div>
        </div>
      </>
    )
  }

  // form view
  return (
    <div className="space-y-6 h-full flex flex-col">
  <HeaderControls title={tMain('title')} actions={headerActionsPlain } />
  <div className="flex-1 overflow-y-auto">

      <div className="bg-white rounded-lg p-3 border border-gray-100">
    <p className=" pb-1 mb-1  font-semibold">{tForm('form.title')}</p>
        {/* Mobile & medium simplified layout */}
        <div className="lg:hidden space-y-4">
          <div>
            <label className="text-sm text-gray-700 mb-1 block">Client Name</label>
            <input 
              {...register('clientName')}
              className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-3" 
            />
            {/* clientName is optional - no error display, validation completely skipped */}
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Email</label>
            <input 
              type="email"
              {...register('email')}
              className={`w-full bg-gray-50 border rounded px-3 py-3 ${errors.email ? 'border-red-500' : 'border-gray-200'}`} 
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-2 block">Connection Type</label>
            <div className="flex gap-4 mb-3">
              <label className="inline-flex items-center space-x-2">
                <input
                  type="radio"
                  {...register('listenerType')}
                  value="whatsapp"
                  className="h-4 w-4 text-[#31499f]"
                />
                <span className="text-sm">WhatsApp</span>
              </label>
              <label className="inline-flex items-center space-x-2">
                <input
                  type="radio"
                  {...register('listenerType')}
                  value="telegram"
                  className="h-4 w-4 text-[#31499f]"
                />
                <span className="text-sm">Telegram</span>
              </label>
            </div>
            {errors.listenerType && <p className="text-red-500 text-xs mt-1">{errors.listenerType.message}</p>}
          </div>

          {watch('listenerType') === 'whatsapp' && (
            <div>
              <label className="text-sm text-gray-700 mb-1 block">WhatsApp Number</label>
              <input 
                {...register('whatsapp')}
                className={`w-full bg-gray-50 border rounded px-3 py-3 ${errors.whatsapp ? 'border-red-500' : 'border-gray-200'}`} 
              />
              {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp.message}</p>}
            </div>
          )}

          {watch('listenerType') === 'telegram' && (
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Telegram Bot Token</label>
              <input 
                {...register('telegramToken')}
                type="password"
                className={`w-full bg-gray-50 border rounded px-3 py-3 ${errors.telegramToken ? 'border-red-500' : 'border-gray-200'}`} 
                placeholder="Enter bot token"
              />
              {errors.telegramToken && <p className="text-red-500 text-xs mt-1">{errors.telegramToken.message}</p>}
            </div>
          )}

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Account Type</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full bg-gray-50 border rounded px-3 py-3 text-sm justify-between ${
                    errors.accountType ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  {getAccountTypeLabel()}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[200px]">
                {accountTypeOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setValue('accountType', option.value as "premium" | "standard" | "basic")}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {errors.accountType && <p className="text-red-500 text-xs mt-1">{errors.accountType.message}</p>}
          </div>
        </div>

        {/* Desktop / large screens: two-column layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Client Name</label>
              <input 
                {...register('clientName')}
                className="w-full bg-[#f7f9ff] border border-gray-200 rounded px-3 py-2" 
              />
              {/* clientName is optional - no error display, validation completely skipped */}
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Email</label>
              <input 
                type="email"
                {...register('email')}
                className={`w-full bg-[#f7f9ff] border rounded px-3 py-2 ${errors.email ? 'border-red-500' : 'border-gray-200'}`} 
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-2 block">Connection Type</label>
              <div className="flex gap-4 mb-3">
                <label className="inline-flex items-center space-x-2">
                  <input
                    type="radio"
                    {...register('listenerType')}
                    value="whatsapp"
                    className="h-4 w-4 text-[#31499f]"
                  />
                  <span className="text-sm">WhatsApp</span>
                </label>
                <label className="inline-flex items-center space-x-2">
                  <input
                    type="radio"
                    {...register('listenerType')}
                    value="telegram"
                    className="h-4 w-4 text-[#31499f]"
                  />
                  <span className="text-sm">Telegram</span>
                </label>
              </div>
              {errors.listenerType && <p className="text-red-500 text-xs mt-1">{errors.listenerType.message}</p>}
            </div>

            {watch('listenerType') === 'whatsapp' && (
              <div>
                <label className="text-sm text-gray-700 mb-1 block">WhatsApp Number</label>
                <input 
                  {...register('whatsapp')}
                  className={`w-full bg-[#f7f9ff] border rounded px-3 py-2 ${errors.whatsapp ? 'border-red-500' : 'border-gray-200'}`} 
                />
                {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp.message}</p>}
              </div>
            )}

            {watch('listenerType') === 'telegram' && (
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Telegram Bot Token</label>
                <input 
                  {...register('telegramToken')}
                  type="password"
                  className={`w-full bg-[#f7f9ff] border rounded px-3 py-2 ${errors.telegramToken ? 'border-red-500' : 'border-gray-200'}`} 
                  placeholder="Enter bot token"
                />
                {errors.telegramToken && <p className="text-red-500 text-xs mt-1">{errors.telegramToken.message}</p>}
              </div>
            )}

            <div>
              <label className="text-sm text-gray-700 mb-1 block">Account Type</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full bg-[#f7f9ff] border rounded px-2 py-2 text-sm justify-between ${
                      errors.accountType ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    {getAccountTypeLabel()}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full min-w-[200px]">
                  {accountTypeOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setValue('accountType', option.value as "premium" | "standard" | "basic")}
                      className="cursor-pointer"
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {errors.accountType && <p className="text-red-500 text-xs mt-1">{errors.accountType.message}</p>}
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 m-1 lg:m-3 bg-white sm:bg-transparent rounded-lg  shadow-md sm:shadow-none">
                           <div className="pt-2 flex justify-end gap-3 mb-2 mr-2">
                             <Button onClick={handleCancel} disabled={isUpdating || isCreatingWithSharing} className="px-4 bg-[#f7f9ff] text-[#31499f] rounded-full hover:bg-[#e0e7ff]">{tForm('form.cancel')}</Button>
                             <Button onClick={handleAdd} disabled={isUpdating || isCreatingWithSharing} className="bg-[#31499f] hover:bg-blue-700 text-white rounded-full px-4">
                               {isUpdating ? 'Updating...' : isCreatingWithSharing ? 'Creating...' : (isEditMode ? 'Update Corresponsable' : tForm('form.addButton'))}
                             </Button>
                           </div>
                         </div>
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
  )
}
