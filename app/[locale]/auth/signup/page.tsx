import type { Metadata } from 'next'
import SignupForm from '@/components/pages/SignupForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = 'Create Account | Xiomara';
  const description = 'Create your Xiomara account to get started.';
  const path = `/${locale}/auth/signup`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: 'Xiomara' },
    twitter: { card: 'summary', title, description }
  };
}

export default function SignupPage() {
  return <SignupForm />;
}
