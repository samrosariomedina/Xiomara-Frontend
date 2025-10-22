import type { Metadata } from 'next'
import DashBoard from "@/components/pages/dashboardPage";
import { ClientAutoSelector } from "@/components/clients/ClientAutoSelector";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

type MaybePromise<T> = T | Promise<T>;
type ParamsLike = { params: MaybePromise<{ locale: string }> };

export async function generateMetadata(props: ParamsLike): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params
  const title = 'Dashboard | Xiomara'
  const description = 'Overview and metrics for your clients and campaigns.'
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

export default async function Page() {
  // Check authentication on server side
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  
  if (!token) {
    redirect('/auth/login');
  }

  return (
    <div>
      <ClientAutoSelector />
      <DashBoard />
    </div>
  )
}


