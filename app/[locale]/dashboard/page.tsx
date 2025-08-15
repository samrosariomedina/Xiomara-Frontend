import type { Metadata } from 'next'
import DashBoard from "@/pages/DashBoard";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params
  const title = 'Dashboard | Xiomara'
  const description = 'Overview and metrics for your clients and campaigns.'
  const path = `/${locale}/dashboard`

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
  return <DashBoard />
}


