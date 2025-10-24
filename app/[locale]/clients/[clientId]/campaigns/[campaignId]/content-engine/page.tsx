import type { Metadata } from 'next'
import ContentEnginePage from "@/components/pages/contentEnginePage";
import { Navbar } from "@/components/Navbar";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

type MaybePromise<T> = T | Promise<T>;
type ParamsLike = { params: MaybePromise<{ locale: string; clientId: string; campaignId: string }> };

export async function generateMetadata(props: ParamsLike): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const title = 'Content Engine — Xiomara';
  const description = 'Generate content for this campaign';
  const path = `/${locale}/clients/content-engine`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: 'Xiomara' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function CampaignContentEnginePage(props: ParamsLike) {
  // Check authentication on server side
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  
  if (!token) {
    redirect('/auth/login');
  }

  const params = await props.params;
  const { clientId, campaignId } = params;

  return (
    <>
      <Navbar />
      <ContentEnginePage clientId={clientId} campaignId={campaignId} />
    </>
  );
}

