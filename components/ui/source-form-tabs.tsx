"use client"

import { useState } from "react"
import { ChevronUp } from "lucide-react"

interface SourceFormTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  renderContent?: (tabId: string) => React.ReactNode
}

export function SourceFormTabs({ activeTab, onTabChange, renderContent }: SourceFormTabsProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([activeTab])
  
  const tabs = [
    { id: "fuentes-generales", label: "Fuente Generales" },
    { id: "corresponsales", label: "Corresponsales" },
    { id: "knowledge-base", label: "Knowledge Base" },
    { id: "media-listening", label: "Media Listening" },
  ]

  const toggleSection = (tabId: string) => {
    if (expandedSections.includes(tabId)) {
      setExpandedSections(expandedSections.filter(id => id !== tabId))
    } else {
      setExpandedSections([...expandedSections, tabId])
    }
    onTabChange(tabId)
  }

  return (
    <>
      {/* Mobile & Medium: Accordion Style - Matching the image design */}
      <div className="lg:hidden">
        {tabs.map((tab) => {
          const isExpanded = expandedSections.includes(tab.id)
          return (
            <div key={tab.id} className="mb-1 last:mb-0">
              <button
                onClick={() => toggleSection(tab.id)}
                className="w-full flex items-center justify-between px-4 py-4 text-left bg-gray-50 rounded-lg mb-4 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-900 text-base">{tab.label}</span>
                <ChevronUp 
                  className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              {isExpanded && (
                <div className="bg-white px-4 py-6">
                  {renderContent ? renderContent(tab.id) : (
                    <div className="text-sm text-gray-600">
                      Content for {tab.label}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop: Horizontal Tabs */}
      <div className="hidden lg:block border-b border-gray-200">
        <div className="flex w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-3 px-4 border-b-2 font-medium text-sm transition-colors text-center ${
                activeTab === tab.id
                  ? "border-[#31499F] text-[#31499F]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
