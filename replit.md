# Overview

This is a Turkish financial management application called "Teminat Mektubu Takip Sistemi" (Guarantee Letter Tracking System). The system is designed to track and manage guarantee letters (teminat mektupları) and credit letters across different projects and banks. It provides comprehensive financial tracking with multi-currency support, data visualization through charts, and export capabilities for financial reporting.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Data Visualization**: Chart.js for financial charts and analytics
- **Table Management**: Tabulator for advanced data table functionality
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless connection
- **Session Management**: PostgreSQL-backed session storage using connect-pg-simple
- **API Design**: RESTful endpoints with proper error handling and logging middleware

## Database Schema
The system manages five core entities:
- **Projects**: Contains project information with status tracking
- **Banks**: Bank details with contact information and status
- **Currencies**: Multi-currency support with exchange rates
- **Exchange Rates**: Real-time currency conversion rates
- **Guarantee Letters**: Core entity linking projects, banks with financial details including amounts, percentages, commission rates, and dates

## Data Storage Architecture
- **Primary Database**: PostgreSQL with UUID primary keys
- **ORM Layer**: Drizzle with full TypeScript integration
- **Schema Management**: Centralized schema definitions in shared directory
- **Migrations**: Drizzle Kit for database schema migrations
- **Connection Pooling**: Neon serverless with WebSocket support

## Authentication & Session Management
- Session-based authentication using PostgreSQL store
- Secure session handling with proper middleware integration
- CORS and security headers configured for production deployment

## File Structure Design
- **Monorepo Structure**: Shared schema and types between client/server
- **Client Directory**: React frontend with component-based architecture
- **Server Directory**: Express API with route-based organization
- **Shared Directory**: Common TypeScript schemas and validation
- **Component Organization**: UI components separated by functionality (charts, forms, tables)

## Multi-Currency System
- Support for TRY, USD, EUR, IQD, GBP currencies
- Real-time exchange rate management
- Currency conversion utilities with formatting
- Localized number formatting for Turkish locale

## Export & Reporting
- Excel/CSV export functionality for financial data
- Multi-format export support with proper UTF-8 encoding
- Chart-based analytics for financial insights
- Dashboard with key performance indicators

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: TypeScript-first ORM with schema validation

## UI & Styling
- **Radix UI**: Headless UI components for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Pre-built component library
- **Chart.js**: Data visualization and charting
- **Tabulator**: Advanced data table functionality

## Development Tools
- **Vite**: Frontend build tool with HMR
- **TypeScript**: Type safety across full stack
- **ESBuild**: Server-side bundling for production
- **Replit Integration**: Development environment plugins

## Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Runtime type validation and schema definition
- **Hookform Resolvers**: Integration between React Hook Form and Zod

## Utilities
- **Date-fns**: Date manipulation and formatting
- **Class Variance Authority**: Component variant management
- **CLSX**: Conditional className utility
- **Nanoid**: Unique ID generation