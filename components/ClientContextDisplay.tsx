"use client"

import { useClient } from '@/context/ClientContext'

export function ClientContextDisplay() {
  const { selectedClient, isClientSelected } = useClient()

  if (!isClientSelected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-yellow-800 text-sm">
          No client selected. Navigate from a client card to see client-specific data.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h3 className="text-blue-900 font-medium text-sm mb-2">Selected Client Context</h3>
      <div className="text-blue-800 text-sm space-y-1">
        <p><strong>Client ID:</strong> {selectedClient._id}</p>
        <p><strong>Client Name:</strong> {selectedClient.title}</p>
        <p><strong>Contact:</strong> {selectedClient.metadata?.contactName || 'N/A'}</p>
        <p><strong>Industry:</strong> {selectedClient.metadata?.industry || 'N/A'}</p>
        <p><strong>Selected At:</strong> {new Date(selectedClient.timestamp).toLocaleString()}</p>
      </div>
    </div>
  )
}
