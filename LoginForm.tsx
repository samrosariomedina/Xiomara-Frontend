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


export default function LoginForm() {

    const t = useTranslations('LOGIN');
  const [showPassword, setShowPassword] = useState(false)

   const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting}
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {email: '', password: ''}
  });

   async function onSubmit(values: LoginInput) {
    // TODO: Wire up to real auth action
    await new Promise((r) => setTimeout(r, 800));
    console.log('Login attempt', values.email);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div 
        className="bg-white shadow-lg border border-gray-100" 
        style={{
          width: '390px',
          height: '844px',
          top: '88px',
          left: '525px',
          borderRadius: '24px',
          opacity: 1,
          position: 'absolute',
          padding: '40px 32px',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div className="text-center mb-10 pt-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Xiomara</h1>
          <p className="text-gray-500 text-sm">{t("title")}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-2">
          {/* Email Field */}
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-medium text-gray-600 ml-1">
              {t("email")}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              {...register("email")}
              className={cn(
                // Base styles with consistent padding and margin
                "w-full h-12 px-4 py-3 border rounded-xl bg-gray-50 transition-all duration-200",
                // Placeholder-specific styling
                "placeholder:text-gray-400 placeholder:font-normal placeholder:text-sm",
                // Focus states
                "focus:outline-none focus:ring-2 focus:ring-purple-800 focus:border-transparent focus:bg-white",
                // Hover state
                "hover:border-gray-300 hover:bg-gray-100",
                // Error state
                errors.email ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-gray-200"
              )}
            />
            {errors.email && <p className="text-xs text-red-500 mt-2 ml-2">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div className="space-y-3">
            <Label htmlFor="password" className="text-sm font-medium text-gray-600 ml-1">
              {t("password")}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("passwordPlaceholder")}
                {...register("password")}
                className={cn(
                  // Base styles with consistent padding and margin
                  "w-full h-12 px-4 py-3 pr-12 border rounded-xl bg-gray-50 transition-all duration-200",
                  // Placeholder-specific styling
                  "placeholder:text-gray-400 placeholder:font-normal placeholder:text-sm",
                  // Focus states
                  "focus:outline-none focus:ring-2 focus:ring-purple-800 focus:border-transparent focus:bg-white",
                  // Hover state
                  "hover:border-gray-300 hover:bg-gray-100",
                  // Error state
                  errors.password ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-gray-200"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-2 ml-2">{errors.password.message}</p>}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right px-2 py-2">
            <a href="#" className="text-xs text-gray-500 hover:text-purple-600 transition-colors">
              {t("forgotPassword")}
            </a>
          </div>

          {/* Login Button */}
          <div className="pt-4 px-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-900 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium h-12 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {isSubmitting ? t("loggingIn") : t("loginButton")}
            </Button>
          </div>
        </form>

        {/* Register Section */}
        <div className="mt-8 text-center px-2">
          <p className="text-xs text-gray-500 mb-4">{t("noAccount")}</p>
          <Button
            variant="outline"
            className="w-full border border-blue-800 text-blue-900 hover:bg-blue-50 font-medium h-12 px-4 rounded-xl transition-all duration-200 bg-white hover:border-blue-800"
          >
            {t("signUp")}
          </Button>
        </div>
      </div>
    </div>
  )
}
