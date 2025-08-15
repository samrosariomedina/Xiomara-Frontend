import { Bell, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTranslations } from 'next-intl'

export function Navbar() {
  const t = useTranslations('NAVBAR')
  
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-[86rem] mx-auto flex items-center justify-between">
        <div className="text-xl font-semibold text-gray-900">{t('appName')}</div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* trigger: avatar always visible; username hidden on small screens */}
              <Button aria-label={t('user')} variant="ghost" className="flex items-center gap-2 text-gray-700 ">
                <Avatar className="h-8 w-8">
                  {/* Use absolute path to public/ so it resolves correctly regardless of locale */}
                  {/* The file exists at /public/diverse-user-avatars.png */}
                  <AvatarImage src="/avatar.svg" alt="user avatar" />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                {/* hide username on mobile (show only avatar) */}
                <span className="hidden sm:inline text-sm font-medium">{t('user')}</span>
                {/* Chevron: hide on mobile to match requirement */}
                <ChevronDown className="hidden sm:inline h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>{t('profile')}</DropdownMenuItem>
              <DropdownMenuItem>{t('settings')}</DropdownMenuItem>
              <DropdownMenuItem>{t('logout')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
