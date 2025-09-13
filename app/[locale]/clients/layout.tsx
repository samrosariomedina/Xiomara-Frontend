import { ClientProvider } from '@/context/ClientContext'

export default function ClientsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientProvider>
      {children}
    </ClientProvider>
  )
}

