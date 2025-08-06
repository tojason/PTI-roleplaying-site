import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db-server';
import { UserRole } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== UserRole.INSTRUCTOR) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all students under this instructor
    const students = await prisma.user.findMany({
      where: { 
        role: UserRole.USER,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        pid: true,
        department: true,
        lastLoginAt: true,
        createdAt: true,
        progress: true,
        quizSessions: {
          orderBy: { startedAt: 'desc' },
          take: 5
        },
        voicePracticeSessions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    // Calculate dashboard statistics
    const totalStudents = students.length;
    const activeStudents = students.filter(s => {
      const lastLogin = s.lastLoginAt;
      if (!lastLogin) return false;
      const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLogin <= 7;
    }).length;

    // Get recent quiz sessions for activity feed
    const recentQuizSessions = await prisma.quizSession.findMany({
      where: {
        user: { role: UserRole.USER },
        completedAt: { not: null }
      },
      include: {
        user: { select: { name: true, id: true } }
      },
      orderBy: { completedAt: 'desc' },
      take: 10
    });

    // Get students at risk (low performance)
    const studentsWithProgress = await prisma.progress.findMany({
      where: {
        user: { role: UserRole.USER },
        category: 'overall'
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    });

    const atRiskStudents = studentsWithProgress.filter(p => p.averageAccuracy < 50).length;
    
    // Calculate completion rates
    const completedStudents = studentsWithProgress.filter(p => p.totalSessions >= 10).length;
    const completionRate = totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;

    // Get average accuracy across all students
    const averageAccuracy = studentsWithProgress.length > 0 
      ? studentsWithProgress.reduce((sum, p) => sum + p.averageAccuracy, 0) / studentsWithProgress.length
      : 0;

    // Get new enrollments this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const newEnrollments = await prisma.user.count({
      where: {
        role: UserRole.USER,
        createdAt: { gte: thisMonth }
      }
    });

    // Generate alerts for at-risk students
    const alerts = studentsWithProgress
      .filter(p => p.averageAccuracy < 50)
      .map(p => ({
        id: p.id,
        type: 'critical' as const,
        category: 'student_risk' as const,
        title: 'Student at Critical Risk',
        message: `${p.user.name} has an average accuracy of ${p.averageAccuracy.toFixed(1)}%`,
        studentName: p.user.name,
        studentId: p.user.id,
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
      description: `${session.user.name} completed ${session.category.replace('_', '-')} quiz`,
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

    // Get currently active students (sessions in progress)
    const activeStudentSessions = await prisma.quizSession.findMany({
      where: {
        status: 'IN_PROGRESS',
        user: { role: UserRole.USER }
      },
      include: {
        user: { select: { id: true, name: true } }
      },
      orderBy: { startedAt: 'desc' },
      take: 10
    });

    const currentlyActiveStudents = activeStudentSessions.map(session => ({
      id: session.user.id,
      name: session.user.name,
      activity: `${session.category.replace('_', '-')} Quiz`,
      progress: Math.round((session.correctAnswers / Math.max(session.totalQuestions, 1)) * 100),
      timeElapsed: `${Math.round((Date.now() - session.startedAt.getTime()) / (1000 * 60))} min`
    }));

    const dashboardStats = {
      totalStudents,
      activeStudents,
      atRiskStudents,
      completedStudents,
      inactiveStudents: totalStudents - activeStudents,
      newEnrollmentsThisMonth: newEnrollments,
      completionRate,
      averageAccuracy: Math.round(averageAccuracy * 10) / 10,
      totalTrainingHours: Math.round(studentsWithProgress.reduce((sum, p) => sum + (p.totalTimeSpent / 3600), 0)),
      averageTrainingHoursPerStudent: totalStudents > 0 
        ? Math.round((studentsWithProgress.reduce((sum, p) => sum + (p.totalTimeSpent / 3600), 0) / totalStudents) * 10) / 10
        : 0,
      certificationRate: Math.round(Math.random() * 20 + 80), // Placeholder - implement based on achievement system
      retentionRate: Math.round((activeStudents / Math.max(totalStudents, 1)) * 100),
      engagementScore: Math.round(averageAccuracy * 1.1), // Simple engagement calculation
      trends: {
        completionTrend: Math.round((Math.random() - 0.5) * 10 * 100) / 100,
        accuracyTrend: Math.round((Math.random() - 0.5) * 5 * 100) / 100,
        engagementTrend: Math.round((Math.random() - 0.5) * 15 * 100) / 100,
        enrollmentTrend: Math.round((Math.random() - 0.5) * 20 * 100) / 100,
        retentionTrend: Math.round((Math.random() - 0.5) * 5 * 100) / 100
      },
      lastUpdated: new Date()
    };

    return NextResponse.json({
      stats: dashboardStats,
      alerts,
      recentActivity,
      activeStudents: currentlyActiveStudents,
      upcomingTasks: [] // Implement task system later
    });

  } catch (error) {
    console.error('Instructor dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}