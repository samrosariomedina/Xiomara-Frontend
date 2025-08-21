"use client"

import type React from "react"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"


interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  breadcrumbs: { label: string; href?: string }[]
  onAddClick?: () => void
}

export function DashboardLayout({ children, title, breadcrumbs, onAddClick }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
     

      {/* Main Content */}
      <main className="px-6 py-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center ">
              {index > 0 && <span className="mx-2">›</span>}
              <span className={index === breadcrumbs.length - 1 ? "text-[#31499f]" : "text-gray-500"}>
                {crumb.label}
              </span>
            </div>
          ))}
        </nav>

        {/* Page Title and Add Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          {onAddClick && (
            <Button onClick={onAddClick} style={{ backgroundColor: "#31499f" }} className="text-white hover:opacity-90 rounded-full flex items-center" aria-label="Agregar Fuentes">
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline ml-2">Agregar Fuentes</span>
            </Button>
          )}
        </div>

        {children}
      </main>
    </div>
  )
}
