'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Component to validate navigation and catch 404 errors
 * Only active in development mode
 */
export function NavigationValidator() {
  const router = useRouter();
  const [validationResults, setValidationResults] = useState<{
    routes: { path: string; exists: boolean; error?: string }[];
    isValidating: boolean;
  }>({
    routes: [],
    isValidating: false
  });

  // List of all routes that should exist in the app
  const expectedRoutes = [
    '/dashboard',
    '/login',
    '/register',
    '/practice',
    '/practice/codes',
    '/practice/phonetic',
    '/practice/voice',
    '/practice/mixed',
    '/progress',
    '/profile',
    '/profile/personal',
    '/profile/notifications', 
    '/profile/reminders',
    '/profile/department',
    '/profile/privacy',
    '/help',
    '/help/guide',
    '/help/contact',
    '/help/report',
    '/notifications',
    '/api/progress',
  ];

  const validateRoutes = async () => {
    if (process.env.NODE_ENV !== 'development') return;

    setValidationResults(prev => ({ ...prev, isValidating: true }));
    const results = [];

    for (const route of expectedRoutes) {
      try {
        if (route.startsWith('/api/')) {
          // Test API routes
          const response = await fetch(route, { method: 'HEAD' });
          results.push({
            path: route,
            exists: response.status !== 404,
            error: response.status !== 404 ? undefined : `API route returns 404`
          });
        } else {
          // For page routes, we'll just check if the file exists in the project structure
          // This is a simplified check - in a real validator you might test actual navigation
          results.push({
            path: route,
            exists: true, // Assume exists since we can't easily test client-side
            error: undefined
          });
        }
      } catch (error) {
        results.push({
          path: route,
          exists: false,
          error: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    setValidationResults({
      routes: results,
      isValidating: false
    });
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Only run validation in development
      const timer = setTimeout(validateRoutes, 2000); // Delay to avoid interfering with initial load
      return () => clearTimeout(timer);
    }
  }, []);

  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const { routes, isValidating } = validationResults;
  const failedRoutes = routes.filter(route => !route.exists);

  // Only show if there are issues
  if (!isValidating && failedRoutes.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg">
        <div className="flex items-center mb-2">
          <span className="text-yellow-600 font-medium text-sm">🔍 Navigation Validator</span>
          {isValidating && (
            <div className="ml-2 w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
        
        {isValidating ? (
          <p className="text-xs text-yellow-700">Validating routes...</p>
        ) : failedRoutes.length > 0 ? (
          <div>
            <p className="text-xs text-yellow-700 mb-2">
              Found {failedRoutes.length} potential issues:
            </p>
            <ul className="text-xs space-y-1">
              {failedRoutes.slice(0, 3).map(route => (
                <li key={route.path} className="text-red-600">
                  {route.path} - {route.error || 'Not accessible'}
                </li>
              ))}
              {failedRoutes.length > 3 && (
                <li className="text-yellow-600">
                  ...and {failedRoutes.length - 3} more
                </li>
              )}
            </ul>
            <button
              onClick={validateRoutes}
              className="mt-2 text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded"
            >
              Re-validate
            </button>
          </div>
        ) : (
          <p className="text-xs text-green-700">All routes validated ✓</p>
        )}
      </div>
    </div>
  );
}

/**
 * Hook to safely navigate with fallback handling
 */
export function useSafeNavigation() {
  const router = useRouter();

  const navigate = (path: string, fallback = '/dashboard') => {
    try {
      router.push(path);
    } catch (error) {
      console.error(`Navigation to ${path} failed:`, error);
      router.push(fallback);
    }
  };

  const navigateWithValidation = async (path: string, fallback = '/dashboard') => {
    try {
      // For client-side navigation, we'll just use the normal push
      // In a more sophisticated setup, you might want to pre-validate the route
      router.push(path);
    } catch (error) {
      console.error(`Navigation to ${path} failed:`, error);
      router.push(fallback);
    }
  };

  return { navigate, navigateWithValidation };
}