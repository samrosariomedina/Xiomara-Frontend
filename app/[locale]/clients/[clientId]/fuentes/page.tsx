import type { Metadata } from 'next'
import FuentesPage from "@/components/pages/listsfuentesPage";
import { Navbar } from "@/components/Navbar";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

type MaybePromise<T> = T | Promise<T>;
type ParamsLike = { params: MaybePromise<{ locale: string; clientId: string }> };

export async function generateMetadata(props: ParamsLike): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const title = 'Fuentes — Xiomara';
  const description = 'Manage sources for this client';
  const path = `/${locale}/clients/fuentes`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: 'Xiomara' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function ClientFuentesPage(props: ParamsLike) {
  // Check authentication on server side
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  
  if (!token) {
    redirect('/auth/login');
  }

  const params = await props.params;
  const { clientId } = params;

  return (
    <>
      <Navbar />
      <FuentesPage clientId={clientId} />
    </>
  );
}

