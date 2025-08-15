import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"

interface KnowledgeItemProps {
  id: number
  name: string
  type: string
  lastUpdate: string
  time: string
}

export function KnowledgeItem({ name, type, lastUpdate, time }: KnowledgeItemProps) {
  return (
    <div className="flex items-start space-x-2 sm:space-x-3">
      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-blue-600 text-xs sm:text-sm font-medium">NC</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
        </div>
        <p className="text-xs text-blue-600 mt-1">{type}</p>
        <div className="flex items-center space-x-2 mt-2">
          <p className="text-xs text-gray-500">{lastUpdate}</p>
          <p className="text-xs text-gray-900">{time}</p>
        </div>
      </div>
      <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0">
        <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </div>
  )
}
