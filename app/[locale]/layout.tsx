import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ClientOnly } from "@/components/providers/ClientOnly";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Xiomara",
  description: "Xiomara - Client and Campaign Management Platform",
  icons: {
    icon: [
      {
        url: "/xiomara.svg",
        type: "image/svg+xml",
      },
      {
        url: "/favicon.ico",
        type: "image/x-icon",
      },
    ],
    apple: "/xiomara.svg",
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as "en" | "es")) {
    notFound();
  }

  // Dynamically import messages for the locale
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale}>
      <body className={inter.variable}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
            <ClientOnly>
              <Toaster position="top-right" />
            </ClientOnly>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
