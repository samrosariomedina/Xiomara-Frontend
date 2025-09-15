'use client'

import { useEffect } from 'react'
import { useClient } from '@/context/ClientContext'
import { useQuery } from '@tanstack/react-query'
import { getClientsAction } from '@/actions/clients'

export function ClientAutoSelector() {
  const { selectedClient, setDefaultClient, isClientSelected } = useClient()

  // Fetch clients to set a default one
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const result = await getClientsAction()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch clients')
      }
      return result.data || []
    },
    enabled: !isClientSelected, // Only fetch if no client is selected
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Set the first client as default if none is selected
  useEffect(() => {
    if (!isClientSelected && clients.length > 0) {
      const firstClient = clients[0]
      setDefaultClient(firstClient)
    }
  }, [isClientSelected, clients, setDefaultClient])

  return null // This component doesn't render anything
}
