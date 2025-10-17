"use client"

import { useClient } from '@/context/ClientContext'
import { Building2, User, Briefcase, Mail, Phone, MapPin } from 'lucide-react'

interface ClientMetadata {
  contactName?: string
  industry?: string
  email?: string
  phone?: string
  location?: string
}

export function ClientInfoDisplay() {
  const { selectedClient, isClientSelected } = useClient()

  if (!isClientSelected || !selectedClient) {
    return null
  }

  const metadata: ClientMetadata = selectedClient.metadata || {}

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="bg-[#f7f9ff] p-3 rounded-lg">
            <Building2 className="h-6 w-6 text-[#31499f]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedClient.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {metadata?.contactName && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Contact:</span>
                  <span>{metadata?.contactName}</span>
                </div>
              )}
              {metadata?.industry && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Industry:</span>
                  <span>{metadata?.industry}</span>
                </div>
              )}
              {metadata?.email && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Email:</span>
                  <span>{metadata?.email}</span>
                </div>
              )}
              {metadata?.phone && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Phone:</span>
                  <span>{metadata.phone}</span>
                </div>
              )}
              {metadata.location && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Location:</span>
                  <span>{metadata.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">Client ID</div>
          <div className="text-sm font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">
            {selectedClient._id.slice(-8)}
          </div>
        </div>
      </div>
    </div>
  )
}
