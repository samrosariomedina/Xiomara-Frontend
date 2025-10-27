"use client"

import { useState, useEffect, useCallback } from "react"
import ChatCard from "@/components/content-engine/contentEnginePage-chatCard"
import FuentesCard from "@/components/content-engine/contentEnginePage-fuentesCard"
import OutputCard from "@/components/content-engine/contentEnginePage-outputCard"
import ContentEngineContextSelector from "@/components/content-engine/ContentEngineContextSelector"
import { useTemplates } from "@/context/TemplatesContext"
import { getContentEngineSources } from '@/actions/sources'
import { getOutputsWithTemplateNamesAction } from '@/actions/outputs'
import type { SourceResponse } from '@/lib/schemas'
import type { OutputResponse } from '@/actions/outputs'
import type { SummaryResponse } from '@/actions/summaries'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from "next/navigation"
import { routes } from '@/lib/routes'

interface ContentEnginePageProps {
    clientId: string
    campaignId?: string
}

export default function ContentEnginePage({ clientId, campaignId }: ContentEnginePageProps){
    const [activeTab, setActiveTab] = useState<'fuentes' | 'chat' | 'output'>('fuentes')
    const { templates } = useTemplates()
    const router = useRouter()
    const queryClient = useQueryClient()
    
    // Determine folderId - campaignId takes priority
    const folderId = campaignId || clientId
    
    // Check if we're in the specific campaign content-engine route
    const isCampaignContentEngine = !!campaignId && !!clientId
    
    console.log('╔══════════════════════════════════════════════════════╗')
    console.log('║  CONTENT ENGINE DEBUG                                ║')
    console.log('╠══════════════════════════════════════════════════════╣')
    console.log('║  Client ID:      ', (clientId || 'N/A').padEnd(29), '║')
    console.log('║  Campaign ID:    ', (campaignId || 'N/A').padEnd(29), '║')
    console.log('║  Folder ID:      ', folderId.padEnd(29), '║')
    console.log('║  Campaign Mode:  ', String(isCampaignContentEngine).padEnd(29), '║')
    console.log('║  Templates:      ', String(templates.length).padEnd(29), '║')
    console.log('╚══════════════════════════════════════════════════════╝')
    
    // Lifted state from FuentesCard
    const [sources, setSources] = useState<SourceResponse[]>([])
    const [filteredSources, setFilteredSources] = useState<SourceResponse[]>([])
    const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([])
    const [isLoadingSources, setIsLoadingSources] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    
    // State to track currently selected summary for output filtering
    const [selectedSummary, setSelectedSummary] = useState<SummaryResponse | null>(null)

    // Server-side data fetching for all outputs with template names (folder-scoped)
    const { data: allOutputs = [], isLoading: isLoadingOutput, refetch: refetchOutput } = useQuery({
        queryKey: ['outputs-with-templates', folderId],
        queryFn: async () => {
            return await getOutputsWithTemplateNamesAction({ folderId });
        },
        enabled: !!folderId,
        staleTime: 30 * 1000, // 30 seconds
    })

    // Function to refresh sources
    const refreshSources = useCallback(async () => {
        try {
            setIsLoadingSources(true)
            
            if (isCampaignContentEngine) {
                // Campaign content-engine mode: fetch sources from both client and campaign
                console.log('🔄 Fetching sources for campaign content-engine mode...')
                console.log('📁 Client ID (parent):', clientId)
                console.log('📁 Campaign ID:', campaignId)
                
                // Fetch sources from both parent client and campaign
                const [clientSources, campaignSources] = await Promise.all([
                    getContentEngineSources({ folderId: clientId }),
                    getContentEngineSources({ folderId: campaignId })
                ])
                
                console.log('📊 Client sources:', clientSources.length)
                console.log('📊 Campaign sources:', campaignSources.length)
                
                // Merge sources and remove duplicates based on _id
                const mergedSources = [...clientSources]
                campaignSources.forEach(campaignSource => {
                    if (!mergedSources.find(source => source._id === campaignSource._id)) {
                        mergedSources.push(campaignSource)
                    }
                })
                
                console.log('📊 Total merged sources:', mergedSources.length)
                setSources(mergedSources)
                setFilteredSources(mergedSources)
            } else {
                // Regular mode: use folderId (campaignId || clientId) for filtering sources
                console.log('🔄 Fetching sources for regular mode...')
                console.log('📁 Folder ID:', folderId)
                
                const fetchedSources = await getContentEngineSources({ 
                    folderId 
                })
                
                console.log('📊 Sources fetched:', fetchedSources.length)
                setSources(fetchedSources)
                setFilteredSources(fetchedSources)
            }
        } catch (error) {
            console.error('Error fetching sources:', error)
        } finally {
            setIsLoadingSources(false)
        }
    }, [folderId, isCampaignContentEngine, clientId, campaignId])


    // Clear all queries and state when folderId changes
    useEffect(() => {
        if (folderId) {
            // Invalidate all queries for the new folder
            queryClient.invalidateQueries({ queryKey: ['outputs-with-templates'] })
            queryClient.invalidateQueries({ queryKey: ['user-summaries-for-dialog'] })
            queryClient.invalidateQueries({ queryKey: ['latest-output'] })
            queryClient.invalidateQueries({ queryKey: ['sources'] })
            
            // Clear local state
            setSelectedSourceIds([])
            setSearchQuery("")
            setSelectedSummary(null) // Clear selected summary when context changes
            
            // Trigger summary clearing
            setClearSummary(true)
            setTimeout(() => setClearSummary(false), 100) // Reset after triggering
        }
    }, [folderId, queryClient])

    // Fetch sources when folderId is available
    useEffect(() => {
        if (folderId) {
            refreshSources()
        }
    }, [folderId, refreshSources])

    // Handle search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredSources(sources)
        } else {
            const filtered = sources.filter(source => 
                source.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                source.content?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredSources(filtered)
        }
    }, [searchQuery, sources])

    const handleSourceSelection = (sourceId: string, isSelected: boolean) => {
        setSelectedSourceIds(prev => 
            isSelected 
                ? [...prev, sourceId]
                : prev.filter(id => id !== sourceId)
        )
    }

    const handleSourceAdded = async () => {
        await refreshSources()
        console.log('Source added successfully - sources refreshed for folder:', folderId)
    }

    const handleClearSelectedSources = () => {
        setSelectedSourceIds([])
    }

    // Callback to handle summary changes from ChatCard
    const handleSummaryChange = (summary: SummaryResponse | null) => {
        setSelectedSummary(summary)
        console.log('📝 Summary changed:', summary ? summary._id : 'None')
    }

    // State to trigger summary clearing
    const [clearSummary, setClearSummary] = useState(false)

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1 bg-gray-50">
                {/* Breadcrumb Navigation */}
                <div className="lg:ml-17 lg:pt-2  p-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <button 
                            onClick={() => window.history.back()}
                            className="flex items-center gap-1 hover:text-[#31499f] transition-colors hover:cursor-pointer"
                        >
                            <svg 
                                className="w-4 h-4" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M15 19l-7-7 7-7" 
                                />
                            </svg>
                            <span>Volver</span>
                        </button>
                        <button className="hover:text-[#31499f] transition-colors hover:cursor-pointer" onClick={() => router.push(routes.clients.clientDashboard(clientId))}>
                        <span className="mx-2 h-full w-full">›</span>
                        <span>Dashboard Cliente</span>
                        </button>
                        <button className="hover:text-[#31499f] transition-colors hover:cursor-pointer" onClick={() => router.push(routes.clients.contentEngine(clientId, campaignId))}>
                        <span className="mx-2 h-12 w-12">›</span>
                        <span>Campaña</span>
                        </button>
                    </div>
                </div>

                {/* Context Selector */}
                <div className="px-6 py-4">
                    <ContentEngineContextSelector 
                        clientId={clientId} 
                        campaignId={campaignId} 
                    />
                </div>

                {/* Mobile Tabs - Only visible on mobile */}
                <div className="md:hidden bg-white ">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('fuentes')}
                            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'fuentes' 
                                    ? 'border-[#31499f] text-[#31499f] bg-blue-50' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Fuentes
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'chat' 
                                    ? 'border-[#31499f] text-[#31499f] bg-blue-50' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Chat
                        </button>
                        <button
                            onClick={() => setActiveTab('output')}
                            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'output' 
                                    ? 'border-[#31499f] text-[#31499f] bg-blue-50' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Output
                        </button>
                    </div>
                </div>

                {/* Desktop Layout - Hidden on mobile */}
                <div className="hidden md:block px-6 py-2">
                    <div className="mx-auto max-w-[95%] h-screen">
                        <div className="flex gap-6 h-full">
                            {/* Left column - Fuentes */}
                            <aside className="w-80 h-full">
                                <div className="h-full">
                                    <FuentesCard 
                                        sources={sources}
                                        filteredSources={filteredSources}
                                        selectedSourceIds={selectedSourceIds}
                                        isLoading={isLoadingSources}
                                        searchQuery={searchQuery}
                                        onSearchChange={setSearchQuery}
                                        onSourceSelection={handleSourceSelection}
                                        onSourceAdded={handleSourceAdded}
                                        folderId={folderId}
                                    />
                                </div>
                            </aside>

                            {/* Middle column - Chat */}
                            <section className="flex-1 h-full min-w-0">
                                <div className="h-full">
                                    <ChatCard 
                                        selectedSourceIds={selectedSourceIds}
                                        onOutputGenerated={refetchOutput}
                                        onClearSelectedSources={handleClearSelectedSources}
                                        clearSummary={clearSummary}
                                        onSummaryChange={handleSummaryChange}
                                        folderId={folderId}
                                    />
                                </div>
                            </section>

                            {/* Right column - Output */}
                            <aside className="w-80 h-full">
                                <div className="h-full">
                                    <OutputCard 
                                        allOutputs={allOutputs as OutputResponse[]}
                                        isLoadingOutput={isLoadingOutput}
                                        onOutputsChange={refetchOutput}
                                        selectedSummaryId={selectedSummary?._id}
                                        folderId={folderId}
                                    />
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>

                {/* Mobile Layout - Only visible on mobile */}
                <div className="md:hidden h-[calc(100vh-140px)]">
                    <div className="h-full p-4">
                        {activeTab === 'fuentes' && (
                            <div className="h-full">
                                <FuentesCard 
                                    sources={sources}
                                    filteredSources={filteredSources}
                                    selectedSourceIds={selectedSourceIds}
                                    isLoading={isLoadingSources}
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    onSourceSelection={handleSourceSelection}
                                    onSourceAdded={handleSourceAdded}
                                    folderId={folderId}
                                />
                            </div>
                        )}
                        {activeTab === 'chat' && (
                            <div className="h-full">
                                <ChatCard 
                                    selectedSourceIds={selectedSourceIds}
                                    onOutputGenerated={refetchOutput}
                                    onClearSelectedSources={handleClearSelectedSources}
                                    clearSummary={clearSummary}
                                    onSummaryChange={handleSummaryChange}
                                    folderId={folderId}
                                />
                            </div>
                        )}
                        {activeTab === 'output' && (
                            <div className="h-full">
                                <OutputCard 
                                    allOutputs={allOutputs as OutputResponse[]}
                                    isLoadingOutput={isLoadingOutput}
                                    onOutputsChange={refetchOutput}
                                    selectedSummaryId={selectedSummary?._id}
                                    folderId={folderId}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}