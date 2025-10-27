"use client"

import type React from "react"

import { Plus, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { ClientInfoDisplay } from "./ClientInfoDisplay"
import { getLocalizedRouteFromPathname, routes } from "@/lib/routes"


interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  breadcrumbs: { label: string; href?: string }[]
  onAddClick?: () => void
  addButtonText?: string
  clientId?: string
  campaignId?: string
}

export function DashboardLayout({ children, title, breadcrumbs, onAddClick, addButtonText = "Agregar", clientId, campaignId }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleContentEngineClick = () => {
    // Navigate to campaign-specific or client-specific content engine using routes
    if (!clientId) {
      console.error('Cannot navigate to content engine: clientId is missing')
      return
    }
    
    const contentEngineRoute = routes.clients.contentEngine(clientId, campaignId)
    const localizedRoute = getLocalizedRouteFromPathname(contentEngineRoute, pathname || '/')
    router.push(localizedRoute)
  }

  return (
    <div className="min-h-screen bg-gray-50">
     

      {/* Main Content */}
      <main className="px-6 py-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center ">
              {index > 0 && <span className="mx-2">›</span>}
              {crumb.href ? (
                <a 
                  href={crumb.href}
                  className={`hover:underline ${index === breadcrumbs.length - 1 ? "text-[#31499f]" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {crumb.label}
                </a>
              ) : (
                <span className={index === breadcrumbs.length - 1 ? "text-[#31499f]" : "text-gray-500"}>
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Page Title and Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center gap-3">
            {/* Content Engine Button */}
            <Button 
              onClick={handleContentEngineClick} 
              variant="outline"
              className="border-[#31499f] text-[#31499f] hover:bg-[#f7f9ff] rounded-full flex items-center"
              aria-label="Content Engine"
            >
              <Brain className="h-4 w-4" />
              <span className="hidden lg:inline ml-2">Content Engine</span>
            </Button>
            
            {/* Add Button */}
            {onAddClick && (
              <Button onClick={onAddClick} style={{ backgroundColor: "#31499f" }} className="text-white hover:opacity-90 rounded-full flex items-center" aria-label={addButtonText}>
                <Plus className="h-4 w-4" />
                <span className="hidden lg:inline ml-2">{addButtonText}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Client Information Display */}
        <ClientInfoDisplay />

        {children}
      </main>
    </div>
  )
}
