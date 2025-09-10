import { MetricCard } from "@/components/ui/metric-card"
import { Users,  FileText, Ear,  Globe } from "lucide-react"

const metrics = [
  {
    title: "Corresponsales",
    value: "0",
    icon: Users,
    iconColor: "text-gray-600",
  },
  {
    title: "Media listeners",
    value: "0",
    icon: Ear,
    iconColor: "text-gray-600",
  },
  {
    title: "Knowledge base",
    value: "0",
    icon: Globe,
    iconColor: "text-gray-600",
  },
  {
    title: "Generales",
    value: "0",
    icon: FileText,
    iconColor: "text-gray-600",
  },
]

export function MetricsCards() {
  return (
  <div className="px-4  grid grid-cols-2 lg:grid-cols-4 gap-3  lg:gap-6 mt-4  max-w-full mx-auto">
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          iconColor={metric.iconColor}
        />
      ))}
    </div>
  )
}
