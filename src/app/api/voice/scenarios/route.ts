import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { createProtectedAPIHandler } from '@/lib/middleware'
// Types will be generated from Prisma schema

// Validation schema for voice scenario queries
const getScenariosSchema = z.object({
  category: z.enum(['PHONETIC', 'RADIO_PROTOCOL', 'CODES']).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  limit: z.string().transform(val => parseInt(val)).optional(),
})

// Validation schema for creating voice scenarios
const createScenarioSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  instruction: z.string().min(10, 'Instruction must be at least 10 characters'),
  targetText: z.string().max(500, 'Target text must be less than 500 characters'),
  expectedAnswer: z.string().max(500, 'Expected answer must be less than 500 characters'),
  category: z.enum(['PHONETIC', 'RADIO_PROTOCOL', 'CODES']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('EASY'),
  tags: z.array(z.string()).default([]),
  estimatedDuration: z.number().min(5).max(300).optional(), // 5 seconds to 5 minutes
})

async function getVoiceScenarios(req: NextRequest, user: any) {
  try {
    const { searchParams } = new URL(req.url)
    const params = Object.fromEntries(searchParams.entries())
    
    const {
      category,
      difficulty,
      limit = 50,
    } = getScenariosSchema.parse(params)

    const where: any = {
      isActive: true
    }

    if (category) where.category = category
    if (difficulty) where.difficulty = difficulty

    const scenarios = await prisma.voiceScenario.findMany({
      where,
      select: {
        id: true,
        title: true,
        instruction: true,
        targetText: true,
        expectedAnswer: true,
        category: true,
        difficulty: true,
        tags: true,
        estimatedDuration: true,
      },
      take: Math.min(limit, 100), // Cap at 100 scenarios
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      scenarios,
      total: scenarios.length,
    })

  } catch (error) {
    console.error('Get voice scenarios error:', error)
    
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
      { error: 'Failed to fetch voice scenarios' },
      { status: 500 }
    )
  }
}

async function createVoiceScenario(req: NextRequest, user: any) {
  try {
    // Check if user can create scenarios (instructors and above)
    if (!['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create scenarios' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = createScenarioSchema.parse(body)

    const scenario = await prisma.voiceScenario.create({
      data: validatedData,
      select: {
        id: true,
        title: true,
        instruction: true,
        targetText: true,
        expectedAnswer: true,
        category: true,
        difficulty: true,
        tags: true,
        estimatedDuration: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      message: 'Voice scenario created successfully',
      scenario
    }, { status: 201 })

  } catch (error) {
    console.error('Create voice scenario error:', error)
    
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
      { error: 'Failed to create voice scenario' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const { GET, POST } = createProtectedAPIHandler({ GET: getVoiceScenarios, POST: createVoiceScenario })