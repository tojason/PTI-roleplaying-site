import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { rateLimit } from './rateLimit'
// UserRole type will be generated from Prisma schema
type UserRole = 'USER' | 'INSTRUCTOR' | 'ADMIN' | 'SUPER_ADMIN'

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}

// API route protection middleware
export async function authenticateAPI(req: NextRequest) {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return { user: token }
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json(
      { error: 'Invalid authentication' },
      { status: 401 }
    )
  }
}

// Role-based authorization middleware
export function authorizeRole(requiredRole: UserRole) {
  return async (req: NextRequest, user: any) => {
    const roleHierarchy = {
      USER: 0,
      INSTRUCTOR: 1,
      ADMIN: 2,
      SUPER_ADMIN: 3
    }

    const userRoleLevel = roleHierarchy[user.role as UserRole]
    const requiredRoleLevel = roleHierarchy[requiredRole]

    if (userRoleLevel < requiredRoleLevel) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return null // Authorization successful
  }
}

// Input validation middleware
export function validateInput(schema: any) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json()
      const validated = schema.parse(body)
      return { validatedData: validated }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error },
        { status: 400 }
      )
    }
  }
}

// Error handling middleware
export function handleAPIError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof Error) {
    // Database errors
    if (error.message.includes('P2002')) {
      return NextResponse.json(
        { error: 'Resource already exists' },
        { status: 409 }
      )
    }
    
    if (error.message.includes('P2025')) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    // Validation errors
    if (error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Validation failed', message: error.message },
        { status: 400 }
      )
    }
  }

  // Generic error
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

// CORS middleware
export function applyCORS(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get('origin')
  
  if (corsOptions.origin.includes(origin || '')) {
    res.headers.set('Access-Control-Allow-Origin', origin || '*')
  }
  
  res.headers.set('Access-Control-Allow-Methods', corsOptions.methods.join(', '))
  res.headers.set('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '))
  res.headers.set('Access-Control-Allow-Credentials', corsOptions.credentials.toString())
  
  return res
}

// Rate limiting middleware
export async function applyRateLimit(req: NextRequest, identifier?: string) {
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'anonymous'
  const key = identifier || ip
  
  const result = await rateLimit(key)
  
  if (!result.success) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded', 
        retryAfter: result.retryAfter 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': result.retryAfter?.toString() || '60'
        }
      }
    )
  }
  
  return null // Rate limit passed
}

// Request logging middleware
export function logRequest(req: NextRequest) {
  const timestamp = new Date().toISOString()
  const method = req.method
  const url = req.url
  const userAgent = req.headers.get('user-agent') || 'unknown'
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
  
  console.log(`[${timestamp}] ${method} ${url} - ${ip} - ${userAgent}`)
}

// Security headers middleware
export function addSecurityHeaders(res: NextResponse) {
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  
  if (process.env.NODE_ENV === 'production') {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  return res
}

// Compose middleware functions
export function createAPIHandler(handlers: {
  GET?: Function
  POST?: Function
  PUT?: Function
  DELETE?: Function
  OPTIONS?: Function
}) {
  return async (req: NextRequest) => {
    try {
      // Log request
      logRequest(req)

      // Apply rate limiting
      const rateLimitResult = await applyRateLimit(req)
      if (rateLimitResult) return rateLimitResult

      // Handle preflight CORS requests
      if (req.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 200 })
        return applyCORS(req, addSecurityHeaders(response))
      }

      // Get handler for HTTP method
      const handler = handlers[req.method as keyof typeof handlers]
      if (!handler) {
        return NextResponse.json(
          { error: 'Method not allowed' },
          { status: 405 }
        )
      }

      // Execute handler
      const result = await handler(req)
      
      // Apply CORS and security headers
      return applyCORS(req, addSecurityHeaders(result))
      
    } catch (error) {
      return handleAPIError(error)
    }
  }
}

// Utility function for protected API routes
export function createProtectedAPIHandler(
  handlers: {
    GET?: Function
    POST?: Function
    PUT?: Function
    DELETE?: Function
  },
  requiredRole?: UserRole
) {
  const protectedHandlers: any = {}
  
  for (const [method, handler] of Object.entries(handlers)) {
    protectedHandlers[method] = async (req: NextRequest) => {
      try {
        // Log request
        logRequest(req)

        // Apply rate limiting
        const rateLimitResult = await applyRateLimit(req)
        if (rateLimitResult) return rateLimitResult

        // Authenticate user
        const authResult = await authenticateAPI(req)
        if (authResult instanceof NextResponse) return authResult
        
        // Check role if required
        if (requiredRole) {
          const roleCheck = await authorizeRole(requiredRole)(req, authResult.user)
          if (roleCheck) return roleCheck
        }
        
        // Call original handler with user context
        const result = await handler(req, authResult.user)
        
        // Apply CORS and security headers
        return applyCORS(req, addSecurityHeaders(result))
        
      } catch (error) {
        return handleAPIError(error)
      }
    }
  }
  
  return protectedHandlers
}