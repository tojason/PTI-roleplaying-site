# Code Style and Conventions

## TypeScript Configuration
- **Strict mode enabled** - all TypeScript strict checks enabled
- **Path aliases** - `@/*` maps to `./src/*` for clean imports
- **Interface-based typing** - comprehensive type definitions in `src/types/index.ts`

## File Organization
- **PascalCase** for component files (e.g., `VoicePractice.tsx`)
- **camelCase** for utility files (e.g., `useAppStore.ts`)
- **kebab-case** for page routes (e.g., `/practice/voice`)

## Component Patterns
- **Functional components** with TypeScript interfaces for props
- **Named exports** from component files
- **'use client'** directive for client-side components
- **Props interfaces** defined in `src/types/index.ts`

## Import Style
```typescript
// External libraries first
import { create } from 'zustand';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

// Internal imports with @ alias
import { cn, formatTime } from '@/lib/utils';
import { VoicePracticeProps } from '@/types';
import { Button } from './Button';
```

## Naming Conventions
- **PascalCase** for components, interfaces, types
- **camelCase** for functions, variables, props
- **SCREAMING_SNAKE_CASE** for constants
- **Descriptive naming** - clear, intention-revealing names

## Component Structure
1. Imports (external, then internal)
2. Interface/type definitions (if not in types file)
3. Component implementation
4. Named export

## State Management
- **Zustand store** with typed interfaces
- **Persistence** for important state
- **Immutable updates** using Immer patterns