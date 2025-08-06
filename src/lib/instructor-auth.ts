import 'server-only'
import { getServerSession } from 'next-auth/next';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { authOptions } from './auth';
import { prisma } from './db-server';

// Types
type UserRole = 'USER' | 'INSTRUCTOR' | 'ADMIN' | 'SUPER_ADMIN';

interface InstructorSessionData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  pid: string;
  department?: string;
  badgeNumber?: string;
  rank?: string;
  isActive: boolean;
  permissions: string[];
}

interface InstructorTokenValidation {
  isValid: boolean;
  user?: InstructorSessionData;
  error?: string;
  errorCode?: string;
}

// Permission constants
export const INSTRUCTOR_PERMISSIONS = {
  VIEW_DASHBOARD: 'instructor:view_dashboard',
  MANAGE_STUDENTS: 'instructor:manage_students',
  VIEW_STUDENT_PROFILES: 'instructor:view_student_profiles',
  CREATE_ASSIGNMENTS: 'instructor:create_assignments',
  GRADE_ASSIGNMENTS: 'instructor:grade_assignments',
  SEND_MESSAGES: 'instructor:send_messages',
  VIEW_ANALYTICS: 'instructor:view_analytics',
  GENERATE_REPORTS: 'instructor:generate_reports',
  MANAGE_SETTINGS: 'instructor:manage_settings',
  
  // Admin permissions
  MANAGE_INSTRUCTORS: 'admin:manage_instructors',
  MANAGE_DEPARTMENTS: 'admin:manage_departments',
  VIEW_ALL_STUDENTS: 'admin:view_all_students',
  SYSTEM_CONFIGURATION: 'admin:system_configuration',
  
  // Super admin permissions
  SYSTEM_MANAGEMENT: 'superadmin:system_management',
  USER_MANAGEMENT: 'superadmin:user_management',
  SECURITY_SETTINGS: 'superadmin:security_settings'
} as const;

// Role to permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  USER: [],
  INSTRUCTOR: [
    INSTRUCTOR_PERMISSIONS.VIEW_DASHBOARD,
    INSTRUCTOR_PERMISSIONS.MANAGE_STUDENTS,
    INSTRUCTOR_PERMISSIONS.VIEW_STUDENT_PROFILES,
    INSTRUCTOR_PERMISSIONS.CREATE_ASSIGNMENTS,
    INSTRUCTOR_PERMISSIONS.GRADE_ASSIGNMENTS,
    INSTRUCTOR_PERMISSIONS.SEND_MESSAGES,
    INSTRUCTOR_PERMISSIONS.VIEW_ANALYTICS,
    INSTRUCTOR_PERMISSIONS.GENERATE_REPORTS,
    INSTRUCTOR_PERMISSIONS.MANAGE_SETTINGS
  ],
  ADMIN: [
    // Instructor permissions
    INSTRUCTOR_PERMISSIONS.VIEW_DASHBOARD,
    INSTRUCTOR_PERMISSIONS.MANAGE_STUDENTS,
    INSTRUCTOR_PERMISSIONS.VIEW_STUDENT_PROFILES,
    INSTRUCTOR_PERMISSIONS.CREATE_ASSIGNMENTS,
    INSTRUCTOR_PERMISSIONS.GRADE_ASSIGNMENTS,
    INSTRUCTOR_PERMISSIONS.VIEW_ANALYTICS,
    INSTRUCTOR_PERMISSIONS.SEND_MESSAGES,
    INSTRUCTOR_PERMISSIONS.GENERATE_REPORTS,
    INSTRUCTOR_PERMISSIONS.MANAGE_SETTINGS,
    // Additional admin permissions
    INSTRUCTOR_PERMISSIONS.MANAGE_INSTRUCTORS,
    INSTRUCTOR_PERMISSIONS.MANAGE_DEPARTMENTS,
    INSTRUCTOR_PERMISSIONS.VIEW_ALL_STUDENTS,
    INSTRUCTOR_PERMISSIONS.SYSTEM_CONFIGURATION
  ],
  SUPER_ADMIN: [
    // All admin permissions (duplicated to avoid circular reference)
    INSTRUCTOR_PERMISSIONS.VIEW_DASHBOARD,
    INSTRUCTOR_PERMISSIONS.MANAGE_STUDENTS,
    INSTRUCTOR_PERMISSIONS.VIEW_STUDENT_PROFILES,
    INSTRUCTOR_PERMISSIONS.CREATE_ASSIGNMENTS,
    INSTRUCTOR_PERMISSIONS.GRADE_ASSIGNMENTS,
    INSTRUCTOR_PERMISSIONS.VIEW_ANALYTICS,
    INSTRUCTOR_PERMISSIONS.SEND_MESSAGES,
    INSTRUCTOR_PERMISSIONS.GENERATE_REPORTS,
    INSTRUCTOR_PERMISSIONS.MANAGE_SETTINGS,
    INSTRUCTOR_PERMISSIONS.MANAGE_INSTRUCTORS,
    INSTRUCTOR_PERMISSIONS.MANAGE_DEPARTMENTS,
    INSTRUCTOR_PERMISSIONS.VIEW_ALL_STUDENTS,
    INSTRUCTOR_PERMISSIONS.SYSTEM_CONFIGURATION,
    // Super admin permissions
    INSTRUCTOR_PERMISSIONS.SYSTEM_MANAGEMENT,
    INSTRUCTOR_PERMISSIONS.USER_MANAGEMENT,
    INSTRUCTOR_PERMISSIONS.SECURITY_SETTINGS
  ]
};

