"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl'
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { loginSchema, type LoginInput } from '@/lib/schemas'
import { loginAction } from '@/actions/auth'
import { routes, getLocalizedRouteFromPathname } from '@/lib/routes'

export default function LoginForm() {
  const t = useTranslations('LOGIN')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  })

  // TanStack Query mutation for login
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const result = await loginAction(credentials)
      if (!result.success) {
        throw new Error(result.error || 'Login failed')
      }
      return result
    },
    onSuccess: (result) => {
      // Check if user is approved
      if (result.approved === false) {
        // User is not approved, redirect to pending page
        router.push(routes.auth.pending)
        return
      }
      
      // User is approved, continue with normal flow
      toast.success(t("loginSuccess"))
      router.push(routes.clients.page)
      router.refresh() // Refresh to update server components
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        icon: <AlertCircle className="h-4 w-4" />
      })
    }
  })

  const onSubmit = async (values: LoginInput) => {
    await loginMutation.mutateAsync(values)
  }

  const isLoading = isSubmitting || loginMutation.isPending

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" suppressHydrationWarning>
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

          {/* Password Field */}
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
              {t("password")}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("passwordPlaceholder")}
                {...register("password")}
                disabled={isLoading}
                className={cn(
                  "w-full h-10 px-3 py-2 pr-10 text-sm border rounded-md bg-white transition-colors",
                  "placeholder:text-gray-400",
                  "hover:border-gray-300",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  errors.password ? "border-red-300" : "border-gray-300"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link 
              href={routes.auth.forgotPassword}
              className="text-xs text-gray-600 hover:text-blue-800 transition-colors font-medium"
            >
              {t("forgotPassword")}
            </Link>
          </div>

          {/* Login Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#31499F] hover:bg-[#2b3f8f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold h-12 px-4 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("loggingIn")}</span>
                </>
              ) : (
                t("loginButton")
              )}
            </Button>
          </div>
        </form>

        {/* Register Section */}
        <div className="mt-9 text-center">
          <p className="text-xs text-gray-500 mb-3 font-medium">{t("noAccount")}</p>
          <Link href={routes.auth.signup}>
            <Button
              variant="outline"
              disabled={isLoading}
              className="w-full border border-[#31499F] text-[#31499F] hover:bg-[#eef1ff] font-semibold h-12 px-4 rounded-full transition-colors bg-white disabled:opacity-50"
            >
              {t("signUp")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
