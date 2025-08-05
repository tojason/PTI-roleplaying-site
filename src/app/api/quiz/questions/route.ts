import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { createProtectedAPIHandler } from '@/lib/middleware'
// Types will be generated from Prisma schema

// Validation schema for quiz question queries
const getQuestionsSchema = z.object({
  category: z.enum(['CODES_10', 'PHONETIC_ALPHABET', 'RADIO_PROTOCOL', 'MIXED']).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  limit: z.string().transform(val => parseInt(val)).optional(),
  shuffle: z.string().transform(val => val === 'true').optional(),
})

// Validation schema for creating quiz questions
const createQuestionSchema = z.object({
  category: z.enum(['CODES_10', 'PHONETIC_ALPHABET', 'RADIO_PROTOCOL', 'MIXED']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('EASY'),
  question: z.string().min(10, 'Question must be at least 10 characters'),
  options: z.array(z.string()).min(2, 'At least 2 options required').max(6, 'Maximum 6 options allowed'),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
  explanation: z.string().optional(),
  audioUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
})

async function getQuestions(req: NextRequest, user: any) {
  try {
    const { searchParams } = new URL(req.url)
    const params = Object.fromEntries(searchParams.entries())
    
    const {
      category,
      difficulty,
      limit = 50,
      shuffle = false
    } = getQuestionsSchema.parse(params)

    const where: any = {
      isActive: true
    }

    if (category) where.category = category
    if (difficulty) where.difficulty = difficulty

    let questions = await prisma.quizQuestion.findMany({
      where,
      select: {
        id: true,
        category: true,
        difficulty: true,
        question: true,
        options: true,
        correctAnswer: true,
        explanation: true,
        audioUrl: true,
        tags: true,
      },
      take: Math.min(limit, 100), // Cap at 100 questions
    })

    // Shuffle questions if requested
    if (shuffle) {
      questions = questions.sort(() => Math.random() - 0.5)
    }

    return NextResponse.json({
      questions,
      total: questions.length,
      category,
      difficulty,
    })

  } catch (error) {
    console.error('Get questions error:', error)
    
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
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

async function createQuestion(req: NextRequest, user: any) {
  try {
    // Check if user can create quizzes
    if (!['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create questions' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = createQuestionSchema.parse(body)

    // Validate that correct answer is one of the options
    if (!validatedData.options.includes(validatedData.correctAnswer)) {
      return NextResponse.json(
        { error: 'Correct answer must be one of the provided options' },
        { status: 400 }
      )
    }

    const question = await prisma.quizQuestion.create({
      data: validatedData,
      select: {
        id: true,
        category: true,
        difficulty: true,
        question: true,
        options: true,
        correctAnswer: true,
        explanation: true,
        audioUrl: true,
        tags: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      message: 'Question created successfully',
      question
    }, { status: 201 })

  } catch (error) {
    console.error('Create question error:', error)
    
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
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const { GET, POST } = createProtectedAPIHandler({ GET: getQuestions, POST: createQuestion })