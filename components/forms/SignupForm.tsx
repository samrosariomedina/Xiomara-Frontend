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
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { signupSchema, type SignupInput } from '@/lib/schemas'
import { signupAction } from '@/actions/auth'
import { routes } from '@/lib/routes'

export default function SignupForm() {
  const t = useTranslations('SIGNUP')
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', repeatPassword: '', name: '' }
  })

  // TanStack Query mutation for signup
  const signupMutation = useMutation({
    mutationFn: async (userData: SignupInput) => {
      const result = await signupAction(userData)
      if (!result.success) {
        throw new Error(result.error || 'Signup failed')
      }
      return result
    },
    onSuccess: () => {
      toast.success(t("signupSuccess"), {
        icon: <CheckCircle className="h-4 w-4" />
      })
      // Redirect to login page after successful signup
      router.push(routes.auth.login)
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        icon: <AlertCircle className="h-4 w-4" />
      })
    }
  })

  const onSubmit = async (values: SignupInput) => {
    await signupMutation.mutateAsync({
      ...values,
      name: values.name || values.email.split('@')[0] // Use email prefix as name if not provided
    })
  }

  const isLoading = isSubmitting || signupMutation.isPending

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

          {/* Repeat Password Field */}
          <div>
            <Label htmlFor="repeatPassword" className="text-sm font-medium text-gray-700 mb-2 block">
              {t("repeatPassword")}
            </Label>
            <div className="relative">
              <Input
                id="repeatPassword"
                type={showRepeatPassword ? "text" : "password"}
                placeholder={t("repeatPasswordPlaceholder")}
                {...register("repeatPassword")}
                disabled={isLoading}
                className={cn(
                  "w-full h-10 px-3 py-2 pr-10 text-sm border rounded-md bg-white transition-colors",
                  "placeholder:text-gray-400",
                  "hover:border-gray-300",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  errors.repeatPassword ? "border-red-300" : "border-gray-300"
                )}
              />
              <button
                type="button"
                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                {showRepeatPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.repeatPassword && <p className="text-xs text-red-600 mt-1">{errors.repeatPassword.message}</p>}
          </div>

          {/* Create Account Button */}
          <div className="pt-2">
            {isLoading ? (
              <div className="w-full flex items-center justify-center h-12">
                <Loader2 className="h-5 w-5 animate-spin text-[#31499F]" />
                <span className="ml-2 text-[#31499F] font-semibold">{t("creating") || "Creating..."}</span>
              </div>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#31499F] hover:bg-[#2b3f8f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold h-12 px-4 rounded-full transition-colors flex items-center justify-center gap-2"
              >
                {t("createAccountButton")}
              </Button>
            )}
          </div>
        </form>

        {/* Login Section */}
        <div className="mt-9 text-center">
          <p className="text-xs text-gray-500 mb-3 font-medium">{t("haveAccount")}</p>
          <Link href={routes.auth.login}>
            <Button
              variant="outline"
              disabled={isLoading}
              className="w-full border border-[#31499F] text-[#31499F] hover:bg-[#eef1ff] font-semibold h-12 px-4 rounded-full transition-colors bg-white disabled:opacity-50"
            >
              {t("login")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
