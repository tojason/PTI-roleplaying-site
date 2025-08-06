// Instructor Dashboard Types

// =============================================================================
// USER & AUTHENTICATION TYPES
// =============================================================================

export enum InstructorRole {
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface InstructorUser {
  id: string;
  pid: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  departmentCode: string;
  rank?: string;
  badgeNumber?: string;
  yearsOfExperience?: number;
  certifications?: string[];
  specializations?: string[];
  profilePhoto?: string;
  role: InstructorRole;
  permissions: string[];
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  lastActivityAt?: Date;
  preferences: InstructorPreferences;
}

export interface LoginCredentials {
  email: string;
  password: string;
  departmentCode: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  departmentCode: string;
  role: InstructorRole;
  badgeNumber?: string;
  yearsOfExperience?: number;
  specializations?: string[];
  supervisorEmail?: string;
}

export interface AuthState {
  user: InstructorUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
  sessionExpiry: Date | null;
}

export interface AuthResponse {
  user: InstructorUser;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface PasswordResetRequest {
  email: string;
  departmentCode: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// =============================================================================
// STUDENT & PERFORMANCE TYPES
// =============================================================================

export enum StudentStatus {
  ACTIVE = 'active',
  AT_RISK = 'at-risk',
  INACTIVE = 'inactive',
  COMPLETED = 'completed',
  SUSPENDED = 'suspended'
}

export interface Student {
  id: string;
  pid: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  badgeNumber?: string;
  avatar?: string;
  status: StudentStatus;
  statusReason?: string;
  statusUpdatedAt?: Date;
  enrollmentDate: Date;
  expectedCompletionDate?: Date;
  lastActivity?: Date;
  progress: StudentProgress;
  performance: PerformanceMetrics;
  cohort?: string;
  cohortId?: string;
  supervisor?: string;
  supervisorId?: string;
  tags?: string[];
  notes?: InstructorNote[];
  riskFactors?: RiskFactor[];
  goals?: StudentGoal[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentProgress {
  overallCompletion: number; // 0-100
  moduleProgress: ModuleProgress[];
  currentModule?: string;
  currentModuleId?: string;
  timeSpent: number; // in minutes
  totalLessonsCompleted: number;
  totalLessonsAvailable: number;
  certificationProgress: CertificationProgress[];
  milestones: ProgressMilestone[];
  estimatedCompletionDate?: Date;
  lastProgressUpdate: Date;
}

export interface PerformanceMetrics {
  overallAccuracy: number; // 0-100
  recentAccuracy: number; // 0-100 (last 7 days)
  accuracyTrend: number; // percentage change
  streak: number;
  longestStreak: number;
  totalSessions: number;
  averageSessionTime: number; // in minutes
  totalTimeSpent: number; // in minutes
  practiceSessionsThisWeek: number;
  practiceSessionsThisMonth: number;
  moduleScores: ModulePerformance[];
  categoryBreakdown: CategoryPerformance[];
  weakAreas: string[];
  strongAreas: string[];
  improvementRate: number; // percentage
  consistencyScore: number; // 0-100
  engagementScore: number; // 0-100
  lastPerformanceUpdate: Date;
}

export interface StudentFilters {
  status?: StudentStatus[];
  progressRange?: {
    min: number;
    max: number;
  };
  accuracyRange?: {
    min: number;
    max: number;
  };
  cohorts?: string[];
  departments?: string[];
  supervisors?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
  tags?: string[];
  riskLevel?: ('low' | 'medium' | 'high' | 'critical')[];
  hasNotes?: boolean;
  lastActivityDays?: number;
}

export interface BulkAction {
  type: 'message' | 'assign' | 'updateStatus' | 'addTag' | 'removeTag' | 'export' | 'archive';
  studentIds: string[];
  payload?: any;
  scheduledFor?: Date;
}

export interface BulkActionResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  failures: Array<{
    studentId: string;
    studentName: string;
    error: string;
  }>;
  processedAt: Date;
}

// Supporting interfaces
export interface RiskFactor {
  id: string;
  type: 'low_engagement' | 'poor_performance' | 'inactivity' | 'consistency' | 'time_management';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  interventions: string[];
}

export interface StudentGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string; // 'accuracy', 'completion', 'time', etc.
  deadline?: Date;
  isCompleted: boolean;
  completedAt?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface InstructorNote {
  id: string;
  content: string;
  type: 'general' | 'performance' | 'behavior' | 'goal' | 'intervention';
  priority: 'low' | 'medium' | 'high';
  isPrivate: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface CertificationProgress {
  certificationId: string;
  certificationName: string;
  requiredModules: string[];
  completedModules: string[];
  progress: number; // 0-100
  isCompleted: boolean;
  completedAt?: Date;
  expiryDate?: Date;
}

export interface ProgressMilestone {
  id: string;
  title: string;
  description: string;
  requiredProgress: number;
  isCompleted: boolean;
  completedAt?: Date;
  reward?: string;
}

export interface ModulePerformance {
  moduleId: string;
  moduleName: string;
  category: 'codes' | 'phonetic' | 'radio-protocol' | 'mixed';
  accuracy: number;
  completionRate: number;
  timeSpent: number;
  attempts: number;
  lastAttempt?: Date;
  bestScore: number;
  averageScore: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface CategoryPerformance {
  category: 'codes' | 'phonetic' | 'radio-protocol' | 'mixed';
  accuracy: number;
  completionRate: number;
  timeSpent: number;
  sessionsCompleted: number;
  averageSessionScore: number;
  improvementRate: number;
  rank: number; // among all students
}

export interface ModuleProgress {
  moduleId: string;
  moduleName: string;
  category: 'codes' | 'phonetic' | 'radio-protocol' | 'mixed';
  completion: number; // 0-100
  accuracy: number; // 0-100
  timeSpent: number; // in minutes
  lastAccessed?: Date;
  isCompleted: boolean;
}

// =============================================================================
// DASHBOARD & ANALYTICS TYPES
// =============================================================================

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  atRiskStudents: number;
  completedStudents: number;
  inactiveStudents: number;
  newEnrollmentsThisMonth: number;
  completionRate: number; // 0-100
  averageAccuracy: number; // 0-100
  totalTrainingHours: number;
  averageTrainingHoursPerStudent: number;
  certificationRate: number; // 0-100
  retentionRate: number; // 0-100
  engagementScore: number; // 0-100
  trends: {
    completionTrend: number; // percentage change
    accuracyTrend: number; // percentage change
    engagementTrend: number; // percentage change
    enrollmentTrend: number; // percentage change
    retentionTrend: number; // percentage change
  };
  departmentComparison?: DepartmentStats[];
  lastUpdated: Date;
}

export interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'doughnut' | 'scatter';
  title: string;
  description?: string;
  data: any[];
  labels?: string[];
  colors?: string[];
  timeRange: TimeRange;
  aggregation: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  metadata?: {
    yAxisLabel?: string;
    xAxisLabel?: string;
    unit?: string;
    precision?: number;
  };
  lastUpdated: Date;
}

export interface TimeRange {
  start: Date;
  end: Date;
  preset?: '24h' | '7d' | '30d' | '90d' | '1y' | 'custom';
  label: string;
}

export interface ComparisonPeriod {
  current: TimeRange;
  previous: TimeRange;
  label: string; // 'vs last week', 'vs last month', etc.
}

export interface Activity {
  id: string;
  type: 'student_login' | 'session_completed' | 'achievement_unlocked' | 'assignment_submitted' | 'module_completed' | 'instructor_action' | 'system_event';
  title: string;
  description: string;
  studentId?: string;
  studentName?: string;
  instructorId?: string;
  instructorName?: string;
  timestamp: Date;
  metadata?: {
    score?: number;
    duration?: number;
    accuracy?: number;
    module?: string;
    assignment?: string;
    oldValue?: any;
    newValue?: any;
  };
  severity: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  actionUrl?: string;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  types: {
    studentProgress: boolean;
    riskAlerts: boolean;
    assignments: boolean;
    systemUpdates: boolean;
    achievements: boolean;
  };
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
}

export interface Alert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'student_risk' | 'performance_decline' | 'inactivity' | 'system' | 'assignment_overdue' | 'certification_expiry';
  title: string;
  message: string;
  studentId?: string;
  studentName?: string;
  assignmentId?: string;
  timestamp: Date;
  isRead: boolean;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  actionRequired: boolean;
  actionUrl?: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

// Supporting interfaces
export interface DepartmentStats {
  departmentId: string;
  departmentName: string;
  totalStudents: number;
  averageCompletion: number;
  averageAccuracy: number;
  ranking: number;
}

export interface ActivityData {
  id: string;
  studentId: string;
  studentName: string;
  type: 'session_completed' | 'achievement_unlocked' | 'assignment_submitted' | 'module_completed';
  description: string;
  timestamp: Date;
  metadata?: {
    score?: number;
    duration?: number;
    accuracy?: number;
    module?: string;
  };
}

export interface AlertData {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  studentId?: string;
  studentName?: string;
  timestamp: Date;
  isRead: boolean;
  actionRequired: boolean;
  actionUrl?: string;
}

export interface AssignmentData {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'practice' | 'assessment';
  category: 'codes' | 'phonetic' | 'radio-protocol' | 'mixed';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  assignedTo: string[]; // student IDs
  assignedBy: string; // instructor ID
  createdAt: Date;
  dueDate?: Date;
  isActive: boolean;
  settings: {
    questionCount: number;
    timeLimit?: number; // in minutes
    allowRetries: boolean;
    maxAttempts?: number;
    passingScore?: number; // 0-100
  };
  submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: Date;
  score: number; // 0-100
  accuracy: number; // 0-100
  timeSpent: number; // in minutes
  attempt: number;
  isCompleted: boolean;
  answers: Record<string, string>; // questionId -> answer
}

export interface PerformanceMetrics {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  data: Array<{
    date: string;
    completions: number;
    accuracy: number;
    activeUsers: number;
    newEnrollments: number;
  }>;
  moduleBreakdown: Array<{
    moduleId: string;
    moduleName: string;
    avgAccuracy: number;
    completionRate: number;
    timeSpent: number;
    difficulty: number; // calculated difficulty score
  }>;
  cohortComparison?: Array<{
    cohortId: string;
    cohortName: string;
    avgCompletion: number;
    avgAccuracy: number;
    totalStudents: number;
    activeStudents: number;
  }>;
}

// =============================================================================
// ASSIGNMENT & COMMUNICATION TYPES
// =============================================================================

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  type: 'quiz' | 'practice' | 'assessment' | 'module' | 'certification';
  category: 'codes' | 'phonetic' | 'radio-protocol' | 'mixed';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  assignedTo: string[]; // student IDs
  assignedBy: string; // instructor ID
  assignedByName: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  startDate?: Date;
  isActive: boolean;
  isPublished: boolean;
  estimatedDuration: number; // in minutes
  settings: AssignmentSettings;
  submissions: AssignmentSubmission[];
  analytics: AssignmentAnalytics;
  tags: string[];
  attachments?: AssignmentAttachment[];
}

export interface AssignmentSettings {
  questionCount: number;
  timeLimit?: number; // in minutes
  allowRetries: boolean;
  maxAttempts?: number;
  passingScore?: number; // 0-100
  showResults: boolean;
  showCorrectAnswers: boolean;
  allowReview: boolean;
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  requireProctoring: boolean;
  availabilityWindow?: {
    start: Date;
    end: Date;
  };
  prerequisites?: string[]; // module IDs
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: Date;
  startedAt: Date;
  score: number; // 0-100
  accuracy: number; // 0-100
  timeSpent: number; // in minutes
  attempt: number;
  isCompleted: boolean;
  isGraded: boolean;
  gradedAt?: Date;
  gradedBy?: string;
  // answers property already defined above as Record<string, string>
  feedback?: string;
  flaggedForReview: boolean;
  status: 'in_progress' | 'submitted' | 'graded' | 'expired';
}

export interface AssignmentAnalytics {
  totalSubmissions: number;
  completionRate: number;
  averageScore: number;
  averageTimeSpent: number;
  passRate: number;
  difficultyRating: number;
  commonMistakes: Array<{
    questionId: string;
    question: string;
    incorrectAnswer: string;
    frequency: number;
  }>;
  performanceByDifficulty: Record<string, number>;
  submissionTrend: Array<{
    date: string;
    submissions: number;
  }>;
}

export interface AssignmentAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface Message {
  id: string;
  subject: string;
  content: string;
  type: 'individual' | 'broadcast' | 'system';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  senderId: string;
  senderName: string;
  senderRole: InstructorRole;
  recipientIds: string[];
  recipientNames: string[];
  sentAt: Date;
  scheduledFor?: Date;
  isScheduled: boolean;
  isRead: boolean;
  readBy: Array<{
    userId: string;
    readAt: Date;
  }>;
  responses?: MessageResponse[];
  attachments?: MessageAttachment[];
  tags?: string[];
  expiresAt?: Date;
  isArchived: boolean;
  metadata?: Record<string, any>;
}

export interface MessageResponse {
  id: string;
  messageId: string;
  content: string;
  senderId: string;
  senderName: string;
  sentAt: Date;
  isRead: boolean;
}

export interface MessageAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'general' | 'encouragement' | 'reminder' | 'warning' | 'congratulation';
  variables: string[]; // placeholders like {{studentName}}
  createdBy: string;
  createdAt: Date;
  usageCount: number;
  isDefault: boolean;
}

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: 'progress' | 'performance' | 'compliance' | 'activity' | 'custom';
  format: 'pdf' | 'csv' | 'excel' | 'json';
  status: 'generating' | 'completed' | 'failed' | 'expired';
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
  downloadUrl?: string;
  downloadCount: number;
  parameters: ReportParameters;
  metadata?: {
    fileSize?: number;
    recordCount?: number;
    processingTime?: number; // in seconds
  };
}

export interface ReportParameters {
  timeRange: TimeRange;
  studentIds?: string[];
  cohortIds?: string[];
  departmentIds?: string[];
  includeCharts: boolean;
  includeRawData: boolean;
  groupBy?: 'student' | 'cohort' | 'department' | 'module';
  metrics: string[]; // specific metrics to include
  filters?: Record<string, any>;
}

export interface InstructorPreferences {
  // Display preferences
  dashboardLayout: 'grid' | 'list';
  defaultView: 'overview' | 'students' | 'analytics' | 'assignments';
  theme: 'light' | 'dark' | 'auto';
  compactMode: boolean;
  showAvatars: boolean;
  animationsEnabled: boolean;
  
