import type { Metadata } from 'next'
import DashBoard from "@/components/pages/dashboardPage";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

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

  return (
    <div>
      <DashBoard clientId={clientId} campaignId={campaignId} />
    </div>
  )
}
