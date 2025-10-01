"use client"

import { createContext, useContext } from 'react'
import type { TemplateResponse } from '@/actions/templates'

interface TemplatesContextType {
  templates: TemplateResponse[]
  globalTemplates: TemplateResponse[]
  userTemplates: TemplateResponse[]
}

const TemplatesContext = createContext<TemplatesContextType | undefined>(undefined)

export function TemplatesProvider({ 
  children, 
  templates 
}: { 
  children: React.ReactNode
  templates: TemplateResponse[] 
}) {
  const globalTemplates = templates.filter(t => t.global)
  const userTemplates = templates.filter(t => !t.global)
  
  return (
    <TemplatesContext.Provider value={{ 
      templates, 
      globalTemplates, 
      userTemplates 
    }}>
      {children}
    </TemplatesContext.Provider>
  )
}

export function useTemplates() {
  const context = useContext(TemplatesContext)
  if (!context) {
    throw new Error('useTemplates must be used within TemplatesProvider')
  }
  return context
}