  // Data preferences
  studentsPerPage: number;
  defaultTimeRange: '24h' | '7d' | '30d' | '90d';
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  
  // Notification preferences
  notifications: NotificationSettings;
  
  // Alert thresholds
  alertThresholds: {
    atRiskAccuracy: number; // below this accuracy triggers at-risk status
    inactivityDays: number; // days without activity triggers inactive status
    criticalFailureRate: number; // failure rate that triggers critical alerts
    lowEngagementThreshold: number; // engagement score threshold
  };
  
  // Chart preferences
  chartPreferences: {
    defaultChartType: 'line' | 'bar' | 'area';
    showTrendLines: boolean;
    showComparisons: boolean;
    colorScheme: 'default' | 'colorblind' | 'high-contrast';
  };
  
  // Advanced preferences
  advancedFeatures: {
    enablePredictiveAnalytics: boolean;
    enableRealTimeUpdates: boolean;
    enableBulkActions: boolean;
    enableAdvancedFilters: boolean;
  };
  
  // Privacy preferences
  privacy: {
    shareAnonymizedData: boolean;
    allowUsageAnalytics: boolean;
    dataSharingLevel: 'none' | 'department' | 'organization';
  };
}

export interface FilterOptions {
  status?: ('active' | 'at-risk' | 'inactive' | 'completed')[];
  progressRange?: {
    min: number;
    max: number;
  };
  accuracyRange?: {
    min: number;
    max: number;
  };
  cohorts?: string[];
  departments?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}


// Component Props Types
export interface StudentCardProps {
  student: Student;
  onViewProfile: (studentId: string) => void;
  onSendMessage: (studentId: string) => void;
  onAssignPractice?: (studentId: string) => void;
  compact?: boolean;
  showQuickActions?: boolean;
}



export interface StudentTableProps {
  students: Student[];
  loading?: boolean;
  onStudentSelect: (studentId: string) => void;
  onBulkAction: (action: string, studentIds: string[]) => void;
  selectedStudents?: string[];
  sortOptions?: SortOptions;
  onSort?: (options: SortOptions) => void;
  compact?: boolean;
}

// API Response Types
export interface DashboardDataResponse {
  stats: DashboardStats;
  recentActivity: ActivityData[];
  alerts: AlertData[];
  upcomingTasks: TaskData[];
  activeStudents: Student[];
}

export interface StudentListResponse {
  students: Student[];
  totalCount: number;
  pageInfo: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface TaskData {
  id: string;
  type: 'grade_assignment' | 'review_progress' | 'contact_student' | 'generate_report';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  relatedStudentId?: string;
  relatedStudentName?: string;
  isCompleted: boolean;
  metadata?: Record<string, any>;
}

// Form Types
export interface AssignmentFormData {
  title: string;
  description: string;
  type: 'quiz' | 'practice' | 'assessment';
  category: 'codes' | 'phonetic' | 'radio-protocol' | 'mixed';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  questionCount: number;
  timeLimit?: number;
  dueDate?: Date;
  allowRetries: boolean;
  maxAttempts?: number;
  passingScore?: number;
  assignToAll: boolean;
  selectedStudents: string[];
  selectedCohorts: string[];
}

export interface InstructorRegisterFormData {
  name: string;
  email: string;
  pid: string;
  password: string;
  department: string;
  rank?: string;
  badgeNumber?: string;
  yearsOfExperience?: number;
  certifications?: string[];
  specializations?: string[];
  supervisorContact?: string;
}

// =============================================================================
// STATE MANAGEMENT TYPES
// =============================================================================

export interface InstructorStore {
  // Authentication state
  user: InstructorUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<InstructorUser>) => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export interface DashboardStore {
  // Data state
  stats: DashboardStats | null;
  students: Student[];
  selectedStudents: string[];
  filters: StudentFilters;
  sortBy: SortOptions;
  view: 'grid' | 'list';
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalStudents: number;
  
  // Actions
  fetchDashboardData: () => Promise<void>;
  fetchStudents: (page?: number) => Promise<void>;
  setSelectedStudents: (ids: string[]) => void;
  applyFilters: (filters: StudentFilters) => void;
  setSortBy: (sort: SortOptions) => void;
  setView: (view: 'grid' | 'list') => void;
  bulkUpdateStudents: (ids: string[], updates: any) => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export interface AnalyticsStore {
  // Data state
  metrics: PerformanceMetrics | null;
  chartData: ChartData[];
  timeRange: TimeRange;
  compareMode: boolean;
  comparisonPeriod: ComparisonPeriod | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchMetrics: (timeRange: TimeRange) => Promise<void>;
  fetchChartData: (chartType: string, timeRange: TimeRange) => Promise<void>;
  updateTimeRange: (range: TimeRange) => void;
  toggleCompareMode: () => void;
  setComparisonPeriod: (period: ComparisonPeriod) => void;
  exportData: (format: 'csv' | 'pdf' | 'excel') => Promise<void>;
  clearError: () => void;
}

export interface AssignmentStore {
  // Data state
  assignments: Assignment[];
  selectedAssignment: Assignment | null;
  submissions: AssignmentSubmission[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchAssignments: () => Promise<void>;
  fetchAssignment: (id: string) => Promise<void>;
  createAssignment: (assignment: CreateAssignmentRequest) => Promise<void>;
  updateAssignment: (id: string, updates: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  fetchSubmissions: (assignmentId: string) => Promise<void>;
  gradeSubmission: (submissionId: string, grade: number, feedback?: string) => Promise<void>;
  clearError: () => void;
}

export interface CommunicationStore {
  // Data state
  messages: Message[];
  selectedMessage: Message | null;
  templates: MessageTemplate[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchMessages: () => Promise<void>;
  sendMessage: (message: SendMessageRequest) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  fetchTemplates: () => Promise<void>;
  createTemplate: (template: Omit<MessageTemplate, 'id' | 'createdAt' | 'usageCount'>) => Promise<void>;
  clearError: () => void;
}

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

export interface CreateAssignmentRequest {
  title: string;
  description: string;
  instructions?: string;
  type: Assignment['type'];
  category: Assignment['category'];
  difficulty: Assignment['difficulty'];
  modules: string[];
  targetScore?: number;
  dueDate?: Date;
  studentIds?: string[];
  cohortIds?: string[];
  settings: AssignmentSettings;
  tags?: string[];
}

export interface SendMessageRequest {
  recipientIds: string[];
  subject: string;
  content: string;
  priority: Message['priority'];
  scheduledFor?: Date;
  templateId?: string;
  attachments?: File[];
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  meta?: PaginationMeta;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  statusCode: number;
}

// =============================================================================
// COMPONENT PROPS TYPES
// =============================================================================

export interface StudentCardProps {
  student: Student;
  onViewProfile: (studentId: string) => void;
  onSendMessage: (studentId: string) => void;
  onAssignPractice?: (studentId: string) => void;
  onToggleSelect?: (studentId: string) => void;
  isSelected?: boolean;
  compact?: boolean;
  showQuickActions?: boolean;
  className?: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period: string;
  };
  icon?: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface AnalyticsChartProps {
  title: string;
  type: ChartData['type'];
  data: any[];
  height?: number;
  loading?: boolean;
  exportable?: boolean;
  onExport?: (format: 'png' | 'csv' | 'pdf') => void;
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  selectedRows?: string[];
  onRowSelect?: (rowId: string) => void;
  onBulkSelect?: (rowIds: string[]) => void;
  sortOptions?: SortOptions;
  onSort?: (options: SortOptions) => void;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  searchable?: boolean;
  searchValue?: string;
  onSearch?: (value: string) => void;
  exportable?: boolean;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  className?: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  className?: string;
}

export interface ActionButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export interface NotificationBadgeProps {
  count: number;
  variant?: 'primary' | 'danger' | 'warning' | 'success';
  size?: 'sm' | 'md' | 'lg';
  showZero?: boolean;
  maxCount?: number;
  className?: string;
}

export interface ProgressRingProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl';
  strokeWidth?: number;
  showValue?: boolean;
  showLabel?: boolean;
  label?: string;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
  className?: string;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  direction: SortDirection;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type ViewMode = 'grid' | 'list' | 'table';

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

export type DatePreset = '24h' | '7d' | '30d' | '90d' | '1y' | 'custom';

export type ThemeMode = 'light' | 'dark' | 'auto';

export type NotificationFrequency = 'immediate' | 'hourly' | 'daily' | 'weekly';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type PerformanceTrend = 'improving' | 'declining' | 'stable';

// Re-export commonly used types for convenience
export type { InstructorUser as Instructor };
export type { Student as StudentData };