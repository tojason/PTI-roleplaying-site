import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, QuizSession, UserProgress, Achievement, VoicePracticeSession, VoiceSettings, VoiceAccuracyResult } from '@/types';

// User Settings Types
interface PrivacySettings {
  dataSharing: boolean;
  analyticsOptIn: boolean;
  performanceTracking: boolean;
  profileVisibility: 'private' | 'department' | 'public';
  crashReporting: boolean;
}

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  practiceReminders: boolean;
  achievementAlerts: boolean;
  weeklyReports: boolean;
  systemUpdates: boolean;
  quietHours: {
    start: string;
    end: string;
  };
  soundProfile: string;
  tutorialCompleted?: boolean;
  tutorialSkipped?: boolean;
}

interface DepartmentSettings {
  customCodes: boolean;
  voiceProtocols: string;
  trainingModules: string[];
  requirementLevel: 'basic' | 'standard' | 'advanced';
}

interface PracticeReminder {
  id: string;
  time: string;
  days: string[];
  type: 'daily' | 'weekly' | 'custom';
  message: string;
  enabled: boolean;
}

interface UserSettings {
  privacy: PrivacySettings;
  notifications: NotificationSettings;
  department: DepartmentSettings;
  reminders: PracticeReminder[];
}
import { safeGetTime } from '@/lib/utils';

interface AppStore {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // User Settings
  userSettings: UserSettings;
  
  // Quiz state
  currentQuiz: QuizSession | null;
  quizHistory: QuizSession[];
  
  // Voice practice state
  voiceSettings: VoiceSettings;
  voicePracticeSessions: VoicePracticeSession[];
  currentVoiceSession: VoicePracticeSession | null;
  voiceProgress: {
    totalSessions: number;
    averageAccuracy: number;
    bestAccuracy: number;
    recentSessions: VoicePracticeSession[];
  };
  
