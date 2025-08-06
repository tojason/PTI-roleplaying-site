# API Specifications - Instructor Dashboard Backend

## Architecture Overview

The instructor dashboard backend is designed as a scalable, secure RESTful API with real-time capabilities. It handles 100+ concurrent instructors managing 1000+ students each, with comprehensive analytics and real-time progress tracking.

### Core Technologies
- **Next.js 14 API Routes** - Server-side API implementation
- **PostgreSQL with Prisma ORM** - Primary database with type-safe queries
- **Redis** - Caching and session management
- **Socket.IO** - Real-time WebSocket communication
- **JWT** - Authentication and authorization
- **Rate Limiting** - Request throttling and abuse prevention
- **Background Jobs** - Async processing for reports and analytics

## Authentication & Authorization

### JWT Token Implementation
```typescript
interface JWTPayload {
  userId: string;
  role: UserRole;
  permissions: string[];
  departmentId: string;
  iat: number;
  exp: number;
}

interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
  iat: number;
  exp: number;
}
```

### POST `/api/instructor/auth/login`
**Request:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
  departmentCode: string;
}
```

**Response:**
```typescript
interface LoginResponse {
  user: InstructorUser;
  accessToken: string; // JWT, 15-minute expiry
  refreshToken: string; // Secure HTTP-only cookie, 7-day expiry
  permissions: string[];
}
```

**Implementation Details:**
- Password validation with bcrypt
- Rate limiting: 5 attempts per IP per 15 minutes
- Failed login tracking and temporary lockout
- Department code validation
- Login audit logging

### POST `/api/instructor/auth/refresh`
**Headers:** `Cookie: refreshToken=...`

**Response:**
```typescript
interface RefreshResponse {
  accessToken: string;
  user: InstructorUser;
}
```

**Implementation:**
- Validate refresh token from HTTP-only cookie
- Check token version for revocation support
- Generate new access token
- Optional: rotate refresh token for security

### POST `/api/instructor/auth/logout`
**Implementation:**
- Invalidate refresh token
- Clear HTTP-only cookies
- Add token to blacklist (Redis)
- Update last logout timestamp

## Dashboard Statistics API

### GET `/api/instructor/dashboard/stats`
**Query Parameters:**
- `timeRange`: '7d' | '30d' | '90d' | 'custom'
- `startDate`: ISO date string (if custom)
- `endDate`: ISO date string (if custom)

**Response:**
```typescript
interface DashboardStatsResponse {
  totalStudents: number;
  activeToday: number;
  activeThisWeek: number;
  averageProgress: number;
  atRiskCount: number;
  completionRate: number;
  
  trends: {
    students: TrendData[];
    progress: TrendData[];
    engagement: TrendData[];
    performance: TrendData[];
  };
  
  topPerformers: StudentSummary[];
  strugglingStudents: StudentSummary[];
  
  modulePerformance: {
    module: string;
    averageScore: number;
    completionRate: number;
    timeSpent: number;
  }[];
  
  recentActivity: Activity[];
}

interface TrendData {
  date: string;
  value: number;
  change?: number;
}
```

**Caching Strategy:**
- Redis cache: 5-minute TTL
- Invalidate on student progress updates
- Background pre-computation for heavy aggregations

## Student Management APIs

### GET `/api/instructor/students`
**Query Parameters:**
```typescript
interface StudentQuery {
  page?: number; // default: 1
  limit?: number; // default: 20, max: 100
  search?: string; // name, email, PID search
  filter?: 'all' | 'active' | 'inactive' | 'at-risk' | 'top-performers';
  sortBy?: 'name' | 'progress' | 'lastActive' | 'performance' | 'joinDate';
  order?: 'asc' | 'desc';
  department?: string;
  assignmentId?: string; // filter by assignment
}
```

**Response:**
```typescript
interface StudentListResponse {
  students: StudentSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: {
    total: number;
    active: number;
    atRisk: number;
    topPerformers: number;
  };
}

interface StudentSummary {
  id: string;
  name: string;
  email: string;
  pid: string;
  department: string;
  rank?: string;
  avatar?: string;
  
