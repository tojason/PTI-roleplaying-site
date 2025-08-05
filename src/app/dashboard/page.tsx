'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/store/useAppStore';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getStreakMessage, safeDate } from '@/lib/utils';
import { getRecentAchievements } from '@/lib/achievements';
import { useStreakCalculation } from '@/hooks/useStreakCalculation';
import { OnboardingTutorial, useOnboardingTutorial } from '@/components/ui/OnboardingTutorial';
import { TutorialDemo } from '@/components/ui/TutorialDemo';
import { TutorialDebugger } from '@/components/ui/TutorialDebugger';
import { PositionTest } from '@/components/debug/PositionTest';
import { initTutorialDebug } from '@/utils/tutorialDebugUtils';
import { 
  FireIcon, 
  AcademicCapIcon,
  TrophyIcon,
  ChartBarIcon,
  ClockIcon,
  StarIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { user, isAuthenticated, login, setActiveTab, quizHistory, voiceProgress } = useAppStore();
  
  // Calculate and update user streak based on actual activity
  useStreakCalculation();
  
  // Initialize onboarding tutorial
  const { showTutorial, handleComplete, handleSkip } = useOnboardingTutorial();

  // Initialize debug helpers (development only)
  useEffect(() => {
    initTutorialDebug();
  }, []);

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session) {
      router.push('/login');
      return;
    }

    // Set the active tab to dashboard when this page loads
    setActiveTab('dashboard');

    // Sync NextAuth session with Zustand store
    if (session.user && (!isAuthenticated || !user)) {
      // Calculate real stats from quiz history
      const totalQuizzes = quizHistory.length;
      let totalCorrect = 0;
      let totalQuestions = 0;
      let totalTimeMinutes = 0;
      
      quizHistory.forEach(quiz => {
        if (quiz.questions && quiz.answers && quiz.endTime) {
          const correct = quiz.questions.reduce((count, question) => {
            const selectedOptionId = quiz.answers[question.id];
            const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
            return count + (selectedOption?.isCorrect ? 1 : 0);
          }, 0);
          
          totalCorrect += correct;
          totalQuestions += quiz.questions.length;
          
          const endTime = safeDate(quiz.endTime);
          const startTime = safeDate(quiz.startTime);
          if (endTime && startTime) {
            const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
            totalTimeMinutes += duration;
          }
        }
      });
      
      const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
      const totalTimeHours = (totalTimeMinutes / 60).toFixed(1);
      
      const storeUser = {
        id: session.user.id,
        pid: session.user.pid,
        name: session.user.name,
        department: session.user.department || 'Unknown Department',
        experienceLevel: 'rookie' as const,
        level: Math.floor(totalQuizzes / 5) + 1, // Level up every 5 quizzes
        streak: 0, // Will be calculated by useStreakCalculation hook
        totalCorrect,
        totalTime: `${totalTimeHours}h`,
        overallAccuracy,
      };
      login(storeUser);
    }
  }, [session, status, isAuthenticated, user, login, router, setActiveTab]);

  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!session || !user) {
    return null; // Will redirect to login
  }

  // Get recent achievements using the shared utility
  const recentAchievements = getRecentAchievements(user, quizHistory, voiceProgress.recentSessions, 4);

  const streakMessage = getStreakMessage(user.streak);

  return (
    <Layout 
      headerProps={{
        title: 'Police Training',
        showMenu: true,
        showNotifications: true,
        notificationCount: 3,
      }}
    >
      <div className="p-4 space-y-6" data-tutorial="dashboard-overview">
        {/* Practice Streak Card */}
        <Card variant="progress" padding="lg" className="text-center" data-tutorial="progress-streak">
          <div className="flex justify-center mb-3">
            <FireIcon className="w-8 h-8 text-warning-600" />
          </div>
          <CardTitle className="text-primary-900 mb-2">Practice Streak</CardTitle>
          <div className="text-3xl font-bold text-primary-800 mb-2">
            {user.streak} Days
          </div>
          <p className="text-sm text-primary-700">{streakMessage}</p>
        </Card>

        {/* Today's Recommended Practice */}
        <Card padding="lg">
          <CardContent>
            <CardTitle className="mb-4">Today's Recommended Practice</CardTitle>
            
            <div className="bg-primary-50 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <AcademicCapIcon className="w-5 h-5 text-primary-700 mr-2" />
                <span className="font-semibold text-primary-900">10-Codes Review</span>
              </div>
              <p className="text-sm text-primary-800 mb-3">
                5 minutes • Mixed difficulty
              </p>
              <Link href="/practice/codes">
                <Button className="w-full">
                  Start Practice
                </Button>
              </Link>
            </div>

            {/* Voice Practice Option */}
            <div className="bg-info-50 rounded-lg p-4" data-tutorial="voice-practice">
              <div className="flex items-center mb-2">
                <MicrophoneIcon className="w-5 h-5 text-info-700 mr-2" />
                <span className="font-semibold text-info-900">Voice Training</span>
              </div>
              <p className="text-sm text-info-800 mb-3">
                Practice radio communication with voice recognition
              </p>
              <Link href="/practice/voice">
                <Button variant="secondary" className="w-full">
                  Try Voice Practice
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card padding="lg">
          <CardContent>
            <CardTitle className="mb-4">Quick Stats</CardTitle>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <ChartBarIcon className="w-5 h-5 text-primary-600 mr-1" />
                  <span className="text-2xl font-bold text-gray-900">
                    {user.overallAccuracy}%
                  </span>
                </div>
                <p className="text-sm text-gray-600">Accuracy</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrophyIcon className="w-5 h-5 text-success-600 mr-1" />
                  <span className="text-2xl font-bold text-gray-900">
                    {user.totalCorrect}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Correct</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <ClockIcon className="w-5 h-5 text-info-600 mr-1" />
                  <span className="text-2xl font-bold text-gray-900">
                    {user.totalTime}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <StarIcon className="w-5 h-5 text-warning-600 mr-1" />
                  <span className="text-2xl font-bold text-gray-900">
                    Level {user.level}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Current</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card padding="lg">
          <CardContent>
            <CardTitle className="mb-4">Recent Achievements</CardTitle>
            {recentAchievements.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {recentAchievements.map((achievement) => (
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
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">Complete quizzes to unlock achievements!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Practice */}
        <Card padding="lg" data-tutorial="practice-modes">
          <CardContent>
            <CardTitle className="mb-4">Quick Practice</CardTitle>
            <div className="grid grid-cols-3 gap-3">
              <Link href="/practice/codes">
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  10-Codes
                </Button>
              </Link>
              <Link href="/practice/phonetic">
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  Phonetic
                </Button>
              </Link>
              <Link href="/practice/mixed">
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  Mixed
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Tutorial */}
      <OnboardingTutorial
        isOpen={showTutorial}
        onComplete={handleComplete}
        onSkip={handleSkip}
      />

      {/* Tutorial Demo (Development Only) */}
      <TutorialDemo />
      
      {/* Debug Panel (Development Only) */}
      <TutorialDebugger />
      
      {/* Position Test (Development Only) */}
      <PositionTest />
    </Layout>
  );
}