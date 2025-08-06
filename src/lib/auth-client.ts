// Client-safe authentication utilities
// This file can be safely imported in client components

export type UserRole = 'USER' | 'INSTRUCTOR' | 'ADMIN' | 'SUPER_ADMIN';

/**
 * Client-safe role hierarchy checking
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    USER: 0,
    INSTRUCTOR: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Enhanced role checking with additional context
 */
export function hasRoleWithContext(
  userRole: UserRole, 
  requiredRole: UserRole,
  context?: {
    userDepartment?: string
    targetDepartment?: string
    resourceOwnerId?: string
    userId?: string
  }
): boolean {
  // Check basic role hierarchy first
  if (!hasRole(userRole, requiredRole)) {
    return false
  }
  
  // If no context provided, basic role check is sufficient
  if (!context) {
    return true
  }
  
  // Super admins always have access
  if (userRole === 'SUPER_ADMIN') {
    return true
  }
  
  // Admins have access unless specifically restricted
  if (userRole === 'ADMIN') {
    return true
  }
  
  // Instructors need department or ownership validation
  if (userRole === 'INSTRUCTOR') {
    // Check department match if departments are provided
    if (context.userDepartment && context.targetDepartment) {
      if (context.userDepartment !== context.targetDepartment) {
        return false
      }
    }
    
    // Check resource ownership if provided
    if (context.resourceOwnerId && context.userId) {
      if (context.resourceOwnerId !== context.userId) {
        return false
      }
    }
  }
  
  return true
}

export function canAccessResource(userRole: UserRole, resourceOwner: string, userId: string): boolean {
  // Super admins and admins can access everything
  if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
    return true
  }
  
  // Instructors can access their department's resources (implement department logic)
  if (userRole === 'INSTRUCTOR') {
    // TODO: Implement department-based access control
    return true
  }
  
  // Users can only access their own resources
  return resourceOwner === userId
}

export function canManageUsers(userRole: UserRole): boolean {
  return userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'
}

export function canCreateQuizzes(userRole: UserRole): boolean {
  return userRole === 'INSTRUCTOR' || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'
}

export function canViewAllProgress(userRole: UserRole): boolean {
  return userRole === 'INSTRUCTOR' || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'
}

export function canModifySystemSettings(userRole: UserRole): boolean {
  return userRole === 'SUPER_ADMIN'
}

// Instructor-specific authorization functions
export function isInstructor(userRole: UserRole): boolean {
  return hasRole(userRole, 'INSTRUCTOR')
}

export function canAccessInstructorDashboard(userRole: UserRole): boolean {
  return hasRole(userRole, 'INSTRUCTOR')
}

export function canManageStudents(userRole: UserRole): boolean {
  return hasRole(userRole, 'INSTRUCTOR')
}

export function canCreateAssignments(userRole: UserRole): boolean {
  return hasRole(userRole, 'INSTRUCTOR')
}

export function canViewAnalytics(userRole: UserRole): boolean {
  return hasRole(userRole, 'INSTRUCTOR')
}

export function canSendMessages(userRole: UserRole): boolean {
  return hasRole(userRole, 'INSTRUCTOR')
}

export function canGenerateReports(userRole: UserRole): boolean {
  return hasRole(userRole, 'INSTRUCTOR')
}

export function canManageInstructors(userRole: UserRole): boolean {
  return hasRole(userRole, 'ADMIN')
}

export function canAccessDepartmentSettings(userRole: UserRole): boolean {
  return hasRole(userRole, 'ADMIN')
}

export function canAccessSystemManagement(userRole: UserRole): boolean {
  return userRole === 'SUPER_ADMIN'
}