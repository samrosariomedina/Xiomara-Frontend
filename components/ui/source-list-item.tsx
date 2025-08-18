import { MoreHorizontal, ImageIcon } from "lucide-react"

interface SourceListItemProps {
  name: string
  type: "image" | "text" | "url"
  category: string
  timestamp: string
}

export function SourceListItem({ name, type, category, timestamp }: SourceListItemProps) {
  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-medium text-sm">NC</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">{name}</span>
            {type === "image" && (
              <div className="flex items-center space-x-1 text-gray-500">
                <ImageIcon className="h-3 w-3" />
                <span className="text-xs">Imagen</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {category}
            </span>
            <span className="text-xs text-gray-500">Última actualización</span>
            <span className="text-xs text-gray-500">{timestamp}</span>
          </div>
        </div>
      </div>
      <button className="p-1 hover:bg-gray-200 rounded">
        <MoreHorizontal className="h-4 w-4 text-gray-400" />
      </button>
    </div>
  )
}
