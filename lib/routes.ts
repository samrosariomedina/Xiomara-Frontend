/**
 * Centralized route definitions for the application
 * All routes should be imported from this file to maintain consistency
 */

export const routes = {
  // Root routes
  home: '/',
  dashboard: '/clients/channels',

  // Auth routes
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    pending: '/auth/pending',
  },

  // Clients routes
  clients: {
    // Main clients page
    page: '/clients',
    
    // Client dashboards (moved from lists)
    dashboards: {
      corresponsales: '/clients/corresponsables',
      fuentes: '/clients/fuentes', 
      knowledge: '/clients/knowledge',
      media: '/clients/media',
    },
    
    // Client-specific pages with route params
    channels: '/clients/channels',
    clientDashboard: (clientId: string) => `/clients/${clientId}`,
    campaignDashboard: (clientId: string, campaignId: string) => `/clients/${clientId}/campaigns/${campaignId}`,
    contentEngine: '/clients/content-engine',
    
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
export type ClientsDashboardsRouteKey = keyof typeof routes.clients.dashboards
