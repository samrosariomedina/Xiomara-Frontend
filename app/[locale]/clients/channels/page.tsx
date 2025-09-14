import type { Metadata } from 'next'
import DashBoard from "@/components/pages/dashboardPage";
import { ClientContextDisplay } from "@/components/ClientContextDisplay";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getReferences } from "@/actions/knowledge";
import { getSources } from "@/actions/sources";

type MaybePromise<T> = T | Promise<T>;
type ParamsLike = { params: MaybePromise<{ locale: string }> };

export async function generateMetadata(props: ParamsLike): Promise<Metadata> {
  const params = await props.params;
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

export default async function Page() {
  // Check authentication on server side
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  
  if (!token) {
    redirect('/auth/login');
  }

  // Fetch references and sources data server-side
  const [references, sources] = await Promise.all([
    getReferences(),
    getSources()
  ]);
  
  console.log('Channels page - references received:', references.length, references);
  console.log('Channels page - sources received:', sources.length, sources);

  return (
    <div>
      <ClientContextDisplay />
      <DashBoard references={references} sources={sources} />
    </div>
  )
}


