# Security Implementation - Instructor Dashboard Backend

## Security Architecture Overview

The instructor dashboard handles sensitive law enforcement data and requires enterprise-grade security measures. This implementation provides defense-in-depth security with role-based access control, comprehensive audit logging, and compliance with law enforcement data protection standards.

### Security Principles
- **Zero Trust Architecture** - Verify everything, trust nothing
- **Defense in Depth** - Multiple layers of security controls
- **Principle of Least Privilege** - Minimum necessary access
- **Data Minimization** - Collect and store only necessary data
- **Audit Everything** - Complete logging for compliance
- **Fail Secure** - Default to secure state on failures

## Authentication & Authorization

### 1. JWT Token Implementation

```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

interface JWTPayload {
  userId: string;
  role: UserRole;
  permissions: string[];
  departmentId: string;
  instructorId?: string;
  sessionId: string;
  iat: number;
  exp: number;
  tokenVersion: number;
}

interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  tokenVersion: number;
  deviceId: string;
  iat: number;
  exp: number;
}

class AuthenticationService {
  private readonly accessTokenSecret = process.env.JWT_ACCESS_SECRET!;
  private readonly refreshTokenSecret = process.env.JWT_REFRESH_SECRET!;
  private readonly accessTokenExpiry = '15m';
  private readonly refreshTokenExpiry = '7d';

  async generateTokenPair(user: User, deviceId: string): Promise<{
    accessToken: string;
    refreshToken: string;
    sessionId: string;
  }> {
    const sessionId = crypto.randomUUID();
    
    // Get user permissions and department
    const [permissions, department] = await Promise.all([
      this.getUserPermissions(user.id, user.role),
      this.getUserDepartment(user.id),
    ]);

    const accessPayload: JWTPayload = {
      userId: user.id,
      role: user.role,
      permissions,
      departmentId: department?.id || '',
      instructorId: user.role === 'INSTRUCTOR' ? user.id : undefined,
      sessionId,
      tokenVersion: user.tokenVersion || 0,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes
    };

    const refreshPayload: RefreshTokenPayload = {
      userId: user.id,
      sessionId,
      tokenVersion: user.tokenVersion || 0,
      deviceId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    };

    const accessToken = jwt.sign(accessPayload, this.accessTokenSecret);
    const refreshToken = jwt.sign(refreshPayload, this.refreshTokenSecret);

    // Store session in Redis with expiration
    await redis.setex(
      `session:${sessionId}`,
      7 * 24 * 60 * 60, // 7 days
      JSON.stringify({
        userId: user.id,
        deviceId,
        createdAt: new Date().toISOString(),
        lastAccessAt: new Date().toISOString(),
      })
    );

    return { accessToken, refreshToken, sessionId };
  }

  async verifyAccessToken(token: string): Promise<JWTPayload | null> {
    try {
      const payload = jwt.verify(token, this.accessTokenSecret) as JWTPayload;
      
      // Check if session is still valid
      const session = await redis.get(`session:${payload.sessionId}`);
      if (!session) {
        throw new Error('Session expired or invalid');
      }

      // Check token version for revocation
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { tokenVersion: true, isActive: true },
      });

      if (!user || !user.isActive || user.tokenVersion !== payload.tokenVersion) {
        throw new Error('Token revoked or user inactive');
      }

      // Update last access time
      await redis.hset(`session:${payload.sessionId}`, 'lastAccessAt', new Date().toISOString());

      return payload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  async refreshTokens(refreshToken: string, deviceId: string): Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> {
    try {
      const payload = jwt.verify(refreshToken, this.refreshTokenSecret) as RefreshTokenPayload;
      
      // Verify device ID matches
      if (payload.deviceId !== deviceId) {
        throw new Error('Device mismatch');
      }

      // Get user and verify token version
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.isActive || user.tokenVersion !== payload.tokenVersion) {
        throw new Error('User inactive or token revoked');
      }

      // Generate new token pair
      const tokens = await this.generateTokenPair(user, deviceId);
      
      // Invalidate old session
      await redis.del(`session:${payload.sessionId}`);
      
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  async revokeTokens(userId: string): Promise<void> {
    // Increment token version to invalidate all tokens
    await prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });

    // Remove all sessions for user
    const sessionKeys = await redis.keys(`session:*`);
    const sessions = await redis.mget(sessionKeys);
    
    const userSessions = sessionKeys.filter((key, index) => {
      const session = sessions[index];
      if (session) {
        const sessionData = JSON.parse(session);
        return sessionData.userId === userId;
      }
      return false;
    });

    if (userSessions.length > 0) {
      await redis.del(...userSessions);
    }
  }

  private async getUserPermissions(userId: string, role: UserRole): Promise<string[]> {
    const basePermissions = this.getRolePermissions(role);
    
    // Add user-specific permissions if any
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { permissions: true },
    });
    
    return [...basePermissions, ...(user?.permissions || [])];
  }

  private getRolePermissions(role: UserRole): string[] {
    const permissions = {
      USER: [
        'practice:access',
        'progress:view:own',
        'achievements:view:own',
      ],
      INSTRUCTOR: [
        'students:view',
        'students:manage',
        'assignments:create',
        'assignments:manage',
        'analytics:view',
        'reports:generate',
        'messages:send',
        'notifications:send',
      ],
      ADMIN: [
        'users:manage',
        'instructors:manage',
        'departments:manage',
        'system:configure',
        'audit:view',
        'analytics:view:all',
      ],
      SUPER_ADMIN: [
        'system:admin',
        'security:manage',
        'data:export',
        'compliance:manage',
      ],
    };

    return permissions[role] || [];
  }
}
```

