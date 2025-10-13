import type { Metadata } from 'next'
import { Suspense } from 'react'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import ForgotPasswordFormSkeleton from '@/components/skeletons/ForgotPasswordFormSkeleton'

type MaybePromise<T> = T | Promise<T>;
type ParamsLike = { params: MaybePromise<{ locale: string }> };

export async function generateMetadata(props: ParamsLike): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const title = 'Forgot Password | Xiomara';
  const description = 'Reset your Xiomara account password.';
  const path = `/${locale}/auth/forgot-password`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: 'Xiomara' },
    twitter: { card: 'summary', title, description }
  };
}


// Server component
export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordFormSkeleton />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
