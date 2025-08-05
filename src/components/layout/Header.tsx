'use client';

import { 
  ChevronLeftIcon, 
  XMarkIcon, 
  Bars3Icon, 
  BellIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationDropdown } from '@/components/ui/NotificationDropdown';
import { UserMenu } from '@/components/ui/UserMenu';
import { Notification } from '@/types';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showClose?: boolean;
  showMenu?: boolean;
  showNotifications?: boolean;
  notificationCount?: number; // This will be overridden by the hook's unreadCount
  onBack?: () => void;
  onClose?: () => void;
  onMenu?: () => void;
  onNotifications?: () => void; // This will be overridden by the hook's toggleDropdown
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  showClose = false,
  showMenu = false,
  showNotifications = false,
  notificationCount = 0, // Will be overridden
  onBack,
  onClose,
  onMenu,
  onNotifications, // Will be overridden
  className,
}) => {
  const {
    notifications,
    unreadCount,
    isDropdownOpen,
    toggleDropdown,
    closeDropdown,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    // This will be handled by the NotificationDropdown component
    // which will navigate to the appropriate URL
  };
  return (
    <div className={cn(
      'flex items-center justify-between p-4 border-b border-gray-200 bg-white relative',
      className
    )} style={{ zIndex: 100 }}>
      {/* Left side */}
      <div className="flex items-center">
        {showBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Go back"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
        )}
        {showClose && (
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Close"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        )}
        {showMenu && (
          <UserMenu />
        )}
        {!showBack && !showClose && !showMenu && <div className="w-10" />}
      </div>

      {/* Center - Title */}
      <div className="flex-1 flex justify-center">
        {title && (
          <h1 className="text-lg font-semibold text-gray-900 truncate px-2">
            {title}
          </h1>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center">
        {showNotifications && (
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className={cn(
                'w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200 relative',
                isDropdownOpen 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'hover:bg-gray-100 text-gray-600'
              )}
              aria-label="Notifications"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <BellIcon className="w-6 h-6" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-error-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-xs text-white font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </div>
              )}
            </button>
            
            <NotificationDropdown
              notifications={notifications}
              unreadCount={unreadCount}
              isOpen={isDropdownOpen}
              onClose={closeDropdown}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onClearAll={clearAll}
              onNotificationClick={handleNotificationClick}
            />
          </div>
        )}
        {!showNotifications && <div className="w-10" />}
      </div>
    </div>
  );
};

export { Header };