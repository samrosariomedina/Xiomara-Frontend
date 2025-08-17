# Dashboard

## Overview

The dashboard provides a central view of client data, sources, correspondents, metrics, and media monitoring.

## Dashboard Layout

- **Top**: Header with breadcrumbs, title, date selector, and "Add Sources" button
- **Main Content**: Grid of cards for different data views
- **Responsive**: Adapts between desktop and mobile layouts

## Components

### Dashboard Header (`dashboard-header.tsx`)

- Displays breadcrumb navigation
- Shows dashboard title with count badge
- Provides date filter dropdown
- Includes "Add Sources" action button
- Has desktop and mobile-optimized layouts

### Metrics Cards (`dashboard-metrics-cards.tsx`)

- Displays key performance indicators
- Shows stats with icons and trend indicators
- Arranged in a responsive grid

### Corresponsables Section (`dashboard-Corresspondable.tsx`)

- Manages correspondents and sources
- Tabbed interface switching between users and sources
- Interactive list with selection checkboxes
- Status badges for approval states
- Expandable on mobile

### Fuentes Section (`dashboard-fuentes.tsx`)

- Displays all available sources
- Table layout on desktop, card layout on mobile
- Filterable by search, date, and status
- Selection functionality for batch operations

### Knowledge Base (`dashboard-knowledge.tsx`)

- Lists knowledge base articles
- Shows last update times
- Includes refresh button
- Selection for batch actions

### Media Monitoring (`dashboard-media.tsx`)

- Displays social media mentions
- Shows engagement metrics
- Groups by platforms (Twitter, etc.)
- Links to source content

## State Management

Each dashboard component maintains its own expansion state for mobile responsiveness. Filter state is managed at the component level, with desktop and mobile layouts sharing the same data but rendering differently.

## Internationalization

All dashboard components use the next-intl translation system with keys structured under relevant namespaces (DASHBOARD, CORRESPONSABLES, FUENTES, KNOWLEDGE, MEDIA).
