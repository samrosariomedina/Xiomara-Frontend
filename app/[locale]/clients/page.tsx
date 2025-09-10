import type { Metadata } from 'next'
import ClientsPage from '@/components/pages/clientsPage'
import { getClientsAction } from '@/actions/clients'
import { ClientResponse } from '@/lib/schemas'

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

async function getClientsData(): Promise<ClientResponse[]> {
  try {
    const result = await getClientsAction()
    console.log('result', result); 
    return result.success ? result.data : []

  } catch (error) {
    console.error('Failed to fetch clients:', error)
    return []
  }
}

export default async function Page() {
  const clientsData = await getClientsData()

  return <ClientsPage initialClients={clientsData} />
}
