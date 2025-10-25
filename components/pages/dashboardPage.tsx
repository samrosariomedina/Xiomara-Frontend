
"use client"

import { DashboardHeader } from "@/components/dashboard/dashboardPage-header";
import { Navbar } from "@/components/Navbar";
import {MetricsCards} from '@/components/dashboard/dashboardPage-metricsCards'
import { CorresponsablesSection } from "@/components/dashboard/dashboardPage-corresspondableCard";
import { FuentesGeneralesSection } from "@/components/dashboard/dashboardPage-fuentesCard";
import { KnowledgeBaseSection } from "@/components/dashboard/dashboardPage-knowledgeCard";
import { MediaListeningSection } from "@/components/dashboard/dashboardPage-mediaCard";
import { ClientInfoDisplay } from "@/components/dashboard/ClientInfoDisplay";
import { CampaignTable } from "@/components/dashboard/dashboardPage-campaignTable";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReferences, removeReferenceAction } from "@/actions/knowledge";
import { getSources, removeSourceAction } from "@/actions/sources";
import { removeCorresponsableAction } from "@/actions/corresponsables";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { SourceResponse, ReferenceResponse } from "@/lib/schemas";
import type { CorresponsableData } from "@/components/dashboard/dashboardPage-corresspondableCard";
import SourcesAdministrator from "./dashboardPage-Forms";
import { useClient } from "@/context/ClientContext";
import type { CampaignResponse, ClientResponse } from "@/lib/schemas";

interface DashBoardProps {
  clientId: string;        // Required - always from route params
  campaignId?: string;     // Optional - only for campaign dashboards
  campaignData?: CampaignResponse | null;      // Optional - campaign data from server
  clientData?: ClientResponse | null;        // Optional - client data from server
}

function DashBoard({ clientId, campaignId, campaignData, clientData }: DashBoardProps) {
  const queryClient = useQueryClient();
  const { setSelectedClient, setParentClient } = useClient();

  // Set client context when we have data
  useEffect(() => {
    if (campaignData && clientData) {
      // Convert CampaignResponse to ClientResponse format for the context
      const campaignAsClient: ClientResponse = {
        _id: campaignData._id,
        title: campaignData.title,
        parent: campaignData.parent,
        items: campaignData.items,
        metadata: {
          type: campaignData.metadata?.type || 'campaign',
          industry: 'Campaign', // Default value for campaigns
          description: campaignData.metadata?.description,
          contactName: 'Campaign', // Default value
          whatsapp: '', // Default value
          position: '', // Default value
          email: '', // Default value
        },
        timestamp: campaignData.timestamp
      };
      
      // Set the campaign as the selected client
      setSelectedClient(campaignAsClient);
      // Set the parent client
      setParentClient(clientData);
    } else if (clientData && !campaignData) {
      // Set the client as the selected client (for client pages)
      setSelectedClient(clientData);
      // Clear parent client since this is a client page, not a campaign page
      setParentClient(null);
    }
  }, [campaignData, clientData, setSelectedClient, setParentClient]);

  // State for SourcesAdministrator
  const [isSourcesAdminOpen, setIsSourcesAdminOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<string>("fuentes-generales");
  const [editingSource, setEditingSource] = useState<SourceResponse | null>(null);
  const [editingReference, setEditingReference] = useState<ReferenceResponse | null>(null);
  const [editingCorresponsable, setEditingCorresponsable] = useState<CorresponsableData | null>(null);

  // Determine the folder ID - campaignId takes priority over clientId
  const folderId = campaignId || clientId;

  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║  DASHBOARD DEBUG (Route-Based)                   ║')
  console.log('╠══════════════════════════════════════════════════╣')
  console.log('║  Client ID from route:   ', (clientId || 'UNDEFINED').padEnd(20), '║')
  console.log('║  Campaign ID from route: ', (campaignId || 'N/A').padEnd(20), '║')
  console.log('║  Folder ID being used:   ', (folderId || 'UNDEFINED').padEnd(20), '║')
  console.log('║  Priority: campaignId || clientId                ║')
  console.log('╚══════════════════════════════════════════════════╝');

  // Fetch references for selected client/campaign
  const {
    data: references = [],
    isLoading: referencesLoading,
    error: referencesError
  } = useQuery({
    queryKey: ['references', folderId],
    queryFn: async () => {
      if (!folderId) return [];
      return await getReferences({ folderId });
    },
    enabled: !!folderId,
    staleTime: 30 * 1000,
    retry: 2,
  });

  // Fetch sources for selected client/campaign
  const {
    data: sources = [],
    isLoading: sourcesLoading,
    error: sourcesError
  } = useQuery({
    queryKey: ['sources', folderId],
    queryFn: async () => {
      if (!folderId) return [];
      return await getSources({ folderId });
    },
    enabled: !!folderId,
    staleTime: 30 * 1000,
    retry: 2,
  });

  // Mutations for delete operations
  const deleteSourceMutation = useMutation({
    mutationFn: removeSourceAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources', folderId] });
      toast.success('Source deleted successfully');
    },
    onError: (error: unknown) => {
      console.error('Delete source error:', error);
      toast.error('Failed to delete source');
    }
  });

  const deleteReferenceMutation = useMutation({
    mutationFn: (referenceId: string) => 
      removeReferenceAction(referenceId, { folderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['references', folderId] });
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
      // Invalidate queries for this specific folder
      queryClient.invalidateQueries({ queryKey: ['corresponsables', folderId] });
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
    await deleteCorresponsableMutation.mutateAsync({
      listenerId: corresponsableId,
      folderId
    });
  };

  // Close handler
  const handleCloseSourcesAdmin = () => {
    setIsSourcesAdminOpen(false);
    setEditingSource(null);
    setEditingReference(null);
    setEditingCorresponsable(null);
  };

  // folderId is always required from route params now, so this check is simpler
  if (!folderId) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-[90rem] mx-auto p-3 pt-5">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Invalid route: missing client or campaign ID</p>
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
         <DashboardHeader 
           references={references} 
           sources={sources} 
           folderId={folderId}
           clientId={clientId}
           campaignId={campaignId}
         />
         <ClientInfoDisplay />
         
         {/* Campaign Table - Only show if client has campaigns and is not a campaign itself */}
         {folderId && !campaignId && (
           <div className="mt-6">
             <CampaignTable clientId={folderId} />
           </div>
         )}

          <MetricsCards references={references} sources={sources} folderId={folderId} />

        {/* Desktop: Side by side cards, Mobile: Stacked accordion */}
        <div className="mt-6 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-1">
             <CorresponsablesSection 
               folderId={folderId}
               onEdit={handleEditCorresponsable}
               onDelete={handleDeleteCorresponsable}
               clientId={clientId}
               campaignId={campaignId}
             />
          </div>
          <div className="lg:col-span-1">
           <KnowledgeBaseSection 
             references={references} 
             onEdit={handleEditReference}
             onDelete={handleDeleteReference}
             clientId={clientId}
             campaignId={campaignId}
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
             clientId={clientId}
             campaignId={campaignId}
           />
        </div>
      </div>
    </div>

    {/* SourcesAdministrator for editing - Only render when folderId is available */}
    {folderId && (
      <SourcesAdministrator
        isOpen={isSourcesAdminOpen}
        onClose={handleCloseSourcesAdmin}
        references={references}
        sources={sources}
        defaultTab={defaultTab}
        folderId={folderId}
        clientId={clientId}
        campaignId={campaignId}
        editSource={editingSource}
        editReference={editingReference}
        editCorresponsable={editingCorresponsable}
      />
    )}
    </>
  )
}

export default DashBoard;

