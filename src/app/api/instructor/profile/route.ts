import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasRole } from '@/lib/auth-client';
import { prisma } from '@/lib/prisma';

// GET /api/instructor/profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(session.user.role as any, 'INSTRUCTOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        rank: true,
        badgeNumber: true,
        pid: true,
        yearsOfExperience: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        emergencyContact: true,
        emergencyPhone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/instructor/profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(session.user.role as any, 'INSTRUCTOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      phone,
      department,
      rank,
      badgeNumber,
      pid,
      yearsOfExperience,
      address,
      city,
      state,
      zipCode,
      emergencyContact,
      emergencyPhone,
    } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!department?.trim()) {
      return NextResponse.json(
        { error: 'Department is required' },
        { status: 400 }
      );
    }

    if (!pid?.trim()) {
      return NextResponse.json(
        { error: 'Police ID (PID) is required' },
        { status: 400 }
      );
    }

    // Validate years of experience
    const yearsNum = yearsOfExperience ? parseInt(yearsOfExperience) : null;
    if (yearsNum !== null && (yearsNum < 0 || yearsNum > 50)) {
      return NextResponse.json(
        { error: 'Years of experience must be between 0 and 50' },
        { status: 400 }
      );
    }

    // Validate phone numbers (basic validation)
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (phone && !phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    if (emergencyPhone && !phoneRegex.test(emergencyPhone)) {
      return NextResponse.json(
        { error: 'Invalid emergency contact phone number format' },
        { status: 400 }
      );
    }

    // Check if PID is already used by another user
    const existingPidUser = await prisma.user.findFirst({
      where: {
        pid: pid,
        id: { not: session.user.id },
      },
    });

    if (existingPidUser) {
      return NextResponse.json(
        { error: 'This PID is already in use by another user' },
        { status: 400 }
      );
    }

    // Check if badge number is already used by another user (if provided)
    if (badgeNumber) {
      const existingBadgeUser = await prisma.user.findFirst({
        where: {
          badgeNumber: badgeNumber,
          id: { not: session.user.id },
        },
      });

      if (existingBadgeUser) {
        return NextResponse.json(
          { error: 'This badge number is already in use by another user' },
          { status: 400 }
        );
      }
    }

    // Update the user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        department: department.trim(),
        rank: rank?.trim() || null,
        badgeNumber: badgeNumber?.trim() || null,
        pid: pid.trim(),
        yearsOfExperience: yearsNum,
        address: address?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        zipCode: zipCode?.trim() || null,
        emergencyContact: emergencyContact?.trim() || null,
        emergencyPhone: emergencyPhone?.trim() || null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        rank: true,
        badgeNumber: true,
        pid: true,
        yearsOfExperience: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        emergencyContact: true,
        emergencyPhone: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'PID or badge number already exists' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}