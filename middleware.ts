import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Create middleware for internationalization
const intlMiddleware = createMiddleware(routing);

// Define protected routes that require authentication
const protectedRoutes = [
  '/clients',
  '/clients/content-engine',
  // '/dashboard',
];

// Define auth routes that should redirect authenticated users
const authRoutes = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/pending',
];

// Create authentication middleware
export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  const pathname = request.nextUrl.pathname;
  
  // Check for the authentication token in cookies
  const token = request.cookies.get('authToken')?.value;
  
  // Determine the locale from the URL
  let locale = 'en'; // default locale
  if (pathname.startsWith('/es/')) {
    locale = 'es';
  } else if (pathname.startsWith('/en/')) {
    locale = 'en';
  }

  // Check if the route is a root route (just / or /en or /es)
  const isRootRoute = pathname === '/' || pathname === '/en' || pathname === '/es' || 
                     pathname === `/${locale}` || pathname === `/${locale}/`;

  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route) || 
    pathname.startsWith(`/en${route}`) || 
    pathname.startsWith(`/es${route}`)
  );

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route) || 
    pathname.startsWith(`/en${route}`) || 
    pathname.startsWith(`/es${route}`)
  );

  // Check if the route is content-engine
  const isContentEngineRoute = pathname.includes('/content-engine') || 
                              pathname.includes(`/${locale}/clients/content-engine`) ||
                              pathname.endsWith('/content-engine');

  // If user is authenticated and trying to access root or auth routes, redirect to clients
  if (token && (isRootRoute || isAuthRoute)) {
    const clientsUrl = new URL(`/${locale}/clients`, request.url);
    return NextResponse.redirect(clientsUrl);
  }

  // If there's no token and the route is protected, redirect to login
  if (!token && isProtectedRoute) {
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing content-engine route, check if client is selected
  if (token && isContentEngineRoute) {
    const selectedClientId = request.cookies.get('selectedClientId')?.value;
    if (!selectedClientId) {
      // Redirect to clients page if no client is selected
      const clientsUrl = new URL(`/${locale}/clients`, request.url);
      return NextResponse.redirect(clientsUrl);
    }
  }

  return response;
}
 
export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
