import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, checkDbConnection } from '@/lib/db-server';
import { UserRole } from '@prisma/client';

export async function GET() {
  try {
    // Check database connection first
    const dbConnected = await checkDbConnection();
    if (!dbConnected) {
      console.warn('Database connection failed, using mock data for development');
      
      // Return mock data when database is unavailable (development mode)
      if (process.env.NODE_ENV === 'development') {
        const mockStats = {
          totalStudents: 25,
          activeStudents: 18,
          atRiskStudents: 3,
          completedStudents: 15,
          inactiveStudents: 7,
          newEnrollmentsThisMonth: 5,
          completionRate: 85,
          averageAccuracy: 78,
          totalTrainingHours: 62,
          averageTrainingHoursPerStudent: 2.5,
          certificationRate: 82,
          retentionRate: 72,
          engagementScore: 86,
          trends: {
            completionTrend: 2.5,
            accuracyTrend: 1.2,
            engagementTrend: 4.8,
            enrollmentTrend: 8.5,
            retentionTrend: -1.2
          },
          lastUpdated: new Date()
        };
        
        const mockAlerts = [
          {
            id: 'mock-alert-1',
            type: 'warning' as const,
            category: 'student_inactive' as const,
            title: 'Student Needs Attention',
            message: 'J. Smith hasn\'t logged in recently',
            studentName: 'J. Smith',
            studentId: 'student-1',
            timestamp: new Date(),
            isRead: false,
            isResolved: false,
            actionRequired: true
          }
        ];
        
        const mockActivity = [
          {
            id: 'activity-1',
            type: 'session_completed' as const,
            title: 'Quiz Completed',
            description: 'A. Johnson completed 10-codes quiz',
            studentName: 'A. Johnson',
            studentId: 'student-2',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            metadata: { score: 85, accuracy: 85 },
            severity: 'success' as const,
            isRead: true
          },
          {
            id: 'activity-2',
            type: 'session_completed' as const,
            title: 'Quiz Completed',
            description: 'M. Davis completed phonetic alphabet quiz',
            studentName: 'M. Davis',
            studentId: 'student-3',
            timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
            metadata: { score: 72, accuracy: 72 },
            severity: 'info' as const,
            isRead: true
          }
        ];
        
        return NextResponse.json({
          stats: mockStats,
          alerts: mockAlerts,
          recentActivity: mockActivity,
          activeStudents: [],
          upcomingTasks: [],
          _isMockData: true
        });
      }
      
      // In production, still return error
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          message: 'Unable to connect to database. Please try again later.'
        }, 
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);
    console.log('Dashboard API - Session:', session?.user?.email, session?.user?.role);
    
    if (!session?.user?.email) {
      console.log('Dashboard API - No session or email');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For development mode with mock users, skip database user lookup
    if (process.env.NODE_ENV === 'development' && session.user.role === 'INSTRUCTOR') {
      console.log('Dashboard API - Using development mode for user:', session.user.email);
    } else {
      // Production mode - verify user in database
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user || user.role !== UserRole.INSTRUCTOR) {
        console.log('Dashboard API - User not found or not instructor:', user?.role);
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    const instructorDepartment = session.user.department || 'Development Department';

    // Get basic student count with error handling
    let totalStudents = 0;
    let activeStudents = 0;
    let students: any[] = [];

    try {
      students = await prisma.user.findMany({
        where: { 
          role: UserRole.USER,
          isActive: true,
          ...(instructorDepartment ? { department: instructorDepartment } : {})
        },
        select: {
          id: true,
          name: true,
          email: true,
          pid: true,
          department: true,
          lastLoginAt: true,
          createdAt: true
        }
      });

      totalStudents = students.length;
      
      // Calculate active students (logged in within 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      activeStudents = students.filter(s => {
        return s.lastLoginAt && s.lastLoginAt >= thirtyDaysAgo;
      }).length;
    } catch (error) {
      console.error('Error fetching students:', error);
      // Continue with defaults
    }

    // Get recent quiz sessions with error handling
    let recentQuizSessions: any[] = [];
    try {
      recentQuizSessions = await prisma.quizSession.findMany({
        where: {
          user: { 
            role: UserRole.USER,
            ...(instructorDepartment ? { department: instructorDepartment } : {})
          },
          completedAt: { not: null }
        },
        include: {
          user: { select: { name: true, id: true } }
        },
        orderBy: { completedAt: 'desc' },
        take: 10
      });
    } catch (error) {
      console.error('Error fetching quiz sessions:', error);
      // Continue with empty array
    }

    // Get average score from recent sessions
    const averageScore = recentQuizSessions.length > 0 
      ? Math.round(recentQuizSessions.reduce((sum, session) => sum + session.score, 0) / recentQuizSessions.length)
      : 0;

    // Count students needing attention (no activity in 7 days or low scores)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const studentsNeedingAttention = students.filter(student => {
      const noRecentActivity = !student.lastLoginAt || student.lastLoginAt < sevenDaysAgo;
      const hasLowScores = recentQuizSessions
        .filter(session => session.user.id === student.id)
        .some(session => session.score < 70);
      return noRecentActivity || hasLowScores;
    }).length;

    // Get new enrollments this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const newEnrollments = students.filter(s => s.createdAt >= thisMonth).length;

    // Simple dashboard stats
    const dashboardStats = {
      totalStudents,
      activeStudents,
      atRiskStudents: studentsNeedingAttention,
      completedStudents: Math.floor(totalStudents * 0.7), // Estimate
      inactiveStudents: totalStudents - activeStudents,
      newEnrollmentsThisMonth: newEnrollments,
      completionRate: Math.round(Math.random() * 20 + 70), // Placeholder
      averageAccuracy: averageScore,
      totalTrainingHours: Math.round(totalStudents * 2.5), // Estimate
      averageTrainingHoursPerStudent: totalStudents > 0 ? 2.5 : 0,
      certificationRate: Math.round(Math.random() * 20 + 80), // Placeholder
      retentionRate: Math.round((activeStudents / Math.max(totalStudents, 1)) * 100),
      engagementScore: Math.round(averageScore * 1.1),
      trends: {
        completionTrend: Math.round((Math.random() - 0.5) * 10 * 100) / 100,
        accuracyTrend: Math.round((Math.random() - 0.5) * 5 * 100) / 100,
        engagementTrend: Math.round((Math.random() - 0.5) * 15 * 100) / 100,
        enrollmentTrend: Math.round((Math.random() - 0.5) * 20 * 100) / 100,
        retentionTrend: Math.round((Math.random() - 0.5) * 5 * 100) / 100
      },
      lastUpdated: new Date()
    };

    // Simple alerts for students needing attention
    const alerts = students
      .filter(student => {
        const noRecentActivity = !student.lastLoginAt || student.lastLoginAt < sevenDaysAgo;
        return noRecentActivity;
      })
      .slice(0, 5) // Limit to 5 alerts
      .map(student => ({
        id: student.id,
        type: 'warning' as const,
        category: 'student_inactive' as const,
        title: 'Student Needs Attention',
        message: `${student.name} hasn't logged in recently`,
        studentName: student.name,
        studentId: student.id,
        timestamp: new Date(),
        isRead: false,
        isResolved: false,
        actionRequired: true
      }));

    // Format recent activity
    const recentActivity = recentQuizSessions.map(session => ({
      id: session.id,
      type: 'session_completed' as const,
      title: 'Quiz Completed',
      description: `${session.user.name} completed ${session.category.replace('_', ' ')} quiz`,
      studentName: session.user.name,
      studentId: session.user.id,
      timestamp: session.completedAt!,
      metadata: { 
        score: session.score,
        accuracy: session.score
      },
      severity: session.score >= 80 ? 'success' as const : 
                session.score >= 60 ? 'info' as const : 'warning' as const,
      isRead: true
    }));

    return NextResponse.json({
      stats: dashboardStats,
      alerts,
      recentActivity,
      activeStudents: [], // Will be populated when needed
      upcomingTasks: []
    });

  } catch (error) {
    console.error('Instructor dashboard API error:', error);
    
    // Handle specific Prisma/Database errors
    if (error instanceof Error) {
      if (error.message.includes('connect ECONNREFUSED') || 
          error.message.includes('database') || 
          error.message.includes('connection')) {
        return NextResponse.json(
          { 
            error: 'Database connection failed',
            message: 'Unable to connect to database. Please check your connection and try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined 
          },
          { status: 503 }
        );
      }
      
      if (error.message.includes('P2002') || error.message.includes('P2025') || 
          error.message.includes('P2003') || error.message.includes('P20')) {
        return NextResponse.json(
          { 
            error: 'Database query error',
            message: 'Database query failed. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined 
          },
          { status: 500 }
        );
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
    return NextResponse.json(
      { 
        error: errorMessage,
        message: 'An unexpected error occurred. Please try refreshing the page.',
        details: process.env.NODE_ENV === 'development' ? error : undefined 
      },
      { status: 500 }
    );
  }
}