'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { calculateUserAchievements, getAchievementProgress } from '@/lib/achievements';
import { useStreakCalculation } from '@/hooks/useStreakCalculation';
import { 
  UserCircleIcon,
  TrophyIcon,
  CogIcon,
  BookOpenIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, quizHistory, voicePracticeSessions } = useAppStore();
  
  // Calculate and update user streak based on actual activity
  useStreakCalculation();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Calculate real achievements based on user progress
  const userAchievements = user ? calculateUserAchievements(user, quizHistory, voicePracticeSessions) : [];
  const achievementProgress = user ? getAchievementProgress(user, quizHistory, voicePracticeSessions) : [];
  
  // Get unlocked achievements for display (limit to 6 for the grid)
  const displayAchievements = userAchievements.slice(0, 6);

  const settingsOptions = [
    { label: 'Personal Information', href: '/profile/personal' },
    { label: 'Notification Preferences', href: '/profile/notifications' },
    { label: 'Practice Reminders', href: '/profile/reminders' },

    { label: 'Privacy & Security', href: '/profile/privacy' },
  ];

  const supportOptions = [
    { label: 'How to Use App', href: '/help/guide' },
    { label: 'Contact Support', href: '/help/contact' },
    { label: 'Report a Problem', href: '/help/report' },
    { label: 'App Version 1.2.0', href: null },
  ];

  return (
    <Layout 
      headerProps={{
        title: 'Profile',
        showBack: true,
        onBack: () => router.push('/dashboard'),
      }}
    >
      <div className="p-4 space-y-6">
        {/* User Info Card */}
        <Card padding="lg" className="text-center">
          <CardContent>
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Profile photo" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircleIcon className="w-12 h-12 text-primary-600" />
              )}
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {user.name}
            </h2>
            <p className="text-gray-600 mb-1">{user.department}</p>
            <p className="text-sm text-gray-500">
              {user.experienceLevel.charAt(0).toUpperCase() + user.experienceLevel.slice(1)} • Level {user.level}
            </p>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card padding="lg">
          <CardContent>
            <div className="flex items-center mb-4">
              <TrophyIcon className="w-5 h-5 text-warning-600 mr-2" />
              <CardTitle>Achievements</CardTitle>
            </div>
            
            {displayAchievements.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {displayAchievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-3 text-center border border-primary-200"
                  >
                    <div className="text-2xl mb-1">{achievement.icon}</div>
                    <p className="text-xs font-medium text-primary-800">
                      {achievement.title}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrophyIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm mb-2">No achievements yet</p>
                <p className="text-gray-400 text-xs">
                  Complete practice sessions to unlock achievements!
                </p>
              </div>
            )}
            
            <Button 
              variant="ghost" 
              className="w-full text-sm"
              onClick={() => router.push('/progress')}
            >
              View Progress ({userAchievements.length})
            </Button>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card padding="lg">
          <CardContent>
            <div className="flex items-center mb-4">
              <CogIcon className="w-5 h-5 text-gray-600 mr-2" />
              <CardTitle>Settings</CardTitle>
            </div>
            
            <div className="space-y-1">
              {settingsOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => option.href && router.push(option.href)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <span className="text-gray-700">{option.label}</span>
                  <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card padding="lg">
          <CardContent>
            <div className="flex items-center mb-4">
              <BookOpenIcon className="w-5 h-5 text-gray-600 mr-2" />
              <CardTitle>Support</CardTitle>
            </div>
            
            <div className="space-y-1">
              {supportOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => option.href && router.push(option.href)}
                  className={`w-full flex items-center justify-between p-3 text-left rounded-lg transition-colors duration-200 ${
                    option.href ? 'hover:bg-gray-50' : ''
                  }`}
                  disabled={!option.href}
                >
                  <span className={option.href ? 'text-gray-700' : 'text-gray-500'}>
                    {option.label}
                  </span>
                  {option.href && (
                    <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <div className="pb-6">
          <Button 
            variant="error" 
            onClick={handleLogout}
            className="w-full"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </Layout>
  );
}