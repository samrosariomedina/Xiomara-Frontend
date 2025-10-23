"use client"

import { MetricCard } from "@/components/ui/metric-card"
import { Users,  FileText, Ear,  Globe } from "lucide-react"
import { useCorresponsables } from "@/hooks/useCorresponsables"
import { useClient } from "@/context/ClientContext"
import { useDataWithCache } from '@/hooks/useDataWithCache'
import type { ReferenceResponse, SourceResponse } from "@/lib/schemas"

interface MetricsCardsProps {
  references: ReferenceResponse[]
  sources: SourceResponse[]
}

export function MetricsCards({ references, sources }: MetricsCardsProps) {
  // Use caching for references
  const {
    data: cachedReferences
  } = useDataWithCache(references, { cacheKey: 'references' })

  // Use caching for sources
  const {
    data: cachedSources
  } = useDataWithCache(sources, { cacheKey: 'sources' })
  
  // Get selected client from context
  const { selectedClient } = useClient()
  
  // Fetch corresponsables for the selected client
  const { 
    corresponsables = [], 
    isLoading: isLoadingCorresponsables 
  } = useCorresponsables(selectedClient?._id)

  // Calculate media listeners count (sources with listener types)
  const mediaListenersCount = cachedSources.filter(source => 
    source.type === 'telegram' || 
    source.type === 'whatsapp' || 
    source.type === 'youtube' || 
    source.type === 'twitter' ||
    source.type === 'listener'
  ).length

  const metrics = [
    {
      title: "Corresponsales",
      value: isLoadingCorresponsables ? "..." : corresponsables.length.toString(),
      icon: Users,
      iconColor: "text-gray-600",
    },
    {
      title: "Media listeners",
      value: mediaListenersCount.toString(),
      icon: Ear,
      iconColor: "text-gray-600",
    },
    {
      title: "Knowledge base",
      value: cachedReferences.length.toString(),
      icon: Globe,
      iconColor: "text-gray-600",
    },
    {
      title: "Generales",
      value: cachedSources.length.toString(),
      icon: FileText,
      iconColor: "text-gray-600",
    },
  ]

  return (
  <div className="px-4  grid grid-cols-2 lg:grid-cols-4 gap-3  lg:gap-6 mt-4  max-w-full mx-auto">
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          iconColor={metric.iconColor}
        />
      ))}
    </div>
  )
}
