"use client"

import React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function Drawer({ isOpen, onClose, title, children, className }: DrawerProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  )
}
