import type { Metadata } from 'next'
import DashBoard from "@/components/pages/dashboardPage";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getClientsAction } from "@/actions/clients";
import type { ClientResponse } from "@/lib/schemas";

type MaybePromise<T> = T | Promise<T>;
type ParamsLike = { params: MaybePromise<{ locale: string; clientId: string }> };

export async function generateMetadata(props: ParamsLike): Promise<Metadata> {
  const { params } = await props;
  const { clientId } = await params;
  
  const title = `Client Dashboard - ${clientId}`;
  const description = `Dashboard for client ${clientId}`;

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

export default async function ClientDashboardPage(props: ParamsLike) {
  // Check authentication on server side
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  
  if (!token) {
    redirect('/auth/login');
  }

  const { params } = await props;
  const { clientId } = await params;

  // Ensure we have valid ID before rendering
  if (!clientId) {
    return <div>Loading...</div>;
  }

  // Fetch client data to pass to the dashboard
  let clientData: ClientResponse | null = null;

  try {
    // Fetch client data
    const clientsResult = await getClientsAction();
    if (clientsResult.success) {
      clientData = clientsResult.data.find((client: ClientResponse) => client._id === clientId) || null;
    }
  } catch (error) {
    console.error('Error fetching client data:', error);
  }

  return (
    <div>
      <DashBoard 
        key={clientId} 
        clientId={clientId}
        clientData={clientData}
      />
    </div>
  )
}
