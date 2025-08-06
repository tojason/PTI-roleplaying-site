import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db-server'
import { createProtectedAPIHandler } from '@/lib/middleware'
// Types will be generated from Prisma schema

// Validation schema for updating quiz sessions
const updateSessionSchema = z.object({
  responses: z.array(z.object({
    questionId: z.string(),
    userAnswer: z.string(),
    timeSpent: z.number().min(0),
  })).optional(),
  completedAt: z.string().datetime().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'EXPIRED']).optional(),
})

async function getQuizSession(req: NextRequest, user: any, { params }: { params: { sessionId: string } }) {
  try {
    const { sessionId } = params

    const session = await prisma.quizSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id
      },
      include: {
        responses: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                options: true,
                correctAnswer: true,
                explanation: true,
                audioUrl: true,
                category: true,
                difficulty: true,
              }
            }
          },
          orderBy: { answeredAt: 'asc' }
        }
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Quiz session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ session })

  } catch (error) {
    console.error('Get quiz session error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz session' },
      { status: 500 }
    )
  }
}

async function updateQuizSession(req: NextRequest, user: any, { params }: { params: { sessionId: string } }) {
  try {
    const { sessionId } = params
    const body = await req.json()
    const validatedData = updateSessionSchema.parse(body)

    // Check if session exists and belongs to user
    const existingSession = await prisma.quizSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id
      }
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Quiz session not found' },
        { status: 404 }
      )
    }

    if (existingSession.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot update completed session' },
        { status: 400 }
      )
    }

    const updateData: any = {}

    // Handle response submission
    if (validatedData.responses && validatedData.responses.length > 0) {
      // Process responses
      const responsePromises = validatedData.responses.map(async (response) => {
        // Get the question to check correct answer
        const question = await prisma.quizQuestion.findUnique({
          where: { id: response.questionId },
          select: { correctAnswer: true }
        })

        if (!question) {
          throw new Error(`Question ${response.questionId} not found`)
        }

        const isCorrect = response.userAnswer === question.correctAnswer

        return prisma.quizResponse.upsert({
          where: {
            sessionId_questionId: {
              sessionId: sessionId,
              questionId: response.questionId
            }
          },
          update: {
            userAnswer: response.userAnswer,
            isCorrect,
            timeSpent: response.timeSpent,
            answeredAt: new Date(),
          },
          create: {
            sessionId: sessionId,
            questionId: response.questionId,
            userAnswer: response.userAnswer,
            isCorrect,
            timeSpent: response.timeSpent,
          }
        })
      })

      await Promise.all(responsePromises)

      // Calculate session statistics
      const responses = await prisma.quizResponse.findMany({
        where: { sessionId }
      })

      const correctAnswers = responses.filter((r: any) => r.isCorrect).length
      const totalAnswered = responses.length
      const score = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0
      const duration = responses.reduce((sum: number, r: any) => sum + r.timeSpent, 0)

      updateData.correctAnswers = correctAnswers
      updateData.score = score
      updateData.duration = duration
    }

    // Handle status and completion
    if (validatedData.status) {
      updateData.status = validatedData.status
    }

    if (validatedData.completedAt) {
      updateData.completedAt = new Date(validatedData.completedAt)
      updateData.status = 'COMPLETED'
    }

    // Update session
    const updatedSession = await prisma.quizSession.update({
      where: { id: sessionId },
      data: updateData,
      include: {
        responses: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                correctAnswer: true,
                explanation: true,
              }
            }
          }
        }
      }
    })

    // Update progress if session is completed
    if (updatedSession.status === 'COMPLETED') {
      await updateUserProgress(user.id, updatedSession)
    }

    return NextResponse.json({
      message: 'Quiz session updated successfully',
      session: updatedSession
    })

  } catch (error) {
    console.error('Update quiz session error:', error)
    
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
      { error: 'Failed to update quiz session' },
      { status: 500 }
    )
  }
}

async function deleteQuizSession(req: NextRequest, user: any, { params }: { params: { sessionId: string } }) {
  try {
    const { sessionId } = params

    // Check if session exists and belongs to user
    const session = await prisma.quizSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Quiz session not found' },
        { status: 404 }
      )
    }

    // Soft delete by updating status
    await prisma.quizSession.update({
      where: { id: sessionId },
      data: { status: 'ABANDONED' }
    })

    return NextResponse.json({ message: 'Quiz session deleted successfully' })

  } catch (error) {
    console.error('Delete quiz session error:', error)
    return NextResponse.json(
      { error: 'Failed to delete quiz session' },
      { status: 500 }
    )
  }
}

// Helper function to update user progress
async function updateUserProgress(userId: string, session: any) {
  const category = 'quiz'
  const subcategory = session.category

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
      correctAnswers: { increment: session.correctAnswers },
      totalQuestions: { increment: session.responses?.length || 0 },
      totalTimeSpent: { increment: session.duration },
      lastPracticed: new Date(),
    },
    create: {
      userId,
      category,
      subcategory,
      totalSessions: 1,
      correctAnswers: session.correctAnswers,
      totalQuestions: session.responses?.length || 0,
      totalTimeSpent: session.duration,
      lastPracticed: new Date(),
    }
  })

  // Update overall progress
  const overallProgress = await prisma.progress.findFirst({
    where: {
      userId,
      category: 'overall',
      subcategory: null
    }
  })

  if (overallProgress) {
    await prisma.progress.update({
      where: { id: overallProgress.id },
      data: {
        totalSessions: { increment: 1 },
        correctAnswers: { increment: session.correctAnswers },
        totalQuestions: { increment: session.responses?.length || 0 },
        totalTimeSpent: { increment: session.duration },
        lastPracticed: new Date(),
      }
    })
  } else {
    await prisma.progress.create({
      data: {
        userId,
        category: 'overall',
        subcategory: null,
        totalSessions: 1,
        correctAnswers: session.correctAnswers,
        totalQuestions: session.responses?.length || 0,
        totalTimeSpent: session.duration,
        lastPracticed: new Date(),
      }
    })
  }
}

export const dynamic = 'force-dynamic'
export const { GET, PUT, DELETE } = createProtectedAPIHandler({ GET: getQuizSession, PUT: updateQuizSession, DELETE: deleteQuizSession })