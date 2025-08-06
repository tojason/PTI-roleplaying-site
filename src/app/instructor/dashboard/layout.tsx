'use client';

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { DashboardLayout } from '@/components/instructor/DashboardLayout';
import { motion } from 'framer-motion';
import { hasRole, type UserRole } from '@/lib/auth-client';
import { InstructorRole } from '@/types/instructor';

interface InstructorDashboardLayoutProps {
  children: ReactNode;
}

export default function InstructorDashboardLayout({ children }: InstructorDashboardLayoutProps) {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const user = session?.user;
  const isAuthenticated = status === 'authenticated' && user && hasRole(user.role as UserRole, 'INSTRUCTOR');

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading instructor dashboard...</p>
          <p className="text-gray-500 text-sm mt-1">Verifying credentials</p>
        </motion.div>
      </div>
    );
  }

  // Authentication check - this should be handled by parent layout
  if (!isAuthenticated || !user) {
    // Let parent layout handle redirects to avoid conflicts
    return null;
  }

  // Transform NextAuth user to instructor user format for dashboard
  const instructorUser = {
    id: user.id,
    pid: user.pid,
    name: user.name,
    firstName: user.name?.split(' ')[0] || '',
    lastName: user.name?.split(' ')[1] || '',
    email: user.email,
    department: user.department || 'Police Department',
    departmentCode: 'DEPT001',
    rank: user.rank,
    badgeNumber: user.badgeNumber,
    role: user.role as InstructorRole, // Convert UserRole to InstructorRole
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    permissions: [],
    certifications: [],
    specializations: [],
    preferences: {
      dashboardLayout: 'grid' as const,
      defaultView: 'overview' as const,
      theme: 'light' as const,
      compactMode: false,
      showAvatars: true,
      animationsEnabled: true,
      studentsPerPage: 20,
      defaultTimeRange: '30d' as const,
      autoRefresh: true,
      refreshInterval: 60,
      notifications: {
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        frequency: 'immediate' as const,
        types: {
          studentProgress: true,
          riskAlerts: true,
          assignments: true,
          systemUpdates: true,
          achievements: true,
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00'
        }
      },
      alertThresholds: {
        atRiskAccuracy: 70,
        inactivityDays: 7,
        criticalFailureRate: 50,
        lowEngagementThreshold: 60,
      },
      chartPreferences: {
        defaultChartType: 'line' as const,
        showTrendLines: true,
        showComparisons: true,
        colorScheme: 'default' as const,
      },
      advancedFeatures: {
        enablePredictiveAnalytics: true,
        enableRealTimeUpdates: true,
        enableBulkActions: true,
        enableAdvancedFilters: true,
      },
      privacy: {
        shareAnonymizedData: false,
        allowUsageAnalytics: true,
        dataSharingLevel: 'department' as const,
      },
    }
  };

  // Successful authentication - render dashboard layout
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <DashboardLayout user={instructorUser}>
        {children}
      </DashboardLayout>
    </motion.div>
  );
}