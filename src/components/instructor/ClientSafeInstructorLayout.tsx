'use client';

import { ReactNode, Suspense } from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

interface ClientSafeInstructorLayoutProps {
  children: ReactNode;
}

function InstructorLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-slate-700 mb-2">Loading Instructor Portal</h2>
        <p className="text-slate-600">Please wait while we prepare your dashboard...</p>
      </div>
    </div>
  );
}

function InstructorErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="text-center max-w-md p-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">
          {error.message.includes('hydrat') 
            ? 'There was a rendering mismatch. This usually happens during development.'
            : 'An unexpected error occurred while loading the instructor dashboard.'
          }
        </p>
        <div className="space-y-3">
          <button
            onClick={resetError}
            className="w-full bg-slate-700 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/instructor/login'}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Back to Login
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Technical Details
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

export function ClientSafeInstructorLayout({ children }: ClientSafeInstructorLayoutProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<InstructorLoadingFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}