### 2. Role-Based Access Control (RBAC)

```typescript
interface Permission {
  resource: string;
  action: string;
  condition?: (user: JWTPayload, resource: any) => boolean;
}

class AuthorizationService {
  private permissions: Map<string, Permission[]> = new Map();

  constructor() {
    this.initializePermissions();
  }

  private initializePermissions() {
    // Instructor permissions
    this.permissions.set('INSTRUCTOR', [
      {
        resource: 'student',
        action: 'view',
        condition: (user, student) => 
          user.departmentId === student.departmentId ||
          student.instructorId === user.instructorId
      },
      {
        resource: 'student',
        action: 'manage',
        condition: (user, student) => 
          student.instructorId === user.instructorId
      },
      {
        resource: 'assignment',
        action: 'create',
      },
      {
        resource: 'assignment',
        action: 'manage',
        condition: (user, assignment) => 
          assignment.instructorId === user.instructorId
      },
      {
        resource: 'analytics',
        action: 'view',
        condition: (user, analytics) => 
          analytics.instructorId === user.instructorId ||
          analytics.departmentId === user.departmentId
      },
    ]);

    // Admin permissions
    this.permissions.set('ADMIN', [
      {
        resource: 'student',
        action: 'view',
        condition: (user, student) => 
          user.departmentId === student.departmentId
      },
      {
        resource: 'instructor',
        action: 'manage',
        condition: (user, instructor) => 
          user.departmentId === instructor.departmentId
      },
      {
        resource: 'department',
        action: 'manage',
        condition: (user, department) => 
          user.departmentId === department.id
      },
    ]);
  }

  async checkPermission(
    user: JWTPayload,
    resource: string,
    action: string,
    resourceData?: any
  ): Promise<boolean> {
    // Super admin has all permissions
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Check explicit permissions array
    const permissionString = `${resource}:${action}`;
    if (user.permissions.includes(permissionString)) {
      return true;
    }

    // Check role-based permissions with conditions
    const rolePermissions = this.permissions.get(user.role) || [];
    
    for (const permission of rolePermissions) {
      if (permission.resource === resource && permission.action === action) {
        if (!permission.condition) {
          return true;
        }
        
        if (resourceData && permission.condition(user, resourceData)) {
          return true;
        }
      }
    }

    return false;
  }

  async checkResourceAccess(
    user: JWTPayload,
    resource: string,
    action: string,
    resourceId: string
  ): Promise<boolean> {
    // Fetch resource data for condition checking
    let resourceData;
    
    switch (resource) {
      case 'student':
        resourceData = await prisma.user.findUnique({
          where: { id: resourceId },
          include: { studentProgress: true },
        });
        break;
      case 'assignment':
        resourceData = await prisma.assignment.findUnique({
          where: { id: resourceId },
        });
        break;
      case 'instructor':
        resourceData = await prisma.instructorProfile.findUnique({
          where: { userId: resourceId },
        });
        break;
      default:
        return false;
    }

    if (!resourceData) {
      return false;
    }

    return this.checkPermission(user, resource, action, resourceData);
  }
}

// Authorization middleware
export function requirePermission(resource: string, action: string) {
  return async (req: NextRequest) => {
    const user = req.user as JWTPayload;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authService = new AuthorizationService();
    const hasPermission = await authService.checkPermission(user, resource, action);

    if (!hasPermission) {
      await logSecurityEvent('ACCESS_DENIED', {
        userId: user.userId,
        resource,
        action,
        ip: req.ip,
        userAgent: req.headers.get('user-agent'),
      });

      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return null; // Permission granted
  };
}

// Resource-specific authorization
export function requireResourceAccess(resource: string, action: string, resourceIdParam: string) {
  return async (req: NextRequest, { params }: { params: { [key: string]: string } }) => {
    const user = req.user as JWTPayload;
    const resourceId = params[resourceIdParam];

    if (!user || !resourceId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authService = new AuthorizationService();
    const hasAccess = await authService.checkResourceAccess(user, resource, action, resourceId);

    if (!hasAccess) {
      await logSecurityEvent('RESOURCE_ACCESS_DENIED', {
        userId: user.userId,
        resource,
        action,
        resourceId,
        ip: req.ip,
      });

      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return null; // Access granted
  };
}
```

