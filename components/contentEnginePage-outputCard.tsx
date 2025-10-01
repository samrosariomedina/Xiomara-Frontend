import React from 'react'
import { ChevronRight, MoreVertical, Wrench } from 'lucide-react'
import { useTemplates } from '@/context/TemplatesContext'

export default function OutputCard() {
    const { templates } = useTemplates()
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

            <section className="flex-1 min-h-0 flex items-center justify-center">
                <div className="flex flex-col items-center text-center px-4 md:px-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-md bg-white border border-gray-100 flex items-center justify-center mb-3 md:mb-4">
                        <Wrench className="h-6 w-6 md:h-8 md:w-8 text-gray-300" />
                    </div>
                    <h4 className="text-sm md:text-base font-semibold text-gray-700 mb-1 md:mb-2">El contenido creado se guarda aquí</h4>
                    <p className="text-xs md:text-sm text-gray-400">Después de añadir las fuentes, haz clic para crear una nota, una social media post o un blog post, entre otros.</p>
                </div>
            </section>
        </div>
    )
}