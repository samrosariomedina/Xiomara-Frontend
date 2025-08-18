"use client"

import { useState, useEffect } from "react"
import { getClients } from "@/actions/clients"
import { Client, Campaign } from "../types"

export const useClientsData = (initialClients: Client[] = []) => {
  const [localClients, setLocalClients] = useState<Client[]>(initialClients || [])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if ((initialClients && initialClients.length > 0) || localClients.length > 0) return
      setLoading(true)
      try {
        const result = await getClients()
        if (result.success) {
          // sort folders by timestamp desc so newest clients show first
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const folders = Array.isArray(result.data)
            ? result.data.slice().sort((a: any, b: any) => {
                // Sort by timestamp descending (newest first)
                const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                return bTime - aTime;
              })
            : [];
          console.log('Sorted folders by timestamp (newest first):', 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            folders.map((f: any) => ({ 
              title: f.title, 
              timestamp: f.timestamp ? new Date(f.timestamp).toLocaleDateString() : 'none'
            })));
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const transformedClients = folders.map((folder: any) => {
            // If the folder already contains children (real campaigns), use them.
            // Otherwise assign deterministic mock campaign data so the UI shows
            // three kinds of expansion states: none, two campaigns, three campaigns.
            let campaignDetails: Campaign[] = [];
            if (Array.isArray(folder.children) && folder.children.length > 0) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              campaignDetails = folder.children.map((campaign: any) => ({
                id: campaign._id,
                name: campaign.title,
                createdDate: campaign.timestamp ? new Date(campaign.timestamp).toLocaleDateString() : 'Unknown',
                connectedSources: {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  whatsapp: campaign.files?.sources?.filter((s: any) => s.type === 'whatsapp').length || 0,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  email: campaign.files?.sources?.filter((s: any) => s.type === 'email').length || 0,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  other: campaign.files?.sources?.filter((s: any) => s.type !== 'whatsapp' && s.type !== 'email').length || 0,
                },
                status: campaign.metadata?.status || 'Activa',
              }));
            } else {
              // Always create dummy campaigns for testing
              campaignDetails = [
                {
                  id: `mock-${folder._id}-1`,
                  name: `Digital Marketing Campaign`,
                  createdDate: new Date(Date.now() - 86400000).toLocaleDateString(),
                  connectedSources: { whatsapp: 3, email: 2, other: 1 },
                  status: 'Activa',
                },
                {
                  id: `mock-${folder._id}-2`,
                  name: `Brand Awareness Campaign`,
                  createdDate: new Date(Date.now() - 2 * 86400000).toLocaleDateString(),
                  connectedSources: { whatsapp: 1, email: 4, other: 2 },
                  status: 'Inactiva',
                },
                {
                  id: `mock-${folder._id}-3`,
                  name: `Product Launch Campaign`,
                  createdDate: new Date(Date.now() - 7 * 86400000).toLocaleDateString(),
                  connectedSources: { whatsapp: 2, email: 3, other: 0 },
                  status: 'Activa',
                }
              ];
              
            }

            return {
              id: folder._id,
              name: folder.title || 'Unnamed Client',
              contact: folder.metadata?.contact?.name || "",
              createdDate: folder.timestamp ? new Date(folder.timestamp).toLocaleDateString() : 'Unknown',
              campaigns: campaignDetails.length,
              avatar: folder.metadata?.logoUrl || "/avatar.svg",
              campaignDetails,
            };
          })
          if (mounted) setLocalClients(transformedClients)
        } else {
          console.error('getClients failed:', result.error)
        }
      } catch (err) {
        console.error('Error fetching clients inside ClientsList:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    localClients,
    loading,
    setLocalClients
  }
}