### 3. Rate Limiting Implementation

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Rate limiting configurations
const rateLimitConfigs = {
  auth: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes
    analytics: true,
  }),
  
  api: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
    analytics: true,
  }),
  
  analytics: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 requests per minute
    analytics: true,
  }),
  
  reports: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests per hour
    analytics: true,
  }),
  
  bulkOperations: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, '1 h'), // 20 requests per hour
    analytics: true,
  }),
  
  messages: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(50, '1 h'), // 50 messages per hour
    analytics: true,
  }),
};

// Enhanced rate limiting middleware
export function rateLimit(type: keyof typeof rateLimitConfigs, customKey?: string) {
  return async (req: NextRequest) => {
    const limiter = rateLimitConfigs[type];
    
    // Create identifier from IP + user ID if available
    const ip = req.ip || 'unknown';
    const user = req.user as JWTPayload;
    const identifier = customKey || (user ? `${user.userId}:${ip}` : ip);
    
    const { success, limit, reset, remaining } = await limiter.limit(identifier);
    
    if (!success) {
      // Log rate limit exceeded
      await logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        userId: user?.userId,
        ip,
        endpoint: req.url,
        type,
        identifier,
      });
      
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          code: 'RATE_LIMITED',
          retryAfter: Math.round((reset - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.round((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to response
    req.rateLimit = {
      limit,
      remaining,
      reset,
    };

    return null; // Rate limit passed
  };
}

// Adaptive rate limiting based on user behavior
class AdaptiveRateLimit {
  async checkUserBehavior(userId: string): Promise<{
    trustScore: number;
    adjustedLimit: number;
  }> {
    const userMetrics = await redis.hmget(
      `user:metrics:${userId}`,
      'successfulRequests',
      'failedRequests',
      'securityViolations',
      'accountAge'
    );

    const successfulRequests = parseInt(userMetrics[0] || '0');
    const failedRequests = parseInt(userMetrics[1] || '0');
    const securityViolations = parseInt(userMetrics[2] || '0');
    const accountAge = parseInt(userMetrics[3] || '0'); // days

    // Calculate trust score (0-100)
    let trustScore = 50; // baseline
    
    if (successfulRequests > 0) {
      const successRate = successfulRequests / (successfulRequests + failedRequests);
      trustScore += (successRate - 0.5) * 40; // -20 to +20
    }
    
    // Penalize security violations
    trustScore -= securityViolations * 10;
    
    // Bonus for account age
    trustScore += Math.min(accountAge / 30, 1) * 10; // up to +10 for 30+ days
    
    trustScore = Math.max(0, Math.min(100, trustScore));
    
    // Adjust limits based on trust score
    const baseLimit = 100;
    const adjustedLimit = Math.floor(baseLimit * (0.5 + trustScore / 200)); // 50-150% of base
    
    return { trustScore, adjustedLimit };
  }
}
```

## Input Validation & Sanitization

### 1. Request Validation with Joi

```typescript
import Joi from 'joi';
import DOMPurify from 'isomorphic-dompurify';

// Common validation schemas
const commonSchemas = {
  id: Joi.string().uuid().required(),
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).max(128).pattern(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  ).required(),
  name: Joi.string().min(2).max(100).pattern(/^[a-zA-Z\s'-]+$/).required(),
  pid: Joi.string().alphanum().min(3).max(20).required(),
  departmentCode: Joi.string().alphanum().min(2).max(10).required(),
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  },
  timeRange: Joi.string().valid('7d', '30d', '90d', 'custom'),
  sortBy: Joi.string().valid('name', 'progress', 'lastActive', 'risk'),
  order: Joi.string().valid('asc', 'desc').default('asc'),
};

// API-specific schemas
const validationSchemas = {
  login: Joi.object({
    email: commonSchemas.email,
    password: Joi.string().required(), // Don't validate format on login
    departmentCode: commonSchemas.departmentCode,
    rememberMe: Joi.boolean().default(false),
  }),

  createAssignment: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(10).max(2000).required(),
    instructions: Joi.string().max(5000).optional(),
    modules: Joi.array().items(Joi.string().uuid()).min(1).required(),
    targetScore: Joi.number().min(0).max(100).required(),
    maxAttempts: Joi.number().integer().min(1).max(10).default(3),
    dueDate: Joi.date().greater('now').required(),
    studentIds: Joi.array().items(Joi.string().uuid()).optional(),
    assignToAll: Joi.boolean().default(false),
  }),

  sendMessage: Joi.object({
    recipients: Joi.object({
      studentIds: Joi.array().items(Joi.string().uuid()).optional(),
      groupIds: Joi.array().items(Joi.string().uuid()).optional(),
      departmentIds: Joi.array().items(Joi.string().uuid()).optional(),
    }).required(),
    subject: Joi.string().min(3).max(200).required(),
    content: Joi.string().min(10).max(10000).required(),
    priority: Joi.string().valid('normal', 'high', 'urgent').default('normal'),
    category: Joi.string().valid('general', 'assignment', 'reminder', 'alert').default('general'),
  }),

  bulkAction: Joi.object({
    studentIds: Joi.array().items(Joi.string().uuid()).min(1).max(1000).required(),
    action: Joi.string().valid('message', 'assign', 'updateStatus', 'export').required(),
    payload: Joi.object().required(),
  }),

  generateReport: Joi.object({
    type: Joi.string().valid('student-progress', 'performance-analysis', 'completion-summary').required(),
    format: Joi.string().valid('pdf', 'csv', 'excel').required(),
    timeRange: commonSchemas.timeRange,
    startDate: Joi.date().when('timeRange', { is: 'custom', then: Joi.required() }),
    endDate: Joi.date().when('timeRange', { is: 'custom', then: Joi.required() }),
    studentIds: Joi.array().items(Joi.string().uuid()).optional(),
    includeCharts: Joi.boolean().default(true),
  }),
};

// Validation middleware
export function validateRequest(schemaName: keyof typeof validationSchemas) {
  return async (req: NextRequest) => {
    try {
      const schema = validationSchemas[schemaName];
      const body = await req.json();
      
      const { error, value } = schema.validate(body, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        const validationErrors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value,
        }));

        await logSecurityEvent('VALIDATION_ERROR', {
          userId: req.user?.userId,
          endpoint: req.url,
          errors: validationErrors,
          ip: req.ip,
        });

        return NextResponse.json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationErrors,
        }, { status: 400 });
      }

      // Sanitize string inputs
      req.validatedBody = sanitizeObject(value);
      return null; // Validation passed

    } catch (parseError) {
      return NextResponse.json({
        error: 'Invalid JSON',
        code: 'INVALID_INPUT',
      }, { status: 400 });
    }
  };
}

