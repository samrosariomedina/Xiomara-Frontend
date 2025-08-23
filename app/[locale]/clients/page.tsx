import type { Metadata } from 'next'
import ClientsPage from '@/pages/clientsPage'   

type MaybePromise<T> = T | Promise<T>;
type ParamsLike = { params: MaybePromise<{ locale: string }> };

export async function generateMetadata(props: ParamsLike): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params
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
