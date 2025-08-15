import type { Metadata } from 'next'
import SignupForm from '@/pages/SignupForm';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params;
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
