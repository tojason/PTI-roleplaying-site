'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Layout } from '@/components/layout/Layout';
import { ProgressTracker } from '@/components/ui/ProgressTracker';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { getAchievementProgress } from '@/lib/achievements';
import { useStreakCalculation } from '@/hooks/useStreakCalculation';
import { UserProgress } from '@/types';
import { safeDate, safeGetTime } from '@/lib/utils';
import { TrophyIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function ProgressPage() {
  const router = useRouter();
  const { isAuthenticated, userProgress, updateProgress, setActiveTab, quizHistory, voiceProgress, user, voicePracticeSessions } = useAppStore();
  
  // Calculate and update user streak based on actual activity
  useStreakCalculation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Set the active tab to progress when this page loads
    setActiveTab('progress');

    // Load real progress data
    loadRealProgressData();
  }, [isAuthenticated, router, setActiveTab]);

  const loadRealProgressData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to fetch from API first, fallback to local calculation
      try {
        const response = await fetch('/api/progress');
        if (response.ok) {
          const apiData = await response.json();
          const formattedProgress = formatApiProgressData(apiData);
          updateProgress(formattedProgress);
          return;
        }
      } catch (apiError) {
        console.warn('API progress fetch failed, using local calculation:', apiError);
      }
      
      // Fallback: Calculate real progress from user's actual data
      const realProgress = calculateRealProgress();
      updateProgress(realProgress);
      
    } catch (err) {
      console.error('Failed to load progress data:', err);
      setError('Failed to load progress data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRealProgress = (): UserProgress => {
    // Calculate overall accuracy from quiz history
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
        
        // Calculate duration from start/end time
        const endTime = safeDate(quiz.endTime);
        const startTime = safeDate(quiz.startTime);
        if (endTime && startTime) {
          const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60); // minutes
          totalTimeMinutes += duration;
        }
      }
    });
    
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const totalTimeHours = (totalTimeMinutes / 60).toFixed(1);
    
    // Calculate category breakdown
    const categoryBreakdown = calculateCategoryBreakdown();
    
    // Calculate weekly data from recent quiz history
    const weeklyData = calculateWeeklyData();
    
    // Calculate recent activity from quiz and voice sessions
    const recentActivity = calculateRecentActivity();
    
    return {
      overallAccuracy,
      totalCorrect,
      totalTime: `${totalTimeHours}h`,
      level: user?.level || 1,
      categoryBreakdown,
      weeklyData,
      recentActivity,
    };
  };

  const calculateCategoryBreakdown = () => {
    const categories = {
      codes: { name: '10-Codes', total: 0, correct: 0, color: '#1e40af' },
      phonetic: { name: 'Phonetic Alphabet', total: 0, correct: 0, color: '#10b981' },
      mixed: { name: 'Mixed Practice', total: 0, correct: 0, color: '#f59e0b' },
    };
    
    quizHistory.forEach(quiz => {
      const category = quiz.category || 'mixed';
      if (categories[category as keyof typeof categories] && quiz.questions && quiz.answers) {
        const correct = quiz.questions.reduce((count, question) => {
          const selectedOptionId = quiz.answers[question.id];
          const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
          return count + (selectedOption?.isCorrect ? 1 : 0);
        }, 0);
        
        categories[category as keyof typeof categories].total += quiz.questions.length;
        categories[category as keyof typeof categories].correct += correct;
      }
    });
    
    return Object.values(categories).map(cat => ({
      name: cat.name,
      accuracy: cat.total > 0 ? Math.round((cat.correct / cat.total) * 100) : 0,
      color: cat.color,
    }));
  };

  const calculateWeeklyData = () => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const weekData = days.map(day => ({ day, accuracy: 0, count: 0 }));
    
    // Get quizzes from the last 7 days
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const recentQuizzes = quizHistory.filter(quiz => {
      if (!quiz.endTime) return false;
      const endTime = safeDate(quiz.endTime);
      return endTime && endTime >= lastWeek;
    });
    
    recentQuizzes.forEach(quiz => {
      if (quiz.endTime && quiz.questions && quiz.answers) {
        const date = safeDate(quiz.endTime);
        if (!date) return;
        const dayIndex = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
        
        const correct = quiz.questions.reduce((count, question) => {
          const selectedOptionId = quiz.answers[question.id];
          const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
          return count + (selectedOption?.isCorrect ? 1 : 0);
        }, 0);
        
        const accuracy = quiz.questions.length > 0 ? (correct / quiz.questions.length) * 100 : 0;
        
        weekData[dayIndex].accuracy = (weekData[dayIndex].accuracy * weekData[dayIndex].count + accuracy) / (weekData[dayIndex].count + 1);
        weekData[dayIndex].count++;
      }
    });
    
    return weekData.map(day => ({
      day: day.day,
      accuracy: Math.round(day.accuracy),
    }));
  };

  const calculateRecentActivity = () => {
    const activities: Array<{
      date: string;
      type: string;
      accuracy: number;
      icon: string;
    }> = [];
    
    // Add recent quiz sessions
    const recentQuizzes = quizHistory
      .filter(quiz => quiz.endTime)
      .sort((a, b) => {
        const timeA = safeGetTime(a.endTime);
        const timeB = safeGetTime(b.endTime);
        return timeB - timeA;
      })
      .slice(0, 5);
    
    recentQuizzes.forEach(quiz => {
      if (quiz.questions && quiz.answers && quiz.endTime) {
        const correct = quiz.questions.reduce((count, question) => {
          const selectedOptionId = quiz.answers[question.id];
          const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
          return count + (selectedOption?.isCorrect ? 1 : 0);
        }, 0);
        
        const accuracy = quiz.questions.length > 0 ? Math.round((correct / quiz.questions.length) * 100) : 0;
        activities.push({
          date: formatDate((safeDate(quiz.endTime) || new Date()).toISOString()),
          type: `${quiz.category || 'Mixed'} Quiz`,
          accuracy,
          icon: quiz.category === 'codes' ? '📻' : quiz.category === 'phonetic' ? '🔤' : '📝',
        });
      }
    });
    
    // Add recent voice sessions
    voiceProgress.recentSessions.slice(0, 3).forEach(session => {
      activities.push({
        date: formatDate((safeDate(session.timestamp) || new Date()).toISOString()),
        type: 'Voice Practice',
        accuracy: Math.round(session.accuracy.score),
        icon: '🎤',
      });
    });
    
    return activities.slice(0, 4);
  };

  const formatApiProgressData = (apiData: any): UserProgress => {
    return {
      overallAccuracy: apiData.overall?.averageAccuracy || 0,
      totalCorrect: apiData.overall?.totalSessions || 0,
      totalTime: `${(apiData.overall?.totalTimeSpent / 3600 || 0).toFixed(1)}h`,
      level: user?.level || 1,
      categoryBreakdown: [
        {
          name: '10-Codes',
          accuracy: apiData.categories?.quiz?.breakdown?.find((b: any) => b.subcategory === 'codes')?.averageAccuracy || 0,
          color: '#1e40af'
        },
        {
          name: 'Phonetic Alphabet',
          accuracy: apiData.categories?.quiz?.breakdown?.find((b: any) => b.subcategory === 'phonetic')?.averageAccuracy || 0,
          color: '#10b981'
        },
        {
          name: 'Mixed Practice',
          accuracy: apiData.categories?.quiz?.breakdown?.find((b: any) => b.subcategory === 'mixed')?.averageAccuracy || 0,
          color: '#f59e0b'
        }
      ],
      weeklyData: formatWeeklyTrendsData(apiData.trends?.quiz || []),
      recentActivity: formatRecentActivityData(apiData.recentActivity || [])
    };
  };

  const formatWeeklyTrendsData = (trendsData: any[]) => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const weekData = days.map(day => ({ day, accuracy: 0 }));
    
    // Process trends data if available
    if (trendsData.length > 0) {
      const latestWeek = trendsData[trendsData.length - 1];
      if (latestWeek) {
        const accuracy = latestWeek.averageAccuracy || 0;
        weekData.forEach(day => {
          day.accuracy = Math.round(accuracy);
        });
      }
    }
    
    return weekData;
  };

  const formatRecentActivityData = (activityData: any[]) => {
    return activityData.slice(0, 4).map((activity: any) => ({
      date: formatDate(activity.timestamp),
      type: activity.type === 'quiz' ? `${activity.category || 'Mixed'} Quiz` : 'Voice Practice',
      accuracy: Math.round(activity.accuracy || 0),
      icon: activity.type === 'quiz' 
        ? (activity.category === 'codes' ? '📻' : activity.category === 'phonetic' ? '🔤' : '📝')
        : '🎤'
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your progress...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        showNavigation={true}
        headerProps={{
          title: 'Progress',
          showBack: true,
          onBack: () => router.push('/dashboard'),
          showMenu: true,
          showNotifications: true,
        }}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-4">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={loadRealProgressData}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!userProgress) {
    // Still show achievements even if no progress data
    const achievementProgress = user ? getAchievementProgress(user, quizHistory, voicePracticeSessions) : [];
    const unlockedAchievements = achievementProgress.filter(a => a.isUnlocked);
    const lockedAchievements = achievementProgress.filter(a => !a.isUnlocked);
    
    return (
      <Layout
        showNavigation={true}
        headerProps={{
          title: 'Progress',
          showBack: true,
          onBack: () => router.push('/dashboard'),
          showMenu: true,
          showNotifications: true,
        }}
      >
        <div className="bg-white min-h-screen">
          <div className="p-4 space-y-6 pb-20">
            {/* Achievement Section */}
            <Card padding="lg">
              <CardContent>
                <div className="flex items-center mb-4">
                  <TrophyIcon className="w-5 h-5 text-warning-600 mr-2" />
                  <CardTitle>Achievements ({unlockedAchievements.length}/{achievementProgress.length})</CardTitle>
                </div>
                
                {unlockedAchievements.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <LockClosedIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm mb-2">No achievements unlocked yet</p>
                    <p className="text-gray-400 text-xs">
                      Complete practice sessions to start earning achievements!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* No Progress Data Message */}
            <div className="text-center p-4">
              <p className="text-gray-600 mb-4">No progress data available yet.</p>
              <p className="text-sm text-gray-500">Start practicing to see your progress!</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Get achievement progress
  const achievementProgress = user ? getAchievementProgress(user, quizHistory, voicePracticeSessions) : [];
  const unlockedAchievements = achievementProgress.filter(a => a.isUnlocked);
  const lockedAchievements = achievementProgress.filter(a => !a.isUnlocked);

  return (
    <Layout 
      showNavigation={true}
      headerProps={{
        title: 'Progress',
        showBack: true,
        onBack: () => router.push('/dashboard'),
        showMenu: true,
        showNotifications: true,
      }}
    >
      <div className="bg-white min-h-screen">
        <div className="p-4 space-y-6 pb-20">
          {/* Achievement Section */}
          <Card padding="lg">
            <CardContent>
              <div className="flex items-center mb-4">
                <TrophyIcon className="w-5 h-5 text-warning-600 mr-2" />
                <CardTitle>Achievements ({unlockedAchievements.length}/{achievementProgress.length})</CardTitle>
              </div>
              
              {/* Unlocked Achievements */}
              {unlockedAchievements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Unlocked</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {unlockedAchievements.map((achievement) => (
                      <div 
                        key={achievement.id}
                        className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-3 border border-primary-200"
                      >
                        <div className="text-2xl mb-2 text-center">{achievement.icon}</div>
                        <p className="text-xs font-semibold text-primary-800 text-center mb-1">
                          {achievement.title}
                        </p>
                        <p className="text-xs text-primary-600 text-center">
                          {achievement.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Locked Achievements */}
              {lockedAchievements.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Coming Soon</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {lockedAchievements.slice(0, 4).map((achievement) => (
                      <div 
                        key={achievement.id}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200 opacity-75"
                      >
                        <div className="text-2xl mb-2 text-center filter grayscale">{achievement.icon}</div>
                        <p className="text-xs font-semibold text-gray-600 text-center mb-1">
                          {achievement.title}
                        </p>
                        <p className="text-xs text-gray-500 text-center mb-2">
                          {achievement.description}
                        </p>
                        {achievement.progress !== undefined && achievement.target && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-gray-400 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(achievement.progress, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {unlockedAchievements.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <LockClosedIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm mb-2">No achievements unlocked yet</p>
                  <p className="text-gray-400 text-xs">
                    Complete practice sessions to start earning achievements!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Progress Tracker Component */}
          {userProgress && <ProgressTracker {...userProgress} />}
        </div>
      </div>
    </Layout>
  );
}