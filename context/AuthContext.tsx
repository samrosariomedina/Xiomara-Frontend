"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutAction,
    onSuccess: () => {
      // Clear user data from cache
      queryClient.setQueryData(['user'], null)
      queryClient.clear()
      
      // Show success message
      toast.success(t('logoutSuccess'))
      
      // Redirect to login
      router.push(routes.auth.login)
    },
    onError: (error: Error) => {
      console.error('Logout error:', error)
      toast.error(t('logoutError'))
    },
  })

  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
  }

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    logout: handleLogout,
    refetchUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
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