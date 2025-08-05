import { User, Achievement, QuizSession, VoicePracticeSession } from '@/types';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  emoji: string;
  condition: (user: User, quizHistory: QuizSession[], voiceSessions: VoicePracticeSession[]) => boolean;
  progress?: (user: User, quizHistory: QuizSession[], voiceSessions: VoicePracticeSession[]) => number;
  target?: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete your first practice session',
    emoji: '📚',
    condition: (user, quizHistory) => quizHistory.length >= 1,
    progress: (user, quizHistory) => quizHistory.length >= 1 ? 100 : 0,
    target: 1
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day practice streak',
    emoji: '🏅',
    condition: (user) => user.streak >= 7,
    progress: (user) => Math.min((user.streak / 7) * 100, 100),
    target: 7
  },
  {
    id: 'ace_quiz',
    title: 'Ace Quiz',
    description: 'Score 90% or higher on any quiz',
    emoji: '🎯',
    condition: (user) => user.overallAccuracy >= 90,
    progress: (user) => Math.min((user.overallAccuracy / 90) * 100, 100),
    target: 90
  },
  {
    id: 'perfect_score',
    title: 'Perfect Score',
    description: 'Get 100% on any quiz',
    emoji: '💯',
    condition: (user, quizHistory) => {
      return quizHistory.some(quiz => {
        if (!quiz.questions || !quiz.answers) return false;
        const totalQuestions = quiz.questions.length;
        const correctAnswers = quiz.questions.reduce((count, question) => {
          const selectedOptionId = quiz.answers[question.id];
          const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
          return count + (selectedOption?.isCorrect ? 1 : 0);
        }, 0);
        return (correctAnswers / totalQuestions) === 1;
      });
    },
    progress: (user, quizHistory) => {
      const perfectQuiz = quizHistory.find(quiz => {
        if (!quiz.questions || !quiz.answers) return false;
        const totalQuestions = quiz.questions.length;
        const correctAnswers = quiz.questions.reduce((count, question) => {
          const selectedOptionId = quiz.answers[question.id];
          const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
          return count + (selectedOption?.isCorrect ? 1 : 0);
        }, 0);
        return (correctAnswers / totalQuestions) === 1;
      });
      return perfectQuiz ? 100 : Math.min(user.overallAccuracy, 100);
    },
    target: 100
  },
  {
    id: 'voice_pro',
    title: 'Voice Pro',
    description: 'Complete 5 voice practice sessions',
    emoji: '🎤',
    condition: (user, quizHistory, voiceSessions) => voiceSessions.length >= 5,
    progress: (user, quizHistory, voiceSessions) => Math.min((voiceSessions.length / 5) * 100, 100),
    target: 5
  },
  {
    id: 'rising_star',
    title: 'Rising Star',
    description: 'Reach Level 3',
    emoji: '⭐',
    condition: (user) => user.level >= 3,
    progress: (user) => Math.min((user.level / 3) * 100, 100),
    target: 3
  },
  {
    id: 'hot_streak',
    title: 'Hot Streak',
    description: 'Maintain a 3-day practice streak',
    emoji: '🔥',
    condition: (user) => user.streak >= 3,
    progress: (user) => Math.min((user.streak / 3) * 100, 100),
    target: 3
  },
  {
    id: 'study_master',
    title: 'Study Master',
    description: 'Complete 10 practice sessions',
    emoji: '🎓',
    condition: (user, quizHistory) => quizHistory.length >= 10,
    progress: (user, quizHistory) => Math.min((quizHistory.length / 10) * 100, 100),
    target: 10
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Answer 100 questions correctly',
    emoji: '💪',
    condition: (user) => user.totalCorrect >= 100,
    progress: (user) => Math.min((user.totalCorrect / 100) * 100, 100),
    target: 100
  },
  {
    id: 'streak_master',
    title: 'Streak Master',
    description: 'Maintain a 14-day practice streak',
    emoji: '🏆',
    condition: (user) => user.streak >= 14,
    progress: (user) => Math.min((user.streak / 14) * 100, 100),
    target: 14
  }
];

export function calculateUserAchievements(
  user: User,
  quizHistory: QuizSession[],
  voiceSessions: VoicePracticeSession[]
): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS
    .filter(def => def.condition(user, quizHistory, voiceSessions))
    .map(def => ({
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.emoji,
      unlockedAt: new Date(), // In a real app, this would be stored
      progress: 100,
      target: def.target
    }));
}

export function getAchievementProgress(
  user: User,
  quizHistory: QuizSession[],
  voiceSessions: VoicePracticeSession[]
): Array<Achievement & { isUnlocked: boolean }> {
  return ACHIEVEMENT_DEFINITIONS.map(def => {
    const isUnlocked = def.condition(user, quizHistory, voiceSessions);
    const progress = def.progress ? def.progress(user, quizHistory, voiceSessions) : (isUnlocked ? 100 : 0);
    
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.emoji,
      progress,
      target: def.target,
      isUnlocked,
      unlockedAt: isUnlocked ? new Date() : undefined
    };
  });
}

export function getRecentAchievements(
  user: User,
  quizHistory: QuizSession[],
  voiceSessions: VoicePracticeSession[],
  limit: number = 4
): Achievement[] {
  return calculateUserAchievements(user, quizHistory, voiceSessions)
    .slice(-limit); // Get the most recent achievements
}