// Content sanitization
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    // Remove potential XSS attacks
    return DOMPurify.sanitize(obj, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

// SQL injection prevention (Prisma handles this automatically, but additional validation)
export function validateSqlInputs(query: string): boolean {
  const sqlInjectionPatterns = [
    /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT( +INTO)?|MERGE|SELECT|UPDATE|UNION( +ALL)?)\b)/i,
    /(;|\||&|\*|'|"|<|>|%|=)/,
    /(\b(AND|OR|NOT|XOR|HAVING|WHERE|LIKE|IN|BETWEEN|IS|NULL)\b.*['"=])/i,
  ];

  return !sqlInjectionPatterns.some(pattern => pattern.test(query));
}
```

### 2. File Upload Security

```typescript
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { promises as fs } from 'fs';

// Secure file upload configuration
const uploadConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.csv', '.xlsx'],
  uploadDir: path.join(process.cwd(), 'uploads'),
  tempDir: path.join(process.cwd(), 'temp'),
};

// File upload middleware
export const secureFileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadConfig.tempDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = crypto.randomUUID() + path.extname(file.originalname);
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: uploadConfig.maxFileSize,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // Check MIME type
    if (!uploadConfig.allowedMimeTypes.includes(file.mimetype)) {
      cb(new Error('Invalid file type'));
      return;
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!uploadConfig.allowedExtensions.includes(ext)) {
      cb(new Error('Invalid file extension'));
      return;
    }

    // Additional security checks
    if (file.originalname.includes('..') || file.originalname.includes('/')) {
      cb(new Error('Invalid filename'));
      return;
    }

    cb(null, true);
  },
});

