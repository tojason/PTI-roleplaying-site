'use client';

import { 
  HomeIcon, 
  BookmarkIcon, 
  ChartBarIcon, 
  QuestionMarkCircleIcon 
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  BookmarkIcon as BookmarkIconSolid, 
  ChartBarIcon as ChartBarIconSolid, 
  QuestionMarkCircleIcon as QuestionMarkCircleIconSolid 
} from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';
import { NavigationProps, TabId } from '@/types';

const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  notifications = {} 
}) => {
  const tabs = [
    {
      id: 'dashboard' as TabId,
      label: 'Home',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      id: 'practice' as TabId,
      label: 'Practice',
      icon: BookmarkIcon,
      activeIcon: BookmarkIconSolid,
    },
    {
      id: 'progress' as TabId,
      label: 'Progress',
      icon: ChartBarIcon,
      activeIcon: ChartBarIconSolid,
    },

  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = isActive ? tab.activeIcon : tab.icon;
          const notificationCount = notifications[tab.id];

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center p-2 min-w-0 flex-1 transition-colors duration-200',
                isActive 
                  ? 'text-primary-700' 
                  : 'text-gray-500 hover:text-gray-700'
              )}
              aria-label={`Navigate to ${tab.label}`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {notificationCount && notificationCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-error-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs font-medium mt-1 truncate">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { Navigation };