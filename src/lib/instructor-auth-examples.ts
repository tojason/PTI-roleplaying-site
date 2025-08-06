/**
 * INSTRUCTOR AUTH EXAMPLES
 * 
 * This file provides comprehensive examples of how to use the instructor authentication
 * and route protection utilities in different scenarios.
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  withInstructorAuth, 
  protectServerRoute, 
  ROUTE_PROTECTIONS,
  createErrorResponse 
} from './route-protection';
import { 
  getInstructorSession, 
  hasPermission, 
  INSTRUCTOR_PERMISSIONS,
  logInstructorAction 
} from './instructor-auth';

// =============================================================================
// API ROUTE EXAMPLES
// =============================================================================

/**
 * Example 1: Basic instructor-only API route
 * Path: /api/instructor/dashboard
 */
export const instructorDashboardAPI = withInstructorAuth(
  async (req: NextRequest, user) => {
    // Log the action
    await logInstructorAction(user.id, 'view_dashboard');

    // Fetch dashboard data (mock)
    const dashboardData = {
      totalStudents: 150,
      activeStudents: 120,
      completionRate: 85.5,
      recentActivity: []
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });
  },
  ROUTE_PROTECTIONS.INSTRUCTOR_DASHBOARD
);

/**
 * Example 2: Student management API with department validation
 * Path: /api/instructor/students
 */
export const studentsAPI = withInstructorAuth(
  async (req: NextRequest, user) => {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');

    // Check if user can access the requested department
    if (department && user.role === 'INSTRUCTOR' && user.department !== department) {
      return createErrorResponse('INSUFFICIENT_PERMISSIONS', 403, {
        message: 'Cannot access students from other departments'
      });
    }

    // Log the action
    await logInstructorAction(user.id, 'view_students', department || 'all');

    // Fetch students based on user's permissions
    const students: any[] = []; // Mock data

    return NextResponse.json({
      success: true,
      data: students,
      meta: {
        department: user.department,
        canViewAll: user.role !== 'INSTRUCTOR'
      }
    });
  },
  ROUTE_PROTECTIONS.STUDENT_LIST
);

/**
 * Example 3: Assignment creation with validation
 * Path: /api/instructor/assignments (POST)
 */
export const createAssignmentAPI = withInstructorAuth(
  async (req: NextRequest, user) => {
    if (req.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    try {
      const assignmentData = await req.json();

      // Validate assignment data
      if (!assignmentData.title || !assignmentData.description) {
        return createErrorResponse('VALIDATION_ERROR', 400, {
          message: 'Title and description are required'
        });
      }

      // Check if user can create assignments for the specified students
      if (assignmentData.studentIds && user.role === 'INSTRUCTOR') {
        // In a real implementation, you would validate that all students
        // belong to the instructor's department
      }

      // Log the action
      await logInstructorAction(user.id, 'create_assignment', 'new_assignment', {
        title: assignmentData.title,
        studentCount: assignmentData.studentIds?.length || 0
      });

      // Create assignment (mock)
      const assignment = {
        id: 'assign_123',
        ...assignmentData,
        createdBy: user.id,
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: assignment
      }, { status: 201 });

    } catch (error) {
      console.error('Error creating assignment:', error);
      return createErrorResponse('INTERNAL_ERROR', 500);
    }
  },
  ROUTE_PROTECTIONS.CREATE_ASSIGNMENT
);

/**
 * Example 4: Admin-only route for managing instructors
 * Path: /api/admin/instructors
 */
export const manageInstructorsAPI = withInstructorAuth(
  async (req: NextRequest, user) => {
    // This route is protected by ADMIN role requirement in ROUTE_PROTECTIONS
    
    // Log the action
    await logInstructorAction(user.id, 'manage_instructors');

    const instructors: any[] = []; // Mock data

    return NextResponse.json({
      success: true,
      data: instructors
    });
  },
  ROUTE_PROTECTIONS.MANAGE_INSTRUCTORS
);

// =============================================================================
// SERVER COMPONENT EXAMPLES
// =============================================================================

/**
 * Example 5: Server component with role-based data fetching
 */
export async function InstructorDashboardServerComponent() {
  const protection = await protectServerRoute(ROUTE_PROTECTIONS.INSTRUCTOR_DASHBOARD);

  if (!protection.allowed) {
    // In a real component, you might redirect or show an error page
    return {
      error: protection.error,
      statusCode: protection.statusCode
    };
  }

  const user = protection.user!;

  // Fetch data based on user role and department
  const dashboardData = await fetchDashboardData(user);

  return {
    user,
    dashboardData
  };
}

/**
 * Example 6: Student profile access validation
 */
export async function StudentProfileServerComponent(studentId: string) {
  const protection = await protectServerRoute(ROUTE_PROTECTIONS.STUDENT_PROFILE);

  if (!protection.allowed) {
    return {
      error: protection.error,
      statusCode: protection.statusCode
    };
  }

  const user = protection.user!;

  // Additional validation: Check if instructor can access this specific student
  const canAccess = await validateStudentAccess(user, studentId);
  
  if (!canAccess) {
    return {
      error: 'Cannot access student data',
      statusCode: 403
    };
  }

  const studentData = await fetchStudentData(studentId);

  return {
    user,
    studentData
  };
}

