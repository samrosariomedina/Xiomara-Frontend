"use client"

import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

interface MediaListeningData {
  [key: string]: unknown
}

interface MediaListeningFormProps {
  onSubmit: (data: MediaListeningData) => void
}

export function MediaListeningForm({  }: MediaListeningFormProps) {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900">Media Listening</h2>
      </div>
      <div className="bg-white rounded-lg p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center">
            <Eye className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-2">No se han configurado fuentes</p>
          <p className="text-sm text-gray-400 mb-6">Agregar fuentes de monitoreo</p>
          <Button className="bg-[#f7f9ff] rounded-full hover:bg-gray-100 text-[#31499f]">Configurar Monitoreo</Button>
        </div>
      </div>
    </>
  )
}
