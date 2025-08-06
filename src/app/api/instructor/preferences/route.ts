import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasRole } from '@/lib/auth-client';
import { prisma } from '@/lib/prisma';

interface InstructorPreferences {
  // Notification Preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  studentProgressAlerts: boolean;
  systemUpdates: boolean;
  weeklyReports: boolean;
  
  // Display Preferences
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  compactView: boolean;
  showAvatars: boolean;
  
  // Dashboard Preferences
  defaultDashboardTab: 'overview' | 'students' | 'analytics';
  studentsPerPage: number;
  autoRefresh: boolean;
  refreshInterval: number;
  
  // Teaching Preferences
  defaultQuizDuration: number;
  showHints: boolean;
  allowRetries: boolean;
  passingScore: number;
  
  // Privacy & Security
  showOnlineStatus: boolean;
  allowStudentMessages: boolean;
  requirePasswordChange: boolean;
  sessionTimeout: number;
  
  // Language & Locale
  language: 'en' | 'es' | 'fr';
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
}

const defaultPreferences: InstructorPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  studentProgressAlerts: true,
  systemUpdates: true,
  weeklyReports: true,
  theme: 'system',
  fontSize: 'medium',
  compactView: false,
  showAvatars: true,
  defaultDashboardTab: 'overview',
  studentsPerPage: 20,
  autoRefresh: true,
  refreshInterval: 30,
  defaultQuizDuration: 30,
  showHints: true,
  allowRetries: true,
  passingScore: 70,
  showOnlineStatus: true,
  allowStudentMessages: true,
  requirePasswordChange: false,
  sessionTimeout: 60,
  language: 'en',
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
};

// GET /api/instructor/preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(session.user.role as any, 'INSTRUCTOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Try to find existing preferences
    const userPreferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    let preferences: InstructorPreferences;

    if (userPreferences?.preferences) {
      // Parse existing preferences and merge with defaults
      preferences = {
        ...defaultPreferences,
        ...JSON.parse(userPreferences.preferences as string),
      };
    } else {
      // Use default preferences
      preferences = defaultPreferences;
    }

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Preferences fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/instructor/preferences
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
    
    // Validate the preferences structure
    const preferences: Partial<InstructorPreferences> = {};
    
    // Notification preferences
    if (typeof body.emailNotifications === 'boolean') preferences.emailNotifications = body.emailNotifications;
    if (typeof body.pushNotifications === 'boolean') preferences.pushNotifications = body.pushNotifications;
    if (typeof body.smsNotifications === 'boolean') preferences.smsNotifications = body.smsNotifications;
    if (typeof body.studentProgressAlerts === 'boolean') preferences.studentProgressAlerts = body.studentProgressAlerts;
    if (typeof body.systemUpdates === 'boolean') preferences.systemUpdates = body.systemUpdates;
    if (typeof body.weeklyReports === 'boolean') preferences.weeklyReports = body.weeklyReports;
    
    // Display preferences
    if (['light', 'dark', 'system'].includes(body.theme)) preferences.theme = body.theme;
    if (['small', 'medium', 'large'].includes(body.fontSize)) preferences.fontSize = body.fontSize;
    if (typeof body.compactView === 'boolean') preferences.compactView = body.compactView;
    if (typeof body.showAvatars === 'boolean') preferences.showAvatars = body.showAvatars;
    
    // Dashboard preferences
    if (['overview', 'students', 'analytics'].includes(body.defaultDashboardTab)) {
      preferences.defaultDashboardTab = body.defaultDashboardTab;
    }
    if (typeof body.studentsPerPage === 'number' && body.studentsPerPage > 0 && body.studentsPerPage <= 100) {
      preferences.studentsPerPage = body.studentsPerPage;
    }
    if (typeof body.autoRefresh === 'boolean') preferences.autoRefresh = body.autoRefresh;
    if (typeof body.refreshInterval === 'number' && body.refreshInterval >= 10 && body.refreshInterval <= 300) {
      preferences.refreshInterval = body.refreshInterval;
    }
    
    // Teaching preferences
    if (typeof body.defaultQuizDuration === 'number' && body.defaultQuizDuration >= 5 && body.defaultQuizDuration <= 180) {
      preferences.defaultQuizDuration = body.defaultQuizDuration;
    }
    if (typeof body.showHints === 'boolean') preferences.showHints = body.showHints;
    if (typeof body.allowRetries === 'boolean') preferences.allowRetries = body.allowRetries;
    if (typeof body.passingScore === 'number' && body.passingScore >= 50 && body.passingScore <= 100) {
      preferences.passingScore = body.passingScore;
    }
    
    // Privacy & Security
    if (typeof body.showOnlineStatus === 'boolean') preferences.showOnlineStatus = body.showOnlineStatus;
    if (typeof body.allowStudentMessages === 'boolean') preferences.allowStudentMessages = body.allowStudentMessages;
    if (typeof body.requirePasswordChange === 'boolean') preferences.requirePasswordChange = body.requirePasswordChange;
    if (typeof body.sessionTimeout === 'number' && [30, 60, 120, 240, 480].includes(body.sessionTimeout)) {
      preferences.sessionTimeout = body.sessionTimeout;
    }
    
    // Language & Locale
    if (['en', 'es', 'fr'].includes(body.language)) preferences.language = body.language;
    if (typeof body.timezone === 'string') preferences.timezone = body.timezone;
    if (['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].includes(body.dateFormat)) {
      preferences.dateFormat = body.dateFormat;
    }
    if (['12h', '24h'].includes(body.timeFormat)) preferences.timeFormat = body.timeFormat;

    // Upsert user preferences
    await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        preferences: JSON.stringify(preferences),
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        preferences: JSON.stringify(preferences),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences,
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/instructor/preferences - Reset to defaults
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(session.user.role as any, 'INSTRUCTOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete existing preferences (this will cause GET to return defaults)
    await prisma.userPreferences.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Preferences reset to defaults',
      preferences: defaultPreferences,
    });
  } catch (error) {
    console.error('Preferences reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}