  // Progress state
  userProgress: UserProgress | null;
  achievements: Achievement[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  activeTab: 'dashboard' | 'practice' | 'progress' | 'help';
  
  // Actions
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  
  // Quiz actions
  startQuiz: (quiz: QuizSession) => void;
  updateQuiz: (quiz: Partial<QuizSession>) => void;
  finishQuiz: (quiz: QuizSession) => void;
  
  // Voice practice actions
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  startVoiceSession: (session: VoicePracticeSession) => void;
  finishVoiceSession: (accuracy: VoiceAccuracyResult) => void;
  addVoicePracticeSession: (session: VoicePracticeSession) => void;
  updateVoiceProgress: () => void;
  
  // Progress actions
  updateProgress: (progress: Partial<UserProgress>) => void;
  addAchievement: (achievement: Achievement) => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveTab: (tab: 'dashboard' | 'practice' | 'progress' | 'help') => void;
  
  // Settings actions
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updateDepartmentSettings: (settings: Partial<DepartmentSettings>) => void;
  updateReminders: (reminders: PracticeReminder[]) => void;
  addReminder: (reminder: PracticeReminder) => void;
  updateReminder: (id: string, updates: Partial<PracticeReminder>) => void;
  deleteReminder: (id: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      currentQuiz: null,
      quizHistory: [],
      
      // User Settings initial state
      userSettings: {
        privacy: {
          dataSharing: false,
          analyticsOptIn: true,
          performanceTracking: true,
          profileVisibility: 'department',
          crashReporting: true,
        },
        notifications: {
          pushNotifications: true,
          emailNotifications: true,
          smsNotifications: false,
          practiceReminders: true,
          achievementAlerts: true,
          weeklyReports: true,
          systemUpdates: true,
          quietHours: {
            start: '22:00',
            end: '07:00'
          },
          soundProfile: 'default',
          tutorialCompleted: false,
          tutorialSkipped: false
        },
        department: {
          customCodes: false,
          voiceProtocols: 'standard',
          trainingModules: ['10-codes', 'phonetic', 'radio-protocol'],
          requirementLevel: 'standard',
        },
        reminders: []
      },
      
      // Voice practice initial state
      voiceSettings: {
        language: 'en-US',
        sensitivity: 'medium',
        autoStop: true,
        maxRecordingTime: 30
      },
      voicePracticeSessions: [],
      currentVoiceSession: null,
      voiceProgress: {
        totalSessions: 0,
        averageAccuracy: 0,
        bestAccuracy: 0,
        recentSessions: []
      },
      
      userProgress: null,
      achievements: [],
      isLoading: false,
      error: null,
      activeTab: 'dashboard',
      
      // User actions
      setUser: (user) => 
        set({ user, isAuthenticated: !!user }),
      
      login: (user) => 
        set({ 
          user, 
          isAuthenticated: true,
          error: null 
        }),
      
      logout: () => 
        set({ 
          user: null, 
          isAuthenticated: false,
          currentQuiz: null,
          currentVoiceSession: null,
          activeTab: 'dashboard'
        }),
      
      // Quiz actions
      startQuiz: (quiz) => 
        set({ currentQuiz: quiz }),
      
      updateQuiz: (quizUpdate) => {
        const currentQuiz = get().currentQuiz;
        if (currentQuiz) {
          set({ 
            currentQuiz: { ...currentQuiz, ...quizUpdate }
          });
        }
      },
      
      finishQuiz: (quiz) => {
        const { quizHistory } = get();
        set({ 
          currentQuiz: null,
          quizHistory: [...quizHistory, quiz]
        });
      },
      
      // Voice practice actions
      updateVoiceSettings: (settings) => {
        const currentSettings = get().voiceSettings;
        set({
          voiceSettings: { ...currentSettings, ...settings }
        });
      },
      
      startVoiceSession: (session) => {
        set({ currentVoiceSession: session });
      },
      
      finishVoiceSession: (accuracy) => {
        const { currentVoiceSession } = get();
        if (currentVoiceSession) {
          const completedSession: VoicePracticeSession = {
            ...currentVoiceSession,
            accuracy
          };
          get().addVoicePracticeSession(completedSession);
          set({ currentVoiceSession: null });
        }
      },
      
      addVoicePracticeSession: (session) => {
        const { voicePracticeSessions } = get();
        const updatedSessions = [...voicePracticeSessions, session];
        set({ voicePracticeSessions: updatedSessions });
        get().updateVoiceProgress();
      },
      
      updateVoiceProgress: () => {
        const { voicePracticeSessions } = get();
        
        if (voicePracticeSessions.length === 0) {
          set({
            voiceProgress: {
              totalSessions: 0,
              averageAccuracy: 0,
              bestAccuracy: 0,
              recentSessions: []
            }
          });
          return;
        }
        
        const totalSessions = voicePracticeSessions.length;
        const accuracyScores = voicePracticeSessions.map(session => session.accuracy.score);
        const averageAccuracy = Math.round(accuracyScores.reduce((sum, score) => sum + score, 0) / totalSessions);
        const bestAccuracy = Math.max(...accuracyScores);
        const recentSessions = voicePracticeSessions
          .sort((a, b) => {
            const timeA = safeGetTime(a.timestamp);
            const timeB = safeGetTime(b.timestamp);
            return timeB - timeA;
          })
          .slice(0, 10);
        
        set({
          voiceProgress: {
            totalSessions,
            averageAccuracy,
            bestAccuracy,
            recentSessions
          }
        });
      },
      
      // Progress actions
      updateProgress: (progressUpdate) => {
        const currentProgress = get().userProgress;
        set({ 
          userProgress: currentProgress 
            ? { ...currentProgress, ...progressUpdate }
            : progressUpdate as UserProgress
        });
      },
      
      addAchievement: (achievement) => {
        const { achievements } = get();
        if (!achievements.find(a => a.id === achievement.id)) {
          set({ 
            achievements: [...achievements, achievement]
          });
        }
      },
      
      // UI actions
      setLoading: (isLoading) => 
        set({ isLoading }),
      
      setError: (error) => 
        set({ error }),
      
      setActiveTab: (activeTab) => 
        set({ activeTab }),
      
      // Settings actions
      updatePrivacySettings: (privacyUpdates) => {
        const currentSettings = get().userSettings;
        set({
          userSettings: {
            ...currentSettings,
            privacy: { ...currentSettings.privacy, ...privacyUpdates }
          }
        });
      },
      
      updateNotificationSettings: (notificationUpdates) => {
        console.log('🏪 Store updateNotificationSettings called with:', notificationUpdates);
        const currentSettings = get().userSettings;
        console.log('🏪 Current settings before update:', currentSettings.notifications);
        
        const newSettings = {
          userSettings: {
            ...currentSettings,
            notifications: { ...currentSettings.notifications, ...notificationUpdates }
          }
        };
        
        console.log('🏪 New settings after update:', newSettings.userSettings.notifications);
        set(newSettings);
      },
      
      updateDepartmentSettings: (departmentUpdates) => {
        const currentSettings = get().userSettings;
        set({
          userSettings: {
            ...currentSettings,
            department: { ...currentSettings.department, ...departmentUpdates }
          }
        });
      },
      
      updateReminders: (reminders) => {
        const currentSettings = get().userSettings;
        set({
          userSettings: {
            ...currentSettings,
            reminders
          }
        });
      },
      
      addReminder: (reminder) => {
        const currentSettings = get().userSettings;
        set({
          userSettings: {
            ...currentSettings,
            reminders: [...currentSettings.reminders, reminder]
          }
        });
      },
      
      updateReminder: (id, updates) => {
        const currentSettings = get().userSettings;
        const updatedReminders = currentSettings.reminders.map(reminder =>
          reminder.id === id ? { ...reminder, ...updates } : reminder
        );
        set({
          userSettings: {
            ...currentSettings,
            reminders: updatedReminders
          }
        });
      },
      
      deleteReminder: (id) => {
        const currentSettings = get().userSettings;
        const updatedReminders = currentSettings.reminders.filter(reminder => reminder.id !== id);
        set({
          userSettings: {
            ...currentSettings,
            reminders: updatedReminders
          }
        });
      },
    }),
    {
      name: 'police-training-app',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        quizHistory: state.quizHistory,
        voiceSettings: state.voiceSettings,
        voicePracticeSessions: state.voicePracticeSessions,
        voiceProgress: state.voiceProgress,
        userProgress: state.userProgress,
        achievements: state.achievements,
        activeTab: state.activeTab,
        userSettings: state.userSettings,
      }),
    }
  )
);