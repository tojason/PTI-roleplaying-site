import 'server-only'
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import { validateInstructorToken, getInstructorSession, hasPermission, INSTRUCTOR_PERMISSIONS } from './instructor-auth';

// Types
type UserRole = 'USER' | 'INSTRUCTOR' | 'ADMIN' | 'SUPER_ADMIN';

interface RouteProtectionOptions {
  requiredRole?: UserRole;
  requiredPermissions?: string[];
  requireAllPermissions?: boolean; // Default: true (must have ALL permissions)
  allowDepartmentAccess?: boolean; // Allow access if user is in same department
  requireOwnership?: boolean; // Require user to own the resource
}

interface ProtectedRouteResult {
  allowed: boolean;
  user?: any;
  error?: string;
  errorCode?: string;
  statusCode?: number;
}

/**
 * Protect server-side routes (for API routes and server components)
 */
export async function protectServerRoute(
  options: RouteProtectionOptions = {}
): Promise<ProtectedRouteResult> {
  try {
    const session = await getInstructorSession();
    
    if (!session) {
      return {
        allowed: false,
        error: 'Authentication required',
        errorCode: 'UNAUTHENTICATED',
        statusCode: 401
      };
    }

    // Check role requirement
    if (options.requiredRole) {
      if (!hasRequiredRole(session.role, options.requiredRole)) {
        return {
          allowed: false,
          error: `${options.requiredRole} role required`,
          errorCode: 'INSUFFICIENT_ROLE',
          statusCode: 403
        };
      }
    }

    // Check permission requirements
    if (options.requiredPermissions && options.requiredPermissions.length > 0) {
      const hasPerms = options.requireAllPermissions !== false
        ? options.requiredPermissions.every(perm => hasPermission(session.role, perm))
        : options.requiredPermissions.some(perm => hasPermission(session.role, perm));

      if (!hasPerms) {
        return {
          allowed: false,
          error: 'Insufficient permissions',
          errorCode: 'INSUFFICIENT_PERMISSIONS',
          statusCode: 403
        };
      }
    }

    return {
      allowed: true,
      user: session
    };
  } catch (error) {
    console.error('Error in protectServerRoute:', error);
    return {
      allowed: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
      statusCode: 500
    };
  }
}

/**
 * Protect API routes with enhanced validation
 */
export async function protectAPIRoute(
  req: NextRequest,
  options: RouteProtectionOptions = {}
): Promise<ProtectedRouteResult> {
  try {
    const validation = await validateInstructorToken(req);
    
    if (!validation.isValid || !validation.user) {
      return {
        allowed: false,
        error: validation.error || 'Authentication failed',
        errorCode: validation.errorCode || 'AUTH_FAILED',
        statusCode: 401
      };
    }

    const user = validation.user;

    // Check role requirement
    if (options.requiredRole) {
      if (!hasRequiredRole(user.role, options.requiredRole)) {
        return {
          allowed: false,
          error: `${options.requiredRole} role required`,
          errorCode: 'INSUFFICIENT_ROLE',
          statusCode: 403
        };
      }
    }

    // Check permission requirements
    if (options.requiredPermissions && options.requiredPermissions.length > 0) {
      const hasPerms = options.requireAllPermissions !== false
        ? options.requiredPermissions.every(perm => hasPermission(user.role, perm))
        : options.requiredPermissions.some(perm => hasPermission(user.role, perm));

      if (!hasPerms) {
        return {
          allowed: false,
          error: 'Insufficient permissions',
          errorCode: 'INSUFFICIENT_PERMISSIONS',
          statusCode: 403
        };
      }
    }

    return {
      allowed: true,
      user
    };
  } catch (error) {
    console.error('Error in protectAPIRoute:', error);
    return {
      allowed: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
      statusCode: 500
    };
  }
}

/**
 * Higher-order function to wrap API route handlers with protection
 */