// Ensure role permissions are properly initialized
ROLE_PERMISSIONS.ADMIN = [
  ...ROLE_PERMISSIONS.INSTRUCTOR,
  INSTRUCTOR_PERMISSIONS.MANAGE_INSTRUCTORS,
  INSTRUCTOR_PERMISSIONS.MANAGE_DEPARTMENTS,
  INSTRUCTOR_PERMISSIONS.VIEW_ALL_STUDENTS,
  INSTRUCTOR_PERMISSIONS.SYSTEM_CONFIGURATION
];

ROLE_PERMISSIONS.SUPER_ADMIN = [
  ...ROLE_PERMISSIONS.ADMIN,
  INSTRUCTOR_PERMISSIONS.SYSTEM_MANAGEMENT,
  INSTRUCTOR_PERMISSIONS.USER_MANAGEMENT,
  INSTRUCTOR_PERMISSIONS.SECURITY_SETTINGS
];

/**
 * Get instructor session on the server side
 */
export async function getInstructorSession(): Promise<InstructorSessionData | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return null;
    }

    const { user } = session;
    
    // Check if user has instructor privileges
    if (!isInstructorRole(user.role)) {
      return null;
    }

    // Get additional user data from database if needed
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        pid: true,
        department: true,
        badgeNumber: true,
        rank: true,
        isActive: true
      }
    });

    if (!userData || !userData.isActive) {
      return null;
    }

    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role as UserRole,
      pid: userData.pid,
      department: userData.department || undefined,
      badgeNumber: userData.badgeNumber || undefined,
      rank: userData.rank || undefined,
      isActive: userData.isActive,
      permissions: ROLE_PERMISSIONS[userData.role as UserRole] || []
    };
  } catch (error) {
    console.error('Error getting instructor session:', error);
    return null;
  }
}

/**
 * Validate instructor token for API routes
 */
export async function validateInstructorToken(req: NextRequest): Promise<InstructorTokenValidation> {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return {
        isValid: false,
        error: 'No authentication token provided',
        errorCode: 'NO_TOKEN'
      };
    }

    // Check if user has instructor privileges
    if (!isInstructorRole(token.role as UserRole)) {
      return {
        isValid: false,
        error: 'Insufficient privileges - instructor role required',
        errorCode: 'INSUFFICIENT_PRIVILEGES'
      };
    }

    // Validate token freshness (optional)
    const tokenAge = Date.now() - ((token.iat as number) || 0) * 1000;
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

    if (tokenAge > maxAge) {
      return {
        isValid: false,
        error: 'Token expired',
        errorCode: 'TOKEN_EXPIRED'
      };
    }

    // Get user data from database to ensure account is still active
    const userData = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        pid: true,
        department: true,
        badgeNumber: true,
        rank: true,
        isActive: true
      }
    });

    if (!userData) {
      return {
        isValid: false,
        error: 'User not found',
        errorCode: 'USER_NOT_FOUND'
      };
    }

    if (!userData.isActive) {
      return {
        isValid: false,
        error: 'Account deactivated',
        errorCode: 'ACCOUNT_DEACTIVATED'
      };
    }

    return {
      isValid: true,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role as UserRole,
        pid: userData.pid,
        department: userData.department || undefined,
        badgeNumber: userData.badgeNumber || undefined,
        rank: userData.rank || undefined,
        isActive: userData.isActive,
        permissions: ROLE_PERMISSIONS[userData.role as UserRole] || []
      }
    };
  } catch (error) {
    console.error('Error validating instructor token:', error);
    return {
      isValid: false,
      error: 'Token validation failed',
      errorCode: 'VALIDATION_ERROR'
    };
  }
}

/**
 * Check if user role has instructor privileges
 */
export function isInstructorRole(role: UserRole): boolean {
  return ['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(role);
}

/**
 * Check if user has specific permission
 */
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return userPermissions.includes(permission);
}

/**
 * Check multiple permissions (user must have ALL permissions)
 */
