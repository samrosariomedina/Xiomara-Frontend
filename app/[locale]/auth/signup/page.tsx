import type { Metadata } from 'next'
import { Suspense } from 'react'
import SignupForm from '@/components/auth/SignupForm'
import SignupFormSkeleton from '@/components/skeletons/SignupFormSkeleton'

export async function generateMetadata(props: { params: { locale: string } } | { params: Promise<{ locale: string }> }): Promise<Metadata> {
  // `params` can be a promise-like value in Next.js metadata flow,
  // await it before accessing properties to avoid sync access errors.
  const params = await (props).params;
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


// Server component
export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFormSkeleton />}>
      <SignupForm />
    </Suspense>
  );
}
