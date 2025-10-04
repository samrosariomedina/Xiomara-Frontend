import { ClientProvider } from '@/context/ClientContext'
import { TemplatesProvider } from '@/context/TemplatesContext'
import { getTemplates } from '@/actions/templates'
import { getUserProfileAction } from '@/actions/auth'

export default async function ClientsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get user profile to pass user ID to templates
  const userResult = await getUserProfileAction()
  const userId = userResult.success ? userResult.user?._id : undefined
  
  // Fetch templates server-side with user ID
  const templates = await getTemplates(userId)

  return (
    <ClientProvider>
      <TemplatesProvider templates={templates}>
        {children}
      </TemplatesProvider>
    </ClientProvider>
  )
}

