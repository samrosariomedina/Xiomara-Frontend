'use client'
import { MoreVertical, Wrench, Copy, Edit, Trash2, Calendar } from 'lucide-react'
import type { OutputResponse } from '@/actions/outputs'
import { deleteOutputAction, deleteOutputItemAction, editOutputAction } from '@/actions/outputs'
import { toast } from 'sonner'
import { useState } from 'react'
import { formatBatchDate, formatDateTimeSafe } from '@/lib/utils'

interface OutputCardProps {
  allOutputs: OutputResponse[]
  isLoadingOutput: boolean
  onOutputsChange?: () => void
  selectedSummaryId?: string | null // ID of currently selected summary
  folderId: string
}

export default function OutputCard({ allOutputs, isLoadingOutput, onOutputsChange, selectedSummaryId, folderId }: OutputCardProps) {
    const [editingItem, setEditingItem] = useState<{ outputId: string; itemId: string; content: string } | null>(null)
    const [editContent, setEditContent] = useState('')
    
    console.log('╔══════════════════════════════════════════════════════╗')
    console.log('║  OUTPUT CARD DEBUG                                   ║')
    console.log('╠══════════════════════════════════════════════════════╣')
    console.log('║  Folder ID:        ', folderId.padEnd(32), '║')
    console.log('║  All Outputs:     ', String(allOutputs.length).padEnd(32), '║')
    console.log('║  Selected Summary: ', (selectedSummaryId || 'None').padEnd(32), '║')
    console.log('╚══════════════════════════════════════════════════════╝')

    // Filter outputs by selected summary
    const filteredOutputs = selectedSummaryId 
        ? allOutputs.filter(output => output.summary === selectedSummaryId)
        : []

    console.log('📊 Filtered outputs:', filteredOutputs.length, 'out of', allOutputs.length)

    const handleCopyContent = (content: string) => {
        // Strip HTML tags for plain text copy
        const plainText = content.replace(/<[^>]*>/g, '')
        navigator.clipboard.writeText(plainText)
        toast.success('Content copied to clipboard!')
    }

    const handleEditItem = (outputId: string, itemId: string, content: string) => {
        setEditingItem({ outputId, itemId, content })
        setEditContent(content.replace(/<[^>]*>/g, '')) // Strip HTML for editing
    }

    const handleSaveEdit = async () => {
        if (!editingItem) return

        try {
            await editOutputAction(editingItem.outputId, {
                [editingItem.itemId]: { content: editContent }
            })
            toast.success('Output updated successfully!')
            setEditingItem(null)
            setEditContent('')
            onOutputsChange?.()
        } catch (error) {
            console.error('Error updating output:', error)
            toast.error('Failed to update output')
        }
    }

    const handleDeleteItem = async (outputId: string, itemId: string) => {
        if (!confirm('Are you sure you want to delete this output item?')) return

        try {
            console.log('Deleting output item:', { outputId, itemId })
            await deleteOutputItemAction(outputId, itemId)
            console.log('Output item deleted successfully')
            toast.success('Output item deleted successfully!')
            onOutputsChange?.()
        } catch (error) {
            console.error('Error deleting output item:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete output item'
            toast.error(errorMessage)
        }
    }

    const handleDeleteOutput = async (outputId: string) => {
        if (!confirm('Are you sure you want to delete this entire output batch?')) return

        try {
            console.log('Deleting entire output batch:', { outputId })
            await deleteOutputAction(outputId)
            console.log('Output batch deleted successfully')
            toast.success('Output batch deleted successfully!')
            onOutputsChange?.()
        } catch (error) {
            console.error('Error deleting output:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete output batch'
            toast.error(errorMessage)
        }
    }

    return (
        <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 w-full shadow-sm h-full flex flex-col">
            <header className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-base md:text-lg font-semibold">Output</h3>
                <button className="p-1 rounded hover:bg-gray-100">
                    <MoreVertical className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                </button>
            </header>

            {/* <section className="mb-3 md:mb-4">
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
            </section> */}

            <div className="border-t border-gray-100" />

            {/* All Generated Outputs Section */}
            <section className="flex-1 min-h-0 flex flex-col">
                {isLoadingOutput ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#31499f] border-t-transparent"></div>
                    </div>
                ) : allOutputs.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center text-center px-4 md:px-6">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-md bg-white border border-gray-100 flex items-center justify-center mb-3 md:mb-4">
                                <Wrench className="h-6 w-6 md:h-8 md:w-8 text-gray-300" />
                            </div>
                            <h4 className="text-sm md:text-base font-semibold text-gray-700 mb-1 md:mb-2">El contenido creado se guarda aquí</h4>
                            <p className="text-xs md:text-sm text-gray-400">Generate a summary first, then click a template button to create content.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs md:text-sm font-medium">
                                {selectedSummaryId ? 'Generated Content' : 'No Summary Selected'}
                            </h4>
                            {selectedSummaryId && (
                                <span className="text-xs text-gray-500">
                                    {filteredOutputs.length} batch{filteredOutputs.length !== 1 ? 'es' : ''}
                                </span>
                            )}
                        </div>
                        
                        {/* Show message when no summary is selected */}
                        {!selectedSummaryId ? (
                            <div className="text-center py-8 text-gray-500">
                                <div className="text-sm">
                                    Select or generate a summary to view its outputs
                                </div>
                            </div>
                        ) : filteredOutputs.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <div className="text-sm">
                                    No outputs generated for this summary yet
                                </div>
                            </div>
                        ) : (
                            /* Filtered Output Batches */
                            <div className="space-y-4">
                                {filteredOutputs.map((output) => (
                                <div key={output._id} className="border border-gray-200 rounded-lg p-3">
                                    {/* Output Batch Header */}
                                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700">
                                                Batch - {formatBatchDate(output.timestamp)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleDeleteOutput(output._id)}
                                                className="p-1 hover:bg-red-100 rounded transition-colors text-red-500"
                                                title="Delete entire batch"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Output Items */}
                                    <div className="space-y-2">
                                        {output.items.map((item) => (
                                            <div key={item._id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                                                {editingItem?.itemId === item._id ? (
                                                    // Edit Mode
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs text-gray-500 font-medium">
                                                                Edit Content
                                                            </span>
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={handleSaveEdit}
                                                                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingItem(null)}
                                                                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <textarea
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            className="w-full p-2 border border-gray-300 rounded text-sm"
                                                            rows={4}
                                                        />
                                                    </div>
                                                ) : (
                                                    // View Mode
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-[#31499f] bg-[#f7f9ff] px-2 py-1 rounded-full">
                                                                    {item.templateName || 'Manual Content'}
                                                                </span>
                                                                {item.edited && (
                                                                    <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                                                        Edited
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => handleCopyContent(item.content)}
                                                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                                    title="Copy content"
                                                                >
                                                                    <Copy className="h-3 w-3 text-gray-500" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleEditItem(output._id, item._id, item.content)}
                                                                    className="p-1 hover:bg-blue-100 rounded transition-colors text-blue-500"
                                                                    title="Edit content"
                                                                >
                                                                    <Edit className="h-3 w-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteItem(output._id, item._id)}
                                                                    className="p-1 hover:bg-red-100 rounded transition-colors text-red-500"
                                                                    title="Delete item"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="bg-white rounded p-3 mb-2">
                                                            <div 
                                                                className="text-xs md:text-sm text-gray-700 leading-relaxed"
                                                                dangerouslySetInnerHTML={{ __html: item.content }}
                                                            />
                                                        </div>
                                                        
                                                        <div className="text-xs text-gray-400">
                                                            Generated: {formatDateTimeSafe(item.timestamp)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    )
}