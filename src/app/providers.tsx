'use client';

import { SessionProvider } from 'next-auth/react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { NavigationValidator } from '@/components/ui/NavigationValidator';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ErrorBoundary>
        {children}
        <NavigationValidator />
      </ErrorBoundary>
    </SessionProvider>
  );
}