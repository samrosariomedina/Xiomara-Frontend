# Project Structure

## Directory Organization

- `actions/`: Server actions for data fetching and mutations
- `app/`: Next.js app router pages and layouts, organized by locales
- `components/`: React components, both shared and page-specific
  - `ui/`: Reusable UI components (buttons, cards, etc.)
  - `clients/`: Client-related components
- `data/`: Static data and sample files
- `docs/`: Developer documentation (you are here)
- `i18n/`: Internationalization configuration
- `lib/`: Shared utilities, schemas, and types
  - `hooks/`: Custom React hooks
- `messages/`: Translation strings for all supported languages
- `pages/`: Page components and API routes
- `public/`: Static assets like images and icons
- `utils/`: Utility functions

## Key Files

- `next.config.ts`: Next.js configuration
- `middleware.ts`: Request interception for auth, i18n, etc.
- `app/[locale]/layout.tsx`: Root layout with locale provider
- `i18n/routing.ts`: Locale detection and routing configuration

## Tech Stack

- **Framework**: Next.js with App Router
- **UI**: Custom components with Tailwind CSS
- **State Management**: React hooks + context
- **Form Handling**: React Hook Form with Zod validation
- **Internationalization**: next-intl

## Build & Deploy

The application uses the Next.js build system:

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start
```
