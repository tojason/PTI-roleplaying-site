import 'server-only'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

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