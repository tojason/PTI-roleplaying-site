'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Navigation } from './Navigation';
import { Header } from './Header';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  showHeader?: boolean;
  headerProps?: React.ComponentProps<typeof Header>;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  showNavigation = true,
  showHeader = true,
  headerProps,
  className,
}) => {
  const router = useRouter();
  const { activeTab, setActiveTab, isAuthenticated } = useAppStore();

  const handleTabChange = (tab: string) => {
    const tabId = tab as 'dashboard' | 'practice' | 'progress';
    setActiveTab(tabId);
    
    // Navigate to the appropriate route
    switch (tabId) {
      case 'dashboard':
        router.push('/dashboard');
        break;
      case 'practice':
        router.push('/practice');
        break;
      case 'progress':
        router.push('/progress');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {showHeader && <Header {...headerProps} />}
      
      {/* Main Content */}
      <main className={cn(
        'flex-1',
        showNavigation && 'pb-20', // Account for bottom navigation
        className
      )}>
        {children}
      </main>
      
      {/* Bottom Navigation */}
      {showNavigation && isAuthenticated && (
        <Navigation 
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}
    </div>
  );
};

export { Layout };