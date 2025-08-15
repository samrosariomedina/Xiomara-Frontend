"use client"

/*
  dashboard-Corresspondable.tsx

  Purpose:
  - Renders the "Corresponsables" card used on the dashboard. Shows two tabs (Usuarios / Fuentes).
  - The current implementation renders the "Usuarios" list only. Each user row includes:
    - a checkbox, avatar, name, sources count (with globe icon), status badge, timestamp and actions menu.

  How to use / edit:
  - Top-level styles: edit the className on the <Card> element.
  - Header: edit the left title and the "Ver todos" Button in the header block.
  - Tabs: update the two tab button classNames to change active/inactive appearances.
  - Toolbar (filter + create): update the left (checkbox/dropdown) and right (create button) markup inside the toolbar block.
  - User rows: each row is a horizontal flex container. To change spacing / border / card appearance update classes in the row container.
  - Badge colors: conditional classes are applied to the <Badge> element. Change the color tokens there to update approved/pending styles.
  - Accessibility: ensure the Checkbox components receive proper labels if you change structure.

  Data shape (corresponsables):
  {
    id: number,
    name: string,
    avatar: string (path to image),
    status: "Aprobado" | "Pendiente",
    sources: number,
    time: string
  }

  UI change hints (quick map to classNames to edit):
  - Card container: <Card className="...">  <-- controls card background / border / shadow
  - Header title: <h2 className="text-base font-medium">  <-- font sizes/weights
  - Tabs: the two <button> elements with px-6 py-3  <-- active tab uses "text-blue-600 border-b-2 border-blue-600"
  - Toolbar checkbox + dropdown: Checkbox + <ChevronDown /> near top-left of list
  - Create button: Button variant="outline" className="... text-blue-600 border-blue-600"
  - User row container: <div className="flex items-center justify-between py-1"> <-- spacing between columns
  - Avatar: <Image ... className="w-8 h-8 rounded-full mr-3" />
  - Name + sources block: adjust text classes inside the nested <div>
  - Status Badge: <Badge className={`px-2 py-1 text-xs font-medium ...`}>

  If you want me to apply a specific visual tweak (colors, spacing, borders, hover states), tell me which element and the exact target style and I will change classNames accordingly.
*/

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, MoreVertical, Globe, ChevronDown, ChevronUp, LucideImage } from "lucide-react"
import { useState } from "react"
import { useTranslations } from 'next-intl'
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"

