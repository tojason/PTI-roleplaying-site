'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckIcon, 
  TrashIcon, 
  XMarkIcon,
  ClockIcon,
  TrophyIcon,
  FireIcon,
  StarIcon,
  SpeakerWaveIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Notification, NotificationDropdownProps } from '@/types';
import { formatRelativeTime, cn } from '@/lib/utils';

const getNotificationIcon = (type: Notification['type'], customIcon?: string) => {
  if (customIcon) {
    return <span className="text-lg">{customIcon}</span>;
  }

  const iconClasses = "w-5 h-5";
  
  switch (type) {
    case 'achievement':
      return <TrophyIcon className={cn(iconClasses, "text-warning-600")} />;
    case 'reminder':
      return <ClockIcon className={cn(iconClasses, "text-info-600")} />;
    case 'update':
      return <InformationCircleIcon className={cn(iconClasses, "text-primary-600")} />;
    case 'streak':
      return <FireIcon className={cn(iconClasses, "text-warning-600")} />;
    case 'quiz_complete':
      return <CheckIcon className={cn(iconClasses, "text-success-600")} />;
    case 'level_up':
      return <StarIcon className={cn(iconClasses, "text-warning-600")} />;
    default:
      return <InformationCircleIcon className={cn(iconClasses, "text-gray-600")} />;
  }
};

const getNotificationBgColor = (type: Notification['type'], isRead: boolean) => {
  if (isRead) return 'bg-gray-50';
  
  switch (type) {
    case 'achievement':
      return 'bg-warning-50';
    case 'reminder':
      return 'bg-info-50';
    case 'update':
      return 'bg-primary-50';
    case 'streak':
      return 'bg-warning-50';
    case 'quiz_complete':
      return 'bg-success-50';
    case 'level_up':
      return 'bg-warning-50';
    default:
      return 'bg-gray-50';
  }
};

const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onNotificationClick: (notification: Notification) => void;
}> = ({ notification, onMarkAsRead, onNotificationClick }) => {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onNotificationClick(notification);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  return (
    <div
      className={cn(
        'p-3 border-b border-gray-100 cursor-pointer transition-colors duration-200 hover:bg-gray-50',
        getNotificationBgColor(notification.type, notification.isRead)
      )}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type, notification.icon)}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={cn(
                'text-sm font-medium text-gray-900 line-clamp-1',
                !notification.isRead && 'font-semibold'
              )}>
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatRelativeTime(notification.timestamp)}
              </p>
            </div>
            
            {/* Unread indicator and mark as read button */}
            <div className="flex items-center space-x-1 ml-2">
              {!notification.isRead && (
                <>
                  <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0" />
                  <button
                    onClick={handleMarkAsRead}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200"
                    aria-label="Mark as read"
                  >
                    <CheckIcon className="w-3 h-3 text-gray-600" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNotificationClick,
}) => {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when dropdown is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick(notification);
    
    // Navigate to action URL if available
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div className="fixed inset-0 bg-black bg-opacity-25 z-40 sm:hidden" />
      
      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className={cn(
          'absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50',
          'max-h-96 flex flex-col',
          'sm:w-96' // Wider on desktop
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {unreadCount} new
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                title="Mark all as read"
              >
                <CheckIcon className="w-4 h-4 text-gray-600" />
              </button>
            )}
            
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                title="Clear all notifications"
              >
                <TrashIcon className="w-4 h-4 text-gray-600" />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Close notifications"
            >
              <XMarkIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <CheckIcon className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">All caught up!</p>
              <p className="text-sm text-gray-500 mt-1">
                No new notifications right now.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onNotificationClick={handleNotificationClick}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                router.push('/notifications');
                onClose();
              }}
              className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
            >
              View all notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export { NotificationDropdown };