export function hasAllPermissions(userRole: UserRole, permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Check multiple permissions (user must have ANY permission)
 */
export function hasAnyPermission(userRole: UserRole, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Department-based access control
 */
export function canAccessDepartment(
  userRole: UserRole,
  userDepartment: string | undefined,
  targetDepartment: string
): boolean {
  // Super admins and admins can access all departments
  if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
    return true;
  }
  
  // Instructors can only access their own department
  if (userRole === 'INSTRUCTOR') {
    return userDepartment === targetDepartment;
  }
  
  return false;
}

/**
 * Student access validation for instructors
 */
export async function canAccessStudent(
  instructorId: string,
  studentId: string
): Promise<boolean> {
  try {
    // Get instructor data
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId },
      select: { role: true, department: true }
    });

    if (!instructor || !isInstructorRole(instructor.role as UserRole)) {
      return false;
    }

    // Super admins and admins can access all students
    if (instructor.role === 'SUPER_ADMIN' || instructor.role === 'ADMIN') {
      return true;
    }

    // Get student data
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { department: true }
    });

    if (!student) {
      return false;
    }

    // Instructors can access students in their department
    return instructor.department === student.department;
  } catch (error) {
    console.error('Error checking student access:', error);
    return false;
  }
}

/**
 * Assignment access validation
 */
export async function canAccessAssignment(
  instructorId: string,
  assignmentId: string
): Promise<boolean> {
  try {
    // Get instructor data
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId },
      select: { role: true, department: true }
    });

    if (!instructor || !isInstructorRole(instructor.role as UserRole)) {
      return false;
    }

    // Super admins and admins can access all assignments
    if (instructor.role === 'SUPER_ADMIN' || instructor.role === 'ADMIN') {
      return true;
    }

    // Check if assignment exists and get creator info
    // This would need to be implemented based on your assignment schema
    // const assignment = await prisma.assignment.findUnique({
    //   where: { id: assignmentId },
    //   select: { createdById: true, department: true }
    // });

    // For now, assume instructors can access assignments in their department
    // or assignments they created
    return true; // Placeholder
  } catch (error) {
    console.error('Error checking assignment access:', error);
    return false;
  }
}

/**
 * Audit logging for instructor actions
 */
export async function logInstructorAction(
  instructorId: string,
  action: string,
  resource?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    console.log('Instructor Action:', {
      instructorId,
      action,
      resource,
      metadata,
      timestamp: new Date().toISOString()
    });

    // In a production environment, you might want to store this in a separate audit table
    // await prisma.auditLog.create({
    //   data: {
    //     userId: instructorId,
    //     action,
    //     resource,
    //     metadata,
    //     timestamp: new Date()
    //   }
    // });
  } catch (error) {
    console.error('Error logging instructor action:', error);
  }
}

/**
 * Rate limiting for instructor actions
 */
export async function checkInstructorRateLimit(
  instructorId: string,
  action: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  // This is a placeholder - implement actual rate limiting logic
  // based on your requirements and rate limiting infrastructure
  
  const rateLimits: Record<string, { requests: number; window: number }> = {
    'send_message': { requests: 10, window: 60 }, // 10 messages per minute
    'create_assignment': { requests: 5, window: 300 }, // 5 assignments per 5 minutes
    'bulk_action': { requests: 3, window: 60 }, // 3 bulk actions per minute
    'export_data': { requests: 2, window: 300 } // 2 exports per 5 minutes
  };

  const limit = rateLimits[action];
  if (!limit) {
    return { allowed: true }; // No limit defined for this action
  }

  // Implement actual rate limiting logic here
  // This could use Redis, in-memory cache, or database
  
  return { allowed: true }; // Placeholder
}

/**
 * Session refresh for long-running operations
 */
export async function refreshInstructorSession(instructorId: string): Promise<boolean> {
  try {
    // Update last activity timestamp
    // Skip updating lastActivityAt for development as it may not exist in schema
    // await prisma.user.update({
    //   where: { id: instructorId },
    //   data: { lastActivityAt: new Date() }
    // });

    return true;
  } catch (error) {
    console.error('Error refreshing instructor session:', error);
    return false;
  }
}

/**
 * Get instructor capabilities based on role and context
 */
export function getInstructorCapabilities(
  role: UserRole,
  department?: string
): {
  canViewAllStudents: boolean;
  canManageInstructors: boolean;
  canAccessSystemSettings: boolean;
  canExportData: boolean;
  maxStudentsPerAssignment: number;
  maxReportsPerDay: number;
} {
  const baseCapabilities = {
    canViewAllStudents: false,
    canManageInstructors: false,
    canAccessSystemSettings: false,
    canExportData: true,
    maxStudentsPerAssignment: 50,
    maxReportsPerDay: 10
  };

  switch (role) {
    case 'SUPER_ADMIN':
      return {
        ...baseCapabilities,
        canViewAllStudents: true,
        canManageInstructors: true,
        canAccessSystemSettings: true,
        maxStudentsPerAssignment: 1000,
        maxReportsPerDay: 100
      };
    
    case 'ADMIN':
      return {
        ...baseCapabilities,
        canViewAllStudents: true,
        canManageInstructors: true,
        maxStudentsPerAssignment: 200,
        maxReportsPerDay: 50
      };
    
    case 'INSTRUCTOR':
      return {
        ...baseCapabilities,
        maxStudentsPerAssignment: 50,
        maxReportsPerDay: 10
      };
    
    default:
      return {
        ...baseCapabilities,
        canExportData: false,
        maxStudentsPerAssignment: 0,
        maxReportsPerDay: 0
      };
  }
}