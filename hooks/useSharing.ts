'use client'

import { useState } from 'react';
import { toast } from 'sonner';

interface SharingOptions {
  whatsapp: boolean;
  telegram: boolean;
  email: boolean;
  copyLink: boolean;
}

interface SharingData {
  shareUrl: string;
  message: string;
  email?: string;
  clientName?: string;
}

export function useSharing() {
  const [isSharing, setIsSharing] = useState(false);

  const shareViaWhatsApp = async (message: string) => {
    try {
      console.log('WhatsApp sharing - Message:', message);
      console.log('Navigator.share available:', !!navigator.share);
      
      if (navigator.share) {
        await navigator.share({
          text: message
        });
        toast.success('WhatsApp share initiated');
      } else {
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        console.log('Opening WhatsApp URL:', whatsappUrl);
        window.open(whatsappUrl, '_blank');
        toast.success('WhatsApp opened in new tab');
      }
      return { success: true, error: null };
    } catch (error) {
      console.error('WhatsApp sharing error:', error);
      toast.error('Failed to share via WhatsApp');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const shareViaTelegram = async (telegramUrl: string) => {
    try {
      console.log('Telegram sharing - URL:', telegramUrl);
      console.log('Navigator.share available:', !!navigator.share);
      
      if (navigator.share) {
        await navigator.share({
          url: telegramUrl
        });
        toast.success('Telegram share initiated');
      } else {
        console.log('Opening Telegram URL:', telegramUrl);
        window.open(telegramUrl, '_blank');
        toast.success('Telegram opened in new tab');
      }
      return { success: true, error: null };
    } catch (error) {
      console.error('Telegram sharing error:', error);
      toast.error('Failed to share via Telegram');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const shareViaEmail = async (email: string, subject: string, message: string) => {
    try {
      console.log('Email sharing - Email:', email);
      console.log('Email sharing - Subject:', subject);
      console.log('Email sharing - Message:', message);
      
      // Use mailto: to open email client with pre-filled content
      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      console.log('Email sharing - Mailto URL:', mailtoUrl);
      console.log('Email sharing - URL length:', mailtoUrl.length);
      
      // Method 1: Create and click a link (most reliable)
      console.log('Creating and clicking mailto link...');
      const link = document.createElement('a');
      link.href = mailtoUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      
      // Add to DOM, click, then remove
      document.body.appendChild(link);
      link.click();
      
      // Remove after a short delay to ensure click is processed
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 100);
      
      toast.success('Email client should open shortly...');
      return { success: true, error: null };
    } catch (error) {
      console.error('Email sharing error:', error);
      toast.error('Failed to open email client');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      console.log('Copy to clipboard - Text:', text);
      console.log('Clipboard API available:', !!navigator.clipboard);
      
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard');
      return { success: true, error: null };
    } catch (error) {
      console.error('Clipboard error:', error);
      toast.error('Failed to copy to clipboard');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const executeSharing = async (sharingData: SharingData, options: SharingOptions) => {
    console.log('Executing sharing with data:', sharingData);
    console.log('Sharing options:', options);
    
    setIsSharing(true);
    const results = {
      whatsapp: { success: false, error: null as string | null },
      telegram: { success: false, error: null as string | null },
      email: { success: false, error: null as string | null },
      copyLink: { success: false, error: null as string | null }
    };

    try {
      // Execute WhatsApp sharing
      if (options.whatsapp) {
        console.log('Executing WhatsApp sharing...');
        const whatsappResult = await shareViaWhatsApp(sharingData.message);
        results.whatsapp = whatsappResult;
        console.log('WhatsApp sharing result:', whatsappResult);
      }

      // Execute Telegram sharing
      if (options.telegram) {
        console.log('Executing Telegram sharing...');
        const telegramResult = await shareViaTelegram(sharingData.shareUrl);
        results.telegram = telegramResult;
        console.log('Telegram sharing result:', telegramResult);
      }

      // Execute email sharing
      if (options.email && sharingData.email) {
        console.log('Executing email sharing...');
        const subject = `Invitación a conectar - ${sharingData.clientName || 'Corresponsal'}`;
        const emailResult = await shareViaEmail(sharingData.email, subject, sharingData.message);
        results.email = emailResult;
        console.log('Email sharing result:', emailResult);
      } else if (options.email && !sharingData.email) {
        console.log('Email sharing requested but no email provided');
        results.email = { success: false, error: 'No email provided' };
      }

      // Execute copy link
      if (options.copyLink) {
        console.log('Executing copy to clipboard...');
        const copyResult = await copyToClipboard(sharingData.shareUrl);
        results.copyLink = copyResult;
        console.log('Copy to clipboard result:', copyResult);
      }

      console.log('All sharing results:', results);
      return results;
    } finally {
      setIsSharing(false);
    }
  };


  return {
    isSharing,
    shareViaWhatsApp,
    shareViaTelegram,
    shareViaEmail,
    copyToClipboard,
    executeSharing
  };
}
