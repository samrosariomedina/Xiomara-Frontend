# Clients Components

This directory contains a refactored and modular version of the clients list functionality, broken down into smaller, maintainable components.

## Structure

```
clients/
├── index.ts              # Main export file
├── types.ts             # TypeScript types and interfaces
├── ClientsList.tsx      # Main container component (receives data via props)
├── ClientCard.tsx       # Individual client card component  
├── CampaignRow.tsx      # Individual campaign row component
```

## Components

### ClientsList
The main container component that handles:
- State management for expanded clients and context menus
- Display of client data received via props
- Row action menus

### ClientCard  
Individual client card component that displays:
- Client information (name, contact, creation date)
- Campaign statistics
- Action buttons (edit, analytics, create campaign)
- Expandable campaign details

### CampaignRow
Individual campaign row component within expanded client cards that shows:
- Campaign details (name, creation date, status)
- Connected sources with counters
- Campaign-specific actions

## Data Flow

Data is fetched in the parent component (clientsPage.tsx) using the `useClients` hook from `@/hooks/useAPI`, then passed down as props to ClientsList.

```
clientsPage.tsx (useClients hook) → ClientsList → ClientCard → CampaignRow
```

## Usage

```tsx
import { ClientsList } from '@/components/clients'

// Basic usage
<ClientsList />

// With props
<ClientsList 
  clients={clientsData}
  onDelete={handleDelete}
  itemsPerPage={10}
/>
```

## Types

All TypeScript types and interfaces are defined in `types.ts`:

- `Client` - Main client data structure
- `Campaign` - Campaign data structure  
- `ClientsListProps` - Props for main ClientsList component
- `ClientCardProps` - Props for ClientCard component
- `CampaignRowProps` - Props for CampaignRow component
- `MenuOpenData` - Context menu positioning data

## Benefits of This Structure

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: Components can be used independently
3. **Testing**: Easier to write unit tests for individual components
4. **Type Safety**: Centralized type definitions
5. **Performance**: Better tree shaking and code splitting opportunities
6. **Development**: Easier to locate and modify specific functionality

## Migration

The original `clients-list.tsx` file now simply re-exports the new modular components, maintaining backward compatibility while enabling the new structure.
