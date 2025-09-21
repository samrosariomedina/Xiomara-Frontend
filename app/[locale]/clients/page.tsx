import type { Metadata } from 'next'
import ClientsPage from '@/components/pages/clientsPage'
import { getClientsAction } from '@/actions/clients'
import { getAllCampaignsAction } from '@/actions/campaigns'
import { ClientResponse, CampaignResponse } from '@/lib/schemas'

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

async function getCampaignsData(): Promise<CampaignResponse[]> {
  try {
    const result = await getAllCampaignsAction()
    console.log('campaigns result', result);
    console.log('Campaigns data:', result.success ? result.data : []);
    return result.success ? result.data : []

  } catch (error) {
    console.error('Failed to fetch campaigns:', error)
    return []
  }
}

export default async function Page() {
  const [clientsData, campaignsData] = await Promise.all([
    getClientsData(),
    getCampaignsData()
  ])

  return <ClientsPage initialClients={clientsData} initialCampaigns={campaignsData} />
}
