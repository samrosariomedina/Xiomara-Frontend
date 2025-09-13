"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from 'next-intl'
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/schemas'
import { recoverPasswordAction } from '@/actions/auth'
import { routes } from '@/lib/routes'
import { useState } from 'react'

export default function ResetPasswordForm() {
  const t = useTranslations('RESET_PASSWORD')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' }
  })

  // TanStack Query mutation for password recovery
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordInput) => {
      if (!token) {
        throw new Error('No recovery token provided')
      }
      const result = await recoverPasswordAction(token, data.password)
      if (!result.success) {
        throw new Error(result.error || 'Password reset failed')
      }
      return result
    },
    onSuccess: () => {
      toast.success(t("successMessage"), {
        icon: <CheckCircle className="h-4 w-4" />
      })
      // Redirect to login page after successful password reset
      setTimeout(() => {
        router.push(routes.auth.login)
      }, 2000)
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        icon: <AlertCircle className="h-4 w-4" />
      })
    }
  })

  const onSubmit = async (values: ResetPasswordInput) => {
    await resetPasswordMutation.mutateAsync(values)
  }

  const isLoading = resetPasswordMutation.isPending

  // Show error if no token is provided
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div
          className="bg-gray-50 lg:bg-white lg:shadow-sm p-8 rounded-xl w-full max-w-sm"
          style={{
            width: '390px',
            height: '400px',
            justifyContent: 'center',
            alignContent: 'center'
          }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Xiomara</h1>
            <p className="text-gray-500 text-md font-medium">Invalid Reset Link</p>
          </div>

          <div className="text-center mb-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              This password reset link is invalid or has expired.
            </p>
            <p className="text-sm text-gray-500">
              Please request a new password reset link.
            </p>
          </div>

          <div className="text-center">
            <Link href={routes.auth.forgotPassword}>
              <Button
                variant="outline"
                className="w-full border border-[#31499F] text-[#31499F] hover:bg-[#eef1ff] font-semibold h-12 px-4 rounded-full transition-colors bg-white"
              >
                Request New Link
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

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
          {/* New Password Field */}
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
              {t("newPassword")}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("newPasswordPlaceholder")}
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
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-2 block">
              {t("confirmPassword")}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t("confirmPasswordPlaceholder")}
                {...register("confirmPassword")}
                disabled={isLoading}
                className={cn(
                  "w-full h-10 px-3 py-2 pr-10 text-sm border rounded-md bg-white transition-colors",
                  "placeholder:text-gray-400",
                  "hover:border-gray-300",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  errors.confirmPassword ? "border-red-300" : "border-gray-300"
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>}
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
                  <span>{t("resetting")}</span>
                </>
              ) : (
                t("resetPassword")
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