// Mock data used for the list. Replace with real data or props when wiring to API.
const corresponsables = [
  { id: 1, name: "Ana López", avatar: "/avatar.svg", status: "Aprobado", sources: 4, time: "3 mins" },
  { id: 2, name: "Carlos Ruiz", avatar: "/avatar.svg", status: "Pendiente", sources: 1, time: "10 mins" },
  { id: 3, name: "María Gómez", avatar: "/avatar.svg", status: "Aprobado", sources: 6, time: "15 mins" },
  { id: 4, name: "Luis Fernández", avatar: "/avatar.svg", status: "Aprobado", sources: 3, time: "20 mins" },
  { id: 5, name: "Sofía Martínez", avatar: "/avatar.svg", status: "Aprobado", sources: 2, time: "30 mins" },
  { id: 6, name: "Jorge Díaz", avatar: "/avatar.svg", status: "Aprobado", sources: 5, time: "45 mins" },
  { id: 7, name: "Lucía Pérez", avatar: "/avatar.svg", status: "Pendiente", sources: 2, time: "1 hr" },
  { id: 8, name: "Andrés Soto", avatar: "/avatar.svg", status: "Aprobado", sources: 7, time: "2 hrs" },
  { id: 9, name: "Valentina Rivas", avatar: "/avatar.svg", status: "Aprobado", sources: 3, time: "3 hrs" },
  { id: 10, name: "Miguel Torres", avatar: "/avatar.svg", status: "Pendiente", sources: 1, time: "6 hrs" },
  { id: 11, name: "Clara Navarro", avatar: "/avatar.svg", status: "Aprobado", sources: 4, time: "1 day" },
  { id: 12, name: "Diego Herrera", avatar: "/avatar.svg", status: "Aprobado", sources: 2, time: "2 days" },
]
export function CorresponsablesSection() {
  const [activeTab, setActiveTab] = useState("usuarios")
  const [isExpanded, setIsExpanded] = useState(false)
  // translations scoped to messages/CORRESPONSABLES
  const t = useTranslations('CORRESPONSABLES')

  return (
  <Card className="bg-white border border-gray-200 shadow-sm flex flex-col overflow-hidden max-h-[70vh] md:max-h-[60vh] lg:h-[600px] lg:max-h-none">
      {/* Header: title + "Ver todos" link
          - Edit title styles here if you want different size/weight
      */}
      <div className="px-5 sm:px-6 py-5 sm:py-2 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-md font-semibold text-gray-900">{t('title')}</h3>
        <div className="flex items-center">
          {/* "Ver todos" link on desktop - hidden on mobile */}
          <Button variant="link" className="hidden sm:block text-blue-900 text-sm p-0 h-auto font-medium underline">
            {t('viewAll')}
          </Button>
          {/* Mobile dropdown toggle button */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="sm:hidden text-gray-500 hover:text-gray-700 ml-2"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      </div>

      {/* Tabs
          - Change active/inactive tab appearance by editing classes below
          - Active tab currently uses text-blue-600 + border-b-2
          - Only shown on desktop or when expanded on mobile
      */}
      <div className={`border-b border-gray-200 ${!isExpanded ? 'hidden sm:block' : 'block'}`}>
        {/* Make tabs take equal width: each button gets flex-1 and centered text */}
        <div className="flex w-full">
          <button
            onClick={() => setActiveTab("usuarios")}
            role="tab"
            aria-selected={activeTab === "usuarios"}
            className={`flex-1 text-center mx-1 py-3 text-sm font-medium ${
              activeTab === "usuarios"
                ? "text-blue-800 border-b-2 border-blue-900"
                : "text-gray-600"
            }`}
          >
            {t('tabs.usuarios')}
          </button>
          <button
            onClick={() => setActiveTab("fuentes")}
            role="tab"
            aria-selected={activeTab === "fuentes"}
            className={`flex-1 text-center  mx-1 py-3 text-sm font-medium ${
              activeTab === "fuentes"
                ? "text-blue-800 border-b-2 border-blue-900"
                : "text-gray-600"
            }`}
          >
            {t('tabs.fuentes')}
          </button>
        </div>
      </div>

  {/* Scrollable content area (keeps card height consistent; contents scroll). Added hide-scrollbar to keep scroll functional but hide native scrollbars. */}
  <div className="flex-1 overflow-y-auto hide-scrollbar">
  {/* Content for the active tab - only visible on desktop or when expanded on mobile */}
      {activeTab === "usuarios" ? (
        <div className={`p-4 pt-0 ${!isExpanded ? 'hidden sm:block' : 'block'}`}>
          {/* Toolbar: left = select / dropdown, right = create button
              - To change the dropdown look: update Checkbox + ChevronDown classes
              - To change Create button: edit Button variant/classes
          */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              {/* Select all checkbox - if you add selection logic wire it to state */}
              <Checkbox id="select-all" className="mr-2 h-4 w-4 rounded border-gray-300" />
              {/* This ChevronDown is a visual dropdown icon in the original design */}
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
            {/* Create Corresponsal button - update color/size here */}
            <Button
              variant="outline"
              className="h-8 px-3 py-1 text-sm font-normal text-[#31499F] flex items-center gap-1 rounded-full bg-[#F7F9FF]"
            >
              <Plus className="h-4 w-4" />
              {t('create')}
            </Button>
          </div>

          {/* List of users - edit row spacing and border here
              Each row structure:
                [Checkbox] [Avatar] [Name + sources]    [Badge] [time] [more]
          */}
          <div className="space-y-4">
            {corresponsables.map((person) => (
              <div key={person.id} className="flex items-center justify-between py-1">
                {/* Left column: checkbox + avatar + name + sources */}
                <div className="flex items-center space-x-3">
                  {/* Individual row checkbox - wire to selection state if needed */}
                  <Checkbox id={`person-${person.id}`} className="h-4 w-4 rounded border-gray-300" />
                  <div className="flex items-center">
                    {/* Avatar - using next/image for optimization. To change size, adjust width/height and the className */}
                    <Image
                      src={person.avatar}
                      alt={person.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <div>
                      {/* Name text - change font sizes/weights here */}
                      <p className="text-sm font-medium">{person.name}</p>
                      {/* Sources row: globe icon + number. To change color or spacing edit classes below */}
                      <div className="inline-flex bg-[#F7F9FF]  items-center text-xs text-blue-900 w-auto p-1">
                        <Globe className="h-3.5 w-3.5 mr-1" />
                        <span>{person.sources}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column: status (stacked) + actions
                    - Badge appears above the timestamp (vertical stack)
                    - Actions button sits to the right of the stack
                */}
                <div className="flex items-center space-x-6 ">
                  {/* Vertical stack: badge on top, time below */}
                  <div className="flex flex-col items-center">
                    <Badge
                      className={`px-2 py-1 text-xs font-medium ${
                        person.status === "Aprobado"
                          ? "bg-[#74DEA4] text-[#192038]"
                          : "bg-[#E9C45E] text-[#192038]"
                      }`}
                    >
                      {person.status === 'Aprobado' ? t('status.approved') : t('status.pending')}
                    </Badge>
                    <span className="text-xs text-gray-500 mt-1 text-center">{person.time}</span>
                  </div>

                  {/* Actions menu button */}
                  <button className="text-gray-500">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* "Fuentes" Tab Content - based on the image */
        <div className={`p-4 pt-0 ${!isExpanded ? 'hidden sm:block' : 'block'}`}>
          {/* Toolbar: left = select / dropdown */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              {/* Select all checkbox - if you add selection logic wire it to state */}
              <Checkbox id="select-all-fuentes" className="mr-2 h-4 w-4 rounded border-gray-300" />
              {/* This ChevronDown is a visual dropdown icon in the original design */}
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* List of campaign images/sources - matches the image layout */}
          <div className="space-y-4">
            {/* Create mock data for campaign sources based on image */}
            {[1, 2, 3, 4, 5,6,7,8,9,10,11,12].map((id) => (
              <div key={id} className="flex flex-col py-1">
                {/* Top row: content + timestamp + actions */}
                <div className="flex justify-between w-full">
                  {/* Left side: checkbox + image icon + name */}
                  <div className="flex items-center space-x-3">
                    {/* Individual row checkbox */}
                    <Checkbox id={`fuente-${id}`} className="h-4 w-4 rounded border-gray-300" />
                    <div className="flex items-center">
                      {/* Image icon - using a document/file icon as placeholder */}
                      <div className="flex items-center justify-center w-8 h-8 rounded-md mr-3 bg-gray-100">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.5 1H3C2.46957 1 1.96086 1.21071 1.58579 1.58579C1.21071 1.96086 1 2.46957 1 3V13C1 13.5304 1.21071 14.0391 1.58579 14.4142C1.96086 14.7893 2.46957 15 3 15H13C13.5304 15 14.0391 14.7893 14.4142 14.4142C14.7893 14.0391 15 13.5304 15 13V7.5L8.5 1Z" stroke="#64748B" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 1V8H15" stroke="#64748B" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                      <p className="block text-sm font-medium">Imagen de campaña publicitaria</p>
                      <div className="flex  ">
                        {/* Campaign name - matches text in image */}
                        
                        {/* Image label - small text below name */}
                        <LucideImage className="h-3 w-3 mt-[2px]"/>
                        <p className="ml-1 text-xs text-gray-500">{t('fuentes.imageLabel')}</p>
                      </div>
                      </div>
                    </div>
                  </div>

                  {/* Right side: timestamp + action button */}
                  <div className="flex items-center">
                    {/* Timestamp as in image */}
                    <span className="text-xs text-gray-500 mr-2">3 mins</span>
                    
                    {/* Action menu button */}
                    <button className="text-gray-500">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Bottom row: Empty left, "Add to campaign" link right */}
                <div className="flex justify-end mt-2">
                  {/* "Agregar a campaña" link - blue text link as shown in image */}
                  <a href="#" className="text-xs text-[#31499F] underline whitespace-nowrap">
                    {t('fuentes.addToCampaign')}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  {/* Mobile "Ver todos" link at bottom (only when expanded) */}
  {isExpanded && (
    <div className="sm:hidden px-4 text-center border-t border-gray-100">
      <Button variant="link" className="text-blue-600 text-sm p-0">
        {t('viewAll')}
      </Button>
    </div>
  )}
    </Card>
  )
}
