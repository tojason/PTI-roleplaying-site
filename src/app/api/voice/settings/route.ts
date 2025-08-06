import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db-server'
import { createProtectedAPIHandler } from '@/lib/middleware'
// Types will be generated from Prisma schema

// Validation schema for voice settings updates
const updateVoiceSettingsSchema = z.object({
  language: z.string().optional(),
  sensitivity: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  autoStop: z.boolean().optional(),
  maxRecordingTime: z.number().min(5).max(300).optional(), // 5 seconds to 5 minutes
  practiceReminders: z.boolean().optional(),
  difficultyLevel: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
})

async function getVoiceSettings(req: NextRequest, user: any) {
  try {
    const settings = await prisma.voiceSettings.findUnique({
      where: { userId: user.id },
      select: {
        language: true,
        sensitivity: true,
        autoStop: true,
        maxRecordingTime: true,
        practiceReminders: true,
        difficultyLevel: true,
      }
    })

    if (!settings) {
      // Create default settings if they don't exist
      const defaultSettings = await prisma.voiceSettings.create({
        data: {
          userId: user.id,
          language: 'en-US',
          sensitivity: 'MEDIUM',
          autoStop: true,
          maxRecordingTime: 30,
          practiceReminders: true,
          difficultyLevel: 'EASY',
        },
        select: {
          language: true,
          sensitivity: true,
          autoStop: true,
          maxRecordingTime: true,
          practiceReminders: true,
          difficultyLevel: true,
        }
      })

      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(settings)

  } catch (error) {
    console.error('Get voice settings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch voice settings' },
      { status: 500 }
    )
  }
}

async function updateVoiceSettings(req: NextRequest, user: any) {
  try {
    const body = await req.json()
    const validatedData = updateVoiceSettingsSchema.parse(body)

    const settings = await prisma.voiceSettings.upsert({
      where: { userId: user.id },
      update: validatedData,
      create: {
        userId: user.id,
        language: validatedData.language || 'en-US',
        sensitivity: validatedData.sensitivity || 'MEDIUM',
        autoStop: validatedData.autoStop ?? true,
        maxRecordingTime: validatedData.maxRecordingTime || 30,
        practiceReminders: validatedData.practiceReminders ?? true,
        difficultyLevel: validatedData.difficultyLevel || 'EASY',
      },
      select: {
        language: true,
        sensitivity: true,
        autoStop: true,
        maxRecordingTime: true,
        practiceReminders: true,
        difficultyLevel: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      message: 'Voice settings updated successfully',
      settings
    })

  } catch (error) {
    console.error('Update voice settings error:', error)
    
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
      { error: 'Failed to update voice settings' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const { GET, PUT } = createProtectedAPIHandler({ GET: getVoiceSettings, PUT: updateVoiceSettings })