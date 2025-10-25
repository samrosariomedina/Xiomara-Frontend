import type { Metadata } from 'next'
import DashBoard from "@/components/pages/dashboardPage";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAllCampaignsAction } from "@/actions/campaigns";
import { getClientsAction } from "@/actions/clients";
import type { CampaignResponse, ClientResponse } from "@/lib/schemas";

type MaybePromise<T> = T | Promise<T>;
type ParamsLike = { params: MaybePromise<{ locale: string; clientId: string; campaignId: string }> };

export async function generateMetadata(props: ParamsLike): Promise<Metadata> {
  const { params } = await props;
  const { clientId, campaignId } = await params;
  
  const title = `Campaign Dashboard - ${campaignId}`;
  const description = `Dashboard for campaign ${campaignId} under client ${clientId}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: { card: 'summary', title, description },
  }
}

export default async function CampaignDashboardPage(props: ParamsLike) {
  // Check authentication on server side
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  
  if (!token) {
    redirect('/auth/login');
  }

  const { params } = await props;
  const { clientId, campaignId } = await params;

  // Ensure we have valid IDs before rendering
  if (!clientId || !campaignId) {
    return <div>Loading...</div>;
  }

  // Fetch campaign and client data to pass to the dashboard
  let campaignData: CampaignResponse | null = null;
  let clientData: ClientResponse | null = null;

  try {
    // Fetch campaign data
    const campaignsResult = await getAllCampaignsAction();
    if (campaignsResult.success) {
      campaignData = campaignsResult.data.find((campaign: CampaignResponse) => campaign._id === campaignId) || null;
    }

    // Fetch client data
    const clientsResult = await getClientsAction();
    if (clientsResult.success) {
      clientData = clientsResult.data.find((client: ClientResponse) => client._id === clientId) || null;
    }
  } catch (error) {
    console.error('Error fetching campaign or client data:', error);
  }

  return (
    <div>
      <DashBoard 
        key={`${clientId}-${campaignId}`} 
        clientId={clientId} 
        campaignId={campaignId}
        campaignData={campaignData}
        clientData={clientData}
      />
    </div>
  )
}
