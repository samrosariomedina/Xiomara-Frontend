import type { Metadata } from 'next'
import { Suspense } from 'react'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import ResetPasswordFormSkeleton from '@/components/skeletons/ResetPasswordFormSkeleton'

type MaybePromise<T> = T | Promise<T>;
type ParamsLike = { params: MaybePromise<{ locale: string }> };

export async function generateMetadata(props: ParamsLike): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const title = 'Reset Password | Xiomara';
  const description = 'Reset your Xiomara account password.';
  const path = `/${locale}/auth/reset-password`;

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
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFormSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