export function withInstructorAuth(
  handler: (req: NextRequest, user: any) => Promise<NextResponse>,
  options: RouteProtectionOptions = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const protection = await protectAPIRoute(req, options);
    
    if (!protection.allowed) {
      return NextResponse.json(
        {
          error: protection.error,
          code: protection.errorCode
        },
        { status: protection.statusCode || 403 }
      );
    }

    try {
      return await handler(req, protection.user);
    } catch (error) {
      console.error('Error in protected API handler:', error);
      return NextResponse.json(
        {
          error: 'Internal server error',
          code: 'HANDLER_ERROR'
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware helper for specific instructor routes
 */
export function createInstructorRouteMiddleware(options: RouteProtectionOptions = {}) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    const protection = await protectAPIRoute(req, options);
    
    if (!protection.allowed) {
      // For middleware, we need to handle redirects and responses differently
      if (protection.statusCode === 401) {
        // Redirect to login
        const loginUrl = new URL('/instructor/login', req.url);
        loginUrl.searchParams.set('callbackUrl', req.url);
        return NextResponse.redirect(loginUrl);
      } else {
        // Return error response
        return NextResponse.json(
          {
            error: protection.error,
            code: protection.errorCode
          },
          { status: protection.statusCode || 403 }
        );
      }
    }

    // Protection passed, continue to next middleware or route
    return null;
  };
}

/**
 * Helper function to check role hierarchy
 */
function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    USER: 0,
    INSTRUCTOR: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Route-specific protection presets
 */
export const ROUTE_PROTECTIONS = {
  // Dashboard routes
  INSTRUCTOR_DASHBOARD: {
    requiredRole: 'INSTRUCTOR' as UserRole,
    requiredPermissions: [INSTRUCTOR_PERMISSIONS.VIEW_DASHBOARD] as string[]
  },

  // Student management routes
  STUDENT_LIST: {
    requiredRole: 'INSTRUCTOR' as UserRole,
    requiredPermissions: [INSTRUCTOR_PERMISSIONS.MANAGE_STUDENTS] as string[]
  },

  STUDENT_PROFILE: {
    requiredRole: 'INSTRUCTOR' as UserRole,
    requiredPermissions: [INSTRUCTOR_PERMISSIONS.VIEW_STUDENT_PROFILES] as string[],
    allowDepartmentAccess: true
  },

  // Assignment routes
  CREATE_ASSIGNMENT: {
    requiredRole: 'INSTRUCTOR' as UserRole,
    requiredPermissions: [INSTRUCTOR_PERMISSIONS.CREATE_ASSIGNMENTS] as string[]
  },

  GRADE_ASSIGNMENT: {
    requiredRole: 'INSTRUCTOR' as UserRole,
    requiredPermissions: [INSTRUCTOR_PERMISSIONS.GRADE_ASSIGNMENTS] as string[]
  },

  // Analytics routes
  VIEW_ANALYTICS: {
    requiredRole: 'INSTRUCTOR' as UserRole,
    requiredPermissions: [INSTRUCTOR_PERMISSIONS.VIEW_ANALYTICS] as string[]
  },

  // Communication routes
  SEND_MESSAGE: {
    requiredRole: 'INSTRUCTOR' as UserRole,
    requiredPermissions: [INSTRUCTOR_PERMISSIONS.SEND_MESSAGES] as string[]
  },

  // Report routes
  GENERATE_REPORT: {
    requiredRole: 'INSTRUCTOR' as UserRole,
    requiredPermissions: [INSTRUCTOR_PERMISSIONS.GENERATE_REPORTS] as string[]
  },

  // Admin routes
  MANAGE_INSTRUCTORS: {
    requiredRole: 'ADMIN' as UserRole,
    requiredPermissions: [INSTRUCTOR_PERMISSIONS.MANAGE_INSTRUCTORS] as string[]
  },

  MANAGE_DEPARTMENTS: {
    requiredRole: 'ADMIN' as UserRole,
    requiredPermissions: [INSTRUCTOR_PERMISSIONS.MANAGE_DEPARTMENTS] as string[]
  },

  // Super admin routes
  SYSTEM_MANAGEMENT: {
    requiredRole: 'SUPER_ADMIN' as UserRole,
    requiredPermissions: [INSTRUCTOR_PERMISSIONS.SYSTEM_MANAGEMENT] as string[]
  }
} as const;

/**
 * Utility function to get user-friendly error messages
 */
export function getRouteErrorMessage(errorCode: string): string {
  const messages: Record<string, string> = {
    UNAUTHENTICATED: 'Please log in to access this page.',
    INSUFFICIENT_ROLE: 'You do not have the required role to access this page.',
    INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action.',
    ACCOUNT_DEACTIVATED: 'Your account has been deactivated. Please contact your administrator.',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
    USER_NOT_FOUND: 'User account not found.',
    INTERNAL_ERROR: 'An internal error occurred. Please try again later.',
    VALIDATION_ERROR: 'Request validation failed.',
    NO_TOKEN: 'Authentication token is missing.',
    AUTH_FAILED: 'Authentication failed.',
    HANDLER_ERROR: 'An error occurred while processing your request.'
  };

  return messages[errorCode] || 'Access denied.';
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  errorCode: string,
  statusCode: number = 403,
  additionalData?: Record<string, any>
): NextResponse {
  return NextResponse.json(
    {
      error: getRouteErrorMessage(errorCode),
      code: errorCode,
      ...additionalData
    },
    { status: statusCode }
  );
}