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

    // Get all students with their progress and recent activity
    const students = await prisma.user.findMany({
      where: { 
        role: UserRole.USER,
        isActive: true
      },
      include: {
        progress: true,
        quizSessions: {
          where: { completedAt: { not: null } },
          orderBy: { completedAt: 'desc' },
          take: 5
        },
        voicePracticeSessions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        achievements: {
          include: {
            achievement: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format student data for the frontend
    const formattedStudents = students.map(student => {
      const overallProgress = student.progress.find(p => p.category === 'overall');
      const quizProgress = student.progress.find(p => p.category === 'quiz');
      const voiceProgress = student.progress.find(p => p.category === 'voice');

      const lastActivity = student.quizSessions[0]?.completedAt || 
                          student.voicePracticeSessions[0]?.createdAt ||
                          student.lastLoginAt;

      const daysSinceActivity = lastActivity 
        ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        pid: student.pid,
        department: student.department,
        rank: student.rank,
        enrolledDate: student.createdAt,
        lastActivity,
        daysSinceActivity,
        status: daysSinceActivity === null ? 'inactive' :
               daysSinceActivity <= 1 ? 'very_active' :
               daysSinceActivity <= 7 ? 'active' :
               daysSinceActivity <= 30 ? 'moderate' : 'inactive',
        overallProgress: {
          totalSessions: overallProgress?.totalSessions || 0,
          averageAccuracy: overallProgress?.averageAccuracy || 0,
          totalTimeSpent: overallProgress?.totalTimeSpent || 0,
          currentStreak: overallProgress?.currentStreak || 0,
          longestStreak: overallProgress?.longestStreak || 0
        },
        quizProgress: {
          totalSessions: quizProgress?.totalSessions || 0,
          averageAccuracy: quizProgress?.averageAccuracy || 0,
          bestAccuracy: quizProgress?.bestAccuracy || 0
        },
        voiceProgress: {
          totalSessions: voiceProgress?.totalSessions || 0,
          averageAccuracy: voiceProgress?.averageAccuracy || 0,
          bestAccuracy: voiceProgress?.bestAccuracy || 0
        },
        recentQuizzes: student.quizSessions.map(session => ({
          id: session.id,
          category: session.category,
          score: session.score,
          completedAt: session.completedAt,
          duration: session.duration
        })),
        recentVoicePractice: student.voicePracticeSessions.map(session => ({
          id: session.id,
          accuracyScore: session.accuracyScore,
          duration: session.duration,
          createdAt: session.createdAt
        })),
        achievements: student.achievements.map(ua => ({
          id: ua.achievement.id,
          name: ua.achievement.name,
          title: ua.achievement.title,
          icon: ua.achievement.icon,
          unlockedAt: ua.unlockedAt
        })),
        riskLevel: overallProgress?.averageAccuracy 
          ? (overallProgress.averageAccuracy < 30 ? 'high' :
             overallProgress.averageAccuracy < 50 ? 'medium' :
             overallProgress.averageAccuracy < 70 ? 'low' : 'none')
          : 'unknown'
      };
    });

    return NextResponse.json({ students: formattedStudents });

  } catch (error) {
    console.error('Instructor students API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const instructor = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!instructor || instructor.role !== UserRole.INSTRUCTOR) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, pid, department, rank, phone } = body;

    // Validate required fields
    if (!name || !email || !pid) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, email, and pid are required' 
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { pid }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: 'User with this email or PID already exists' 
      }, { status: 400 });
    }

    // Create new student
    const newStudent = await prisma.user.create({
      data: {
        name,
        email,
        pid,
        department,
        rank,
        phone,
        password: `temp_${pid}`, // Temporary password - should be changed on first login
        role: UserRole.USER,
        isActive: true
      }
    });

    return NextResponse.json({ 
      message: 'Student created successfully',
      student: {
        id: newStudent.id,
        name: newStudent.name,
        email: newStudent.email,
        pid: newStudent.pid
      }
    });

  } catch (error) {
    console.error('Create student API error:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}