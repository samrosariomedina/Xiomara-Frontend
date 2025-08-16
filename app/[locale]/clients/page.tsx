import type { Metadata } from 'next'
import ClientsPage from '@/components/pages/clientsPage'   

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const title = 'Clients — Xiomara'
  const description = 'List and manage your clients and their campaigns in Xiomara'
  const path = `/${locale}/clients`

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: 'Xiomara' },
    twitter: { card: 'summary', title, description },
  }
}

export default function Page() {
  return <ClientsPage />
}
