'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNotifications } from '@/hooks/useNotifications';
import { formatRelativeTime, cn } from '@/lib/utils';
import { 
  CheckIcon, 
  TrashIcon,
  TrophyIcon,
  FireIcon,
  StarIcon,
  ClockIcon,
  InformationCircleIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { Notification } from '@/types';

const getNotificationIcon = (type: Notification['type'], customIcon?: string) => {
  if (customIcon) {
    return <span className="text-2xl">{customIcon}</span>;
  }

  const iconClasses = "w-6 h-6";
  
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
  if (isRead) return 'bg-white border-gray-200';
  
  switch (type) {
    case 'achievement':
      return 'bg-warning-50 border-warning-200';
    case 'reminder':
      return 'bg-info-50 border-info-200';
    case 'update':
      return 'bg-primary-50 border-primary-200';
    case 'streak':
      return 'bg-warning-50 border-warning-200';
    case 'quiz_complete':
      return 'bg-success-50 border-success-200';
    case 'level_up':
      return 'bg-warning-50 border-warning-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return null;
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <Layout 
      headerProps={{
        title: 'Notifications',
        showBack: true,
        onBack: () => router.back(),
      }}
    >
      <div className="p-4 space-y-4">
        {/* Header Actions */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BellIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                {unreadCount > 0 && (
                  <span className="ml-1 text-primary-600 font-medium">
                    ({unreadCount} unread)
                  </span>
                )}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <CheckIcon className="w-4 h-4 mr-1" />
                  Mark all read
                </Button>
              )}
              
              <Button
                variant="secondary"
                size="sm"
                onClick={clearAll}
                className="text-xs text-error-600 hover:text-error-700"
              >
                <TrashIcon className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Card padding="lg" className="text-center">
            <CardContent>
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <BellIcon className="w-8 h-8 text-gray-400" />
              </div>
              <CardTitle className="mb-2">All caught up!</CardTitle>
              <p className="text-gray-600 mb-4">
                No notifications right now. Keep practicing to unlock achievements and stay updated on your progress.
              </p>
              <Button
                onClick={() => router.push('/dashboard')}
                variant="secondary"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-md',
                  getNotificationBgColor(notification.type, notification.isRead)
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.icon)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={cn(
                            'text-sm font-medium text-gray-900 mb-1',
                            !notification.isRead && 'font-semibold'
                          )}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatRelativeTime(notification.timestamp)}
                          </p>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0" />
                          )}
                          
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200"
                              aria-label="Mark as read"
                            >
                              <CheckIcon className="w-4 h-4 text-gray-600" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom spacing for mobile navigation */}
        <div className="h-4" />
      </div>
    </Layout>
  );
}