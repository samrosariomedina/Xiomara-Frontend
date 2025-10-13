import { Skeleton } from '@/components/ui/skeleton'

export default function LoginFormSkeleton() {
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
          <Skeleton className="h-5 w-24 mx-auto" />
        </div>

        {/* Form Skeleton */}
        <div className="space-y-4">
          {/* Email Field */}
          <div>
            <Skeleton className="h-4 w-12 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Password Field */}
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Skeleton className="h-3 w-24 ml-auto" />
          </div>

          {/* Login Button */}
          <div className="pt-2">
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>

        {/* Register Section */}
        <div className="mt-9 text-center">
          <Skeleton className="h-3 w-32 mx-auto mb-3" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}
