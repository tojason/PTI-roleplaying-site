'use client';

import { useState, useEffect, useCallback } from 'react';
import { Notification } from '@/types';
import { storage } from '@/lib/utils';

const STORAGE_KEY = 'pti_notifications';

// Sample training-related notifications
const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'achievement',
    title: 'New Achievement Unlocked!',
    message: 'You earned the "Week Warrior" badge for practicing 7 days in a row.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    isRead: false,
    icon: '🏅',
    actionUrl: '/progress',
    metadata: { achievement: 'week_warrior' }
  },
  {
    id: '2',
    type: 'quiz_complete',
    title: 'Quiz Completed',
    message: 'Great job on the 10-Codes practice! You scored 85% accuracy.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    icon: '🎯',
    actionUrl: '/progress',
    metadata: { score: 85, category: 'codes' }
  },
  {
    id: '3',
    type: 'reminder',
    title: 'Daily Streak Reminder',
    message: 'Keep your 5-day streak alive! Complete today\'s recommended practice.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    isRead: false,
    icon: '🔥',
    actionUrl: '/practice',
    metadata: { streak: 5 }
  },
  {
    id: '4',
    type: 'level_up',
    title: 'Level Up!',
    message: 'Congratulations! You\'ve reached Level 3 in your training.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
    icon: '⭐',
    actionUrl: '/dashboard',
    metadata: { newLevel: 3 }
  },
  {
    id: '5',
    type: 'update',
    title: 'New Practice Mode Available',
    message: 'Try the new Voice Practice mode to improve your radio communication skills.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    isRead: true,
    icon: '🎤',
    actionUrl: '/practice/voice',
    metadata: { feature: 'voice_practice' }
  }
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load notifications from storage on mount
  useEffect(() => {
    const stored = storage.get(STORAGE_KEY);
    if (stored && Array.isArray(stored)) {
      // Convert timestamp strings back to Date objects
      const parsedNotifications = stored.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
      setNotifications(parsedNotifications);
    } else {
      // Initialize with sample notifications
      setNotifications(SAMPLE_NOTIFICATIONS);
      storage.set(STORAGE_KEY, SAMPLE_NOTIFICATIONS);
    }
  }, []);

  // Save notifications to storage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      storage.set(STORAGE_KEY, notifications);
    }
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    storage.remove(STORAGE_KEY);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Generate training-specific notifications
  const addAchievementNotification = useCallback((title: string, message: string, actionUrl?: string) => {
    addNotification({
      type: 'achievement',
      title,
      message,
      isRead: false,
      icon: '🏅',
      actionUrl,
    });
  }, [addNotification]);

  const addQuizCompleteNotification = useCallback((score: number, category: string) => {
    addNotification({
      type: 'quiz_complete',
      title: 'Quiz Completed',
      message: `Great job on the ${category} practice! You scored ${score}% accuracy.`,
      isRead: false,
      icon: '🎯',
      actionUrl: '/progress',
      metadata: { score, category },
    });
  }, [addNotification]);

  const addStreakReminder = useCallback((streakDays: number) => {
    addNotification({
      type: 'reminder',
      title: 'Daily Streak Reminder',
      message: `Keep your ${streakDays}-day streak alive! Complete today's recommended practice.`,
      isRead: false,
      icon: '🔥',
      actionUrl: '/practice',
      metadata: { streak: streakDays },
    });
  }, [addNotification]);

  const addLevelUpNotification = useCallback((newLevel: number) => {
    addNotification({
      type: 'level_up',
      title: 'Level Up!',
      message: `Congratulations! You've reached Level ${newLevel} in your training.`,
      isRead: false,
      icon: '⭐',
      actionUrl: '/dashboard',
      metadata: { newLevel },
    });
  }, [addNotification]);

  return {
    notifications,
    unreadCount,
    isDropdownOpen,
    toggleDropdown,
    closeDropdown,
    markAsRead,
    markAllAsRead,
    clearAll,
    addNotification,
    removeNotification,
    // Training-specific helpers
    addAchievementNotification,
    addQuizCompleteNotification,
    addStreakReminder,
    addLevelUpNotification,
  };
}