import type { Metadata } from 'next'
import MediaPage from "@/components/pages/listsmediaPage";
import { Navbar } from "@/components/Navbar";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

type MaybePromise<T> = T | Promise<T>;
type ParamsLike = { params: MaybePromise<{ locale: string; clientId: string; campaignId: string }> };

export async function generateMetadata(props: ParamsLike): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const title = 'Media Listening — Xiomara';
  const description = 'Manage media listening for this campaign';
  const path = `/${locale}/clients/media`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: 'Xiomara' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function CampaignMediaPage(props: ParamsLike) {
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
      <MediaPage clientId={clientId} campaignId={campaignId} />
    </>
  );
}

