import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { checkAuthAction } from '@/actions/auth'

export const metadata: Metadata = {
  title: 'Xiomara',
  description: 'Welcome to Xiomara. Sign in to access your account.'
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  
  // Check if user is already authenticated
  const cookieStore = await cookies()
  const token = cookieStore.get('authToken')?.value
  
  if (token) {
    // If user has a token, check if it's valid
    try {
      const authResult = await checkAuthAction()
      if (authResult.success && authResult.authenticated) {
        // User is authenticated, redirect to clients dashboard
        redirect(`/${locale}/clients`)
      }
    } catch (error) {
      // If auth check fails, continue to login redirect
      console.error('Auth check failed:', error)
    }
  }
  
  // If no token or auth check failed, redirect to login
  redirect(`/${locale}/auth/login`)
}
