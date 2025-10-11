import { ClientProvider } from '@/context/ClientContext'
import { TemplatesProvider } from '@/context/TemplatesContext'
import { getTemplates } from '@/actions/templates'
import { getUserProfileAction } from '@/actions/auth'

export default async function ClientsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch templates server-side (backend will automatically return global + user's own templates)
  const templates = await getTemplates()

  return (
    <ClientProvider>
      <TemplatesProvider templates={templates}>
        {children}
      </TemplatesProvider>
    </ClientProvider>
  )
}

