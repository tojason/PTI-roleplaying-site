// Core application types

export interface User {
  id: string;
  pid: string;
  name: string;
  department: string;
  experienceLevel: 'rookie' | 'experienced' | 'veteran';
  level: number;
  streak: number;
  totalCorrect: number;
  totalTime: string;
  overallAccuracy: number;
  avatar?: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation?: string;
  category: 'codes' | 'phonetic' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard';
  hasAudio?: boolean;
  audioUrl?: string;
}

export interface QuizSession {
  id: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, string>; // questionId -> selectedOptionId
  score: number;
  startTime: Date;
  endTime?: Date;
  category: 'codes' | 'phonetic' | 'mixed';
}

export interface QuizCardProps {
  question: string;
  options: QuizOption[];
  currentQuestion: number;
  totalQuestions: number;
  progress: number; // 0-100
  onAnswerSelect: (optionId: string) => void;
  selectedAnswer?: string;
  showFeedback: boolean;
  explanation?: string;
  hasAudio?: boolean;
  onAudioPlay?: () => void;
  onExit?: () => void;
}

export interface VoiceScenario {
  id: string;
  title: string;
  instruction: string;
  targetText: string;
  expectedAnswer: string;
  category: 'phonetic' | 'radio-protocol';
}

export interface VoicePracticeProps {
  scenario: VoiceScenario;
  isRecording?: boolean;
  recordingTime?: number;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onShowAnswer: () => void;
  onSkip: () => void;
  showAnswer: boolean;
  feedback?: {
    accuracy: number;
    suggestions: string[];
  };
}

export interface UserProgress {
  overallAccuracy: number;
  totalCorrect: number;
  totalTime: string;
  level: number;
  categoryBreakdown: Array<{
    name: string;
    accuracy: number;
    color: string;
  }>;
  weeklyData: Array<{
    day: string;
    accuracy: number;
  }>;
  recentActivity: Array<{
    date: string;
    type: string;
    accuracy: number;
    icon: string;
  }>;
}

export interface ProgressTrackerProps extends UserProgress {}

export interface NavigationProps {
  activeTab: 'dashboard' | 'practice' | 'progress' | 'help';
  onTabChange: (tab: string) => void;
  notifications?: {
    dashboard?: number;
    practice?: number;
    progress?: number;
    help?: number;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress?: number; // 0-100
  target?: number;
}

export interface LoginFormData {
  pid: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  name: string;
  pid: string;
  password: string;
  experienceLevel?: 'rookie' | 'experienced' | 'veteran';
}

export interface AppState {
  user: User | null;
  currentQuiz: QuizSession | null;
  isLoading: boolean;
  error: string | null;
}

// Component state types
export type QuizState = 'idle' | 'active' | 'feedback' | 'completed';
export type VoiceState = 'idle' | 'recording' | 'processing' | 'feedback';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Navigation types
export type TabId = 'dashboard' | 'practice' | 'progress';

// Practice mode types
export type PracticeMode = 'codes' | 'phonetic' | 'mixed' | 'voice';

// Voice Recognition types
export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  alternatives: string[];
  isFinal: boolean;
}

export interface VoiceRecognitionConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface VoiceAccuracyResult {
  score: number; // 0-100
  matches: Array<{
    expected: string;
    actual: string;
    match: boolean;
    similarity: number;
  }>;
  suggestions: string[];
  category: 'excellent' | 'good' | 'needs-improvement' | 'poor';
}

export interface VoicePracticeSession {
  id: string;
  scenarioId: string;
  userSpeech: string;
  accuracy: VoiceAccuracyResult;
  timestamp: Date;
  duration: number; // in seconds
}

export interface VoiceSettings {
  language: string;
  sensitivity: 'low' | 'medium' | 'high';
  autoStop: boolean;
  maxRecordingTime: number; // in seconds
}

// Enhanced VoicePracticeProps with real speech recognition
export interface EnhancedVoicePracticeProps extends Omit<VoicePracticeProps, 'feedback'> {
  feedback?: VoiceAccuracyResult;
  onVoiceResult?: (result: VoiceRecognitionResult) => void;
  onAccuracyScore?: (accuracy: VoiceAccuracyResult) => void;
  voiceSettings?: VoiceSettings;
  supportsBrowserSpeech?: boolean;
  onExit?: () => void;
}

// Audio recorder state
export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  volume: number;
  error: string | null;
}

// Speech recognition error types
export interface SpeechRecognitionError {
  error: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported';
  message: string;
}

// Theme types
export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'achievement' | 'reminder' | 'update' | 'streak' | 'quiz_complete' | 'level_up';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  icon?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isDropdownOpen: boolean;
}

export interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNotificationClick: (notification: Notification) => void;
}