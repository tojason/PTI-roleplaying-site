'use client';

import React from 'react';
import { Card, CardContent, CardTitle } from './Card';
import { Button } from './Button';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="text-center p-6">
              <ExclamationTriangleIcon className="w-16 h-16 text-error-500 mx-auto mb-4" />
              <CardTitle className="text-error-900 mb-2">Something went wrong</CardTitle>
              <p className="text-gray-600 mb-6">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-4 p-3 bg-gray-100 rounded text-left text-xs">
                  <pre className="whitespace-pre-wrap text-error-800">
                    {this.state.error.message}
                  </pre>
                </div>
              )}
              
              <div className="space-y-2">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Refresh Page
                </Button>
                
                <Button
                  onClick={() => {
                    this.setState({ hasError: false });
                    window.location.href = '/dashboard';
                  }}
                  variant="secondary"
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  return (error: Error) => {
    console.error('Unhandled error:', error);
    // In a real app, you might want to send this to an error reporting service
  };
}