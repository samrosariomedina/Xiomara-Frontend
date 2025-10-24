"use client"

import { useClient } from '@/context/ClientContext'
import { Building2, User, Briefcase, Mail, Phone, MapPin, Target, Calendar } from 'lucide-react'
import { formatDateSafe } from '@/lib/utils'

interface ClientMetadata {
  contactName?: string
  industry?: string
  email?: string
  phone?: string
  location?: string
}

interface CampaignMetadata {
  type?: string
  campaignType?: string
  startDate?: string
  description?: string
}

export function ClientInfoDisplay() {
  const { selectedClient, isClientSelected, isClientType, isCampaignType, parentClient } = useClient()

  if (!isClientSelected || !selectedClient) {
    return null
  }

  // Render campaign view
  if (isCampaignType) {
    const campaignMetadata: CampaignMetadata = selectedClient.metadata || {}
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="bg-[#f7f9ff] p-3 rounded-lg">
              <Target className="h-6 w-6 text-[#31499f]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedClient.title}
                </h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  Campaign
                </span>
              </div>
              {parentClient && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Client:</span>
                  <span>{parentClient.title}</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                {campaignMetadata?.campaignType && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Target className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Type:</span>
                    <span className="capitalize">{campaignMetadata.campaignType}</span>
                  </div>
                )}
                {campaignMetadata?.startDate && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Start Date:</span>
                    <span>{formatDateSafe(campaignMetadata.startDate)}</span>
                  </div>
                )}
                {campaignMetadata?.description && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Description:</span>
                    <span>{campaignMetadata.description}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Campaign ID</div>
            <div className="text-sm font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">
              {selectedClient._id.slice(-8)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render client view
  const clientMetadata: ClientMetadata = selectedClient.metadata || {}

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
              {clientMetadata?.contactName && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Contact:</span>
                  <span>{clientMetadata?.contactName}</span>
                </div>
              )}
              {clientMetadata?.industry && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Industry:</span>
                  <span>{clientMetadata?.industry}</span>
                </div>
              )}
              {clientMetadata?.email && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Email:</span>
                  <span>{clientMetadata?.email}</span>
                </div>
              )}
              {clientMetadata?.phone && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Phone:</span>
                  <span>{clientMetadata.phone}</span>
                </div>
              )}
              {clientMetadata.location && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Location:</span>
                  <span>{clientMetadata.location}</span>
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
