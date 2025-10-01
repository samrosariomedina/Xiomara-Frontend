import type { Metadata } from 'next'
import ContentEnginePage from "@/components/pages/contentEnginePage"

type MaybePromise<T> = T | Promise<T>;
type ParamsLike = { params: MaybePromise<{ locale: string }> };

export async function generateMetadata(props: ParamsLike): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params
  const title = 'Content Engine — Xiomara'
  const description = 'Generate and manage content with AI-powered tools in Xiomara'
  const path = `/${locale}/content-engine`

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
  // Templates are now available via TemplatesContext (fetched in layout)
  return <ContentEnginePage />
}