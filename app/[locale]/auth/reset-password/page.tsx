import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import ResetPasswordForm from '@/components/forms/ResetPasswordForm';

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

// Loading component for the reset password form
function ResetPasswordFormSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div
        className="bg-gray-50 lg:bg-white lg:shadow-sm p-8 rounded-xl w-full max-w-sm"
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
          <Skeleton className="h-5 w-48 mx-auto" />
        </div>

        {/* Form Skeleton */}
        <div className="space-y-4">
          {/* Password Field */}
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Confirm Password Field */}
          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>

        {/* Back to Login Section */}
        <div className="mt-9 text-center">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}

// Server component
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFormSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
