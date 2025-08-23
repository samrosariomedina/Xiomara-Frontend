"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface SectionHeaderProps {
  title: string
  isExpanded?: boolean
  onToggle?: () => void
  showToggle?: boolean
  actions?: React.ReactNode
}

export function SectionHeader({ title, isExpanded, onToggle, showToggle = true, actions }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
      <div className="flex items-center space-x-2">
        {actions}
        {showToggle && (
          <Button variant="ghost" size="sm" className="lg:hidden ml-2 p-1" onClick={onToggle}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  )
}
