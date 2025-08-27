"use client"

import { Bell, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTranslations } from 'next-intl'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { toast } from "sonner"
import { useAuth } from '@/context/AuthContext'

export function Navbar() {
  const t = useTranslations('NAVBAR')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { logout } = useAuth()
  
  const handleLogout = async () => {
    try {
      await logout() // Call the logout function from useAuth
      toast.success(t('logoutSuccess'))
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error(t('logoutError'))
    }
  }

  const toggleLocale = () => {
    try {
      const seg = (pathname || "/").split('/').filter(Boolean)
      const current = seg[0] === 'es' ? 'es' : 'en'
      const next = current === 'en' ? 'es' : 'en'

      let pathWithoutLocale = pathname || '/'
      if (pathWithoutLocale.startsWith(`/${current}`)) {
        pathWithoutLocale = pathWithoutLocale.slice(current.length + 1) || '/'
      }

      const query = searchParams ? `?${searchParams.toString()}` : ''
      const newPath = `/${next}${pathWithoutLocale}${query}`

      router.push(newPath)
    } catch {
      const next = (pathname || '').startsWith('/es') ? 'en' : 'es'
      router.push(`/${next}`)
    }
  }
  
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
              {/* User menu trigger */}
              <Button aria-label={t('user')} variant="ghost" className="flex items-center gap-2 text-gray-700 ">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.svg" alt="user avatar" />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium">{t('user')}</span>
                <ChevronDown className="hidden sm:inline h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>{t('profile')}</DropdownMenuItem>
              <DropdownMenuItem>{t('settings')}</DropdownMenuItem>
              <DropdownMenuItem onClick={toggleLocale}>
                {((pathname || '/').split('/')[1] === 'es') ? 'English' : 'Español'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>{t('logout')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
