# Internationalization

## Overview

Xiomara uses next-intl for internationalization, supporting English and Spanish with a locale-prefix routing strategy (`/en/...` and `/es/...`).

## Key Files

- `i18n/routing.ts`: Configuration for locale detection and routing
- `i18n/navigation.ts`: Navigation utilities for locale-aware links
- `i18n/request.ts`: Helpers for server components to access translations
- `messages/en.json`: English translation strings
- `messages/es.json`: Spanish translation strings
- `middleware.ts`: Handles locale detection from URL
- `app/[locale]/layout.tsx`: Sets up locale providers

## Using Translations

### In Client Components

```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('SECTION_KEY');
  
  return <h1>{t('title')}</h1>; // Renders localized title
}
```

### In Server Components

```tsx
import { getTranslations } from 'next-intl/server';

export async function MyServerComponent() {
  const t = await getTranslations('SECTION_KEY');
  
  return <h1>{t('title')}</h1>; // Renders localized title
}
```

## Translation Structure

Translation files use a nested structure with uppercase section keys:

```json
{
  "LOGIN": {
    "title": "Login",
    "email": "Email"
  },
  "DASHBOARD": {
    "title": "Dashboard",
    "sections": {
      "metrics": "Metrics"
    }
  }
}
```

## Switching Languages

The application includes a language toggle in the navbar that preserves the current path and query parameters when switching between English and Spanish.

### Language Switching Implementation

The language switcher is implemented in `components/Navbar.tsx` with a clean approach that preserves the current path and query parameters:

```tsx
const toggleLocale = () => {
  try {
    const seg = (pathname || "/").split('/').filter(Boolean)
    const current = seg[0] === 'es' ? 'es' : 'en'
    const next = current === 'en' ? 'es' : 'en'

    let pathWithoutLocale = pathname || '/'
    if (pathWithoutLocale.startsWith(`/${current}`)) {
      pathWithoutLocale = pathWithoutLocale.slice(current.length + 1) || '/'
    }

    const query = searchParams ? `?${searchParams.toString()}` : ''
    const newPath = `/${next}${pathWithoutLocale}${query}`

    router.push(newPath)
  } catch {
    const next = (pathname || '').startsWith('/es') ? 'en' : 'es'
    router.push(`/${next}`)
  }
}
```

This function:
1. Determines the current locale from the URL path
2. Calculates the target locale (switching between 'en' and 'es')
3. Extracts the current path without the locale prefix
4. Preserves query parameters
5. Constructs and navigates to the new URL with the switched locale
6. Includes a fallback mechanism for handling edge cases

## Adding New Languages

To add a new supported language:
1. Create a new file in `messages/` (e.g., `fr.json`)
2. Add the locale to the supported locales list in `i18n/routing.ts`
3. Update the language picker in `Navbar.tsx` to include the new option
