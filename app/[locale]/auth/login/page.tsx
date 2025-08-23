import type { Metadata } from 'next'
import LoginForm from '@/components/pages/loginPage';

type MaybePromise<T> = T | Promise<T>;
type ParamsLike = { params: MaybePromise<{ locale: string }> };

export async function generateMetadata(props: ParamsLike): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const title = 'Login | Xiomara';
  const description = 'Sign in to your Xiomara account to access your dashboard.';
  const path = `/${locale}/auth/login`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: 'Xiomara' },
    twitter: { card: 'summary', title, description }
  };
}

export default function LoginPage() {
  return <LoginForm />;
}
