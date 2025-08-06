import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db-server'
import { handleAPIError } from '@/lib/middleware'

// Validation schema for user registration
const registerSchema = z.object({
  pid: z.string().min(3, 'Police ID must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    
    // Check if user already exists by PID
    const existingUser = await prisma.user.findFirst({
      where: {
        pid: validatedData.pid
      }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this Police ID already exists' },
        { status: 409 }
      )
    }
    
    // Hash password
    const hashedPassword = await hash(validatedData.password, 12)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: `${validatedData.pid}@police.local`, // Generate a unique email for authentication compatibility
        password: hashedPassword,
        name: validatedData.name,
        pid: validatedData.pid,
        role: 'USER', // Default role
      },
      select: {
        id: true,
        email: true,
        name: true,
        pid: true,
        badgeNumber: true,
        department: true,
        role: true,
        createdAt: true,
      }
    })
    
    // Create default voice settings
    await prisma.voiceSettings.create({
      data: {
        userId: user.id,
        language: 'en-US',
        sensitivity: 'MEDIUM',
        autoStop: true,
        maxRecordingTime: 30,
        practiceReminders: true,
        difficultyLevel: 'EASY',
      }
    })
    
    // Create initial progress entries
    const progressEntries = [
      { category: 'quiz', subcategory: 'CODES_10' },
      { category: 'quiz', subcategory: 'PHONETIC_ALPHABET' },
      { category: 'quiz', subcategory: 'RADIO_PROTOCOL' },
      { category: 'voice', subcategory: 'PHONETIC' },
      { category: 'voice', subcategory: 'RADIO_PROTOCOL' },
      { category: 'voice', subcategory: 'CODES' },
      { category: 'overall', subcategory: null },
    ]
    
    await prisma.progress.createMany({
      data: progressEntries.map(entry => ({
        userId: user.id,
        category: entry.category,
        subcategory: entry.subcategory,
      }))
    })
    
    return NextResponse.json({
      message: 'User created successfully',
      user
    }, { status: 201 })
    
  } catch (error) {
    console.error('Registration error:', error)
    
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
    
    return handleAPIError(error)
  }
}

export const dynamic = 'force-dynamic'
export { POST }