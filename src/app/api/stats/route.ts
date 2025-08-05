import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { createProtectedAPIHandler } from '@/lib/middleware'

// Validation schema for stats queries
const getStatsSchema = z.object({
  type: z.enum(['leaderboard', 'department', 'global']).default('leaderboard'),
  category: z.enum(['quiz', 'voice', 'overall']).default('overall'),
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  limit: z.string().transform((val: string) => parseInt(val)).default('10'),
})

async function getStatsData(req: NextRequest, user: any) {
  try {
    const { searchParams } = new URL(req.url)
    const params = Object.fromEntries(searchParams.entries())
    
    const { type, category, period, limit } = getStatsSchema.parse(params)

    // Calculate date range
    const now = new Date()
    let startDate: Date | undefined
    
    if (period !== 'all') {
      const periodDays = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      }
      startDate = new Date(now.getTime() - (periodDays[period] * 24 * 60 * 60 * 1000))
    }

    let response = {}

    switch (type) {
      case 'leaderboard':
        response = await getLeaderboard(category, startDate, limit, user)
        break
      case 'department':
        response = await getDepartmentStats(user.department, category, startDate)
        break
      case 'global':
        response = await getGlobalStats(category, startDate)
        break
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Get stats error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters', 
          details: error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

async function getLeaderboard(category: string, startDate: Date | undefined, limit: number, user: any) {
  const whereClause = startDate ? { lastPracticed: { gte: startDate } } : {}

  let progressData
  
  if (category === 'overall') {
    progressData = await prisma.progress.findMany({
      where: {
        ...whereClause,
        category: 'overall'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            pid: true,
            badgeNumber: true,
            department: true,
            rank: true
          }
        }
      },
      orderBy: [
        { averageAccuracy: 'desc' },
        { totalSessions: 'desc' }
      ],
      take: limit
    })
  } else {
    progressData = await prisma.progress.findMany({
      where: {
        ...whereClause,
        category
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            badgeNumber: true,
            department: true,
            rank: true
          }
        }
      }
    })

    // Group by user and calculate aggregate scores
    const userStats = new Map()
    
    progressData.forEach((progress: any) => {
      const userId = progress.userId
      if (!userStats.has(userId)) {
        userStats.set(userId, {
          user: progress.user,
          totalSessions: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          totalTimeSpent: 0,
          averageAccuracy: 0,
          bestAccuracy: 0
        })
      }
      
      const stats = userStats.get(userId)
      stats.totalSessions += progress.totalSessions
      stats.totalQuestions += progress.totalQuestions
      stats.correctAnswers += progress.correctAnswers
      stats.totalTimeSpent += progress.totalTimeSpent
      stats.bestAccuracy = Math.max(stats.bestAccuracy, progress.bestAccuracy)
    })

    // Calculate weighted average accuracy and sort
    progressData = Array.from(userStats.values())
      .map((stats: any) => {
        stats.averageAccuracy = stats.totalQuestions > 0 
          ? (stats.correctAnswers / stats.totalQuestions) * 100
          : 0
        return stats
      })
      .sort((a: any, b: any) => {
        if (b.averageAccuracy !== a.averageAccuracy) {
          return b.averageAccuracy - a.averageAccuracy
        }
        return b.totalSessions - a.totalSessions
      })
      .slice(0, limit)
  }

  // Find current user's rank
  const allUsers = category === 'overall' 
    ? await prisma.progress.findMany({
        where: { category: 'overall' },
        select: { userId: true, averageAccuracy: true, totalSessions: true },
        orderBy: [
          { averageAccuracy: 'desc' },
          { totalSessions: 'desc' }
        ]
      })
    : [] // More complex calculation needed for other categories

  const userRank = allUsers.findIndex((u: any) => u.userId === user.id) + 1

  return {
    leaderboard: progressData.map((entry: any, index: number) => ({
      rank: index + 1,
      user: category === 'overall' ? entry.user : entry.user,
      stats: {
        totalSessions: category === 'overall' ? entry.totalSessions : entry.totalSessions,
        averageAccuracy: Math.round((category === 'overall' ? entry.averageAccuracy : entry.averageAccuracy) * 100) / 100,
        bestAccuracy: Math.round((category === 'overall' ? entry.bestAccuracy : entry.bestAccuracy) * 100) / 100,
        totalTimeSpent: category === 'overall' ? entry.totalTimeSpent : entry.totalTimeSpent
      }
    })),
    currentUserRank: userRank || null,
    total: allUsers.length
  }
}

