import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { QuizSession, VoicePracticeSession } from '@/types';
import { safeDate } from '@/lib/utils';

export function useStreakCalculation() {
  const { user, quizHistory, voicePracticeSessions, setUser } = useAppStore();

  useEffect(() => {
    if (!user) return;

    const calculateStreak = () => {
      // Combine quiz sessions and voice sessions into a single activity array
      const activities: Date[] = [];
      
      // Add quiz completion dates
      quizHistory.forEach(quiz => {
        if (quiz.endTime) {
          const endTime = safeDate(quiz.endTime);
          if (endTime) {
            activities.push(endTime);
          }
        }
      });
      
      // Add voice session dates
      voicePracticeSessions.forEach(session => {
        const timestamp = safeDate(session.timestamp);
        if (timestamp) {
          activities.push(timestamp);
        }
      });
      
      if (activities.length === 0) {
        return 0;
      }
      
      // Sort activities by date (most recent first)
      activities.sort((a, b) => b.getTime() - a.getTime());
      
      // Get unique days (remove multiple activities on same day)
      const uniqueDays = new Set();
      const dailyActivities: Date[] = [];
      
      activities.forEach(date => {
        const dayKey = date.toDateString();
        if (!uniqueDays.has(dayKey)) {
          uniqueDays.add(dayKey);
          dailyActivities.push(date);
        }
      });
      
      // Sort unique days (most recent first)
      dailyActivities.sort((a, b) => b.getTime() - a.getTime());
      
      // Calculate current streak
      let streak = 0;
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0); // Start of yesterday
      
      // Check if user practiced today or yesterday to start counting streak
      const mostRecentActivity = dailyActivities[0];
      if (!mostRecentActivity) return 0;
      
      // If most recent activity is today or yesterday, start counting
      if (mostRecentActivity >= yesterday) {
        let currentDate = new Date(today);
        currentDate.setHours(0, 0, 0, 0); // Start of current day being checked
        
        for (const activityDate of dailyActivities) {
          const activityDay = new Date(activityDate);
          activityDay.setHours(0, 0, 0, 0);
          
          // If activity is on the current day we're checking
          if (activityDay.getTime() === currentDate.getTime()) {
            streak++;
            // Move to previous day
            currentDate.setDate(currentDate.getDate() - 1);
          } else if (activityDay.getTime() < currentDate.getTime()) {
            // Gap found, break the streak
            break;
          }
          // If activity is in the future (shouldn't happen), skip it
        }
      }
      
      return streak;
    };

    const newStreak = calculateStreak();
    
    // Only update if streak has changed
    if (user.streak !== newStreak) {
      setUser({
        ...user,
        streak: newStreak
      });
    }
  }, [user, quizHistory, voicePracticeSessions, setUser]);
}