"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const telegramTokenSchema = z.object({
  token: z.string()
    .min(1, 'Telegram bot token is required')
    .regex(/^\d+:[A-Za-z0-9_-]+$/, 'Invalid Telegram bot token format. Should be like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz')
});

type TelegramTokenInput = z.infer<typeof telegramTokenSchema>;

interface TelegramTokenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (token: string) => void;
  correspondentName: string;
}

export function TelegramTokenDialog({
  isOpen,
  onClose,
  onConfirm,
  correspondentName,
}: TelegramTokenDialogProps) {
  const [isValidating, setIsValidating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TelegramTokenInput>({
    resolver: zodResolver(telegramTokenSchema),
    defaultValues: {
      token: "",
    },
  });

  const onSubmit = async (data: TelegramTokenInput) => {
    try {
      setIsValidating(true);
      
      // Basic format validation is already done by Zod schema
      // Backend will validate the token when creating the listener
      toast.success('Token saved successfully');
      onConfirm(data.token);
      reset();
      onClose();
      
    } catch (error) {
      console.error('Token validation error:', error);
      toast.error('Failed to save token. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isValidating) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-gray-900 font-semibold">Telegram Bot Token</DialogTitle>
          <DialogDescription className="text-gray-600">
            Enter the Telegram bot token for <strong className="text-gray-900">{correspondentName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token" className="text-gray-700 font-medium">
              Bot Token *
            </Label>
            <Input
              id="token"
              {...register("token")}
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              disabled={isSubmitting || isValidating}
              className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            />
            {errors.token && (
              <p className="text-sm text-red-600">{errors.token.message}</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-2">How to get a Telegram Bot Token:</h4>
            <ol className="text-xs text-blue-800 space-y-1">
              <li>1. Open Telegram and search for @BotFather</li>
              <li>2. Send /newbot command</li>
              <li>3. Follow instructions to create your bot</li>
              <li>4. Copy the token provided by BotFather</li>
              <li>5. Paste it here</li>
            </ol>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || isValidating}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isValidating}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isValidating ? "Validating..." : isSubmitting ? "Confirming..." : "Confirm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
