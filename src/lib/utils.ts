import { type ClassValue, clsx } from 'clsx';

/**
 * Utility function to merge CSS classes
 * Uses clsx for conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format time in minutes and seconds
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get practice streak message
 */
export function getStreakMessage(days: number): string {
  if (days === 0) return "Start your practice streak today!";
  if (days === 1) return "Great start! Keep it going!";
  if (days < 7) return `${days} days strong! Keep it up!`;
  if (days < 30) return `${days} days! You're on fire!`;
  return `${days} days! Incredible dedication!`;
}

/**
 * Get level progress
 */
export function getLevelProgress(currentPoints: number): { level: number; progress: number; nextLevelPoints: number } {
  // Each level requires 100 more points than the previous
  // Level 1: 0-99, Level 2: 100-299, Level 3: 300-599, etc.
  let level = 1;
  let pointsNeeded = 100;
  let totalPointsForLevel = 0;
  
  while (currentPoints >= totalPointsForLevel + pointsNeeded) {
    totalPointsForLevel += pointsNeeded;
    level++;
    pointsNeeded += 100;
  }
  
  const pointsInCurrentLevel = currentPoints - totalPointsForLevel;
  const progress = Math.round((pointsInCurrentLevel / pointsNeeded) * 100);
  
  return {
    level,
    progress,
    nextLevelPoints: pointsNeeded - pointsInCurrentLevel,
  };
}

/**
 * Get accuracy color based on percentage
 */
export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 90) return 'text-success-600';
  if (accuracy >= 80) return 'text-primary-600';
  if (accuracy >= 70) return 'text-warning-600';
  return 'text-error-600';
}

/**
 * Get accuracy background color for progress bars
 */
export function getAccuracyBgColor(accuracy: number): string {
  if (accuracy >= 90) return 'bg-success-500';
  if (accuracy >= 80) return 'bg-primary-500';
  if (accuracy >= 70) return 'bg-warning-500';
  return 'bg-error-500';
}

/**
 * Safely convert a value to a Date object
 */
export function safeDate(value: Date | string | number | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Safely get time from a date value
 */
export function safeGetTime(value: Date | string | number | null | undefined): number {
  const date = safeDate(value);
  return date ? date.getTime() : 0;
}

/**
 * Format date relative to now
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks === 1) return '1 week ago';
  if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
  
  return date.toLocaleDateString();
}

/**
 * Local storage utilities
 */
export const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Handle storage quota exceeded
    }
  },
  
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
  
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  },
};

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}