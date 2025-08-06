'use client';

import { useEffect } from 'react';
import { useInstructorDashboardStore } from '@/store/instructorDashboardStore';

/**
 * Custom hook for instructor dashboard data
 * Provides easy access to dashboard stats and activity data
 */
export const useInstructorDashboard = () => {
  const {
    stats,
    recentActivity,
    alerts,
    isLoading,
    error,
    fetchDashboardData,
    markAlertAsRead,
    dismissAlert,
    clearError
  } = useInstructorDashboardStore();

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Transform alerts count to exclude read alerts
  const activeAlertsCount = alerts?.filter(alert => !alert.isRead).length || 0;

  // Transform recent activity for display (limit to 3 most recent)
  const recentActivityDisplay = recentActivity?.slice(0, 3) || [];

  // Format average accuracy as percentage
  const averageAccuracy = stats?.averageAccuracy ? `${Math.round(stats.averageAccuracy)}%` : '0%';

  return {
    // Raw data
    stats,
    recentActivity,
    alerts,
    
    // Computed values
    activeAlertsCount,
    recentActivityDisplay,
    averageAccuracy,
    
    // State
    isLoading,
    error,
    
    // Actions
    markAlertAsRead,
    dismissAlert,
    clearError,
    refresh: fetchDashboardData
  };
};