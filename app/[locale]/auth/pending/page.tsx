import type { Metadata } from 'next'
import { Button } from "@/components/ui/button"
import { Link } from '@/i18n/navigation'
import { routes } from '@/lib/routes'
import { Clock, CheckCircle, Mail } from 'lucide-react'

type MaybePromise<T> = T | Promise<T>;
type ParamsLike = { params: MaybePromise<{ locale: string }> };

export async function generateMetadata(props: ParamsLike): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params
  const title = 'Account Pending Approval — Xiomara'
  const description = 'Your account is awaiting administrator approval.'
  const path = `/${locale}/auth/pending`

  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: 'Xiomara' },
    twitter: { card: 'summary', title, description },
  }
}

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Clock className="h-16 w-16 text-amber-500" />
            <div className="absolute -top-1 -right-1">
              <div className="bg-amber-100 rounded-full p-1">
                <CheckCircle className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Account Pending Approval
        </h1>
        <p className="text-gray-600 mb-6">
          Your account has been successfully created and is currently awaiting administrator approval.
        </p>

        {/* Status Card */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-amber-800 mb-2">
            <Mail className="h-4 w-4" />
            <span className="font-medium text-sm">What happens next?</span>
          </div>
          <ul className="text-sm text-amber-700 space-y-1 text-left">
            <li>• Administrator will review your account</li>
            <li>• You'll receive an email notification once approved</li>
            <li>• This process typically takes 24-48 hours</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            You can try logging in again once your account is approved.
          </p>
          
          <div className="flex gap-3">
            <Link href={routes.auth.login} className="flex-1">
              <Button 
                variant="outline" 
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Back to Login
              </Button>
            </Link>
            
            <Link href={routes.auth.signup} className="flex-1">
              <Button 
                variant="outline" 
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Contact Support
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            If you have questions, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  )
}
