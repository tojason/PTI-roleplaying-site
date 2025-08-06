/**
 * Activity formatting utilities for instructor dashboard
 */

/**
 * Get the appropriate color class for an activity type
 */
export const getActivityColor = (type: string): string => {
  switch (type) {
    case 'session_completed':
    case 'module_completed':
      return 'bg-success-500';
    case 'student_login':
    case 'assignment_submitted':
      return 'bg-info-500';
    case 'achievement_unlocked':
      return 'bg-warning-500';
    default:
      return 'bg-gray-500';
  }
};

/**
 * Format a timestamp as a relative time string
 */
export const formatTimeAgo = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

/**
 * Format a timestamp as a short relative time string (for mobile)
 */
export const formatTimeAgoShort = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'now';
};