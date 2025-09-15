
"use client"

import { DashboardHeader } from "@/components/dashboardPage-header";
import { Navbar } from "@/components/Navbar";
import {MetricsCards} from '@/components/dashboardPage-metricsCards'
import { CorresponsablesSection } from "@/components/dashboardPage-corresspondableCard";
import { FuentesGeneralesSection } from "@/components/dashboardPage-fuentesCard";
import { KnowledgeBaseSection } from "@/components/dashboardPage-knowledgeCard";
import { MediaListeningSection } from "@/components/dashboardPage-mediaCard";
import { useDataWithCache } from "@/hooks/useDataWithCache";
import type { ReferenceResponse, SourceResponse } from "@/lib/schemas";

interface DashBoardProps {
  references: ReferenceResponse[]
  sources: SourceResponse[]
}

function DashBoard({ references, sources }: DashBoardProps) {
  // Use caching for references
  const {
    data: cachedReferences
  } = useDataWithCache(references, { cacheKey: 'references' })

  // Use caching for sources
  const {
    data: cachedSources
  } = useDataWithCache(sources, { cacheKey: 'sources' })
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[90rem] mx-auto p-3 pt-5   ">
         <DashboardHeader references={cachedReferences} sources={cachedSources} />
          <MetricsCards references={cachedReferences} sources={cachedSources} />

        {/* Desktop: Side by side cards, Mobile: Stacked accordion */}
        <div className="mt-6 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-1">
             <CorresponsablesSection />
          </div>
          <div className="lg:col-span-1">
           <KnowledgeBaseSection references={cachedReferences} />
          </div>
          <div className="lg:col-span-1">
             <MediaListeningSection />
          </div>
        </div>

        <div className="mt-6 lg:mt-8">
           <FuentesGeneralesSection sources={cachedSources} />
        </div>
      </div>
    </div>
    </>
  )
}

export default DashBoard;

