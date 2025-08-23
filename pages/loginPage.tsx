"use client"

import {useTranslations} from 'next-intl';
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import {loginSchema, type LoginInput} from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAPI';
import { toast } from "sonner";



export default function LoginForm() {
    const t = useTranslations('LOGIN');
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter();
    const { login, isLoading: authLoading } = useAuth();

   const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting}
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {email: '', password: ''}
  });

   async function onSubmit(values: LoginInput) {
    try {
      await login(values);
      toast.success(t("loginSuccess"));
      router.push('/clients');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : t("loginError");
      toast.error(errorMessage);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-gray-50 lg:bg-white lg:shadow-sm p-8 rounded-xl w-full max-w-sm"
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

          {/* Forgot Password Link */}
          <div className="text-right">
            <a href="#" className="text-xs text-gray-600 hover:text-blue-800 transition-colors font-medium">
              {t("forgotPassword")}
            </a>
          </div>

          {/* Login Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full bg-[#31499F] hover:bg-[#2b3f8f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold h-12 px-4 rounded-full transition-colors"
            >
              {(isSubmitting || authLoading) ? t("loggingIn") : t("loginButton")}
            </Button>
          </div>
        </form>

        {/* Register Section */}
        <div className="mt-9 text-center">
          <p className="text-xs text-gray-500 mb-3 font-medium">{t("noAccount")}</p>
          <Link href="/auth/signup">
            <Button
              variant="outline"
              className="w-full border border-[#31499F] text-[#31499F] hover:bg-[#eef1ff] font-semibold h-12 px-4 rounded-full transition-colors bg-white"
            >
              {t("signUp")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
