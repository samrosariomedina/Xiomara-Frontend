import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal } from "lucide-react"

interface SourceCardProps {
  id: number
  name: string
  description: string
  time: string
  showCheckbox?: boolean
}

export function SourceCard({ name, description, time, showCheckbox = true }: SourceCardProps) {
  return (
    <div className="flex items-start gap-2 sm:gap-3">
      {showCheckbox && <Checkbox className="h-4 w-4 mt-1" />}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{name}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
        <Button variant="link" className="text-blue-600 text-xs p-0 h-auto font-normal mt-1">
          Agregar a campaña
        </Button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-xs text-gray-500 min-w-[35px] sm:min-w-[40px]">{time}</span>

        <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  )
}
