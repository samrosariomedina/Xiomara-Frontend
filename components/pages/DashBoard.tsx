import { DashboardHeader } from "@/components/dashboard-header";
import { Navbar } from "@/components/Navbar";
import {MetricsCards} from '@/components/dashboard-metrics-cards'
import { CorresponsablesSection } from "@/components/dashboard-Corresspondable";
import { FuentesGeneralesSection } from "@/components/dashboard-fuentes";
import { KnowledgeBaseSection } from "@/components/dashboard-knowledge";
import { MediaListeningSection } from "@/components/dashboard-media";

export default function DashBoard() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <DashboardHeader />
          <MetricsCards />

        {/* Desktop: Side by side cards, Mobile: Stacked accordion */}
        <div className="mt-6 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-1">
            <CorresponsablesSection />
          </div>
          <div className="lg:col-span-1">
            <KnowledgeBaseSection />
          </div>
          <div className="lg:col-span-1">
            <MediaListeningSection /> 
          </div>
        </div>

        <div className="mt-6 lg:mt-8">
          <FuentesGeneralesSection />
        </div>
      </div>
    </div>
    </>
  )
}

