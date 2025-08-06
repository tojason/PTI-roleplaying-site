import 'server-only'
import { NextAuthOptions, User } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from './db-server'
// UserRole type will be generated from Prisma schema
type UserRole = 'USER' | 'INSTRUCTOR' | 'ADMIN' | 'SUPER_ADMIN'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      pid: string
      badgeNumber?: string
      department?: string
      rank?: string
    }
  }
  
  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    pid: string
    badgeNumber?: string
    department?: string
    rank?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    pid: string
    badgeNumber?: string
    department?: string
    rank?: string
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        pid: { label: 'Police ID', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.pid || !credentials?.password) {
          throw new Error('Police ID and password are required')
        }

        try {
          // Development mode - allow mock instructor login
          if (process.env.NODE_ENV === 'development') {
            // Mock instructor credentials for development
            const mockInstructors = [
              {
                pid: 'INS001',
                password: 'instructor123',
                id: 'mock-instructor-1',
                email: 'instructor@department.gov',
                name: 'Officer Sarah Rodriguez',
                role: 'INSTRUCTOR' as const,
                badgeNumber: 'MPD-2024',
                department: 'Metro Police Department',
                rank: 'Sergeant'
              },
              {
                pid: credentials.pid, // Allow any PID in development
                password: 'dev123',
                id: 'dev-instructor-' + credentials.pid,
                email: `${credentials.pid}@department.gov`,
                name: `Instructor ${credentials.pid}`,
                role: 'INSTRUCTOR' as const,
                badgeNumber: 'DEV-001',
                department: 'Development Department',
                rank: 'Officer'
              }
            ];

            // Check for specific predefined instructor first
            let mockUser = mockInstructors.find(u => 
              u.pid === credentials.pid && u.password === credentials.password
            );
            
            // If not found, allow any PID with dev123 password
            if (!mockUser && credentials.password === 'dev123') {
              mockUser = {
                pid: credentials.pid,
                password: 'dev123',
                id: 'dev-instructor-' + credentials.pid,
                email: `${credentials.pid}@department.gov`,
                name: `Instructor ${credentials.pid}`,
                role: 'INSTRUCTOR' as const,
                badgeNumber: 'DEV-001',
                department: 'Development Department',
                rank: 'Officer'
              };
            }

            if (mockUser) {
              return {
                id: mockUser.id,
                email: mockUser.email,
                name: mockUser.name,
                role: mockUser.role,
                pid: mockUser.pid,
                badgeNumber: mockUser.badgeNumber,
                department: mockUser.department,
                rank: mockUser.rank,
              };
            }
          }

          // Production mode - use database
          // Find user by PID
          const user = await prisma.user.findFirst({
            where: {
              pid: credentials.pid
            }
          })

          if (!user) {
            throw new Error('No user found with this Police ID')
          }

          if (!user.isActive) {
            throw new Error('Account is deactivated')
          }

          // Verify password
          const isPasswordValid = await compare(credentials.password, user.password)

          if (!isPasswordValid) {
            throw new Error('Invalid password')
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            pid: user.pid,
            badgeNumber: user.badgeNumber || undefined,
            department: user.department || undefined,
            rank: user.rank || undefined,
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days (will be overridden in callbacks)
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days (will be overridden in callbacks)
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.pid = user.pid
        token.badgeNumber = user.badgeNumber
        token.department = user.department
        token.rank = user.rank
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        token.name = session.name || token.name
        token.email = session.email || token.email
        token.pid = session.pid || token.pid
        token.badgeNumber = session.badgeNumber || token.badgeNumber
        token.department = session.department || token.department
        token.rank = session.rank || token.rank
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.pid = token.pid
        session.user.badgeNumber = token.badgeNumber
        session.user.department = token.department
        session.user.rank = token.rank
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // If url is relative, make it absolute
      if (url.startsWith('/')) {
        url = `${baseUrl}${url}`;
      }
      
      // Only allow redirects to same origin
      try {
        const redirectUrl = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        
        if (redirectUrl.origin !== baseUrlObj.origin) {
          // For security, only redirect within same origin
          return baseUrl;
        }
      } catch {
        // Invalid URL, use default redirect
        return baseUrl;
      }
      
      // For development, allow all same-origin redirects
      return url;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User ${user.name} (${user.pid}) signed in`)
    },
    async signOut({ session, token }) {
      console.log(`User signed out`)
    },
    async createUser({ user }) {
      console.log(`New user created: ${user.name} (${user.pid})`)
    }
  },
  debug: process.env.NODE_ENV === 'development',
}

// Helper functions for authorization
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    USER: 0,
    INSTRUCTOR: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// Enhanced role checking with additional context
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

// Department-based access control
export function canAccessDepartmentData(
  userRole: UserRole, 
  userDepartment: string | undefined, 
  targetDepartment: string
): boolean {
  // Super admins and admins can access all departments
  if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
    return true
  }
  
  // Instructors can only access their own department
  if (userRole === 'INSTRUCTOR') {
    return userDepartment === targetDepartment
  }
  
  return false
}

// Student access control for instructors
export function canAccessStudentData(
  userRole: UserRole,
  userDepartment: string | undefined,
  studentDepartment: string,
  studentId?: string,
  assignedStudents?: string[]
): boolean {
  // Super admins and admins can access all students
  if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
    return true
  }
  
  // Instructors can access students in their department
  if (userRole === 'INSTRUCTOR') {
    // Check department match
    const departmentMatch = userDepartment === studentDepartment
    
    // If specific student list is provided, check assignment
    if (assignedStudents && studentId) {
      return departmentMatch && assignedStudents.includes(studentId)
    }
    
    return departmentMatch
  }
  
  return false
}

// Assignment permission control
export function canAccessAssignment(
  userRole: UserRole,
  userDepartment: string | undefined,
  assignmentDepartment: string,
  assignmentCreatorId?: string,
  userId?: string
): boolean {
  // Super admins and admins can access all assignments
  if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
    return true
  }
  
  // Instructors can access assignments in their department
  if (userRole === 'INSTRUCTOR') {
    const departmentMatch = userDepartment === assignmentDepartment
    
    // If creator info is provided, check if they created it
    if (assignmentCreatorId && userId) {
      return departmentMatch && (assignmentCreatorId === userId)
    }
    
    return departmentMatch
  }
  
  return false
}

// Route-specific permission functions
export function getInstructorRoutePermissions(userRole: UserRole): string[] {
  const baseRoutes = []
  
  if (hasRole(userRole, 'INSTRUCTOR')) {
    baseRoutes.push(
      '/instructor/dashboard',
      '/instructor/students',
      '/instructor/analytics',
      '/instructor/assignments',
      '/instructor/reports',
      '/instructor/messages',
      '/instructor/settings'
    )
  }
  
  if (hasRole(userRole, 'ADMIN')) {
    baseRoutes.push(
      '/instructor/manage',
      '/instructor/departments'
    )
  }
  
  if (userRole === 'SUPER_ADMIN') {
    baseRoutes.push(
      '/instructor/system'
    )
  }
  
  return baseRoutes
}

// Session validation for instructors
export function validateInstructorSession(session: any): boolean {
  if (!session?.user) return false
  
  const { user } = session
  
  // Check required fields
  if (!user.id || !user.pid || !user.role) return false
  
  // Check if user has instructor privileges
  if (!hasRole(user.role, 'INSTRUCTOR')) return false
  
  // Check if account is active (if this field exists)
  // This would need to be added to the session if account status tracking is needed
  
  return true
}

// Token validation for API routes
export function validateInstructorToken(token: any): boolean {
  if (!token) return false
  
  // Check required fields
  if (!token.id || !token.pid || !token.role) return false
  
  // Check if user has instructor privileges
  if (!hasRole(token.role, 'INSTRUCTOR')) return false
  
  return true
}

// Helper function to get role-based default route
function getRoleBasedDefaultRoute(userRole: UserRole, baseUrl: string): string {
  switch (userRole) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
    case 'INSTRUCTOR':
      return `${baseUrl}/instructor/dashboard`;
    case 'USER':
    default:
      return `${baseUrl}/dashboard`;
  }
}