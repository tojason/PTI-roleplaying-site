import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { createProtectedAPIHandler } from '@/lib/middleware'
// Types will be generated from Prisma schema

// Validation schema for creating quiz sessions
const createSessionSchema = z.object({
  category: z.enum(['CODES_10', 'PHONETIC_ALPHABET', 'RADIO_PROTOCOL', 'MIXED']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('EASY'),
  totalQuestions: z.number().min(1).max(100).default(10),
})

// Validation schema for updating quiz sessions
const updateSessionSchema = z.object({
  responses: z.array(z.object({
    questionId: z.string(),
    userAnswer: z.string(),
    timeSpent: z.number().min(0),
  })),
  completedAt: z.string().datetime().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'EXPIRED']).optional(),
})

// Validation schema for quiz session queries
const getSessionsSchema = z.object({
  limit: z.string().transform(val => parseInt(val)).optional(),
  offset: z.string().transform(val => parseInt(val)).optional(),
  category: z.enum(['CODES', 'PHONETIC', 'PROCEDURES']).optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'EXPIRED']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
})

async function getQuizSessions(req: NextRequest, user: any) {
  try {
    const { searchParams } = new URL(req.url)
    const params = Object.fromEntries(searchParams.entries())
    
    const {
      limit = 50,
      offset = 0,
      category,
      status,
      dateFrom,
      dateTo
    } = getSessionsSchema.parse(params)

    const where: any = {
      userId: user.id
    }

    if (category) where.category = category
    if (status) where.status = status
    if (dateFrom || dateTo) {
      where.startedAt = {}
      if (dateFrom) where.startedAt.gte = new Date(dateFrom)
      if (dateTo) where.startedAt.lte = new Date(dateTo)
    }

    const [sessions, total] = await Promise.all([
      prisma.quizSession.findMany({
        where,
        include: {
          responses: {
            include: {
              question: {
                select: {
                  id: true,
                  question: true,
                  correctAnswer: true,
                }
              }
            }
          }
        },
        orderBy: { startedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.quizSession.count({ where })
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
    console.error('Get quiz sessions error:', error)
    
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
      { error: 'Failed to fetch quiz sessions' },
      { status: 500 }
    )
  }
}

async function createQuizSession(req: NextRequest, user: any) {
  try {
    const body = await req.json()
    const validatedData = createSessionSchema.parse(body)

    // Create new quiz session
    const session = await prisma.quizSession.create({
      data: {
        userId: user.id,
        category: validatedData.category,
        difficulty: validatedData.difficulty,
        totalQuestions: validatedData.totalQuestions,
        correctAnswers: 0,
        score: 0,
        duration: 0,
        status: 'IN_PROGRESS',
      },
      select: {
        id: true,
        category: true,
        difficulty: true,
        totalQuestions: true,
        status: true,
        startedAt: true,
      }
    })

    return NextResponse.json({
      message: 'Quiz session created successfully',
      session
    }, { status: 201 })

  } catch (error) {
    console.error('Create quiz session error:', error)
    
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
      { error: 'Failed to create quiz session' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const { GET, POST } = createProtectedAPIHandler({ GET: getQuizSessions, POST: createQuizSession })