// File validation after upload
export async function validateUploadedFile(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    
    // Check file size again
    if (stats.size > uploadConfig.maxFileSize) {
      await fs.unlink(filePath);
      return false;
    }

    // Read file header to verify MIME type
    const buffer = await fs.readFile(filePath, { encoding: null, length: 512 });
    const actualMimeType = await getMimeTypeFromBuffer(buffer);
    
    // Verify MIME type matches content
    if (!uploadConfig.allowedMimeTypes.includes(actualMimeType)) {
      await fs.unlink(filePath);
      return false;
    }

    return true;
  } catch (error) {
    console.error('File validation error:', error);
    return false;
  }
}

async function getMimeTypeFromBuffer(buffer: Buffer): Promise<string> {
  // Check file signatures (magic numbers)
  const signatures = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/gif': [0x47, 0x49, 0x46],
    'application/pdf': [0x25, 0x50, 0x44, 0x46],
  };

  for (const [mimeType, signature] of Object.entries(signatures)) {
    if (signature.every((byte, index) => buffer[index] === byte)) {
      return mimeType;
    }
  }

  return 'application/octet-stream';
}
```

## Audit Logging & Monitoring

### 1. Comprehensive Audit System

```typescript
interface AuditEvent {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldData?: any;
  newData?: any;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  success: boolean;
  errorMessage?: string;
}

