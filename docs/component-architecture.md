# Component Architecture

## Component Organization

The components in Xiomara follow a hierarchical structure:

1. **Page Components**: Top-level components rendered by Next.js routing
2. **Section Components**: Major page sections (e.g., dashboard cards)
3. **Feature Components**: Specific feature implementations
4. **UI Components**: Reusable, presentational components

## UI Component Library

The `components/ui/` directory contains base UI components built on Tailwind CSS:

- `button.tsx`: Button variants (primary, secondary, outline, etc.)
- `card.tsx`: Container components with consistent styling
- `input.tsx`: Form controls with consistent styling
- `badge.tsx`: Status indicators and tags
- `avatar.tsx`: User avatars with fallback support
- `dropdown-menu.tsx`: Dropdown menus and submenus

## Dashboard Components

Dashboard components are prefixed with `dashboard-` and represent distinct cards or sections:

- `dashboard-header.tsx`: Top navigation bar with title and actions
- `dashboard-Corresspondable.tsx`: Correspondent management card
- `dashboard-fuentes.tsx`: Sources management card
- `dashboard-knowledge.tsx`: Knowledge base card
- `dashboard-media.tsx`: Media monitoring card
- `dashboard-metrics-cards.tsx`: KPI metrics display

## Shared Layouts

- `Navbar.tsx`: Global navigation with user menu and language switching
- `clients-header.tsx`: Reusable header for client-related pages

## Component Props Pattern

Components use TypeScript interfaces for props, defined either:
- Inline for component-specific props
- In dedicated type files for shared prop types

Example:
```tsx
interface CardProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function Card({ title, isExpanded, onToggle }: CardProps) {
  // Component implementation
}
```

## State Management

Most components use React's useState and useEffect hooks for local state. For shared state, useContext is employed (e.g., authentication state).
