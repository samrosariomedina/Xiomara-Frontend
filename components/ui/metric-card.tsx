import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
}

export function MetricCard({ title, value, icon: Icon, iconColor = "text-gray-600" }: MetricCardProps) {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm p-4 sm:p-6">
      <div className="flex flex-col items-center sm:flex-row sm:items-center sm:space-x-4 text-center sm:text-left">
        <div className={`p-3 rounded-full bg-[#F7F9FF] ${iconColor} flex items-center justify-center`}> 
          <Icon className="h-6 w-6 sm:h-6 sm:w-6" />
        </div>

        <div className="mt-3 sm:mt-0">
          <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  )
}
