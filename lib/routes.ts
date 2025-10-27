/**
 * Centralized route definitions for the application
 * All routes should be imported from this file to maintain consistency
 */

export const routes = {
  // Root routes
  home: '/',

  // Auth routes
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    pending: '/auth/pending',
  },

  // Clients routes - all routes are tied to specific client IDs
  clients: {
    // Main clients list page
    page: '/clients',
    // Client-specific pages with route params
    clientDashboard: (clientId: string) => `/clients/${clientId}`,
    campaignDashboard: (clientId: string, campaignId: string) => `/clients/${clientId}/campaigns/${campaignId}`,
    contentEngine: (clientId: string, campaignId?: string) => 
      campaignId ? `/clients/${clientId}/campaigns/${campaignId}/content-engine` : `/clients/${clientId}/content-engine`,
    fuentes: (clientId: string, campaignId?: string) => 
      campaignId ? `/clients/${clientId}/campaigns/${campaignId}/fuentes` : `/clients/${clientId}/fuentes`,
    knowledge: (clientId: string, campaignId?: string) => 
      campaignId ? `/clients/${clientId}/campaigns/${campaignId}/knowledge` : `/clients/${clientId}/knowledge`,
    media: (clientId: string, campaignId?: string) => 
      campaignId ? `/clients/${clientId}/campaigns/${campaignId}/media` : `/clients/${clientId}/media`,
    corresponsables: (clientId: string, campaignId?: string) => 
      campaignId ? `/clients/${clientId}/campaigns/${campaignId}/corresponsables` : `/clients/${clientId}/corresponsables`,
    
    // Dynamic dashboard routes based on client/campaign context
    getDashboardRoute: (clientId: string, campaignId?: string, dashboardName?: string) => {
      if (campaignId && dashboardName) {
        return `/clients/${clientId}/campaigns/${campaignId}/${dashboardName}`;
      } else if (dashboardName) {
        return `/clients/${clientId}/${dashboardName}`;
      } else if (campaignId) {
        return `/clients/${clientId}/campaigns/${campaignId}`;
      } else {
        return `/clients/${clientId}`;
      }
    },
  },
} as const

// Helper function to generate localized routes
export function getLocalizedRoute(route: string, locale: string = 'en'): string {
  return `/${locale}${route}`
}

// Helper function to get current locale from pathname
export function getLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  return segments[0] === 'es' ? 'es' : 'en'
}

// Helper function to generate localized route from current pathname
export function getLocalizedRouteFromPathname(route: string, pathname: string): string {
  const locale = getLocaleFromPathname(pathname)
  return getLocalizedRoute(route, locale)
}

// Type definitions for better TypeScript support
export type RouteKey = keyof typeof routes
export type AuthRouteKey = keyof typeof routes.auth
export type ClientsRouteKey = keyof typeof routes.clients
