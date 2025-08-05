# Project Structure

## Directory Layout
```
src/
├── app/                          # Next.js App Router pages
│   ├── dashboard/               # Dashboard page
│   ├── login/                   # Authentication pages
│   ├── practice/                # Practice mode pages
│   │   ├── codes/              # 10-codes quiz
│   │   ├── phonetic/           # Phonetic alphabet quiz
│   │   └── voice/              # Voice practice
│   ├── progress/               # Progress tracking page
│   ├── profile/                # User profile page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page (redirects)
│   └── globals.css             # Global styles
├── components/                  # Reusable components
│   ├── ui/                     # Basic UI components
│   │   ├── Button.tsx          # Button component
│   │   ├── Card.tsx            # Card components
│   │   ├── Input.tsx           # Input components
│   │   ├── Checkbox.tsx        # Checkbox component
│   │   ├── Progress.tsx        # Progress indicators
│   │   ├── QuizCard.tsx        # Quiz interface
│   │   ├── VoicePractice.tsx   # Voice practice interface
│   │   └── ProgressTracker.tsx # Progress tracking
│   └── layout/                 # Layout components
│       ├── Layout.tsx          # Main layout wrapper
│       ├── Navigation.tsx      # Bottom tab navigation
│       └── Header.tsx          # Page headers
├── lib/                        # Utility functions
│   ├── utils.ts               # Common utilities
│   └── mockData.ts            # Mock quiz data
├── store/                      # State management
│   └── useAppStore.ts         # Zustand store
└── types/                      # TypeScript definitions
    └── index.ts               # Type definitions
```

## Key Components
- **VoicePractice.tsx** - Main voice practice component (needs speech integration)
- **QuizCard.tsx** - Quiz interface for 10-codes and phonetic alphabet
- **useAppStore.ts** - Zustand global state management
- **types/index.ts** - All TypeScript type definitions

## Important Files
- **package.json** - Dependencies and scripts
- **tailwind.config.ts** - Tailwind CSS configuration
- **tsconfig.json** - TypeScript configuration
- **.eslintrc.json** - ESLint configuration