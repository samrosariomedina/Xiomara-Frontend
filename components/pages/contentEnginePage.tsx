"use client"

import { useState } from "react"
import ChatCard from "@/components/contentEnginePage-chatCard"
import FuentesCard from "@/components/contentEnginePage-fuentesCard"
import OutputCard from "@/components/contentEnginePage-outputCard"
import { Navbar } from "@/components/Navbar"

export default function ContentEnginePage(){
    const [activeTab, setActiveTab] = useState<'fuentes' | 'chat' | 'output'>('fuentes')

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
                                    <FuentesCard />
                                </div>
                            </aside>

                            {/* Middle column - Chat */}
                            <section className="flex-1 h-full min-w-0">
                                <div className="h-full">
                                    <ChatCard />
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
                                <FuentesCard />
                            </div>
                        )}
                        {activeTab === 'chat' && (
                            <div className="h-full">
                                <ChatCard />
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