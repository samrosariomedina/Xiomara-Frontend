# Navbar Component

## Overview

The Navbar component is the main navigation element across the application, providing access to user account functions, notifications, and language switching.

## Features

- **User Menu Dropdown**: Access to user profile, settings, language switching, and logout
- **Language Toggle**: Switch between English and Spanish while preserving the current path
- **Notifications**: Access to system notifications
- **Responsive Design**: Adapts to different screen sizes

## Implementation

Located at `components/Navbar.tsx`, the component uses:

- `next/navigation` for routing
- `next-intl` for internationalization
- Dropdown menus from UI components
- Authentication actions from `actions/auth.ts`

## Language Switching

The Navbar implements language switching through the `toggleLocale` function:

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

This implementation:
- Extracts the current locale from the URL
- Determines the target locale
- Preserves the current path and query parameters
- Navigates to the equivalent URL in the new locale

## Logout Functionality

The Navbar handles user logout through the `handleLogout` function, which:
1. Calls the `logout()` action from `actions/auth.ts`
2. Displays a success or error toast
3. Redirects to the login page on successful logout

## Customization

To customize the Navbar:

- **Styling**: Update the Tailwind classes in the component
- **Logo/Branding**: Modify the text in the left side of the navbar
- **Menu Items**: Add or remove options in the DropdownMenuContent
- **Translations**: Update keys in the locale files under the `NAVBAR` section
