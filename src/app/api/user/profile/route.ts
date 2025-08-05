import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { hash, compare } from 'bcryptjs'
import { prisma } from '@/lib/db'
import { createProtectedAPIHandler } from '@/lib/middleware'

// Validation schema for profile updates
const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  pid: z.string().min(3, 'Police ID must be at least 3 characters').optional(),
  badgeNumber: z.string().optional(),
  department: z.string().min(2, 'Department must be at least 2 characters').optional(),
  rank: z.string().optional(),
  phone: z.string().optional(),
})

// Validation schema for password change
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
})

async function getUserProfile(req: NextRequest, user: any) {
  try {
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        pid: true,
        badgeNumber: true,
        department: true,
        rank: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        isActive: true,
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user: profile })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

async function updateUserProfile(req: NextRequest, user: any) {
  try {
    const body = await req.json()
    
    // Check if this is a password change request
    if (body.currentPassword && body.newPassword) {
      const passwordData = changePasswordSchema.parse(body)
      
      // Get current user with password
      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { password: true }
      })
      
      if (!currentUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      
      // Verify current password
      const isCurrentPasswordValid = await compare(
        passwordData.currentPassword, 
        currentUser.password
      )
      
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }
      
      // Hash new password
      const hashedNewPassword = await hash(passwordData.newPassword, 12)
      
      // Update password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedNewPassword }
      })
      
      return NextResponse.json({ message: 'Password updated successfully' })
    }
    
    // Regular profile update
    const validatedData = updateProfileSchema.parse(body)
    
    // Check for PID conflicts
    if (validatedData.pid) {
      const existingUser = await prisma.user.findFirst({
        where: {
          pid: validatedData.pid,
          NOT: { id: user.id }
        }
      })
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Police ID already in use' },
          { status: 409 }
        )
      }
    }
    
    // Check for badge number conflicts
    if (validatedData.badgeNumber) {
      const existingUser = await prisma.user.findFirst({
        where: {
          badgeNumber: validatedData.badgeNumber,
          NOT: { id: user.id }
        }
      })
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Badge number already in use' },
          { status: 409 }
        )
      }
    }
    
    // Update profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        pid: true,
        badgeNumber: true,
        department: true,
        rank: true,
        phone: true,
        avatar: true,
        role: true,
        updatedAt: true,
      }
    })
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })
    
  } catch (error) {
    console.error('Update profile error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

async function deleteUserProfile(req: NextRequest, user: any) {
  try {
    // Soft delete user account
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        isActive: false,
        email: `deleted_${Date.now()}_${user.email}` // Prevent email conflicts
      }
    })
    
    return NextResponse.json({ message: 'Account deactivated successfully' })
    
  } catch (error) {
    console.error('Delete profile error:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate account' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const { GET, PUT, DELETE } = createProtectedAPIHandler({ GET: getUserProfile, PUT: updateUserProfile, DELETE: deleteUserProfile })