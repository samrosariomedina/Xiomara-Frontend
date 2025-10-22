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
import { Checkbox } from "@/components/ui/checkbox"
import HeaderControls from "../ui/formsHeader-dashboard"
import SourcesList, { SourceItem } from "../ui/formsLists-dashboard"
import { useTranslations } from 'next-intl'
import { corresponsablesSchema, type CorresponsablesInput } from '@/lib/schemas'
import { useCorresponsables } from "@/hooks/useCorresponsables"
import { useClient } from "@/context/ClientContext"
import { formatDateSafe } from "@/lib/utils"
import { useRouter } from 'next/navigation'
import { useSharing } from "@/hooks/useSharing"
import { createCorresponsableWithSharingAction } from "@/actions/corresponsables"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

interface CorresponsableData {
  _id: string;
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
}

export function CorresponsalesForm({ onSubmit }: CorresponsalesFormProps) {
  const [showForm, setShowForm] = useState(false)
  
  // Use react-hook-form like the client form
  const form = useForm<CorresponsableFormData>({
    resolver: zodResolver(corresponsablesSchema),
    defaultValues: {
      clientName: "",
      email: "",
      whatsapp: "",
      accountType: "basic",
      telegramToken: "",
      invitationMethods: {
        whatsapp: false,
        telegram: false,
        email: false,
        copyLink: false,
      },
    },
    mode: "onSubmit"
  })
  
  const { register, setValue, formState: { errors }, watch, handleSubmit, clearErrors } = form

  const tForm = useTranslations('CORRESPONSABLES_FORM')
  const tMain = useTranslations('CORRESPONSABLES')
  const router = useRouter()
  const { executeSharing } = useSharing()

  // Clear errors when form is shown
  useEffect(() => {
    if (showForm) {
      clearErrors()
    }
  }, [showForm, clearErrors])
  
  // Get selected client from context
  const { selectedClient } = useClient()
  
  // Fetch corresponsables for the selected client
  const { 
    corresponsables = [], 
    isLoading, 
    error 
  } = useCorresponsables(selectedClient?._id)

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

  const headerActions = [
    { icon: <Eye className="h-4 w-4" />, label: tForm('header.viewFullList'), ariaLabel: tForm('header.viewFullList'), onClick: () => router.push('/clients/channels/corresponsables'), variant: "soft" as const },
    { icon: <Download className="h-4 w-4" />, label: tForm('header.uploadCSV'), ariaLabel: tForm('header.uploadCSV'), onClick: () => {}, variant: "soft" as const },
    { icon: <Plus className="h-4 w-4" />, label: tForm('header.add'), ariaLabel: tForm('header.add'), onClick: () => setShowForm(true), variant: "soft" as const },
  ]

  const headerActionsPlain: { label: string; onClick?: () => void }[] = []

  const handleCancel = () => {
    form.reset({
      clientName: "",
      email: "",
      whatsapp: "",
      accountType: "basic",
      telegramToken: "",
      invitationMethods: {
        whatsapp: false,
        telegram: false,
        email: false,
        copyLink: false,
      },
    })
    setShowForm(false)
  }

  // Form submission handler that matches the client form
  const handleCorrespondentSubmission = async (data: CorresponsableFormData) => {
    if (!selectedClient?._id) {
      toast.error('No client selected')
      return
    }

    try {
      console.log('Creating corresponsable with data:', {
        clientName: data.clientName,
        email: data.email,
        whatsapp: data.whatsapp,
        accountType: data.accountType,
        telegramToken: data.telegramToken ? 'TOKEN_PROVIDED' : 'NO_TOKEN',
        invitationMethods: data.invitationMethods
      });
      
      const result = await createCorresponsableWithSharingAction(selectedClient._id, {
        clientName: data.clientName,
        email: data.email || "",
        whatsapp: data.whatsapp,
        accountType: data.accountType,
        telegramToken: data.telegramToken,
        invitationMethods: data.invitationMethods
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
                email: data.email,
                clientName: data.clientName
              },
              invitationMethods
            );
          } else {
            toast.warning('Corresponsable created but sharing data unavailable');
          }
        }

        const listenerCount = listeners ? listeners.length : 1;
        const listenerText = listenerCount > 1 ? `${listenerCount} listeners` : 'listener';
        toast.success(`Corresponsable ${data.clientName} created successfully with ${listenerText}`);
        
        // Add to local sources for immediate UI update
        const newItem: SourceItem = {
          id: Date.now(), // Temporary ID for UI
          name: data.clientName,
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
          whatsapp: "",
          accountType: "basic",
          telegramToken: "",
          invitationMethods: {
            whatsapp: false,
            telegram: false,
            email: false,
            copyLink: false,
          },
        })
        setShowForm(false)
      } else {
        toast.error(result.error || 'Failed to create corresponsable');
      }
    } catch (error) {
      console.error('Error creating corresponsable:', error);
      toast.error('Failed to create corresponsable');
    }
  }

  const handleAdd = handleSubmit(
    (data) => {
      console.log('Form validation passed, data:', data)
      console.log('Current form values:', form.getValues())
      console.log('Current form errors:', form.formState.errors)
      handleCorrespondentSubmission(data)
    },
    (errors) => {
      console.log('Form validation failed, errors:', errors)
      console.log('Current form values:', form.getValues())
      // Clear any stale errors
      form.clearErrors()
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

  // list view
  if (localSources.length > 0 && !showForm) {
    return (
      <div className="h-full flex flex-col">
  <HeaderControls title={tMain('title')} actions={headerActions} />
        <div className="bg-white rounded-lg p-6 flex-1 overflow-hidden">
          <SourcesList sources={localSources} pageType="corresponsables" />
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
              className={`w-full bg-gray-50 border rounded px-3 py-3 ${errors.clientName ? 'border-red-500' : 'border-gray-200'}`} 
            />
            {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName.message}</p>}
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
            <label className="text-sm text-gray-700 mb-1 block">WhatsApp Number</label>
            <input 
              {...register('whatsapp')}
              className={`w-full bg-gray-50 border rounded px-3 py-3 ${errors.whatsapp ? 'border-red-500' : 'border-gray-200'}`} 
            />
            {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp.message}</p>}
          </div>

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

          <div>
            <div className="text-sm text-gray-600 mb-2">How do you want to send the invitation?</div>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center space-x-2">
                <Checkbox
                  id="whatsapp"
                  checked={watch('invitationMethods.whatsapp')}
                  onCheckedChange={(checked) => setValue('invitationMethods.whatsapp', !!checked)}
                  className="border-gray-300 h-4 w-4"
                />
                <span className="text-sm">Send via WhatsApp</span>
              </label>

              <label className="inline-flex items-center space-x-2">
                <Checkbox
                  id="telegram"
                  checked={watch('invitationMethods.telegram')}
                  onCheckedChange={(checked) => setValue('invitationMethods.telegram', !!checked)}
                  className="border-gray-300 h-4 w-4"
                />
                <span className="text-sm">Send via Telegram</span>
              </label>

              <label className="inline-flex items-center space-x-2">
                <Checkbox
                  id="email"
                  checked={watch('invitationMethods.email')}
                  onCheckedChange={(checked) => setValue('invitationMethods.email', !!checked)}
                  className="border-gray-300 h-4 w-4"
                />
                <span className="text-sm">Send via email</span>
              </label>

              <label className="inline-flex items-center space-x-2">
                <Checkbox
                  id="copyLink"
                  checked={watch('invitationMethods.copyLink')}
                  onCheckedChange={(checked) => setValue('invitationMethods.copyLink', !!checked)}
                  className="border-gray-300 h-4 w-4"
                />
                <span className="text-sm">Copy the link and share</span>
              </label>
            </div>
            {errors.invitationMethods && <p className="text-red-500 text-xs mt-1">{errors.invitationMethods.message}</p>}
          </div>
        </div>

        {/* Desktop / large screens: two-column layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Client Name</label>
              <input 
                {...register('clientName')}
                className={`w-full bg-[#f7f9ff] border rounded px-3 py-2 ${errors.clientName ? 'border-red-500' : 'border-gray-200'}`} 
              />
              {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName.message}</p>}
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
              <label className="text-sm text-gray-700 mb-1 block">WhatsApp Number</label>
              <input 
                {...register('whatsapp')}
                className={`w-full bg-[#f7f9ff] border rounded px-3 py-2 ${errors.whatsapp ? 'border-red-500' : 'border-gray-200'}`} 
              />
              {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp.message}</p>}
            </div>
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

            <div className="col-span-2 mt-2">
              <div className="text-sm text-gray-600 mb-2">How do you want to send the invitation?</div>
              <div className="flex items-center space-x-6">
                <label className="inline-flex items-center space-x-2">
                  <Checkbox
                    id="whatsapp-d"
                    checked={watch('invitationMethods.whatsapp')}
                    onCheckedChange={(checked) => setValue('invitationMethods.whatsapp', !!checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Send via WhatsApp</span>
                </label>

                <label className="inline-flex items-center space-x-2">
                  <Checkbox
                    id="telegram-d"
                    checked={watch('invitationMethods.telegram')}
                    onCheckedChange={(checked) => setValue('invitationMethods.telegram', !!checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Send via Telegram</span>
                </label>

                <label className="inline-flex items-center space-x-2">
                  <Checkbox
                    id="email-d"
                    checked={watch('invitationMethods.email')}
                    onCheckedChange={(checked) => setValue('invitationMethods.email', !!checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Send via email</span>
                </label>

                <label className="inline-flex items-center space-x-2">
                  <Checkbox
                    id="copyLink-d"
                    checked={watch('invitationMethods.copyLink')}
                    onCheckedChange={(checked) => setValue('invitationMethods.copyLink', !!checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Copy the link and share</span>
                </label>
              </div>
              {errors.invitationMethods && <p className="text-red-500 text-xs mt-1">{errors.invitationMethods.message}</p>}
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 m-1 lg:m-3 bg-white sm:bg-transparent rounded-lg  shadow-md sm:shadow-none">
                           <div className="pt-2 flex justify-end gap-3 mb-2 mr-2">
                             <Button onClick={handleCancel} className="px-4 bg-[#f7f9ff] text-[#31499f] rounded-full hover:bg-[#e0e7ff]">{tForm('form.cancel')}</Button>
                             <Button onClick={handleAdd} className="bg-[#31499f] hover:bg-blue-700 text-white rounded-full px-4">{tForm('form.addButton')}</Button>
                           </div>
                         </div>
  </div>
    </div>
  )
}
