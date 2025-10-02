import React, { useState, useEffect } from 'react'
import { ChevronRight, MoreVertical, Wrench, Edit, Trash2, Copy, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTemplates } from '@/context/TemplatesContext'
import { getOutputsAction, editOutputAction, removeOutputAction } from '@/actions/outputs'
import type { OutputResponse, OutputItem } from '@/actions/outputs'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function OutputCard() {
    const { templates } = useTemplates()
    
    // Local state for outputs
    const [outputs, setOutputs] = useState<OutputResponse[]>([])
    const [selectedOutput, setSelectedOutput] = useState<OutputResponse | null>(null)
    const [isLoadingOutputs, setIsLoadingOutputs] = useState(true)
    const [editingItem, setEditingItem] = useState<{ outputId: string, itemId: string, content: string } | null>(null)

    // Fetch outputs on component mount
    useEffect(() => {
        fetchOutputs()
    }, [])

    const fetchOutputs = async () => {
        try {
            setIsLoadingOutputs(true)
            const fetchedOutputs = await getOutputsAction()
            setOutputs(fetchedOutputs)
            if (fetchedOutputs.length > 0 && !selectedOutput) {
                setSelectedOutput(fetchedOutputs[0])
            }
        } catch (error) {
            console.error('Error fetching outputs:', error)
            toast.error('Failed to load outputs')
        } finally {
            setIsLoadingOutputs(false)
        }
    }

    // React Query mutation for editing output items
    const editOutputMutation = useMutation({
        mutationFn: ({ outputId, items }: { outputId: string, items: { [itemId: string]: { content: string } } }) => 
            editOutputAction(outputId, items),
        onSuccess: (updatedOutput) => {
            // Update local state
            setOutputs(prev => prev.map(output => 
                output._id === updatedOutput._id ? updatedOutput : output
            ))
            if (selectedOutput?._id === updatedOutput._id) {
                setSelectedOutput(updatedOutput)
            }
            setEditingItem(null)
            toast.success('Output updated successfully!')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update output')
        }
    })

    // React Query mutation for removing output items
    const removeOutputMutation = useMutation({
        mutationFn: ({ outputId, itemIds }: { outputId: string, itemIds?: string[] }) => 
            removeOutputAction(outputId, itemIds),
        onSuccess: () => {
            fetchOutputs() // Refresh outputs after removal
            toast.success('Output removed successfully!')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to remove output')
        }
    })

    const handleEditItem = (outputId: string, itemId: string, content: string) => {
        setEditingItem({ outputId, itemId, content })
    }

    const handleSaveEdit = () => {
        if (!editingItem) return
        
        editOutputMutation.mutate({
            outputId: editingItem.outputId,
            items: {
                [editingItem.itemId]: { content: editingItem.content }
            }
        })
    }

    const handleRemoveItem = (outputId: string, itemId: string) => {
        removeOutputMutation.mutate({ outputId, itemIds: [itemId] })
    }

    const handleCopyContent = (content: string) => {
        navigator.clipboard.writeText(content)
        toast.success('Content copied to clipboard!')
    }

    // Listen for new outputs (could be called from ChatCard)
    useEffect(() => {
        const handleFocus = () => {
            fetchOutputs()
        }

        window.addEventListener('focus', handleFocus)
        document.addEventListener('visibilitychange', handleFocus)

        return () => {
            window.removeEventListener('focus', handleFocus)
            document.removeEventListener('visibilitychange', handleFocus)
        }
    }, [])

    return (
        <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 w-full shadow-sm h-full flex flex-col">
            <header className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-base md:text-lg font-semibold">Output</h3>
                <button className="p-1 rounded hover:bg-gray-100">
                    <MoreVertical className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                </button>
            </header>

            <section className="mb-3 md:mb-4">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                    <h4 className="text-xs md:text-sm font-medium">Templates Rápidos</h4>
                </div>

                <ul className="space-y-1.5 md:space-y-2">
                    {templates.length > 0 ? (
                        templates.slice(0, 3).map((template) => (
                            <li key={template._id} className="flex items-center justify-between p-2 md:p-3 rounded-md hover:bg-gray-50">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-100" />
                                    <div className="text-xs md:text-sm text-gray-700 truncate">
                                        {template.title || 'Sin título'}
                                    </div>
                                </div>
                                <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                            </li>
                        ))
                    ) : (
                        <li className="flex items-center justify-center p-2 md:p-3 rounded-md">
                            <div className="text-xs md:text-sm text-gray-500">No hay templates disponibles</div>
                        </li>
                    )}
                </ul>
            </section>

            <div className="border-t border-gray-100" />

            {/* Generated Outputs Section */}
            <section className="flex-1 min-h-0 flex flex-col">
                {isLoadingOutputs ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#31499f] border-t-transparent"></div>
                    </div>
                ) : outputs.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center text-center px-4 md:px-6">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-md bg-white border border-gray-100 flex items-center justify-center mb-3 md:mb-4">
                                <Wrench className="h-6 w-6 md:h-8 md:w-8 text-gray-300" />
                            </div>
                            <h4 className="text-sm md:text-base font-semibold text-gray-700 mb-1 md:mb-2">El contenido creado se guarda aquí</h4>
                            <p className="text-xs md:text-sm text-gray-400">Generate a summary first, then click &quot;Generate Output&quot; to create content.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-3">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs md:text-sm font-medium">Generated Content</h4>
                            <span className="text-xs text-gray-500">{outputs.length} output{outputs.length !== 1 ? 's' : ''}</span>
                        </div>
                        
                        {/* Output List */}
                        <div className="space-y-2">
                            {outputs.map((output) => (
                                <div key={output._id} className="border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-gray-500">
                                            {new Date(output.timestamp).toLocaleDateString()}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {output.items.length} item{output.items.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    
                                    {/* Output Items */}
                                    <div className="space-y-2">
                                        {output.items.map((item) => (
                                            <div key={item._id} className="bg-gray-50 rounded p-2">
                                                {editingItem?.itemId === item._id ? (
                                                    <div className="space-y-2">
                                                        <textarea
                                                            value={editingItem.content}
                                                            onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                                                            className="w-full p-2 text-xs border border-gray-300 rounded resize-none"
                                                            rows={3}
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button
                                                                onClick={handleSaveEdit}
                                                                disabled={editOutputMutation.isPending}
                                                                size="sm"
                                                                className="text-xs"
                                                            >
                                                                {editOutputMutation.isPending ? 'Saving...' : 'Save'}
                                                            </Button>
                                                            <Button
                                                                onClick={() => setEditingItem(null)}
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-xs"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div 
                                                            className="text-xs text-gray-700 mb-2 line-clamp-3"
                                                            dangerouslySetInnerHTML={{ __html: item.content }}
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleEditItem(output._id, item._id, item.content)}
                                                                className="p-1 hover:bg-gray-200 rounded"
                                                                title="Edit"
                                                            >
                                                                <Edit className="h-3 w-3 text-gray-500" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleCopyContent(item.content)}
                                                                className="p-1 hover:bg-gray-200 rounded"
                                                                title="Copy"
                                                            >
                                                                <Copy className="h-3 w-3 text-gray-500" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRemoveItem(output._id, item._id)}
                                                                className="p-1 hover:bg-gray-200 rounded"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-3 w-3 text-red-500" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}