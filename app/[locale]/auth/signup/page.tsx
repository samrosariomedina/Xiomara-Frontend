import type { Metadata } from 'next'
import { Suspense } from 'react'
import SignupForm from '@/components/forms/SignupForm'
import { Skeleton } from '@/components/ui/skeleton'

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

// Loading component for the signup form
function SignupFormSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div 
        className="bg-gray-50 lg:bg-white lg:shadow-sm p-8 rounded-lg w-full max-w-sm"
        style={{
          width: '390px',
          height: '700px',
          justifyContent: 'center',
          alignContent: 'center'
        }}
      >
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <Skeleton className="h-8 w-32 mx-auto mb-2" />
          <Skeleton className="h-5 w-24 mx-auto" />
        </div>

        {/* Form Skeleton */}
        <div className="space-y-4">
          {/* Email Field */}
          <div>
            <Skeleton className="h-4 w-12 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Name Field */}
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Password Field */}
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Repeat Password Field */}
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Create Account Button */}
          <div className="pt-2">
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>

        {/* Login Section */}
        <div className="mt-9 text-center">
          <Skeleton className="h-3 w-32 mx-auto mb-3" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}

// Server component
export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFormSkeleton />}>
      <SignupForm />
    </Suspense>
  );
}
