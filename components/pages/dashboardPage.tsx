
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReferences, removeReferenceAction } from "@/actions/knowledge";
import { getSources, removeSourceAction } from "@/actions/sources";
import { removeCorresponsableAction } from "@/actions/corresponsables";
import { useState } from "react";
import { toast } from "sonner";
import type { SourceResponse, ReferenceResponse } from "@/lib/schemas";
import type { CorresponsableData } from "@/components/dashboard/dashboardPage-corresspondableCard";
import SourcesAdministrator from "./dashboardPage-Forms";

function DashBoard() {
  const { selectedClient } = useClient();
  const queryClient = useQueryClient();

  // State for SourcesAdministrator
  const [isSourcesAdminOpen, setIsSourcesAdminOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<string>("fuentes-generales");
  const [editingSource, setEditingSource] = useState<SourceResponse | null>(null);
  const [editingReference, setEditingReference] = useState<ReferenceResponse | null>(null);
  const [editingCorresponsable, setEditingCorresponsable] = useState<CorresponsableData | null>(null);

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

  // Mutations for delete operations
  const deleteSourceMutation = useMutation({
    mutationFn: removeSourceAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      toast.success('Source deleted successfully');
    },
    onError: (error: unknown) => {
      console.error('Delete source error:', error);
      toast.error('Failed to delete source');
    }
  });

  const deleteReferenceMutation = useMutation({
    mutationFn: (referenceId: string) => 
      removeReferenceAction(referenceId, { folderId: selectedClient?._id || '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['references'] });
      toast.success('Knowledge base deleted successfully');
    },
    onError: (error: unknown) => {
      console.error('Delete reference error:', error);
      toast.error('Failed to delete knowledge base');
    }
  });

  const deleteCorresponsableMutation = useMutation({
    mutationFn: ({ listenerId, folderId }: { listenerId: string; folderId: string }) => 
      removeCorresponsableAction(listenerId, folderId),
    onSuccess: () => {
      console.log('✅ Corresponsable delete successful, invalidating queries...');
      // Invalidate all corresponsables queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['corresponsables'] });
      // Also refetch the specific query for this folder
      queryClient.refetchQueries({ queryKey: ['corresponsables', selectedClient?._id] });
      toast.success('Corresponsable deleted successfully');
    },
    onError: (error: unknown) => {
      console.error('❌ Delete corresponsable error:', error);
      toast.error('Failed to delete corresponsable');
    }
  });

  // Edit handlers
  const handleEditSource = (source: SourceResponse) => {
    setEditingSource(source);
    setEditingReference(null);
    setEditingCorresponsable(null);
    setDefaultTab("fuentes-generales");
    setIsSourcesAdminOpen(true);
  };

  const handleEditReference = (reference: ReferenceResponse) => {
    console.log('🔵 handleEditReference called with:', reference);
    setEditingReference(reference);
    setEditingSource(null);
    setEditingCorresponsable(null);
    setDefaultTab("knowledge-base");
    setIsSourcesAdminOpen(true);
    console.log('🔵 Set editingReference to:', reference);
    console.log('🔵 Set defaultTab to: knowledge-base');
  };

  const handleEditCorresponsable = (corresponsable: CorresponsableData) => {
    console.log('🟣 handleEditCorresponsable called with:', corresponsable);
    setEditingCorresponsable(corresponsable);
    setEditingSource(null);
    setEditingReference(null);
    setDefaultTab("corresponsales");
    setIsSourcesAdminOpen(true);
    console.log('🟣 Set editingCorresponsable to:', corresponsable);
    console.log('🟣 Set defaultTab to: corresponsales');
  };

  // Delete handlers
  const handleDeleteSource = async (sourceId: string) => {
    await deleteSourceMutation.mutateAsync(sourceId);
  };

  const handleDeleteReference = async (referenceId: string) => {
    await deleteReferenceMutation.mutateAsync(referenceId);
  };

  const handleDeleteCorresponsable = async (corresponsableId: string) => {
    if (!selectedClient?._id) {
      toast.error('No client selected');
      return;
    }
    await deleteCorresponsableMutation.mutateAsync({
      listenerId: corresponsableId,
      folderId: selectedClient._id
    });
  };

  // Close handler
  const handleCloseSourcesAdmin = () => {
    setIsSourcesAdminOpen(false);
    setEditingSource(null);
    setEditingReference(null);
    setEditingCorresponsable(null);
  };

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
             <CorresponsablesSection 
               onEdit={handleEditCorresponsable}
               onDelete={handleDeleteCorresponsable}
             />
          </div>
          <div className="lg:col-span-1">
           <KnowledgeBaseSection 
             references={references} 
             onEdit={handleEditReference}
             onDelete={handleDeleteReference}
           />
          </div>
          <div className="lg:col-span-1">
             <MediaListeningSection />
          </div>
        </div>

        <div className="mt-6 lg:mt-8">
           <FuentesGeneralesSection 
             sources={sources}
             onEdit={handleEditSource}
             onDelete={handleDeleteSource}
           />
        </div>
      </div>
    </div>

    {/* SourcesAdministrator for editing */}
    <SourcesAdministrator
      isOpen={isSourcesAdminOpen}
      onClose={handleCloseSourcesAdmin}
      references={references}
      sources={sources}
      defaultTab={defaultTab}
      editSource={editingSource}
      editReference={editingReference}
      editCorresponsable={editingCorresponsable}
    />
    </>
  )
}

export default DashBoard;

