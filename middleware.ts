import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Create middleware for internationalization
const intlMiddleware = createMiddleware(routing);

// Define protected routes that require authentication
const protectedRoutes = [
  '/clients',
  // '/dashboard',
];

// Create authentication middleware
export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  const pathname = request.nextUrl.pathname;
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route) || 
    pathname.startsWith(`/en${route}`) || 
    pathname.startsWith(`/es${route}`)
  );

  // If it's not a protected route, return the response as is
  if (!isProtectedRoute) {
    return response;
  }

  // Check for the authentication token in cookies
  const token = request.cookies.get('authToken')?.value;

  // If there's no token and the route is protected, redirect to login
  if (!token && isProtectedRoute) {
    // Determine the locale from the URL
    let locale = 'en'; // default locale
    if (pathname.startsWith('/es/')) {
      locale = 'es';
    } else if (pathname.startsWith('/en/')) {
      locale = 'en';
    }
    
    // Redirect to the login page with the appropriate locale
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
 
export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
