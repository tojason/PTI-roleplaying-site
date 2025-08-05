import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database utility functions
export const db = {
  // User operations
  user: {
    findUnique: prisma.user.findUnique,
    findMany: prisma.user.findMany,
    create: prisma.user.create,
    update: prisma.user.update,
    delete: prisma.user.delete,
    count: prisma.user.count,
  },
  
  // Quiz operations
  quizSession: {
    findUnique: prisma.quizSession.findUnique,
    findMany: prisma.quizSession.findMany,
    create: prisma.quizSession.create,
    update: prisma.quizSession.update,
    delete: prisma.quizSession.delete,
    count: prisma.quizSession.count,
  },
  
  quizQuestion: {
    findUnique: prisma.quizQuestion.findUnique,
    findMany: prisma.quizQuestion.findMany,
    create: prisma.quizQuestion.create,
    update: prisma.quizQuestion.update,
    delete: prisma.quizQuestion.delete,
    count: prisma.quizQuestion.count,
  },
  
  quizResponse: {
    findUnique: prisma.quizResponse.findUnique,
    findMany: prisma.quizResponse.findMany,
    create: prisma.quizResponse.create,
    update: prisma.quizResponse.update,
    delete: prisma.quizResponse.delete,
    count: prisma.quizResponse.count,
  },
  
  // Voice practice operations
  voicePracticeSession: {
    findUnique: prisma.voicePracticeSession.findUnique,
    findMany: prisma.voicePracticeSession.findMany,
    create: prisma.voicePracticeSession.create,
    update: prisma.voicePracticeSession.update,
    delete: prisma.voicePracticeSession.delete,
    count: prisma.voicePracticeSession.count,
  },
  
  voiceScenario: {
    findUnique: prisma.voiceScenario.findUnique,
    findMany: prisma.voiceScenario.findMany,
    create: prisma.voiceScenario.create,
    update: prisma.voiceScenario.update,
    delete: prisma.voiceScenario.delete,
    count: prisma.voiceScenario.count,
  },
  
  voiceSettings: {
    findUnique: prisma.voiceSettings.findUnique,
    create: prisma.voiceSettings.create,
    update: prisma.voiceSettings.update,
    upsert: prisma.voiceSettings.upsert,
    delete: prisma.voiceSettings.delete,
  },
  
  // Progress operations
  progress: {
    findUnique: prisma.progress.findUnique,
    findMany: prisma.progress.findMany,
    create: prisma.progress.create,
    update: prisma.progress.update,
    upsert: prisma.progress.upsert,
    delete: prisma.progress.delete,
  },
  
  // Achievement operations
  achievement: {
    findUnique: prisma.achievement.findUnique,
    findMany: prisma.achievement.findMany,
    create: prisma.achievement.create,
    update: prisma.achievement.update,
    delete: prisma.achievement.delete,
  },
  
  userAchievement: {
    findUnique: prisma.userAchievement.findUnique,
    findMany: prisma.userAchievement.findMany,
    create: prisma.userAchievement.create,
    delete: prisma.userAchievement.delete,
  },
  
  // Reference data operations
  tenCode: {
    findUnique: prisma.tenCode.findUnique,
    findMany: prisma.tenCode.findMany,
    create: prisma.tenCode.create,
    update: prisma.tenCode.update,
    delete: prisma.tenCode.delete,
  },
  
  phoneticAlphabet: {
    findUnique: prisma.phoneticAlphabet.findUnique,
    findMany: prisma.phoneticAlphabet.findMany,
    create: prisma.phoneticAlphabet.create,
    update: prisma.phoneticAlphabet.update,
    delete: prisma.phoneticAlphabet.delete,
  },
  
  // Transaction support
  $transaction: prisma.$transaction,
  $executeRaw: prisma.$executeRaw,
  $queryRaw: prisma.$queryRaw,
}

// Health check function
export async function checkDbConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Graceful shutdown
export async function disconnectDb(): Promise<void> {
  await prisma.$disconnect()
}

// Error handling utility
export function isDatabaseError(error: unknown): boolean {
  return error instanceof Error && (
    error.message.includes('P2002') || // Unique constraint
    error.message.includes('P2025') || // Record not found
    error.message.includes('P2003') || // Foreign key constraint
    error.message.includes('P2016') || // Query interpretation error
    error.message.includes('P2017') || // Records not connected
    error.message.includes('P2018') || // Required connected records not found
    error.message.includes('P2019') || // Input error
    error.message.includes('P2020') || // Value out of range
    error.message.includes('P2021') || // Table does not exist
    error.message.includes('P2022')    // Column does not exist
  )
}

// Database error parser
export function parseDatabaseError(error: unknown): { code: string; message: string } {
  if (error instanceof Error) {
    if (error.message.includes('P2002')) {
      return { code: 'UNIQUE_CONSTRAINT', message: 'A record with this information already exists' }
    }
    if (error.message.includes('P2025')) {
      return { code: 'NOT_FOUND', message: 'The requested record was not found' }
    }
    if (error.message.includes('P2003')) {
      return { code: 'FOREIGN_KEY', message: 'Related record does not exist' }
    }
    if (error.message.includes('P2016')) {
      return { code: 'QUERY_ERROR', message: 'Query interpretation error' }
    }
  }
  
  return { code: 'UNKNOWN_ERROR', message: 'An unexpected database error occurred' }
}