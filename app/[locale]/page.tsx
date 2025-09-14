import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Xiomara',
  description: 'Welcome to Xiomara. Sign in to access your account.'
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  // Server-side redirect to the locale-aware login page
  redirect(`/${locale}/auth/login`)
}