  progress: {
    overall: number;
    quizAccuracy: number;
    voiceAccuracy: number;
    lastActiveAt: string;
    currentStreak: number;
    totalSessions: number;
  };
  
  assignments: {
    total: number;
    completed: number;
    overdue: number;
  };
  
  status: 'active' | 'inactive' | 'at-risk';
  riskFactors?: string[];
}
```

### GET `/api/instructor/students/:id`
**Response:**
```typescript
interface StudentDetailResponse {
  student: Student;
  progress: DetailedProgress;
  assignments: Assignment[];
  practiceHistory: PracticeSession[];
  achievements: UserAchievement[];
  analytics: StudentAnalytics;
}

interface DetailedProgress {
  overall: ProgressMetrics;
  byCategory: {
    [category: string]: ProgressMetrics;
  };
  trends: TrendData[];
  weakAreas: WeakArea[];
  strengths: string[];
}

interface StudentAnalytics {
  totalTimeSpent: number;
  averageSessionLength: number;
  peakActivityTimes: TimeSlot[];
  deviceUsage: DeviceStats[];
  progressVelocity: number;
  retentionRate: number;
}
```

### POST `/api/instructor/students/bulk-action`
**Request:**
```typescript
interface BulkActionRequest {
  studentIds: string[];
  action: 'message' | 'assign' | 'updateStatus' | 'export' | 'addToGroup';
  payload: {
    // For message action
    subject?: string;
    content?: string;
    priority?: 'normal' | 'high' | 'urgent';
    
    // For assign action
    assignmentId?: string;
    dueDate?: string;
    
    // For updateStatus action
    status?: 'active' | 'inactive';
    
    // For addToGroup action
    groupId?: string;
  };
}
```

**Response:**
```typescript
interface BulkActionResponse {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: BulkActionError[];
  jobId?: string; // For async operations
}
```

## Analytics & Reporting APIs

### GET `/api/instructor/analytics/performance`
**Query Parameters:**
```typescript
interface AnalyticsQuery {
  timeRange: '7d' | '30d' | '90d' | 'custom';
  startDate?: string;
  endDate?: string;
  groupBy: 'day' | 'week' | 'month';
  studentIds?: string[]; // Optional filter
  modules?: string[]; // Optional filter
  departments?: string[]; // Optional filter
}
```

**Response:**
```typescript
interface PerformanceAnalyticsResponse {
  overview: {
    totalSessions: number;
    averageScore: number;
    completionRate: number;
    totalTimeSpent: number;
    improvementRate: number;
  };
  
  timeSeriesData: {
    date: string;
    sessions: number;
    averageScore: number;
    completionRate: number;
    activeUsers: number;
  }[];
  
  moduleBreakdown: {
    module: string;
    category: string;
    sessions: number;
    averageScore: number;
    completionRate: number;
    timeSpent: number;
    difficultyDistribution: {
      easy: number;
      medium: number;
      hard: number;
    };
  }[];
  
  studentSegments: {
    segment: string;
    count: number;
    averageScore: number;
    characteristics: string[];
  }[];
}
```

### GET `/api/instructor/analytics/module-breakdown`
**Response:**
```typescript
interface ModuleBreakdownResponse {
  modules: {
    id: string;
    name: string;
    category: QuizCategory;
    totalQuestions: number;
    
    performance: {
      totalAttempts: number;
      averageScore: number;
      completionRate: number;
      averageTimeSpent: number;
    };
    
    questionAnalysis: {
      questionId: string;
      text: string;
      correctRate: number;
      averageTimeSpent: number;
      commonMistakes: string[];
    }[];
    
    difficultyAnalysis: {
      difficulty: DifficultyLevel;
      averageScore: number;
      completionRate: number;
    }[];
  }[];
}
```

## Assignment Management APIs

### POST `/api/instructor/assignments`
**Request:**
```typescript
interface CreateAssignmentRequest {
  title: string;
  description: string;
  instructions?: string;
  
  modules: {
    moduleId: string;
    requiredScore?: number;
    maxAttempts?: number;
  }[];
  
  requirements: {
    targetScore: number;
    completionDeadline: string;
    maxAttempts?: number;
    allowRetakes: boolean;
  };
  
