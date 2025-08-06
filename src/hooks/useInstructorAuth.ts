'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { InstructorUser, InstructorRole } from '@/types/instructor';

interface UseInstructorAuthResult {
  user: InstructorUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasRole: (role: InstructorRole | InstructorRole[]) => boolean;
  canAccessStudentData: (studentId?: string) => boolean;
}

export function useInstructorAuth(): UseInstructorAuthResult {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<InstructorUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLoading = status === 'loading';
  const isAuthenticated = !!session && !!user && user.role !== undefined;

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/instructor/login');
      return;
    }

    // Check if user has instructor role
    if (session.user && session.user.role) {
      const userRole = session.user.role as InstructorRole;
      
      if (!Object.values(InstructorRole).includes(userRole)) {
        setError('Insufficient permissions. Instructor access required.');
        router.push('/instructor/login');
        return;
      }

      // Transform session user to instructor user with fallbacks for development
      const instructorUser: InstructorUser = {
        id: session.user.id || '',
        pid: session.user.pid || 'DEV001',
        name: session.user.name || '',
        firstName: (session.user as any).firstName || session.user.name?.split(' ')[0] || 'John',
        lastName: (session.user as any).lastName || session.user.name?.split(' ')[1] || 'Doe',
        email: session.user.email || '',
        department: (session.user as any).department || 'Development Department',
        departmentCode: (session.user as any).departmentCode || 'DEV01',
        rank: (session.user as any).rank,
        badgeNumber: (session.user as any).badgeNumber,
        yearsOfExperience: (session.user as any).yearsOfExperience,
        certifications: (session.user as any).certifications || [],
        specializations: (session.user as any).specializations || [],
        profilePhoto: (session.user as any).image,
        role: userRole,
        permissions: (session.user as any).permissions || [],
        isActive: (session.user as any).isActive ?? true,
        isVerified: (session.user as any).isVerified ?? false,
        createdAt: new Date((session.user as any).createdAt || Date.now()),
        updatedAt: new Date((session.user as any).updatedAt || Date.now()),
        lastLoginAt: (session.user as any).lastLoginAt ? new Date((session.user as any).lastLoginAt) : undefined,
        lastActivityAt: (session.user as any).lastActivityAt ? new Date((session.user as any).lastActivityAt) : undefined,
        preferences: (session.user as any).preferences || {
          dashboardLayout: 'grid',
          defaultView: 'overview',
          theme: 'light',
          compactMode: false,
          showAvatars: true,
          animationsEnabled: true,
          studentsPerPage: 20,
          defaultTimeRange: '30d',
          autoRefresh: true,
          refreshInterval: 60,
          notifications: {
            emailEnabled: true,
            pushEnabled: true,
            smsEnabled: false,
            frequency: 'immediate',
            types: {
              studentProgress: true,
              riskAlerts: true,
              assignments: true,
              systemUpdates: true,
              achievements: true,
            },
          },
          alertThresholds: {
            atRiskAccuracy: 70,
            inactivityDays: 7,
            criticalFailureRate: 50,
            lowEngagementThreshold: 60,
          },
          chartPreferences: {
            defaultChartType: 'line',
            showTrendLines: true,
            showComparisons: true,
            colorScheme: 'default',
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
            dataSharingLevel: 'department',
          },
        },
      };

      setUser(instructorUser);
      setError(null);
    }
  }, [session, status, router]);

  const hasRole = (requiredRole: InstructorRole | InstructorRole[]): boolean => {
    if (!user) return false;
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(user.role);
  };

  const canAccessStudentData = (studentId?: string): boolean => {
    if (!user) return false;
    
    // Super admin can access all data
    if (user.role === InstructorRole.SUPER_ADMIN) return true;
    
    // Admin can access all student data in their organization
    if (user.role === InstructorRole.ADMIN) return true;
    
    // Regular instructors can access students in their department/cohorts
    // This would typically involve checking assignments, cohorts, etc.
    // For now, we'll allow access (would be refined based on business logic)
    if (user.role === InstructorRole.INSTRUCTOR) return true;
    
    return false;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    hasRole,
    canAccessStudentData,
  };
}