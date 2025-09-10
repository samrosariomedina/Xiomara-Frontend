import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAuthHeaders() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
  return {};
}

export function isAuthenticated() {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('token');
  }
  return false;
}

/**
 * Format date safely for SSR/hydration compatibility
 * Returns ISO date string (YYYY-MM-DD) to avoid locale/timezone differences
 */
export function formatDateSafe(dateString: string): string {
  try {
    return new Date(dateString).toISOString().split('T')[0];
  } catch {
    return dateString; // Return original if parsing fails
  }
}

/**
 * Format date with locale support (client-side only)
 * Use this for display purposes after hydration
 */
export function formatDateWithLocale(dateString: string, locale: string = 'en-US'): string {
  if (typeof window === 'undefined') {
    return formatDateSafe(dateString); // Fallback for SSR
  }
  
  try {
    return new Date(dateString).toLocaleDateString(locale);
  } catch {
    return formatDateSafe(dateString);
  }
}