# Client Management

## Overview

Xiomara provides a complete client management system, allowing users to view, create, edit, and delete client records and associated campaigns.

## Key Components

### Client Listing (`clients-list.tsx`, `ClientsList.tsx`)

- Displays paginated list of clients
- Provides search and filter functionality
- Empty state handling for new users

### Client Card (`ClientCard.tsx`)

- Individual client display card
- Shows client name, logo, contact, and campaigns
- Contains action menu for edit/delete operations

### Client Header (`clients-header.tsx`)

- Page header for client sections
- Contains search, filters, and create button
- Responsive design for desktop and mobile

### Campaign Row (`CampaignRow.tsx`)

- Displays individual campaign information
- Shows connected sources and status
- Provides campaign-specific actions

### Client Forms

Three-part form for client creation/editing:
- `GeneralInformationForm.tsx`: Basic client details and contact
- `BrandGuidesForm.tsx`: Brand assets and guidelines
- `ConnectCorrespondentsForm.tsx`: Associate correspondents with client

## Data Flow

1. Client data is fetched through server actions in `actions/clients.ts`
2. Data is passed to client components for rendering
3. Forms collect updated data and submit through server actions
4. Success/error handling with toast notifications

## Key Features

### Client Creation

Three-step wizard for adding new clients:
1. General information (name, industry, logo, description)
2. Brand guides (styling, assets)
3. Correspondent connections

### Campaign Management

- Create campaigns associated with clients
- Connect sources to campaigns
- Track campaign status and metrics

### Search & Filters

- Filter clients by name, date, status
- Sort options (recent, alphabetical)
- Pagination for large client lists

## Type Definitions

Client-related type definitions are located in `components/clients/types.ts` and `lib/types.ts`.
