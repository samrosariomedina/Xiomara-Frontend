"use client"

import { useState } from "react"
import { X, Copy, Share2, Mail, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useSharing } from "@/hooks/useSharing"
import { toast } from "sonner"

interface ShareLinkDialogProps {
  isOpen: boolean
  onClose: () => void
  shareUrl: string
  clientName: string
  email?: string
  listenerType?: "whatsapp" | "telegram"
}

export function ShareLinkDialog({
  isOpen,
  onClose,
  shareUrl,
  clientName,
  email,
  listenerType = "whatsapp"
}: ShareLinkDialogProps) {
  const { copyToClipboard, shareViaWhatsApp, shareViaTelegram, shareViaEmail } = useSharing()
  const [isCopying, setIsCopying] = useState(false)

  const message = `Hola ${clientName}, te invito a conectarte con nuestro sistema de corresponsales. ${shareUrl}`

  const handleCopyLink = async () => {
    setIsCopying(true)
    try {
      await copyToClipboard(shareUrl)
    } finally {
      setIsCopying(false)
    }
  }

  const handleShareViaApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invitación para ${clientName}`,
          text: message,
          url: shareUrl
        })
        toast.success('Link shared successfully')
      } catch (error) {
        // User cancelled or error occurred
        if (error instanceof Error && error.name !== 'AbortError') {
          toast.error('Failed to share')
        }
      }
    } else {
      // Fallback: copy to clipboard
      await handleCopyLink()
    }
  }

  const handleShareViaWhatsApp = async () => {
    await shareViaWhatsApp(message)
  }

  const handleShareViaTelegram = async () => {
    await shareViaTelegram(shareUrl)
  }

  const handleShareViaEmail = async () => {
    if (email) {
      const subject = `Invitación a conectar - ${clientName}`
      await shareViaEmail(email, subject, message)
    } else {
      toast.warning('No email address available')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Share Invitation Link
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Share the invitation link with {clientName}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Link display */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Invitation Link</p>
            <p className="text-sm font-mono break-all text-gray-800">{shareUrl}</p>
          </div>

          {/* Sharing buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Copy Link */}
            <Button
              onClick={handleCopyLink}
              disabled={isCopying}
              variant="outline"
              className="flex items-center gap-2 h-10"
            >
              <Copy className="h-4 w-4" />
              <span className="text-sm">{isCopying ? 'Copying...' : 'Copy Link'}</span>
            </Button>

            {/* Share via App (mobile) */}
            {!!navigator.share ? (
              <Button
                onClick={handleShareViaApp}
                variant="outline"
                className="flex items-center gap-2 h-10"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-sm">Send via App</span>
              </Button>
            ) : null}

            {/* Share via WhatsApp */}
            {listenerType === "whatsapp" ? (
              <Button
                onClick={handleShareViaWhatsApp}
                variant="outline"
                className="flex items-center gap-2 h-10"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">WhatsApp</span>
              </Button>
            ) : null}

            {/* Share via Telegram */}
            {listenerType === "telegram" ? (
              <Button
                onClick={handleShareViaTelegram}
                variant="outline"
                className="flex items-center gap-2 h-10"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">Telegram</span>
              </Button>
            ) : null}

            {/* Share via Email */}
            {email ? (
              <Button
                onClick={handleShareViaEmail}
                variant="outline"
                className="flex items-center gap-2 h-10"
              >
                <Mail className="h-4 w-4" />
                <span className="text-sm">Email</span>
              </Button>
            ) : null}
          </div>

          {/* Close button */}
          <div className="flex justify-end pt-2">
            <Button onClick={onClose} variant="ghost" className="text-sm">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

