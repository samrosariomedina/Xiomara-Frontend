'use client'
import React from "react"

interface ClientFormTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  t: (key: string) => string
}

export const ClientFormTabs = React.memo(function ClientFormTabs({
  activeTab,
  onTabChange,
  t
}: ClientFormTabsProps) {
  const tabs = [
    { id: "general", label: t('tabs.general') },
    { id: "connect", label: t('tabs.connect') },
    { id: "brand", label: t('tabs.brand') }
  ] as const

  return (
    <div className="hidden md:block">
      <div className="flex space-x-8 border-b border-gray-200 justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pb-4 pt-3 text-xs font-medium transition-colors relative ${
              activeTab === tab.id 
                ? tab.id === "connect" 
                  ? "text-[#31499F]" 
                  : "text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
            type="button"
          >
            {tab.label}
            {activeTab === tab.id && (
              <div 
                className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                  tab.id === "connect" ? "bg-[#31499F]" : "bg-gray-900"
                }`} 
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
})
