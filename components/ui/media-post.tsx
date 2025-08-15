import { Badge } from "@/components/ui/badge"

interface MediaPostProps {
  id: number
  username: string
  platform: string
  content: string
  time: string
  engagement: string
}

export function MediaPost({ username, platform, content, time, engagement }: MediaPostProps) {
  // Layout: inner rounded card matching reference image. Keep compact on mobile (no changes to parent responsive behavior).
  const [pct, ...rest] = engagement.split(" ")

  return (
    <div>
      <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
        {/* Top row: username left, badges right (badges hidden on xs) */}
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <span className="text-sm font-semibold text-gray-900 block truncate">{username}</span>
            <p className="text-sm text-gray-700 mt-2 max-w-xl">{content}</p>
          </div>

          <div className="hidden sm:flex flex-col items-end ml-4">
            <div className="flex gap-2">
              <Badge className="bg-blue-50 text-blue-700 text-xs">Positivo</Badge>
              <Badge className="bg-gray-100 text-gray-700 text-xs">{platform}</Badge>
            </div>
          </div>
        </div>

        {/* Bottom row: time left (left) and engagement (right) */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-500">{time}</span>
          <div className="text-sm text-right">
            <span className="font-semibold text-gray-900">{pct}</span>
            <span className="text-xs text-gray-500 ml-2">{rest.join(" ")}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