// =============================================================================
// UTILITY FUNCTIONS (MOCK IMPLEMENTATIONS)
// =============================================================================

async function fetchDashboardData(user: any) {
  // Mock implementation - in reality, this would query the database
  // based on user role and department
  
  if (user.role === 'INSTRUCTOR') {
    // Fetch data for instructor's department only
    return {
      totalStudents: 50,
      departmentStudents: 50,
      scope: 'department'
    };
  } else {
    // Fetch system-wide data for admins
    return {
      totalStudents: 500,
      departmentStudents: null,
      scope: 'system'
    };
  }
}

async function fetchStudentData(studentId: string) {
  // Mock implementation
  return {
    id: studentId,
    name: 'John Doe',
    progress: 75,
    lastActivity: new Date().toISOString()
  };
}

async function validateStudentAccess(user: any, studentId: string): Promise<boolean> {
  // Mock implementation - in reality, this would check:
  // 1. If student exists
  // 2. If student belongs to instructor's department (for instructors)
  // 3. Any other business rules
  
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    return true; // Admins can access all students
  }

  if (user.role === 'INSTRUCTOR') {
    // Check if student is in instructor's department
    // This would typically involve a database query
    return true; // Mock: allow access
  }

  return false;
}

// =============================================================================
// MIDDLEWARE EXAMPLES
// =============================================================================

/**
 * Example 7: Custom middleware for specific routes
 */
export function createDepartmentMiddleware(allowedDepartments: string[]) {
  return withInstructorAuth(
    async (req: NextRequest, user) => {
      // Check if user's department is in the allowed list
      if (user.role === 'INSTRUCTOR' && 
          user.department && 
          !allowedDepartments.includes(user.department)) {
        return createErrorResponse('INSUFFICIENT_PERMISSIONS', 403, {
          message: `Access restricted to departments: ${allowedDepartments.join(', ')}`
        });
      }

      // If check passes, continue to the actual handler
      return NextResponse.next();
    },
    { requiredRole: 'INSTRUCTOR' }
  );
}

// =============================================================================
// ERROR HANDLING EXAMPLES
// =============================================================================

/**
 * Example 8: Comprehensive error handling in API routes
 */
export const robustAPI = withInstructorAuth(
  async (req: NextRequest, user) => {
    try {
      // Your API logic here
      const result = await performSomeOperation();
      
      return NextResponse.json({
        success: true,
        data: result
      });

    } catch (error) {
      // Log the error with context
      console.error('API Error:', {
        error: error instanceof Error ? error.message : String(error),
        user: { id: user.id, role: user.role },
        path: req.nextUrl.pathname,
        method: req.method,
        timestamp: new Date().toISOString()
      });

      // Return appropriate error response
      if (error instanceof ValidationError) {
        return createErrorResponse('VALIDATION_ERROR', 400, {
          details: error.details
        });
      }

      if (error instanceof NotFoundError) {
        return createErrorResponse('NOT_FOUND', 404);
      }

      // Generic error response
      return createErrorResponse('INTERNAL_ERROR', 500);
    }
  },
  { requiredRole: 'INSTRUCTOR' }
);

// Mock error classes
class ValidationError extends Error {
  constructor(public details: any) {
    super('Validation failed');
  }
}

class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
  }
}

async function performSomeOperation() {
  // Mock operation that might throw errors
  return { data: 'success' };
}

// =============================================================================
// TESTING UTILITIES
// =============================================================================

/**
 * Example 9: Mock user for testing
 */
export function createMockInstructorUser(overrides: Partial<any> = {}) {
  return {
    id: 'instructor_123',
    name: 'John Instructor',
    email: 'john@police.gov',
    role: 'INSTRUCTOR',
    pid: 'P123456',
    department: 'DOWNTOWN',
    badgeNumber: 'B789',
    rank: 'Sergeant',
    isActive: true,
    permissions: [
      INSTRUCTOR_PERMISSIONS.VIEW_DASHBOARD,
      INSTRUCTOR_PERMISSIONS.MANAGE_STUDENTS,
      INSTRUCTOR_PERMISSIONS.CREATE_ASSIGNMENTS
    ],
    ...overrides
  };
}

/**
 * Example 10: Mock admin user for testing
 */
export function createMockAdminUser(overrides: Partial<any> = {}) {
  return {
    id: 'admin_456',
    name: 'Jane Admin',
    email: 'jane@police.gov',
    role: 'ADMIN',
    pid: 'P456789',
    department: 'HEADQUARTERS',
    badgeNumber: 'A123',
    rank: 'Lieutenant',
    isActive: true,
    permissions: [
      // Admin permissions for development
      'admin:all'
    ],
    ...overrides
  };
}