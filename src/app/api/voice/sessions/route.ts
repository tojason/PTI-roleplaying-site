import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db-server'
import { createProtectedAPIHandler } from '@/lib/middleware'
// Types will be generated from Prisma schema

// Validation schema for creating voice practice sessions
const createVoiceSessionSchema = z.object({
  scenarioId: z.string(),
  userSpeech: z.string().min(1, 'User speech is required'),
  accuracy: z.object({
    score: z.number().min(0).max(100),
    category: z.enum(['EXCELLENT', 'GOOD', 'NEEDS_IMPROVEMENT', 'POOR']),
    matches: z.array(z.object({
      expected: z.string(),
      actual: z.string(),
      match: z.boolean(),
      similarity: z.number().min(0).max(1),
    })),
    suggestions: z.array(z.string()),
  }),
  duration: z.number().min(0), // seconds
  timestamp: z.string().datetime(),
})

// Validation schema for voice session queries
const getVoiceSessionsSchema = z.object({
  limit: z.string().transform(val => parseInt(val)).optional(),
  offset: z.string().transform(val => parseInt(val)).optional(),
  category: z.enum(['PHONETIC', 'RADIO_PROTOCOL', 'CODES']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
})

async function getVoiceSessions(req: NextRequest, user: any) {
  try {
    const { searchParams } = new URL(req.url)
    const params = Object.fromEntries(searchParams.entries())
    
    const {
      limit = 50,
      offset = 0,
      category,
      dateFrom,
      dateTo
    } = getVoiceSessionsSchema.parse(params)

    const where: any = {
      userId: user.id
    }

    if (category) {
      where.scenario = {
        category: category
      }
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }

    const [sessions, total] = await Promise.all([
      prisma.voicePracticeSession.findMany({
        where,
        include: {
          scenario: {
            select: {
              id: true,
              title: true,
              instruction: true,
              targetText: true,
              expectedAnswer: true,
              category: true,
              difficulty: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.voicePracticeSession.count({ where })
    ])

    return NextResponse.json({
      sessions,
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('Get voice sessions error:', error)
    
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
      { error: 'Failed to fetch voice sessions' },
      { status: 500 }
    )
  }
}

async function createVoiceSession(req: NextRequest, user: any) {
  try {
    const body = await req.json()
    const validatedData = createVoiceSessionSchema.parse(body)

    // Verify scenario exists
    const scenario = await prisma.voiceScenario.findUnique({
      where: { id: validatedData.scenarioId },
      select: { id: true, category: true }
    })

    if (!scenario) {
      return NextResponse.json(
        { error: 'Voice scenario not found' },
        { status: 404 }
      )
    }

    // Create voice practice session
    const session = await prisma.voicePracticeSession.create({
      data: {
        userId: user.id,
        scenarioId: validatedData.scenarioId,
        userSpeech: validatedData.userSpeech,
        accuracyScore: validatedData.accuracy.score,
        accuracyCategory: validatedData.accuracy.category,
        accuracyDetails: validatedData.accuracy,
        duration: validatedData.duration,
        status: 'COMPLETED',
      },
      include: {
        scenario: {
          select: {
            id: true,
            title: true,
            instruction: true,
            targetText: true,
            expectedAnswer: true,
            category: true,
            difficulty: true,
          }
        }
      }
    })

    // Update user progress
    await updateVoiceProgress(user.id, session)

    return NextResponse.json({
      id: session.id,
      userId: session.userId,
      scenarioId: session.scenarioId,
      accuracy: validatedData.accuracy,
      timestamp: session.createdAt.toISOString(),
      status: 'completed',
    }, { status: 201 })

  } catch (error) {
    console.error('Create voice session error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create voice session' },
      { status: 500 }
    )
  }
}

// Helper function to update voice practice progress
async function updateVoiceProgress(userId: string, session: any) {
  const category = 'voice'
  const subcategory = session.scenario.category

  // Update category-specific progress
  await prisma.progress.upsert({
    where: {
      userId_category_subcategory: {
        userId,
        category,
        subcategory
      }
    },
    update: {
      totalSessions: { increment: 1 },
      totalTimeSpent: { increment: session.duration },
      averageAccuracy: {
        // Calculate new average (simplified, could be more sophisticated)
        // This would ideally use a proper rolling average calculation
      },
      bestAccuracy: session.accuracyScore > 0 ? 
        { set: Math.max(session.accuracyScore) } : undefined,
      lastPracticed: new Date(),
    },
    create: {
      userId,
      category,
      subcategory,
      totalSessions: 1,
      totalTimeSpent: session.duration,
      averageAccuracy: session.accuracyScore,
      bestAccuracy: session.accuracyScore,
      lastPracticed: new Date(),
    }
  })

  // Update overall voice progress
  const voiceProgress = await prisma.progress.findFirst({
    where: {
      userId,
      category: 'voice',
      subcategory: null
    }
  })

  if (voiceProgress) {
    await prisma.progress.update({
      where: { id: voiceProgress.id },
      data: {
        totalSessions: { increment: 1 },
        totalTimeSpent: { increment: session.duration },
        lastPracticed: new Date(),
      }
    })
  } else {
    await prisma.progress.create({
      data: {
        userId,
        category: 'voice',
        subcategory: null,
        totalSessions: 1,
        totalTimeSpent: session.duration,
        averageAccuracy: session.accuracyScore,
        bestAccuracy: session.accuracyScore,
        lastPracticed: new Date(),
      }
    })
  }

  // Recalculate average accuracy for voice practice
  const voiceSessions = await prisma.voicePracticeSession.findMany({
    where: { userId },
    select: { accuracyScore: true }
  })

  if (voiceSessions.length > 0) {
    const averageAccuracy = voiceSessions.reduce((sum: number, s: any) => sum + s.accuracyScore, 0) / voiceSessions.length
    const bestAccuracy = Math.max(...voiceSessions.map((s: any) => s.accuracyScore))

    await prisma.progress.updateMany({
      where: {
        userId,
        category: 'voice'
      },
      data: {
        averageAccuracy,
        bestAccuracy
      }
    })
  }
}

export const dynamic = 'force-dynamic'
export const { GET, POST } = createProtectedAPIHandler({ GET: getVoiceSessions, POST: createVoiceSession })