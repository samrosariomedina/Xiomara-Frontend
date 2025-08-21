"use client"

import { useState } from "react"
import { Plus, Download, Eye, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import HeaderControls from "./header-controls"
import SourcesList, { SourceItem } from "./sources-list"
import { useTranslations } from 'next-intl'

interface FormData {
  name: string
  whatsapp: string
  other: string
  accountType: string
  invitationMethods: {
    whatsapp: boolean
    email: boolean
    copyLink: boolean
  }
}

interface CorresponsalesFormProps {
  onSubmit?: (data: FormData) => void
}

export function CorresponsalesForm({ onSubmit }: CorresponsalesFormProps) {
  const [showForm, setShowForm] = useState(false)
  const [sources, setSources] = useState<SourceItem[]>([])
  const [form, setForm] = useState<FormData>({
    name: "",
    whatsapp: "",
    other: "",
    accountType: "",
    invitationMethods: {
      whatsapp: false,
      email: false,
      copyLink: false,
    },
  })

  const tForm = useTranslations('CORRESPONSABLES_FORM')
  const tMain = useTranslations('CORRESPONSABLES')

  const headerActions = [
    { icon: <Eye className="h-4 w-4" />, label: tForm('header.viewFullList'), ariaLabel: tForm('header.viewFullList'), onClick: () => {}, variant: "soft" as const },
    { icon: <Download className="h-4 w-4" />, label: tForm('header.uploadCSV'), ariaLabel: tForm('header.uploadCSV'), onClick: () => {}, variant: "soft" as const },
    { icon: <Plus className="h-4 w-4" />, label: tForm('header.add'), ariaLabel: tForm('header.add'), onClick: () => setShowForm(true), variant: "soft" as const },
  ]

  const headerActionsPlain: { label: string; onClick?: () => void }[] = []

  const handleCancel = () => {
  setForm({ name: "", whatsapp: "", other: "", accountType: "", invitationMethods: { whatsapp: false, email: false, copyLink: false } })
    setShowForm(false)
  }

  const handleAdd = () => {
    const id = sources.length + 1
    const newItem: SourceItem = {
      id,
      name: form.name || "Nombre",
      type: "image",
      category: "Marketing",
      timestamp: "20min",
    }
    setSources([...sources, newItem])
  onSubmit?.(form)
  setForm({ name: "", whatsapp: "", other: "", accountType: "", invitationMethods: { whatsapp: false, email: false, copyLink: false } })
    setShowForm(false)
  }

  // list view
  if (sources.length > 0 && !showForm) {
    return (
      <div>
  <HeaderControls title={tMain('title')} actions={headerActions} />
        <div className="bg-white rounded-lg p-6">
          <SourcesList sources={sources} onKebabClick={(id) => console.log("kebab", id)} />
        </div>
      </div>
    )
  }

  // empty state
  if (!showForm && sources.length === 0) {
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
    <div className="space-y-6">
  <HeaderControls title={"Corresponsales"} actions={headerActionsPlain } />

      <div className="bg-white rounded-lg p-3 border border-gray-100">
        <p className=" pb-1 mb-1  font-semibold">Agregar Nuveo</p>
        {/* Mobile & medium simplified layout */}
        <div className="lg:hidden space-y-4">
          <div>
            <label className="text-sm text-gray-700 mb-1 block">{tForm('form.clientName')}</label>
            <input className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-3" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">{tForm('form.whatsapp')}</label>
            <input className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-3" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">{tForm('form.other')}</label>
            <input className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-3" value={form.other} onChange={(e) => setForm({ ...form, other: e.target.value })} />
          </div>

          <div>
      <label className="text-sm text-gray-700 mb-1 block">{tForm('form.accountType')}</label>
            <Select onValueChange={(value) => setForm({ ...form, accountType: value })} defaultValue={form.accountType}>
              <SelectTrigger className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-3 text-sm">
        <SelectValue placeholder={tForm('form.selectPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
        <SelectItem value="admin">{tForm('form.accountTypes.admin')}</SelectItem>
        <SelectItem value="user">{tForm('form.accountTypes.user')}</SelectItem>
        <SelectItem value="guest">{tForm('form.accountTypes.guest')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">{tForm('form.invitationMethodsTitle')}</div>
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center space-x-2">
                <Checkbox
                  id="whatsapp"
                  checked={form.invitationMethods.whatsapp}
                  onCheckedChange={(checked) => setForm({ ...form, invitationMethods: { ...form.invitationMethods, whatsapp: !!checked } })}
                  className="border-gray-300 h-4 w-4"
                />
                <span className="text-sm">{tForm('form.sendWhatsapp')}</span>
              </label>

              <label className="inline-flex items-center space-x-2">
                <Checkbox
                  id="email"
                  checked={form.invitationMethods.email}
                  onCheckedChange={(checked) => setForm({ ...form, invitationMethods: { ...form.invitationMethods, email: !!checked } })}
                  className="border-gray-300 h-4 w-4"
                />
                <span className="text-sm">{tForm('form.sendEmail')}</span>
              </label>

              <label className="inline-flex items-center space-x-2">
                <Checkbox
                  id="copyLink"
                  checked={form.invitationMethods.copyLink}
                  onCheckedChange={(checked) => setForm({ ...form, invitationMethods: { ...form.invitationMethods, copyLink: !!checked } })}
                  className="border-gray-300 h-4 w-4"
                />
                <span className="text-sm">{tForm('form.copyLink')}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Desktop / large screens: two-column layout (unchanged) */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700 mb-1 block">{tForm('form.clientName')}</label>
              <input className="w-full bg-[#f7f9ff] border border-gray-200 rounded px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">{tForm('form.whatsapp')}</label>
              <input className="w-full bg-[#f7f9ff] border border-gray-200 rounded px-3 py-2" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            </div>

            <div>
        <label className="text-sm text-gray-700 mb-1 block">{tForm('form.other')}</label>
              <input className="w-full bg-[#f7f9ff] border border-gray-200 rounded px-3 py-2" value={form.other} onChange={(e) => setForm({ ...form, other: e.target.value })} />
            </div>
            <div>
        <label className="text-sm text-gray-700 mb-1 block">{tForm('form.accountType')}</label>
              <Select onValueChange={(value) => setForm({ ...form, accountType: value })} defaultValue={form.accountType}>
                <SelectTrigger className="w-full  bg-[#f7f9ff] border border-gray-200 rounded  px-2 py-2 text-sm">
          <SelectValue placeholder={tForm('form.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
          <SelectItem value="admin">{tForm('form.accountTypes.admin')}</SelectItem>
          <SelectItem value="user">{tForm('form.accountTypes.user')}</SelectItem>
          <SelectItem value="guest">{tForm('form.accountTypes.guest')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 mt-2">
              <div className="text-sm text-gray-600 mb-2">{tForm('form.invitationMethodsTitle')}</div>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center  space-x-2">
                  <Checkbox
                    id="whatsapp-d"
                    checked={form.invitationMethods.whatsapp}
                    onCheckedChange={(checked) => setForm({ ...form, invitationMethods: { ...form.invitationMethods, whatsapp: !!checked } })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{tForm('form.sendWhatsapp')}</span>
                </label>

                <label className="inline-flex items-center space-x-2">
                  <Checkbox
                    id="email-d"
                    checked={form.invitationMethods.email}
                    onCheckedChange={(checked) => setForm({ ...form, invitationMethods: { ...form.invitationMethods, email: !!checked } })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{tForm('form.sendEmail')}</span>
                </label>

                <label className="inline-flex items-center space-x-2">
                  <Checkbox
                    id="copyLink-d"
                    checked={form.invitationMethods.copyLink}
                    onCheckedChange={(checked) => setForm({ ...form, invitationMethods: { ...form.invitationMethods, copyLink: !!checked } })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{tForm('form.copyLink')}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 m-1 lg:m-3 bg-white sm:bg-transparent rounded-lg  shadow-md sm:shadow-none">
                           <div className="pt-2 flex justify-end gap-3 mb-2 mr-2">
                             <Button onClick={handleCancel} className="px-4 bg-[#f7f9ff] text-[#31499f] rounded-full hover:bg-[#e0e7ff]">Cancelar</Button>
                             <Button onClick={handleAdd} className="bg-[#31499f] hover:bg-blue-700 text-white rounded-full px-4">Agregar Fuentes</Button>
                           </div>
                         </div>
    </div>
  )
}
