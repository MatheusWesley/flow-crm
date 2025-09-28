# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

Flow-CRM is a modern React-based sales management frontend application built with Vite, TypeScript, and TailwindCSS. It's designed as a comprehensive CRM system for managing products, customers, pre-sales, inventory, and reports with a focus on Brazilian business requirements (CPF validation, Brazilian currency formatting).

## Common Development Commands

### Development Server
```bash
npm run dev          # Start development server with hot reload
npm run preview      # Preview production build locally
```

### Build and Production
```bash
npm run build        # TypeScript compilation + Vite production build
```

### Code Quality and Testing
```bash
npm run lint         # Run Biome linter
npm run format       # Format code with Biome
npm run check        # Run Biome check and auto-fix issues
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once (CI mode)
npm run test:ui      # Run tests with Vitest UI
```

### Running Single Tests
```bash
npx vitest run src/components/common/Button/Button.test.tsx    # Single test file
npx vitest run --grep "should render button"                  # Specific test case
```

## Architecture Overview

### Project Structure Philosophy
The codebase follows a feature-driven architecture with clear separation of concerns:

- **Feature Components** (`src/components/features/`): Business logic components organized by domain (dashboard, presales, products, customers)
- **Common Components** (`src/components/common/`): Reusable UI components with comprehensive test coverage
- **Layout Components** (`src/components/layout/`): Application shell components (Header, Sidebar, Layout)
- **Mock Data Layer** (`src/data/`): Mock services simulating backend APIs for development
- **TypeScript Types** (`src/types/index.ts`): Comprehensive type definitions for the entire application

### Key Architectural Patterns

#### Component Organization
- Each component directory contains: `Component.tsx`, `Component.test.tsx`, `index.ts`
- Components follow single responsibility principle with clear prop interfaces
- All business components are wrapped in the Layout component through `LayoutWrapper`

#### Routing Strategy
- React Router with centralized route configuration in `src/routes/index.tsx`
- All routes wrapped with `LayoutWrapper` for consistent layout
- Placeholder routes for incomplete features (inventory, reports, settings)

#### Type System Design
- Comprehensive TypeScript types in `src/types/index.ts` covering all domain models
- Strict TypeScript configuration with `noUnusedLocals` and `noUnusedParameters`
- Input types derived from main types using `Omit` utility (e.g., `ProductInput`)
- Const assertions for enums (`PreSaleStatus`, `ProductUnit`, `UserRole`)

#### State Management Approach
- Currently using React's built-in state management (useState, useEffect)
- Mock services in `src/data/` simulate async operations and data persistence
- Form state management through custom interfaces (`FormState`, `FormField`)

#### Styling System
- TailwindCSS v4 with custom configuration
- Mobile-first responsive design approach
- Biome formatter configured for tab indentation and single quotes
- Component-level styling with utility classes

### Development Patterns

#### Path Aliases Configuration
- `@/*` → `src/*`
- `@/components/*` → `src/components/*`
- `@/hooks/*` → `src/hooks/*`
- `@/types/*` → `src/types/*`
- `@/utils/*` → `src/utils/*`
- `@/data/*` → `src/data/*`

#### Brazilian Business Logic
- CPF validation and formatting in `src/utils/index.ts`
- Brazilian currency formatting (BRL)
- Product code generation with timestamp-based prefixes

#### Testing Strategy
- Vitest with jsdom environment for component testing
- Testing Library React for component interaction testing
- Test setup file at `src/test/setup.ts`
- Every component has corresponding `.test.tsx` file

### Mock Data Architecture
The application uses a sophisticated mock data layer that simulates real backend services:
- `mockProductService.ts` - Product CRUD operations
- `mockCustomerService.ts` - Customer management
- `mockDashboardService.ts` - Dashboard metrics
- `mockUser.ts` - Authentication simulation

This architecture allows development without a backend while maintaining realistic data flow patterns.

### Layout System
The Layout component manages:
- Responsive sidebar with collapse/expand functionality
- Mobile-first design with overlay navigation
- Sticky header with search functionality
- Consistent page structure across all routes

### Component Design Principles
- Generic table component with configurable columns and actions
- Modal components with consistent API
- Form components with validation support
- Button variants (primary, secondary, danger) with loading states

## Future Architecture Considerations
- State management migration path (likely React Query + Zustand)
- Backend integration points already defined through mock services
- Authentication system structure in place through User types
- Report generation system architecture outlined but not implemented