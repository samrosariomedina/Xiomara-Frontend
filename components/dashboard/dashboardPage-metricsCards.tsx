"use client"

import { MetricCard } from "@/components/ui/metric-card"
import { Users,  FileText, Ear,  Globe } from "lucide-react"
import { useCorresponsables } from "@/hooks/useCorresponsables"
import type { ReferenceResponse, SourceResponse } from "@/lib/schemas"

interface MetricsCardsProps {
  references: ReferenceResponse[]
  sources: SourceResponse[]
  folderId: string
}

export function MetricsCards({ references, sources, folderId }: MetricsCardsProps) {
  // Use data directly from props - React Query already handles caching with folderId
  // No need for additional localStorage caching layer
  
  // Fetch corresponsables for the folder (client or campaign)
  const { 
    corresponsables = [], 
    isLoading: isLoadingCorresponsables 
  } = useCorresponsables(folderId)

  // Calculate media listeners count (sources with listener types)
  const mediaListenersCount = sources.filter(source => 
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
      value: references.length.toString(),
      icon: Globe,
      iconColor: "text-gray-600",
    },
    {
      title: "Generales",
      value: sources.length.toString(),
      icon: FileText,
      iconColor: "text-gray-600",
    },
  ]

  return (
    <div className="px-4 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-6 max-w-full mx-auto">
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
