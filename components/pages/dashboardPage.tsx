
"use client"

import { DashboardHeader } from "@/components/dashboard/dashboardPage-header";
import { Navbar } from "@/components/Navbar";
import {MetricsCards} from '@/components/dashboard/dashboardPage-metricsCards'
import { CorresponsablesSection } from "@/components/dashboard/dashboardPage-corresspondableCard";
import { FuentesGeneralesSection } from "@/components/dashboard/dashboardPage-fuentesCard";
import { KnowledgeBaseSection } from "@/components/dashboard/dashboardPage-knowledgeCard";
import { MediaListeningSection } from "@/components/dashboard/dashboardPage-mediaCard";
import { ClientInfoDisplay } from "@/components/dashboard/ClientInfoDisplay";
import { useClient } from "@/context/ClientContext";
import { useQuery } from '@tanstack/react-query';
import { getReferences } from "@/actions/knowledge";
import { getSources } from "@/actions/sources";

function DashBoard() {
  const { selectedClient } = useClient();

  // Debug logging for selected client
  console.log('=== DASHBOARD DEBUG ===')
  console.log('Selected Client:', selectedClient)
  console.log('Selected Client ID:', selectedClient?._id)
  console.log('Folder ID being used for fetching:', selectedClient?._id)
  console.log('================================')

  // Fetch references for selected client
  const {
    data: references = [],
    isLoading: referencesLoading,
    error: referencesError
  } = useQuery({
    queryKey: ['references', selectedClient?._id],
    queryFn: async () => {
      if (!selectedClient?._id) return [];
      return await getReferences({ folderId: selectedClient._id });
    },
    enabled: !!selectedClient?._id,
    staleTime: 30 * 1000,
    retry: 2,
  });

  // Fetch sources for selected client
  const {
    data: sources = [],
    isLoading: sourcesLoading,
    error: sourcesError
  } = useQuery({
    queryKey: ['sources', selectedClient?._id],
    queryFn: async () => {
      if (!selectedClient?._id) return [];
      return await getSources({ folderId: selectedClient._id });
    },
    enabled: !!selectedClient?._id,
    staleTime: 30 * 1000,
    retry: 2,
  });

  // Show loading state if no client selected or data is loading
  if (!selectedClient) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-[90rem] mx-auto p-3 pt-5">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Please select a client to view the dashboard</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show loading state while data is being fetched
  if (referencesLoading || sourcesLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-[90rem] mx-auto p-3 pt-5">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show error state if there's an error
  if (referencesError || sourcesError) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-[90rem] mx-auto p-3 pt-5">
            <div className="flex items-center justify-center h-64">
              <p className="text-red-500">Error loading dashboard data. Please try again.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[90rem] mx-auto p-3 pt-5   ">
         <DashboardHeader references={references} sources={sources} />
         <ClientInfoDisplay />
          <MetricsCards references={references} sources={sources} />

        {/* Desktop: Side by side cards, Mobile: Stacked accordion */}
        <div className="mt-6 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-1">
             <CorresponsablesSection />
          </div>
          <div className="lg:col-span-1">
           <KnowledgeBaseSection references={references} />
          </div>
          <div className="lg:col-span-1">
             <MediaListeningSection />
          </div>
        </div>

        <div className="mt-6 lg:mt-8">
           <FuentesGeneralesSection sources={sources} />
        </div>
      </div>
    </div>
    </>
  )
}

export default DashBoard;

