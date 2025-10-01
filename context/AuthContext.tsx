"use client"

import React, { createContext, useContext, ReactNode, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getUserProfileAction, logoutAction } from '@/actions/auth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { User, AuthContextType } from '@/lib/types'
import { routes } from '@/lib/routes'

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
interface AuthProviderProps {
  children: ReactNode
  initialUser?: User | null
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const t = useTranslations('AUTH')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Query for user profile
  const {
    data: user,
    isLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const result = await getUserProfileAction()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user profile')
      }
      return result.user
    },
    initialData: initialUser,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      
      // Call logout action
      await logoutAction()
      
      // Clear user data from cache
      queryClient.setQueryData(['user'], null)
      queryClient.clear()
      
      // Redirect to login
      router.push(routes.auth.login)
    } catch (error) {
      console.error('Logout error:', error)
      toast.error(t('logoutError'))
    } finally {
      setIsLoggingOut(false)
    }
  }

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    logout: handleLogout,
    refetchUser,
    isLoggingOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Logout Loading Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-700 font-medium">Logging out...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 