"use client"

import {useTranslations} from 'next-intl';
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import {signupSchema, type SignupInput} from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { useRouter } from 'next/navigation';
import { signup } from '@/actions/auth';
import { toast } from "sonner";

export default function SignupForm() {
  const t = useTranslations('SIGNUP');
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting}
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {email: '', password: '', repeatPassword: ''}
  });

  const router = useRouter();

  async function onSubmit(values: SignupInput) {
    try {
      const result = await signup(values);
      
      if (result.success) {
        toast.success(t("signupSuccess"));
        // Redirect to login page after successful signup
        router.push('/auth/login');
      } else {
        toast.error(result.error || t("signupFailed"));
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(t("signupError"));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-gray-50 lg:bg-white lg:shadow-sm p-8 rounded-lg w-full max-w-sm"
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
              className={cn(
                "w-full h-10 px-3 py-2 text-sm border rounded-md bg-white transition-colors",
                "placeholder:text-gray-400",
                "",
                "hover:border-gray-300",
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
                className={cn(
                  "w-full h-10 px-3 py-2 pr-10 text-sm border rounded-md bg-white transition-colors",
                  "placeholder:text-gray-400",
                  "",
                  "hover:border-gray-300",
                  errors.password ? "border-red-300" : "border-gray-300"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                className={cn(
                  "w-full h-10 px-3 py-2 pr-10 text-sm border rounded-md bg-white transition-colors",
                  "placeholder:text-gray-400",
                  "",
                  "hover:border-gray-300",
                  errors.repeatPassword ? "border-red-300" : "border-gray-300"
                )}
              />
              <button
                type="button"
                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showRepeatPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.repeatPassword && <p className="text-xs text-red-600 mt-1">{errors.repeatPassword.message}</p>}
          </div>

          {/* Create Account Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#31499F] hover:bg-[#2b3f8f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold h-12 px-4 rounded-full transition-colors"
            >
              {isSubmitting ? "Creating..." : t("createAccountButton")}
            </Button>
          </div>
        </form>

        {/* Login Section */}
        <div className="mt-9 text-center">
          <p className="text-xs text-gray-500 mb-3 font-medium">{t("haveAccount")}</p>
          <Link href="/auth/login">
            <Button
              variant="outline"
              className="w-full border border-[#31499F] text-[#31499F] hover:bg-[#eef1ff] font-semibold h-12 px-4 rounded-full transition-colors bg-white"
            >
              {t("login")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