  assignment: {
    studentIds?: string[]; // Optional: specific students
    departmentIds?: string[]; // Optional: entire departments
    groupIds?: string[]; // Optional: student groups
    assignToAll?: boolean; // Assign to all students
  };
  
  notifications: {
    assignmentNotification: boolean;
    reminderSchedule?: 'daily' | 'weekly' | 'custom';
    deadlineReminder: boolean;
  };
}
```

**Response:**
```typescript
interface CreateAssignmentResponse {
  assignment: Assignment;
  assignedCount: number;
  estimatedDuration: number;
}
```

### GET `/api/instructor/assignments`
**Query Parameters:**
- `status`: 'active' | 'completed' | 'overdue' | 'draft'
- `page`, `limit`, `sortBy`, `order`

**Response:**
```typescript
interface AssignmentListResponse {
  assignments: {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    dueDate: string;
    status: AssignmentStatus;
    
    stats: {
      totalAssigned: number;
      completed: number;
      inProgress: number;
      notStarted: number;
      overdue: number;
      averageScore: number;
      completionRate: number;
    };
    
    modules: AssignmentModule[];
  }[];
  pagination: PaginationMeta;
}
```

## Communication APIs

### POST `/api/instructor/messages/send`
**Request:**
```typescript
interface SendMessageRequest {
  recipients: {
    studentIds?: string[];
    groupIds?: string[];
    departmentIds?: string[];
    assignmentIds?: string[]; // Message all students in assignment
  };
  
  message: {
    subject: string;
    content: string;
    contentType: 'text' | 'html';
    priority: 'normal' | 'high' | 'urgent';
    category: 'general' | 'assignment' | 'reminder' | 'alert';
  };
  
  delivery: {
    sendImmediately: boolean;
    scheduledAt?: string;
    deliveryMethod: 'app' | 'email' | 'both';
  };
  
  tracking: {
    requireReadReceipt: boolean;
    enableTracking: boolean;
  };
}
```

**Response:**
```typescript
interface SendMessageResponse {
  messageId: string;
  recipientCount: number;
  deliveryStatus: 'sent' | 'scheduled' | 'failed';
  deliveryDetails: {
    successful: number;
    failed: number;
    scheduled: number;
  };
}
```

### GET `/api/instructor/messages`
**Query Parameters:**
- `folder`: 'inbox' | 'sent' | 'drafts' | 'archived'
- `status`: 'read' | 'unread' | 'replied'
- `page`, `limit`, `search`

## Report Generation APIs

### POST `/api/instructor/reports/generate`
**Request:**
```typescript
interface GenerateReportRequest {
  type: 'student-progress' | 'performance-analysis' | 'completion-summary' | 'custom';
  format: 'pdf' | 'csv' | 'excel' | 'json';
  
  filters: {
    timeRange: TimeRange;
    studentIds?: string[];
    modules?: string[];
    assignments?: string[];
    departments?: string[];
  };
  
  options: {
    includeCharts: boolean;
    includeRawData: boolean;
    includeAnalysis: boolean;
    language: 'en' | 'es'; // Localization support
  };
  
  delivery: {
    method: 'download' | 'email';
    emailAddress?: string;
    schedule?: 'once' | 'daily' | 'weekly' | 'monthly';
  };
}
```

**Response:**
```typescript
interface GenerateReportResponse {
  reportId: string;
  status: 'processing' | 'completed' | 'failed';
  estimatedCompletionTime?: number; // seconds
  downloadUrl?: string; // If completed immediately
}
```

### GET `/api/instructor/reports/:id/status`
**Response:**
```typescript
interface ReportStatusResponse {
  reportId: string;
  status: 'processing' | 'completed' | 'failed' | 'expired';
  progress: number; // 0-100
  downloadUrl?: string;
  expiresAt?: string;
  error?: string;
}
```

## WebSocket Real-time Events

### Connection Authentication
```typescript
// Client connection
const socket = io('/instructor', {
  auth: {
    token: accessToken
  },
  transports: ['websocket', 'polling']
});
```

### Event Types
```typescript
interface WebSocketEvents {
  // Student activity updates
  'student:progress': {
    studentId: string;
    progress: ProgressUpdate;
    timestamp: string;
  };
  
