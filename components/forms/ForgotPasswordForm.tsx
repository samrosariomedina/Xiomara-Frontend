"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl'
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/schemas'
import { forgotPasswordAction } from '@/actions/auth'
import { routes } from '@/lib/routes'

export default function ForgotPasswordForm() {
  const t = useTranslations('FORGOT_PASSWORD')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  })

  // TanStack Query mutation for forgot password
  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordInput) => {
      const result = await forgotPasswordAction(data.email)
      if (!result.success) {
        throw new Error(result.error || 'Forgot password request failed')
      }
      return result
    },
    onSuccess: () => {
      toast.success(t("emailSent"), {
        icon: <CheckCircle className="h-4 w-4" />
      })
      // Redirect to login page after successful request
      router.push(routes.auth.login)
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        icon: <AlertCircle className="h-4 w-4" />
      })
    }
  })

  const onSubmit = async (values: ForgotPasswordInput) => {
    await forgotPasswordMutation.mutateAsync(values)
  }

  const isLoading = forgotPasswordMutation.isPending

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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Xiomara</h1>
          <p className="text-gray-500 text-md font-medium">{t("title")}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
              {t("email")}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              {...register("email")}
              disabled={isLoading}
              className={cn(
                "w-full h-10 px-3 py-2 text-sm border rounded-md bg-white transition-colors",
                "placeholder:text-gray-400",
                "hover:border-gray-300",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                errors.email ? "border-red-300" : "border-gray-300"
              )}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#31499F] hover:bg-[#2b3f8f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold h-12 px-4 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("sending")}</span>
                </>
              ) : (
                t("sendResetLink")
              )}
            </Button>
          </div>
        </form>

        {/* Back to Login Section */}
        <div className="mt-9 text-center">
          <Link href={routes.auth.login}>
            <Button
              variant="outline"
              disabled={isLoading}
              className="w-full border border-[#31499F] text-[#31499F] hover:bg-[#eef1ff] font-semibold h-12 px-4 rounded-full transition-colors bg-white disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("backToLogin")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
