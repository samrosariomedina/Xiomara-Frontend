"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPasswordAction } from "@/actions/auth"
import { useTranslations } from "next-intl"

const resetPasswordSchema = z.object({
  passwordOld: z.string()
    .min(1, 'Current password is required')
    .max(100, 'Password too long')
    .refine((val) => val.trim().length > 0, 'Current password cannot be empty'),
  passwordNew: z.string()
    .min(6, 'New password must be at least 6 characters')
    .max(100, 'Password too long')
    .refine((val) => val.trim().length >= 6, 'New password cannot be empty or whitespace only'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.passwordNew === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

interface ResetPasswordDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ResetPasswordDialog({ isOpen, onClose }: ResetPasswordDialogProps) {
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      passwordOld: "",
      passwordNew: "",
      confirmPassword: "",
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { passwordOld: string; passwordNew: string }) => {
      const result = await resetPasswordAction(data)
      if (!result.success) {
        throw new Error(result.error || 'Failed to reset password')
      }
      return result
    },
    onSuccess: () => {
      toast.success('Password updated successfully')
      handleClose()
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to update password'
      
      // Check if it's a server error that might indicate account issues
      if (errorMessage.includes('Server error') || errorMessage.includes('account configuration')) {
        toast.error(errorMessage, {
          duration: 8000, // Show longer for important messages
        })
      } else {
        toast.error(errorMessage)
      }
    },
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    // Trim whitespace to ensure clean data
    await resetPasswordMutation.mutateAsync({
      passwordOld: data.passwordOld.trim(),
      passwordNew: data.passwordNew.trim(),
    })
  }

  const handleClose = () => {
    resetForm()
    setShowPasswords({ old: false, new: false, confirm: false })
    onClose()
  }

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-gray-900 font-semibold">Reset Password</DialogTitle>
          <DialogDescription className="text-gray-600">
            Enter your current password and choose a new password.
            <br />
            <span className="text-sm text-amber-600 mt-1 block">
              Note: Password reset may not be available for all account types.
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="passwordOld" className="text-gray-700 font-medium">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="passwordOld"
                type={showPasswords.old ? "text" : "password"}
                placeholder="Enter your current password"
                className="pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                {...register("passwordOld")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                onClick={() => togglePasswordVisibility('old')}
              >
                {showPasswords.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.passwordOld && (
              <p className="text-sm text-red-600">{errors.passwordOld.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="passwordNew" className="text-gray-700 font-medium">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="passwordNew"
                type={showPasswords.new ? "text" : "password"}
                placeholder="Enter your new password"
                className="pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                {...register("passwordNew")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.passwordNew && (
              <p className="text-sm text-red-600">{errors.passwordNew.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                placeholder="Confirm your new password"
                className="pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                {...register("confirmPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={resetPasswordMutation.isPending}
              className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
            >
              {resetPasswordMutation.isPending ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
