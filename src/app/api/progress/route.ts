import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { createProtectedAPIHandler } from '@/lib/middleware'
import { safeGetTime } from '@/lib/utils'

// Validation schema for progress queries
const getProgressSchema = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
})

async function getProgressData(req: NextRequest, user: any) {
  try {
    const { searchParams } = new URL(req.url)
    const params = Object.fromEntries(searchParams.entries())
    
    const { category, subcategory, period } = getProgressSchema.parse(params)

    // Calculate date range based on period
    const now = new Date()
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }
    const startDate = new Date(now.getTime() - (periodDays[period] * 24 * 60 * 60 * 1000))

    // Build where clause
    const where: any = { userId: user.id }
    if (category) where.category = category
    if (subcategory) where.subcategory = subcategory

    // Get progress data
    const progressData = await prisma.progress.findMany({
      where,
      orderBy: { category: 'asc' }
    })

    // Get recent quiz sessions for activity feed
    const recentQuizSessions = await prisma.quizSession.findMany({
      where: {
        userId: user.id,
        startedAt: { gte: startDate },
        status: 'COMPLETED'
      },
      include: {
        responses: {
          select: {
            isCorrect: true
          }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: 10
    })

    // Get recent voice practice sessions
    const recentVoiceSessions = await prisma.voicePracticeSession.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: startDate }
      },
      include: {
        scenario: {
          select: {
            title: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Calculate overall statistics
    const overallProgress = progressData.find((p: any) => p.category === 'overall')
    const quizProgress = progressData.filter((p: any) => p.category === 'quiz')
    const voiceProgress = progressData.filter((p: any) => p.category === 'voice')

    // Calculate trends (simplified - could be more sophisticated)
    const weeklyQuizData = await getWeeklyQuizData(user.id, startDate)
    const weeklyVoiceData = await getWeeklyVoiceData(user.id, startDate)

    // Build response
    const response = {
      overall: {
        totalSessions: overallProgress?.totalSessions || 0,
        totalTimeSpent: overallProgress?.totalTimeSpent || 0,
        averageAccuracy: overallProgress?.averageAccuracy || 0,
        bestAccuracy: overallProgress?.bestAccuracy || 0,
        currentStreak: overallProgress?.currentStreak || 0,
        longestStreak: overallProgress?.longestStreak || 0,
        lastPracticed: overallProgress?.lastPracticed,
      },
      
      categories: {
        quiz: {
          totalSessions: quizProgress.reduce((sum: number, p: any) => sum + p.totalSessions, 0),
          averageAccuracy: calculateAverageAccuracy(quizProgress),
          breakdown: quizProgress.map((p: any) => ({
            subcategory: p.subcategory,
            sessions: p.totalSessions,
            averageAccuracy: p.averageAccuracy,
            bestAccuracy: p.bestAccuracy,
            lastPracticed: p.lastPracticed,
          }))
        },
        
        voice: {
          totalSessions: voiceProgress.reduce((sum: number, p: any) => sum + p.totalSessions, 0),
          averageAccuracy: calculateAverageAccuracy(voiceProgress),
          breakdown: voiceProgress.map((p: any) => ({
            subcategory: p.subcategory,
            sessions: p.totalSessions,
            averageAccuracy: p.averageAccuracy,
            bestAccuracy: p.bestAccuracy,
            lastPracticed: p.lastPracticed,
          }))
        }
      },

      trends: {
        quiz: weeklyQuizData,
        voice: weeklyVoiceData,
      },

      recentActivity: [
        ...recentQuizSessions.map((session: any) => ({
          id: session.id,
          type: 'quiz',
          category: session.category,
          accuracy: session.score,
          duration: session.duration,
          timestamp: session.startedAt,
          details: {
            totalQuestions: session.responses.length,
            correctAnswers: session.responses.filter((r: any) => r.isCorrect).length
          }
        })),
        ...recentVoiceSessions.map((session: any) => ({
          id: session.id,
          type: 'voice',
          category: session.scenario.category,
          accuracy: session.accuracyScore,
          duration: session.duration,
          timestamp: session.createdAt,
          details: {
            scenarioTitle: session.scenario.title
          }
        }))
      ].sort((a, b) => {
        const timeA = safeGetTime(a.timestamp);
        const timeB = safeGetTime(b.timestamp);
        return timeB - timeA;
      }).slice(0, 20)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Get progress error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters', 
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch progress data' },
      { status: 500 }
    )
  }
}

// Helper function to calculate average accuracy across multiple progress entries
function calculateAverageAccuracy(progressEntries: any[]): number {
  if (progressEntries.length === 0) return 0
  
  const totalSessions = progressEntries.reduce((sum, p) => sum + p.totalSessions, 0)
  if (totalSessions === 0) return 0
  
  const weightedSum = progressEntries.reduce((sum, p) => 
    sum + (p.averageAccuracy * p.totalSessions), 0)
  
  return weightedSum / totalSessions
}

// Helper function to get weekly quiz data
async function getWeeklyQuizData(userId: string, startDate: Date) {
  const quizSessions = await prisma.quizSession.findMany({
    where: {
      userId,
      startedAt: { gte: startDate },
      status: 'COMPLETED'
    },
    select: {
      startedAt: true,
      score: true,
      duration: true
    }
  })

  // Group by week
  const weeklyData: { [key: string]: { sessions: number; totalScore: number; totalDuration: number } } = {}
  
  quizSessions.forEach((session: any) => {
    const weekStart = getWeekStart(session.startedAt)
    const weekKey = weekStart.toISOString().split('T')[0]
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { sessions: 0, totalScore: 0, totalDuration: 0 }
    }
    
    weeklyData[weekKey].sessions++
    weeklyData[weekKey].totalScore += session.score
    weeklyData[weekKey].totalDuration += session.duration
  })

  return Object.entries(weeklyData).map(([week, data]) => ({
    week,
    sessions: data.sessions,
    averageAccuracy: data.sessions > 0 ? data.totalScore / data.sessions : 0,
    totalDuration: data.totalDuration
  }))
}

// Helper function to get weekly voice data
async function getWeeklyVoiceData(userId: string, startDate: Date) {
  const voiceSessions = await prisma.voicePracticeSession.findMany({
    where: {
      userId,
      createdAt: { gte: startDate }
    },
    select: {
      createdAt: true,
      accuracyScore: true,
      duration: true
    }
  })

  // Group by week
  const weeklyData: { [key: string]: { sessions: number; totalScore: number; totalDuration: number } } = {}
  
  voiceSessions.forEach((session: any) => {
    const weekStart = getWeekStart(session.createdAt)
    const weekKey = weekStart.toISOString().split('T')[0]
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { sessions: 0, totalScore: 0, totalDuration: 0 }
    }
    
    weeklyData[weekKey].sessions++
    weeklyData[weekKey].totalScore += session.accuracyScore
    weeklyData[weekKey].totalDuration += session.duration
  })

  return Object.entries(weeklyData).map(([week, data]) => ({
    week,
    sessions: data.sessions,
    averageAccuracy: data.sessions > 0 ? data.totalScore / data.sessions : 0,
    totalDuration: data.totalDuration
  }))
}

// Helper function to get the start of the week (Monday)
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  return new Date(d.setDate(diff))
}

export const dynamic = 'force-dynamic'
export const { GET } = createProtectedAPIHandler({ GET: getProgressData })