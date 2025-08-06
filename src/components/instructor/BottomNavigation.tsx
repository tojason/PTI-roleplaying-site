'use client';

import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeIcon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
}

// Tab icons (outline versions)
const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const StudentsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const AnalyticsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const MessagesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const MoreIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

// Tab icons (solid versions)
const HomeIconSolid = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.47 3.84a.75.75 0 01.06 1.06L9.81 6.75H15a.75.75 0 010 1.5H8.5a.75.75 0 01-.53-.22L3.47 3.84a.75.75 0 011.06-1.06L11.47 3.84zM3 12.75a.75.75 0 01.75-.75h6.568l-1.757-1.757a.75.75 0 111.061-1.061l3 3a.75.75 0 010 1.061l-3 3a.75.75 0 01-1.061-1.061L10.318 14.5H3.75A.75.75 0 013 12.75z" />
  </svg>
);

const StudentsIconSolid = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-1.381z" clipRule="evenodd" />
  </svg>
);

const AnalyticsIconSolid = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
  </svg>
);

const MessagesIconSolid = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
  </svg>
);

const MoreIconSolid = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </svg>
);

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs: TabConfig[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
      href: '/instructor/dashboard',
    },
    {
      id: 'students',
      label: 'Students',
      icon: StudentsIcon,
      activeIcon: StudentsIconSolid,
      href: '/instructor/students',
      badge: 3, // Mock badge for at-risk students
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: AnalyticsIcon,
      activeIcon: AnalyticsIconSolid,
      href: '/instructor/analytics',
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessagesIcon,
      activeIcon: MessagesIconSolid,
      href: '/instructor/messages',
      badge: 12, // Mock badge for unread messages
    },
    {
      id: 'more',
      label: 'More',
      icon: MoreIcon,
      activeIcon: MoreIconSolid,
      href: '/instructor/settings',
    },
  ];

  const handleTabChange = (tab: TabConfig) => {
    router.push(tab.href);
  };

  const isTabActive = (tab: TabConfig) => {
    // Exact match for dashboard
    if (tab.id === 'dashboard') {
      return pathname === '/instructor/dashboard';
    }
    
    // Check if current path starts with tab href
    return pathname.startsWith(tab.href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = isTabActive(tab);
          const Icon = isActive ? tab.activeIcon : tab.icon;

          return (
            <motion.button
              key={tab.id}
              onClick={() => handleTabChange(tab)}
              className={cn(
                'flex flex-col items-center justify-center p-2 min-w-0 flex-1 transition-colors duration-200 relative',
                isActive 
                  ? 'text-primary-700' 
                  : 'text-gray-500 hover:text-gray-700'
              )}
              aria-label={`Navigate to ${tab.label}`}
              whileTap={{ scale: 0.95 }}
            >
              {/* Icon container with badge */}
              <div className="relative">
                <Icon className="w-6 h-6" />
                
                {/* Badge */}
                {tab.badge && tab.badge > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-error-500 rounded-full flex items-center justify-center px-1"
                  >
                    <span className="text-xs text-white font-bold leading-none">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Label */}
              <span className={cn(
                'text-xs font-medium mt-1 truncate transition-colors duration-200',
                isActive ? 'text-primary-700' : 'text-gray-500'
              )}>
                {tab.label}
              </span>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}