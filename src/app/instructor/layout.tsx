'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { hasRole, type UserRole } from '@/lib/auth-client';

interface InstructorLayoutProps {
  children: React.ReactNode;
}

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/instructor/login', '/instructor/register', '/instructor/forgot-password'];

export default function InstructorLayout({ children }: InstructorLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && session?.user && hasRole(session.user.role as UserRole, 'INSTRUCTOR');

  useEffect(() => {
    if (status !== 'loading') {
      setIsInitialized(true);
    }
  }, [status]);

  useEffect(() => {
    if (!isInitialized) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    
    if (!isAuthenticated && !isPublicRoute) {
      // Redirect to login with return URL, but avoid loops
      const returnUrl = encodeURIComponent(pathname);
      const targetUrl = `/instructor/login?returnUrl=${returnUrl}`;
      
      // Only redirect if we're not already going to the login page
      if (pathname !== '/instructor/login') {
        router.replace(targetUrl); // Use replace to avoid history loops
      }
    } else if (isAuthenticated && isPublicRoute && pathname !== '/instructor/login') {
      // Redirect authenticated users away from auth pages, but not during login process
      router.replace('/instructor/dashboard'); // Use replace to avoid history loops
    }
  }, [isAuthenticated, pathname, router, isInitialized]);

  // Show loading state while checking authentication
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading Instructor Portal...</p>
          <p className="text-white/70 text-sm mt-2">Verifying credentials and permissions</p>
        </div>
      </div>
    );
  }

  // For public routes, render without additional checks
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  if (isPublicRoute) {
    return (
      <div className="instructor-layout">
        {children}
      </div>
    );
  }

  // For protected routes, ensure user is authenticated
  if (!isAuthenticated || !session?.user) {
    // Don't render access denied if we're already redirecting or on login page
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    if (isPublicRoute || !isInitialized) {
      return (
        <div className="min-h-screen bg-slate-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </div>
        </div>
      );
    }
    
    // Only show access denied if we haven't started redirecting
    return (
      <div className="min-h-screen bg-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Access Denied</h1>
          <p className="text-white/70 text-sm mb-6">You need instructor permissions to access this area.</p>
          <button
            onClick={() => {
              const returnUrl = encodeURIComponent(pathname);
              router.replace(`/instructor/login?returnUrl=${returnUrl}`);
            }}
            className="bg-white text-slate-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Sign In to Instructor Portal
          </button>
        </div>
      </div>
    );
  }

  // Render protected content with appropriate layout
  return (
    <div className="instructor-layout">
      <InstructorHeader />
      <main className="instructor-main">
        {children}
      </main>
    </div>
  );
}

// Instructor-specific header component
function InstructorHeader() {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const { signOut } = await import('next-auth/react');
    await signOut({ callbackUrl: '/instructor/login' });
  };

  const user = session?.user;

  return (
    <header className="bg-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Police Training System</h1>
              <p className="text-xs text-slate-300">Instructor Portal</p>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user?.name?.split(' ')?.[0]?.[0]}{user?.name?.split(' ')?.[1]?.[0]}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-slate-300">{user?.department}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <p className="text-xs text-slate-600">{user?.role}</p>
                  <p className="text-xs text-slate-600">PID: {user?.pid}</p>
                </div>
                
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push('/instructor/profile');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile Settings
                </button>
                
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push('/instructor/preferences');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Preferences
                </button>
                
                <hr className="my-1" />
                
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Error Boundary for instructor routes (removed export to fix build)
function InstructorErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <div className="instructor-error-boundary">
      {/* In a real implementation, you'd want a proper error boundary here */}
      {children}
    </div>
  );
}