  'student:session-start': {
    studentId: string;
    sessionType: 'quiz' | 'voice';
    module: string;
  };
  
  'student:session-complete': {
    studentId: string;
    sessionId: string;
    results: SessionResults;
  };
  
  // Alerts and notifications
  'alert:at-risk-student': {
    studentId: string;
    riskFactors: string[];
    recommendedActions: string[];
  };
  
  'alert:assignment-overdue': {
    assignmentId: string;
    studentIds: string[];
    daysOverdue: number;
  };
  
  // System notifications
  'notification:new-message': {
    messageId: string;
    from: string;
    subject: string;
    priority: MessagePriority;
  };
  
  'system:maintenance': {
    message: string;
    scheduledAt: string;
    duration: number;
  };
}
```

## Rate Limiting & Security

### Rate Limiting Configuration
```typescript
interface RateLimitConfig {
  // Authentication endpoints
  '/api/instructor/auth/login': '5 requests per 15 minutes';
  '/api/instructor/auth/refresh': '10 requests per minute';
  
  // General API endpoints
  '/api/instructor/*': '100 requests per minute';
  
  // Analytics endpoints (heavy queries)
  '/api/instructor/analytics/*': '30 requests per minute';
  
  // Report generation (resource intensive)
  '/api/instructor/reports/generate': '10 requests per hour';
  
  // Bulk operations
  '/api/instructor/students/bulk-action': '20 requests per hour';
  '/api/instructor/messages/send': '50 messages per hour';
}
```

### Security Headers
```typescript
interface SecurityHeaders {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'";
  'X-Frame-Options': 'DENY';
  'X-Content-Type-Options': 'nosniff';
  'Referrer-Policy': 'strict-origin-when-cross-origin';
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()';
}
```

### Input Validation
- **Joi schemas** for request validation
- **Sanitization** of all user inputs
- **SQL injection prevention** through Prisma ORM
- **XSS protection** with content sanitization
- **CSRF protection** with token validation

## Error Handling

### Standard Error Response
```typescript
interface APIError {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
  statusCode: number;
}
```

### Error Codes
```typescript
enum ErrorCodes {
  // Authentication
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  RESOURCE_LOCKED = 'RESOURCE_LOCKED',
  
  // Rate limiting
  RATE_LIMITED = 'RATE_LIMITED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  
  // Business logic
  ASSIGNMENT_ALREADY_SUBMITTED = 'ASSIGNMENT_ALREADY_SUBMITTED',
  STUDENT_NOT_ENROLLED = 'STUDENT_NOT_ENROLLED',
  REPORT_GENERATION_FAILED = 'REPORT_GENERATION_FAILED'
}
```

## Performance Optimizations

### Query Optimization
- **Pagination** for all list endpoints
- **Field selection** to reduce payload size
- **Eager loading** for related data
- **Query result caching** in Redis
- **Database indexes** on frequently queried fields

### Caching Strategy
```typescript
interface CacheStrategy {
  // Dashboard stats: 5-minute cache
  'dashboard:stats': { ttl: 300, invalidateOn: ['student_progress'] };
  
  // Student lists: 1-minute cache
  'students:list': { ttl: 60, invalidateOn: ['student_update'] };
  
  // Analytics data: 15-minute cache
  'analytics:performance': { ttl: 900, invalidateOn: ['session_complete'] };
  
  // Static data: 1-hour cache
  'reference:modules': { ttl: 3600, invalidateOn: ['admin_update'] };
}
```

### Background Processing
- **Bull Queue** for report generation
- **Cron jobs** for analytics pre-computation
- **Event-driven updates** for real-time data
- **Batch processing** for bulk operations

## API Versioning & Documentation

### Versioning Strategy
- URL versioning: `/api/v1/instructor/...`
- Backward compatibility for 2 versions
- Deprecation notices with 6-month timeline
- Migration guides for breaking changes

### OpenAPI Specification
- Complete OpenAPI 3.0 documentation
- Auto-generated client libraries
- Interactive API explorer
- Request/response examples