class AuditLogger {
  async logEvent(event: AuditEvent): Promise<void> {
    try {
      // Store in database for permanent record
      await prisma.auditLog.create({
        data: {
          userId: event.userId,
          userEmail: event.userId ? await this.getUserEmail(event.userId) : null,
          userRole: event.userId ? await this.getUserRole(event.userId) : null,
          action: event.action,
          resource: event.resource,
          resourceId: event.resourceId,
          oldData: event.oldData,
          newData: event.newData,
          ipAddress: event.ip,
          userAgent: event.userAgent,
          sessionId: event.sessionId,
          success: event.success,
          errorMessage: event.errorMessage,
          timestamp: new Date(),
        },
      });

      // Also log to external security system for real-time monitoring
      await this.sendToSecuritySystem(event);

      // Store in Redis for fast access (last 1000 events per user)
      if (event.userId) {
        await redis.lpush(`audit:${event.userId}`, JSON.stringify({
          ...event,
          timestamp: new Date().toISOString(),
        }));
        await redis.ltrim(`audit:${event.userId}`, 0, 999);
      }

    } catch (error) {
      console.error('Audit logging failed:', error);
      // Never fail the main operation due to audit logging
    }
  }

  async logSecurityEvent(eventType: string, details: Record<string, any>): Promise<void> {
    const event: AuditEvent = {
      userId: details.userId,
      action: eventType,
      resource: 'security',
      metadata: details,
      ip: details.ip,
      userAgent: details.userAgent,
      success: false, // Security events are typically failures/attempts
    };

    await this.logEvent(event);

    // Additional security alerting for critical events
    if (this.isCriticalEvent(eventType)) {
      await this.sendSecurityAlert(eventType, details);
    }
  }

  private isCriticalEvent(eventType: string): boolean {
    const criticalEvents = [
      'UNAUTHORIZED_ACCESS_ATTEMPT',
      'PRIVILEGE_ESCALATION_ATTEMPT',
      'DATA_BREACH_ATTEMPT',
      'BRUTE_FORCE_ATTACK',
      'ACCOUNT_TAKEOVER_ATTEMPT',
    ];
    return criticalEvents.includes(eventType);
  }

  private async sendSecurityAlert(eventType: string, details: Record<string, any>): Promise<void> {
    // Send to security team via webhook, email, or security system
    const alertPayload = {
      severity: 'HIGH',
      eventType,
      timestamp: new Date().toISOString(),
      details,
      source: 'instructor-dashboard',
    };

    // Implementation would depend on your security infrastructure
    // Examples: Splunk, ELK Stack, security@domain.com, Slack webhook
    console.warn('SECURITY ALERT:', alertPayload);
  }

  private async getUserEmail(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    return user?.email || null;
  }

  private async getUserRole(userId: string): Promise<UserRole | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user?.role || null;
  }

  private async sendToSecuritySystem(event: AuditEvent): Promise<void> {
    // Send to external SIEM or security monitoring system
    // This would be implemented based on your security infrastructure
  }
}

// Global audit logger instance
export const auditLogger = new AuditLogger();

// Convenience function for quick logging
export async function logSecurityEvent(eventType: string, details: Record<string, any>): Promise<void> {
  await auditLogger.logSecurityEvent(eventType, details);
}

// Audit middleware for API routes
export function auditMiddleware(action: string, resource: string) {
  return async (req: NextRequest, response: NextResponse) => {
    const user = req.user as JWTPayload;
    const startTime = Date.now();
    
    // Log the attempt
    const auditEvent: AuditEvent = {
      userId: user?.userId,
      action: `${action}_ATTEMPT`,
      resource,
      ip: req.ip,
      userAgent: req.headers.get('user-agent') || undefined,
      sessionId: user?.sessionId,
      success: false, // Will be updated based on response
    };

    try {
      // Execute the request (this happens in the API route)
      // The response status will determine success/failure
      const success = response.status >= 200 && response.status < 400;
      
      await auditLogger.logEvent({
        ...auditEvent,
        action: success ? `${action}_SUCCESS` : `${action}_FAILURE`,
        success,
        errorMessage: success ? undefined : `HTTP ${response.status}`,
        metadata: {
          duration: Date.now() - startTime,
          responseStatus: response.status,
        },
      });

    } catch (error) {
      await auditLogger.logEvent({
        ...auditEvent,
        action: `${action}_ERROR`,
        success: false,
        errorMessage: error.message,
        metadata: {
          duration: Date.now() - startTime,
          error: error.stack,
        },
      });
    }
  };
}
```

### 2. Security Monitoring & Alerting

```typescript
class SecurityMonitor {
  private readonly alertThresholds = {
    failedLogins: { count: 5, window: 15 * 60 * 1000 }, // 5 in 15 minutes
    rateLimitExceeded: { count: 10, window: 60 * 60 * 1000 }, // 10 in 1 hour
    unauthorizedAccess: { count: 3, window: 5 * 60 * 1000 }, // 3 in 5 minutes
    suspiciousActivity: { count: 5, window: 30 * 60 * 1000 }, // 5 in 30 minutes
  };

