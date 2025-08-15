import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Globe, MoreHorizontal } from "lucide-react"

interface UserCardProps {
  id: number
  name: string
  avatar?: string
  status: "Aprobado" | "Pendiente"
  sources: number
  time: string
  showCheckbox?: boolean
}

export function UserCard({ name, avatar, status, sources, time, showCheckbox = true }: UserCardProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {showCheckbox && <Checkbox className="h-4 w-4" />}

      <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
        <AvatarImage src={avatar || "/placeholder.svg"} />
        <AvatarFallback className="text-xs">NC</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
          <div className="flex items-center gap-1 text-blue-600">
            <Globe className="h-3 w-3" />
            <span className="text-xs font-medium">{sources}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Badge
          className={`text-xs px-2 py-1 font-medium ${
            status === "Aprobado"
              ? "bg-green-100 text-green-700 hover:bg-green-100"
              : "bg-orange-100 text-orange-700 hover:bg-orange-100"
          }`}
        >
          {status}
        </Badge>

        <span className="text-xs text-gray-500 min-w-[35px] sm:min-w-[40px]">{time}</span>

        <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  )
}
