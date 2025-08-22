import React from 'react'
import { ChevronRight, MoreVertical, Wrench } from 'lucide-react'

export default function OutputCard() {
    return (
        <div className="bg-white rounded-lg p-4 md:p-6 w-full shadow-sm h-full flex flex-col">
            <header className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Output</h3>
                <button className="p-1 rounded hover:bg-gray-100">
                    <MoreVertical className="h-5 w-5 text-gray-500" />
                </button>
            </header>

            <section className="mb-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium">Templates Rápidos</h4>
                </div>

                <ul className="space-y-2">
                    <li className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100" />
                            <div className="text-sm text-gray-700">Template solo texto</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                    </li>

                    <li className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100" />
                            <div className="text-sm text-gray-700">Template con imagen</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                    </li>
                </ul>
            </section>

            <div className="border-t border-gray-100" />

            <section className="flex-1 min-h-0 flex items-center justify-center">
                <div className="flex flex-col items-center text-center px-6">
                    <div className="w-20 h-20 rounded-md bg-white border border-gray-100 flex items-center justify-center mb-4">
                        <Wrench className="h-8 w-8 text-gray-300" />
                    </div>
                    <h4 className="text-base font-semibold text-gray-700 mb-2">El contenido creado se guarda aquí</h4>
                    <p className="text-sm text-gray-400">Después de añadir las fuentes, haz clic para crear una nota, una social media post o un blog post, entre otros.</p>
                </div>
            </section>
        </div>
    )
}