  async checkSecurityThresholds(userId: string, eventType: string): Promise<void> {
    const threshold = this.alertThresholds[eventType as keyof typeof this.alertThresholds];
    if (!threshold) return;

    const key = `security:${eventType}:${userId}`;
    const count = await redis.incr(key);
    
    if (count === 1) {
      await redis.expire(key, threshold.window / 1000);
    }

    if (count >= threshold.count) {
      await this.triggerSecurityAlert(userId, eventType, count);
    }
  }

  private async triggerSecurityAlert(userId: string, eventType: string, count: number): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, role: true },
    });

    const alert = {
      severity: 'HIGH',
      type: 'SECURITY_THRESHOLD_EXCEEDED',
      user: user || { email: 'unknown', name: 'unknown', role: 'unknown' },
      eventType,
      count,
      timestamp: new Date().toISOString(),
      action: 'ACCOUNT_TEMPORARILY_LOCKED',
    };

    // Log security alert
    await auditLogger.logSecurityEvent('SECURITY_THRESHOLD_EXCEEDED', alert);

    // Temporarily lock account for non-admins
    if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      await this.temporaryAccountLock(userId, 30); // 30 minutes
    }

    // Send alert to security team
    await this.notifySecurityTeam(alert);
  }

  private async temporaryAccountLock(userId: string, minutes: number): Promise<void> {
    const lockUntil = new Date(Date.now() + minutes * 60 * 1000);
    
    await redis.setex(`account:locked:${userId}`, minutes * 60, lockUntil.toISOString());
    
    await auditLogger.logEvent({
      userId,
      action: 'ACCOUNT_LOCKED',
      resource: 'user',
      resourceId: userId,
      success: true,
      metadata: { lockDuration: minutes, lockUntil },
    });
  }

  async isAccountLocked(userId: string): Promise<boolean> {
    const lockInfo = await redis.get(`account:locked:${userId}`);
    return lockInfo !== null;
  }

  private async notifySecurityTeam(alert: any): Promise<void> {
    // Implementation depends on your notification system
    // Could be email, Slack, PagerDuty, etc.
    console.warn('SECURITY TEAM ALERT:', alert);
  }

  // Anomaly detection for unusual patterns
  async detectAnomalies(userId: string): Promise<void> {
    const userActivity = await this.getUserActivityPattern(userId);
    const anomalies = await this.analyzeActivityPattern(userActivity);
    
    if (anomalies.length > 0) {
      await auditLogger.logSecurityEvent('ANOMALY_DETECTED', {
        userId,
        anomalies,
        activity: userActivity,
      });
    }
  }

  private async getUserActivityPattern(userId: string): Promise<any> {
    // Get user's typical activity pattern from the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const activity = await prisma.auditLog.findMany({
      where: {
        userId,
        timestamp: { gte: thirtyDaysAgo },
        success: true,
      },
      select: {
        action: true,
        timestamp: true,
        ip: true,
        userAgent: true,
      },
      orderBy: { timestamp: 'desc' },
    });

    return this.aggregateActivityPattern(activity);
  }

  private aggregateActivityPattern(activity: any[]): any {
    // Analyze patterns: typical hours, IPs, user agents, actions
    const patterns = {
      typicalHours: new Set<number>(),
      commonIPs: new Map<string, number>(),
      commonUserAgents: new Map<string, number>(),
      commonActions: new Map<string, number>(),
    };

    activity.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      patterns.typicalHours.add(hour);
      
      if (event.ip) {
        patterns.commonIPs.set(event.ip, (patterns.commonIPs.get(event.ip) || 0) + 1);
      }
      
      if (event.userAgent) {
        patterns.commonUserAgents.set(event.userAgent, 
          (patterns.commonUserAgents.get(event.userAgent) || 0) + 1);
      }
      
      patterns.commonActions.set(event.action, 
        (patterns.commonActions.get(event.action) || 0) + 1);
    });

    return patterns;
  }

  private async analyzeActivityPattern(pattern: any): Promise<string[]> {
    const anomalies: string[] = [];
    
    // This is a simplified example - real anomaly detection would be more sophisticated
    const currentHour = new Date().getHours();
    if (!pattern.typicalHours.has(currentHour) && pattern.typicalHours.size > 0) {
      anomalies.push(`Unusual login time: ${currentHour}:00`);
    }

    return anomalies;
  }
}

