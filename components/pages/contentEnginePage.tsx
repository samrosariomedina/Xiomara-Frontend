"use client"

import { useState, useEffect, useCallback } from "react"
import ChatCard from "@/components/content-engine/contentEnginePage-chatCard"
import FuentesCard from "@/components/content-engine/contentEnginePage-fuentesCard"
import OutputCard from "@/components/content-engine/contentEnginePage-outputCard"
import { Navbar } from "@/components/Navbar"
import { useTemplates } from "@/context/TemplatesContext"
import { useClient } from "@/context/ClientContext"
import { getContentEngineSources } from '@/actions/sources'
import { getOutputsWithTemplateNamesAction } from '@/actions/outputs'
import type { SourceResponse } from '@/lib/schemas'
import type { OutputResponse } from '@/actions/outputs'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from "next/navigation"

export default function ContentEnginePage(){
    const [activeTab, setActiveTab] = useState<'fuentes' | 'chat' | 'output'>('fuentes')
    const { templates } = useTemplates()
    const { selectedClient, isInitialized } = useClient()
    const router = useRouter()
    console.log('Templates available:', templates.length)
    
    // Lifted state from FuentesCard
    const [sources, setSources] = useState<SourceResponse[]>([])
    const [filteredSources, setFilteredSources] = useState<SourceResponse[]>([])
    const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([])
    const [isLoadingSources, setIsLoadingSources] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    // Server-side data fetching for all outputs with template names (folder-scoped)
    const { data: allOutputs = [], isLoading: isLoadingOutput, refetch: refetchOutput } = useQuery({
        queryKey: ['outputs-with-templates', selectedClient?._id],
        queryFn: async () => {
            if (!selectedClient?._id) return [];
            return await getOutputsWithTemplateNamesAction({ folderId: selectedClient._id });
        },
        enabled: !!selectedClient?._id,
        staleTime: 30 * 1000, // 30 seconds
    })

    // Function to refresh sources
    const refreshSources = useCallback(async () => {
        try {
            setIsLoadingSources(true)
            // Use selected client ID for filtering sources
            const fetchedSources = await getContentEngineSources({ 
                folderId: selectedClient?._id 
            })
            setSources(fetchedSources)
            setFilteredSources(fetchedSources)
        } catch (error) {
            console.error('Error fetching sources:', error)
        } finally {
            setIsLoadingSources(false)
        }
    }, [selectedClient?._id])


    // Fetch sources when client is selected and initialized
    useEffect(() => {
        if (selectedClient && isInitialized) {
            refreshSources()
        }
    }, [selectedClient, isInitialized, refreshSources])

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
        if (selectedClient) {
            await refreshSources()
            console.log('Source added successfully - sources refreshed for client:', selectedClient._id)
        }
    }

    const handleClearSelectedSources = () => {
        setSelectedSourceIds([])
    } 

    // Show loading state while client context is initializing
    if (!isInitialized) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar/>
                <main className="flex-1 bg-gray-50">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading content engine...</p>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    // Show alert dialog if no client is selected after initialization
    if (!selectedClient) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar/>
                <main className="flex-1 bg-gray-50">
                    <div className="flex items-center justify-center h-64">
                        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Client Selected</h3>
                                <p className="text-gray-600 mb-6">
                                    Please select a client from the clients page to access the content engine.
                                </p>
                                <button
                                    onClick={() => router.push('/clients')}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Go to Clients
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar/>
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
                        <button className="hover:text-[#31499f] transition-colors hover:cursor-pointer" onClick={() => router.push('/clients/channels')}>
                        <span className="mx-2 h-full w-full">›</span>
                        <span>Listado Clientes</span>

                        </button>
                        <button className="hover:text-[#31499f] transition-colors hover:cursor-pointer" onClick={() => router.push('/clients/content-engine')}>
                        <span className="mx-2 h-12 w-12">›</span>
                        <span>Campaña</span>
                        </button>
                    </div>
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
                                        clientId={selectedClient?._id}
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
                                    clientId={selectedClient?._id}
                                />
                            </div>
                        )}
                        {activeTab === 'chat' && (
                            <div className="h-full">
                                <ChatCard 
                                    selectedSourceIds={selectedSourceIds}
                                    onOutputGenerated={refetchOutput}
                                    onClearSelectedSources={handleClearSelectedSources}
                                />
                            </div>
                        )}
                        {activeTab === 'output' && (
                            <div className="h-full">
                                <OutputCard 
                                    allOutputs={allOutputs as OutputResponse[]}
                                    isLoadingOutput={isLoadingOutput}
                                    onOutputsChange={refetchOutput}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}