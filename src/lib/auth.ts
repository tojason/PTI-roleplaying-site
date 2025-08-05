import { NextAuthOptions, User } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from './db'
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
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
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