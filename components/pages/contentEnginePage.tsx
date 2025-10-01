"use client"

import { useState, useEffect } from "react"
import ChatCard from "@/components/contentEnginePage-chatCard"
import FuentesCard from "@/components/contentEnginePage-fuentesCard"
import OutputCard from "@/components/contentEnginePage-outputCard"
import { Navbar } from "@/components/Navbar"
import { useTemplates } from "@/context/TemplatesContext"
import { getContentEngineSources } from '@/actions/sources'
import type { SourceResponse } from '@/lib/schemas'
import type { SummaryResponse } from '@/actions/summaries'

export default function ContentEnginePage(){
    const [activeTab, setActiveTab] = useState<'fuentes' | 'chat' | 'output'>('fuentes')
    const { templates } = useTemplates()
    console.log('Templates available:', templates.length)
    
    // Lifted state from FuentesCard
    const [sources, setSources] = useState<SourceResponse[]>([])
    const [filteredSources, setFilteredSources] = useState<SourceResponse[]>([])
    const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([])
    const [isLoadingSources, setIsLoadingSources] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    
    // Summary state
    const [generatedSummary, setGeneratedSummary] = useState<SummaryResponse | null>(null)
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

    // Function to refresh sources
    const refreshSources = async () => {
        try {
            setIsLoadingSources(true)
            const fetchedSources = await getContentEngineSources()
            setSources(fetchedSources)
            setFilteredSources(fetchedSources)
        } catch (error) {
            console.error('Error fetching sources:', error)
        } finally {
            setIsLoadingSources(false)
        }
    }

    // Load summary from localStorage on mount
    useEffect(() => {
        const savedSummary = localStorage.getItem('contentEngine_summary')
        if (savedSummary) {
            try {
                setGeneratedSummary(JSON.parse(savedSummary))
            } catch (error) {
                console.error('Error parsing saved summary:', error)
                localStorage.removeItem('contentEngine_summary')
            }
        }
    }, [])

    // Save summary to localStorage when it changes
    useEffect(() => {
        if (generatedSummary) {
            localStorage.setItem('contentEngine_summary', JSON.stringify(generatedSummary))
        }
    }, [generatedSummary])

    // Fetch sources on component mount
    useEffect(() => {
        refreshSources()
    }, [])

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
        console.log('Source added successfully - sources refreshed')
    } 

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar/>
            <main className="flex-1 bg-gray-50">
                {/* Breadcrumb Navigation */}
                <div className="lg:ml-17 lg:pt-2  p-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Listado Clientes</span>
                        <span>›</span>
                        <span>Campaña</span>
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
                                    />
                                </div>
                            </aside>

                            {/* Middle column - Chat */}
                            <section className="flex-1 h-full min-w-0">
                                <div className="h-full">
                                    <ChatCard 
                                        selectedSourceIds={selectedSourceIds}
                                        generatedSummary={generatedSummary}
                                        isGeneratingSummary={isGeneratingSummary}
                                        onSummaryGenerated={setGeneratedSummary}
                                        onGeneratingChange={setIsGeneratingSummary}
                                    />
                                </div>
                            </section>

                            {/* Right column - Output */}
                            <aside className="w-80 h-full">
                                <div className="h-full">
                                    <OutputCard />
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
                                />
                            </div>
                        )}
                        {activeTab === 'chat' && (
                            <div className="h-full">
                                <ChatCard 
                                    selectedSourceIds={selectedSourceIds}
                                    generatedSummary={generatedSummary}
                                    isGeneratingSummary={isGeneratingSummary}
                                    onSummaryGenerated={setGeneratedSummary}
                                    onGeneratingChange={setIsGeneratingSummary}
                                />
                            </div>
                        )}
                        {activeTab === 'output' && (
                            <div className="h-full">
                                <OutputCard />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}