export const securityMonitor = new SecurityMonitor();
```

## Data Encryption & Protection

### 1. Data Encryption at Rest

```typescript
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

class DataEncryption {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  
  private getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable not set');
    }
    return Buffer.from(key, 'hex');
  }

  // Encrypt sensitive data before storing
  encrypt(text: string): string {
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(this.ivLength);
    
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from('instructor-dashboard', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine IV, auth tag, and encrypted data
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  // Decrypt sensitive data after retrieval
  decrypt(encryptedData: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    
    const key = this.getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAAD(Buffer.from('instructor-dashboard', 'utf8'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Hash passwords securely
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Verify password
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate secure random tokens
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Hash sensitive identifiers (one-way)
  hashIdentifier(identifier: string): string {
    return crypto.createHash('sha256').update(identifier).digest('hex');
  }
}

export const dataEncryption = new DataEncryption();

// Prisma middleware for automatic encryption/decryption
export function createEncryptionMiddleware() {
  return prisma.$use(async (params, next) => {
    // Fields that should be encrypted
    const encryptedFields = ['phone', 'ssn', 'address'];
    
    // Encrypt on create/update
    if (params.action === 'create' || params.action === 'update') {
      if (params.args.data) {
        for (const field of encryptedFields) {
          if (params.args.data[field]) {
            params.args.data[field] = dataEncryption.encrypt(params.args.data[field]);
          }
        }
      }
    }
    
    const result = await next(params);
    
    // Decrypt on read
    if (params.action === 'findUnique' || params.action === 'findFirst' || params.action === 'findMany') {
      if (result) {
        const decryptRecord = (record: any) => {
          for (const field of encryptedFields) {
            if (record[field]) {
              try {
                record[field] = dataEncryption.decrypt(record[field]);
              } catch (error) {
                console.error(`Failed to decrypt field ${field}:`, error);
                record[field] = '[ENCRYPTED]';
              }
            }
          }
          return record;
        };
        
        if (Array.isArray(result)) {
          result.forEach(decryptRecord);
        } else {
          decryptRecord(result);
        }
      }
    }
    
    return result;
  });
}
```

### 2. Secure Communication

```typescript
// HTTPS enforcement middleware
export function enforceHTTPS(req: NextRequest) {
  if (req.headers.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    return NextResponse.redirect(`https://${req.headers.get('host')}${req.url}`, 301);
  }
  return null;
}

// Security headers middleware
export function securityHeaders() {
  return {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' wss: ws:; media-src 'self'; object-src 'none'; child-src 'none'; worker-src 'none'; frame-ancestors 'none'; form-action 'self'; base-uri 'self';",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(), vibrate=(), fullscreen=(), sync-xhr=()',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  };
}

// CORS configuration for instructor dashboard
export const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Request-ID',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};
```

This comprehensive security implementation provides enterprise-grade protection for the instructor dashboard, with multiple layers of defense, comprehensive audit logging, and compliance with law enforcement data protection requirements.