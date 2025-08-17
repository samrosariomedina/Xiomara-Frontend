import type { Metadata } from 'next'
import DashBoard from "@/pages/DashBoard";

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

export default function Page() {
  return <DashBoard />
}


