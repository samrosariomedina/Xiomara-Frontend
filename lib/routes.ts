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
  },

  // Clients routes
  clients: {
    // Main clients page
    page: '/clients',
    
    // Client dashboards (moved from lists)
    dashboards: {
      corresponsales: '/clients/corresponsales',
      fuentes: '/clients/fuentes', 
      knowledge: '/clients/knowledge',
      media: '/clients/media',
    },
    
    // Client-specific pages
    channels: '/clients/channels',
    contentEngine: '/clients/content-engine',
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