async function getDepartmentStats(department: string | undefined, category: string, startDate: Date | undefined) {
  if (!department) {
    return { error: 'User department not specified' }
  }

  const whereClause: any = {
    user: { department }
  }
  
  if (startDate) {
    whereClause.lastPracticed = { gte: startDate }
  }

  if (category !== 'overall') {
    whereClause.category = category
  } else {
    whereClause.category = 'overall'
  }

  const departmentProgress = await prisma.progress.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          pid: true,
          badgeNumber: true,
          rank: true
        }
      }
    }
  })

  const stats = {
    totalUsers: departmentProgress.length,
    totalSessions: departmentProgress.reduce((sum: number, p: any) => sum + p.totalSessions, 0),
    averageAccuracy: departmentProgress.length > 0 
      ? departmentProgress.reduce((sum: number, p: any) => sum + p.averageAccuracy, 0) / departmentProgress.length
      : 0,
    totalTimeSpent: departmentProgress.reduce((sum: number, p: any) => sum + p.totalTimeSpent, 0),
    topPerformers: departmentProgress
      .sort((a: any, b: any) => b.averageAccuracy - a.averageAccuracy)
      .slice(0, 5)
      .map((p: any) => ({
        user: p.user,
        averageAccuracy: Math.round(p.averageAccuracy * 100) / 100,
        totalSessions: p.totalSessions
      }))
  }

  return { department, category, stats }
}

async function getGlobalStats(category: string, startDate: Date | undefined) {
  const whereClause: any = {}
  
  if (startDate) {
    whereClause.lastPracticed = { gte: startDate }
  }

  if (category !== 'overall') {
    whereClause.category = category
  } else {
    whereClause.category = 'overall'
  }

  const [progressData, totalUsers] = await Promise.all([
    prisma.progress.aggregate({
      where: whereClause,
      _count: { userId: true },
      _sum: {
        totalSessions: true,
        totalQuestions: true,
        correctAnswers: true,
        totalTimeSpent: true
      },
      _avg: {
        averageAccuracy: true
      },
      _max: {
        bestAccuracy: true
      }
    }),
    prisma.user.count({ where: { isActive: true } })
  ])

  // Get department breakdown
  const departmentStats = await prisma.$queryRaw`
    SELECT 
      u.department,
      COUNT(DISTINCT u.id) as user_count,
      AVG(p.average_accuracy) as avg_accuracy,
      SUM(p.total_sessions) as total_sessions
    FROM users u
    LEFT JOIN progress p ON u.id = p.user_id
    WHERE u.is_active = true
      AND p.category = ${category === 'overall' ? 'overall' : category}
      ${startDate ? `AND p.last_practiced >= ${startDate.toISOString()}` : ''}
    GROUP BY u.department
    ORDER BY avg_accuracy DESC
  `

  return {
    global: {
      totalUsers: totalUsers,
      activeUsers: progressData._count.userId || 0,
      totalSessions: progressData._sum.totalSessions || 0,
      totalQuestions: progressData._sum.totalQuestions || 0,
      correctAnswers: progressData._sum.correctAnswers || 0,
      overallAccuracy: progressData._sum.totalQuestions 
        ? ((progressData._sum.correctAnswers || 0) / progressData._sum.totalQuestions) * 100
        : 0,
      averageAccuracy: Math.round((progressData._avg.averageAccuracy || 0) * 100) / 100,
      bestAccuracy: Math.round((progressData._max.bestAccuracy || 0) * 100) / 100,
      totalTimeSpent: progressData._sum.totalTimeSpent || 0
    },
    departments: departmentStats
  }
}

export const dynamic = 'force-dynamic'
export const { GET } = createProtectedAPIHandler({ GET: getStatsData })