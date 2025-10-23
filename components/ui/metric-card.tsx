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
    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
      <div className="flex flex-col items-center text-center">
        <div className={`p-4 rounded-full bg-[#F7F9FF] ${iconColor} flex items-center justify-center mb-4`}> 
          <Icon className="h-6 w-6" />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  )
}
