import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAuthHeaders() {
  // Only run on client side to prevent hydration mismatch
  if (typeof window === 'undefined') {
    return {};
  }
  
  try {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export function isAuthenticated() {
  // Only run on client side to prevent hydration mismatch
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    return !!localStorage.getItem('token');
  } catch {
    return false;
  }
}

/**
 * Format date safely for SSR/hydration compatibility
 * Returns ISO date string (YYYY-MM-DD) to avoid locale/timezone differences
 */
export function formatDateSafe(dateString: string | undefined | null): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    return date.toISOString().split('T')[0];
  } catch {
    return 'N/A'; // Return safe fallback if parsing fails
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