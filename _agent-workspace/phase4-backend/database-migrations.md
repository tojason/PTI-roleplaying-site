# Database Migrations - Instructor Dashboard Backend

## Migration Strategy

The instructor dashboard requires extending the existing Prisma schema with new models and relationships while maintaining backward compatibility with the existing student application.

### Migration Approach
1. **Additive Changes Only** - No modifications to existing tables
2. **New Instructor Models** - Dedicated tables for instructor functionality
3. **Performance Indexes** - Optimized for 100+ concurrent instructors, 1000+ students each
4. **Analytics Tables** - Pre-computed aggregations for fast dashboard queries
5. **Audit Trail** - Complete logging for compliance and debugging

## New Models and Extensions

### 1. Instructor Profile Extensions

```prisma
// Extend existing User model (no migration needed - already supports INSTRUCTOR role)
// Add new instructor-specific model for additional data

model InstructorProfile {
  id           String   @id @default(cuid())
  userId       String   @unique @map("user_id")
  
  // Professional Information
  employeeId   String?  @unique @map("employee_id")
  certification String[]
  specializations String[] // Areas of expertise
  experience   Int?     // Years of experience
  
  // Department and Organization
  departmentId String   @map("department_id")
  supervisorId String?  @map("supervisor_id")
  territory    String?  // Geographical area
  
  // Dashboard Preferences
  dashboardSettings Json @map("dashboard_settings")
  notificationSettings Json @map("notification_settings")
  
  // Status and Permissions
  isActive     Boolean  @default(true) @map("is_active")
  canAssign    Boolean  @default(true) @map("can_assign")
  canViewAll   Boolean  @default(false) @map("can_view_all") // Department-wide access
  
  // Relationships
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  department   Department @relation(fields: [departmentId], references: [id])
  supervisor   InstructorProfile? @relation("InstructorSupervisor", fields: [supervisorId], references: [id])
  subordinates InstructorProfile[] @relation("InstructorSupervisor")
  
  // Timestamps
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  
  @@index([departmentId], map: "idx_instructor_profile_department")
  @@index([supervisorId], map: "idx_instructor_profile_supervisor")
  @@index([userId], map: "idx_instructor_profile_user")
  @@map("instructor_profiles")
}

// Department model for organizational structure
model Department {
  id          String    @id @default(cuid())
  name        String    @unique
  code        String    @unique // Short department code
  description String?
  
  // Hierarchy
  parentId    String?   @map("parent_id")
  parent      Department? @relation("DepartmentHierarchy", fields: [parentId], references: [id])
  children    Department[] @relation("DepartmentHierarchy")
  
  // Location and Contact
  location    String?
  contactInfo Json?     @map("contact_info")
  
  // Settings
  settings    Json      @default("{}")
  isActive    Boolean   @default(true) @map("is_active")
  
  // Relationships
  instructors InstructorProfile[]
  students    User[]    @relation("UserDepartment")
  
  // Timestamps
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  
  @@index([parentId], map: "idx_department_parent")
  @@index([code], map: "idx_department_code")
  @@map("departments")
}
```

### 2. Student Progress Tracking

```prisma
// Enhanced student progress model for instructor visibility
model StudentProgress {
  id           String   @id @default(cuid())
  studentId    String   @map("student_id")
  instructorId String?  @map("instructor_id") // Optional assigned instructor
  
  // Overall Progress Metrics
  overallScore       Float    @default(0) @map("overall_score")
  completionRate     Float    @default(0) @map("completion_rate")
  currentStreak      Int      @default(0) @map("current_streak")
  longestStreak      Int      @default(0) @map("longest_streak")
  
  // Category-specific Progress
  quizAccuracy       Float    @default(0) @map("quiz_accuracy")
  voiceAccuracy      Float    @default(0) @map("voice_accuracy")
  codesProgress      Float    @default(0) @map("codes_progress")
  phoneticProgress   Float    @default(0) @map("phonetic_progress")
  protocolProgress   Float    @default(0) @map("protocol_progress")
  
  // Time Tracking
  totalTimeSpent     Int      @default(0) @map("total_time_spent") // minutes
  averageSessionTime Float    @default(0) @map("average_session_time") // minutes
  lastActiveAt       DateTime? @map("last_active_at")
  
  // Performance Indicators
  improvementRate    Float    @default(0) @map("improvement_rate") // % improvement over time
  consistencyScore   Float    @default(0) @map("consistency_score") // Regularity of practice
  difficultyLevel    DifficultyLevel @default(EASY) @map("difficulty_level")
  
  // Risk Assessment
  riskScore          Float    @default(0) @map("risk_score") // 0-100, higher = more at risk
  riskFactors        String[] @map("risk_factors")
  lastRiskEvaluation DateTime? @map("last_risk_evaluation")
  
  // Goals and Targets
  targetScore        Float?   @map("target_score")
  targetDate         DateTime? @map("target_date")
  goalAchieved       Boolean  @default(false) @map("goal_achieved")
  
  // Relationships
  student            User     @relation("StudentProgress", fields: [studentId], references: [id], onDelete: Cascade)
  instructor         User?    @relation("InstructorStudents", fields: [instructorId], references: [id])
  
  // Timestamps
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")
  
  @@unique([studentId])
  @@index([instructorId], map: "idx_student_progress_instructor")
  @@index([riskScore], map: "idx_student_progress_risk")
  @@index([lastActiveAt], map: "idx_student_progress_last_active")
  @@index([overallScore], map: "idx_student_progress_overall_score")
  @@map("student_progress")
}

// Daily progress snapshots for trend analysis
model ProgressSnapshot {
  id                 String   @id @default(cuid())
  studentId          String   @map("student_id")
  snapshotDate       DateTime @map("snapshot_date") @db.Date
  
  // Daily Metrics
  sessionsCompleted  Int      @default(0) @map("sessions_completed")
  totalTimeSpent     Int      @default(0) @map("total_time_spent") // minutes
  questionsAnswered  Int      @default(0) @map("questions_answered")
  correctAnswers     Int      @default(0) @map("correct_answers")
  
  // Scores
  dailyAccuracy      Float    @default(0) @map("daily_accuracy")
  overallScore       Float    @default(0) @map("overall_score")
  improvementDelta   Float    @default(0) @map("improvement_delta")
  
  // Activity Patterns
  peakActivityHour   Int?     @map("peak_activity_hour") // 0-23
  sessionCount       Int      @default(0) @map("session_count")
  avgSessionLength   Float    @default(0) @map("avg_session_length")
  
  // Relationships
  student            User     @relation("StudentSnapshots", fields: [studentId], references: [id], onDelete: Cascade)
  
  @@unique([studentId, snapshotDate])
  @@index([snapshotDate], map: "idx_progress_snapshot_date")
  @@index([studentId, snapshotDate], map: "idx_progress_snapshot_student_date")
  @@map("progress_snapshots")
}
```

### 3. Assignment and Goal Management

```prisma
model Assignment {
  id               String   @id @default(cuid())
  instructorId     String   @map("instructor_id")
  
  // Assignment Details
  title            String
  description      String
  instructions     String?
  
  // Requirements
  modules          String[] // Module IDs to complete
  targetScore      Float    @map("target_score")
  maxAttempts      Int?     @default(3) @map("max_attempts")
  allowRetakes     Boolean  @default(true) @map("allow_retakes")
  
  // Scheduling
  assignedAt       DateTime @default(now()) @map("assigned_at")
  dueDate          DateTime @map("due_date")
  availableFrom    DateTime? @map("available_from")
  availableUntil   DateTime? @map("available_until")
  
  // Status and Settings
  status           AssignmentStatus @default(ACTIVE)
  priority         AssignmentPriority @default(NORMAL)
  isTemplate       Boolean  @default(false) @map("is_template")
  
  // Metadata
  estimatedDuration Int?    @map("estimated_duration") // minutes
  tags             String[] @default([])
  category         String?
  
  // Relationships
  instructor       User     @relation("InstructorAssignments", fields: [instructorId], references: [id])
  submissions      AssignmentSubmission[]
  
  // Timestamps
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")
  
  @@index([instructorId], map: "idx_assignment_instructor")
  @@index([dueDate], map: "idx_assignment_due_date")
  @@index([status], map: "idx_assignment_status")
  @@index([assignedAt], map: "idx_assignment_assigned_at")
  @@map("assignments")
}

model AssignmentSubmission {
  id            String    @id @default(cuid())
  assignmentId  String    @map("assignment_id")
  studentId     String    @map("student_id")
  
  // Submission Details
  status        SubmissionStatus @default(NOT_STARTED)
  attemptNumber Int       @default(1) @map("attempt_number")
  score         Float?
  completedAt   DateTime? @map("completed_at")
  
  // Session Data
  sessions      Json[]    // Array of session IDs and results
  totalTime     Int       @default(0) @map("total_time") // minutes
  
  // Feedback
  instructorFeedback String? @map("instructor_feedback")
  autoFeedback       String? @map("auto_feedback")
  
  // Relationships
  assignment    Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  student       User       @relation("StudentSubmissions", fields: [studentId], references: [id], onDelete: Cascade)
  
  // Timestamps
  startedAt     DateTime?  @map("started_at")
  submittedAt   DateTime?  @map("submitted_at")
  createdAt     DateTime   @default(now()) @map("created_at")
  updatedAt     DateTime   @updatedAt @map("updated_at")
  
  @@unique([assignmentId, studentId, attemptNumber])
  @@index([studentId], map: "idx_assignment_submission_student")
  @@index([assignmentId], map: "idx_assignment_submission_assignment")
  @@index([status], map: "idx_assignment_submission_status")
  @@index([completedAt], map: "idx_assignment_submission_completed")
  @@map("assignment_submissions")
}

// Enums for assignments
enum AssignmentStatus {
  DRAFT
  SCHEDULED
  ACTIVE
  PAUSED
  COMPLETED
  ARCHIVED
}

enum AssignmentPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum SubmissionStatus {
  NOT_STARTED
  IN_PROGRESS
  SUBMITTED
  COMPLETED
  OVERDUE
  GRADED
}
```

### 4. Analytics and Reporting

```prisma
// Pre-computed analytics for fast dashboard queries
model AnalyticsDaily {
  id             String   @id @default(cuid())
  date           DateTime @db.Date
  instructorId   String?  @map("instructor_id")
  departmentId   String?  @map("department_id")
  
  // Student Metrics
  totalStudents        Int @default(0) @map("total_students")
  activeStudents       Int @default(0) @map("active_students")
  newRegistrations     Int @default(0) @map("new_registrations")
  atRiskStudents       Int @default(0) @map("at_risk_students")
  
  // Performance Metrics
  totalSessions        Int @default(0) @map("total_sessions")
  completedSessions    Int @default(0) @map("completed_sessions")
  averageScore         Float @default(0) @map("average_score")
  totalTimeSpent       Int @default(0) @map("total_time_spent") // minutes
  
  // Activity Metrics
  quizSessions         Int @default(0) @map("quiz_sessions")
  voiceSessions        Int @default(0) @map("voice_sessions")
  averageSessionLength Float @default(0) @map("average_session_length")
  
  // Assignment Metrics
  assignmentsCreated   Int @default(0) @map("assignments_created")
  assignmentsCompleted Int @default(0) @map("assignments_completed")
  assignmentsOverdue   Int @default(0) @map("assignments_overdue")
  
  // Engagement Metrics
  uniqueActiveUsers    Int @default(0) @map("unique_active_users")
  totalLogins          Int @default(0) @map("total_logins")
  bounceRate           Float @default(0) @map("bounce_rate")
  retentionRate        Float @default(0) @map("retention_rate")
  
  // Relationships
  instructor     User?       @relation("InstructorAnalytics", fields: [instructorId], references: [id])
  department     Department? @relation("DepartmentAnalytics", fields: [departmentId], references: [id])
  
  @@unique([date, instructorId, departmentId])
  @@index([date], map: "idx_analytics_daily_date")
  @@index([instructorId, date], map: "idx_analytics_daily_instructor_date")
  @@index([departmentId, date], map: "idx_analytics_daily_department_date")
  @@map("analytics_daily")
}

// Module-specific performance analytics
model ModuleAnalytics {
  id           String   @id @default(cuid())
  date         DateTime @db.Date
  moduleId     String   @map("module_id")
  category     QuizCategory
  difficulty   DifficultyLevel
  
  // Performance Metrics
  totalAttempts       Int @default(0) @map("total_attempts")
  successfulAttempts  Int @default(0) @map("successful_attempts")
  averageScore        Float @default(0) @map("average_score")
  averageTime         Float @default(0) @map("average_time")
  
  // Difficulty Analysis
  completionRate      Float @default(0) @map("completion_rate")
  retryRate           Float @default(0) @map("retry_rate")
  abandonmentRate     Float @default(0) @map("abandonment_rate")
  
  // Question Analysis
  questionStats       Json @map("question_stats") // Per-question statistics
  
  @@unique([date, moduleId, category, difficulty])
  @@index([date], map: "idx_module_analytics_date")
  @@index([moduleId], map: "idx_module_analytics_module")
  @@index([category], map: "idx_module_analytics_category")
  @@map("module_analytics")
}
```

### 5. Communication and Notifications

```prisma
model Message {
  id           String    @id @default(cuid())
  senderId     String    @map("sender_id")
  
  // Message Content
  subject      String
  content      String
  contentType  MessageType @default(TEXT) @map("content_type")
  
  // Classification
  category     MessageCategory @default(GENERAL)
  priority     MessagePriority @default(NORMAL)
  
  // Recipients (JSON array of recipient info)
  recipients   Json // [{id, type: 'user'|'group'|'department', status: 'sent'|'delivered'|'read'}]
  
  // Delivery Settings
  deliveryMethod String[] @default(["app"]) @map("delivery_method") // app, email, sms
  scheduledAt    DateTime? @map("scheduled_at")
  expiresAt      DateTime? @map("expires_at")
  
  // Status and Tracking
  status         MessageStatus @default(DRAFT)
  readReceipts   Json @default("{}") @map("read_receipts") // {userId: timestamp}
  deliveryStatus Json @default("{}") @map("delivery_status")
  
  // Relationships
  sender         User @relation("SentMessages", fields: [senderId], references: [id])
  replies        Message[] @relation("MessageThread")
  parentMessage  Message? @relation("MessageThread", fields: [parentId], references: [id])
  parentId       String? @map("parent_id")
  
  // Timestamps
  sentAt         DateTime? @map("sent_at")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")
  
  @@index([senderId], map: "idx_message_sender")
  @@index([status], map: "idx_message_status")
  @@index([category], map: "idx_message_category")
  @@index([scheduledAt], map: "idx_message_scheduled")
  @@index([sentAt], map: "idx_message_sent")
  @@map("messages")
}

model Notification {
  id           String   @id @default(cuid())
  userId       String   @map("user_id")
  
  // Notification Content
  title        String
  message      String
  actionUrl    String?  @map("action_url")
  
  // Classification
  type         NotificationType
  category     String?
  priority     NotificationPriority @default(NORMAL)
  
  // Status
  isRead       Boolean  @default(false) @map("is_read")
  isArchived   Boolean  @default(false) @map("is_archived")
  
  // Metadata
  metadata     Json     @default("{}")
  expiresAt    DateTime? @map("expires_at")
  
  // Relationships
  user         User     @relation("UserNotifications", fields: [userId], references: [id], onDelete: Cascade)
  
  // Timestamps
  readAt       DateTime? @map("read_at")
  createdAt    DateTime @default(now()) @map("created_at")
  
  @@index([userId], map: "idx_notification_user")
  @@index([userId, isRead], map: "idx_notification_user_read")
  @@index([type], map: "idx_notification_type")
  @@index([createdAt], map: "idx_notification_created")
  @@map("notifications")
}

// Enums for communication
enum MessageType {
  TEXT
  HTML
  MARKDOWN
}

enum MessageCategory {
  GENERAL
  ASSIGNMENT
  REMINDER
  ALERT
  ANNOUNCEMENT
  FEEDBACK
}

enum MessagePriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum MessageStatus {
  DRAFT
  SCHEDULED
  SENT
  DELIVERED
  FAILED
  ARCHIVED
}

enum NotificationType {
  ASSIGNMENT_CREATED
  ASSIGNMENT_DUE
  ASSIGNMENT_OVERDUE
  STUDENT_AT_RISK
  PROGRESS_MILESTONE
  SYSTEM_ALERT
  MESSAGE_RECEIVED
  REPORT_READY
}

enum NotificationPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}
```

### 6. Audit Trail and Logging

```prisma
model AuditLog {
  id           String   @id @default(cuid())
  
  // Actor Information
  userId       String?  @map("user_id")
  userEmail    String?  @map("user_email")
  userRole     UserRole? @map("user_role")
  ipAddress    String?  @map("ip_address")
  userAgent    String?  @map("user_agent")
  
  // Action Details
  action       String   // e.g., "create_assignment", "view_student_progress"
  resource     String   // e.g., "assignment", "student", "analytics"
  resourceId   String?  @map("resource_id")
  
  // Request Context
  method       String?  // HTTP method
  endpoint     String?  // API endpoint
  requestId    String?  @map("request_id")
  sessionId    String?  @map("session_id")
  
  // Change Details
  oldData      Json?    @map("old_data")
  newData      Json?    @map("new_data")
  changes      Json?    // Specific fields changed
  
  // Result
  success      Boolean  @default(true)
  errorMessage String?  @map("error_message")
  
  // Relationships
  user         User?    @relation("UserAuditLogs", fields: [userId], references: [id])
  
  // Timestamps
  timestamp    DateTime @default(now())
  
  @@index([userId], map: "idx_audit_log_user")
  @@index([action], map: "idx_audit_log_action")
  @@index([resource], map: "idx_audit_log_resource")
  @@index([timestamp], map: "idx_audit_log_timestamp")
  @@index([sessionId], map: "idx_audit_log_session")
  @@map("audit_logs")
}

model SystemLog {
  id          String    @id @default(cuid())
  
  // Log Classification
  level       LogLevel  // ERROR, WARN, INFO, DEBUG
  category    String    // e.g., "authentication", "database", "performance"
  service     String?   // Microservice or component name
  
  // Message
  message     String
  details     Json?
  
  // Context
  requestId   String?   @map("request_id")
  sessionId   String?   @map("session_id")
  traceId     String?   @map("trace_id")
  
  // Error Information (if applicable)
  errorCode   String?   @map("error_code")
  stackTrace  String?   @map("stack_trace")
  
  // Performance (if applicable)
  duration    Int?      // milliseconds
  memoryUsage BigInt?   @map("memory_usage") // bytes
  
  // Timestamps
  timestamp   DateTime  @default(now())
  
  @@index([level], map: "idx_system_log_level")
  @@index([category], map: "idx_system_log_category")
  @@index([timestamp], map: "idx_system_log_timestamp")
  @@index([requestId], map: "idx_system_log_request")
  @@map("system_logs")
}

enum LogLevel {
  DEBUG
  INFO
  WARN
  ERROR
  FATAL
}
```

## Updated User Model Extensions

```prisma
// Add these relationships to the existing User model
model User {
  // ... existing fields ...
  
  // New instructor relationships
  instructorProfile     InstructorProfile? @relation("InstructorUser")
  instructorStudents    StudentProgress[]  @relation("InstructorStudents")
  instructorAssignments Assignment[]       @relation("InstructorAssignments")
  instructorAnalytics   AnalyticsDaily[]   @relation("InstructorAnalytics")
  
  // Student relationships for instructor dashboard
  studentProgress       StudentProgress?   @relation("StudentProgress")
  progressSnapshots     ProgressSnapshot[] @relation("StudentSnapshots")
  assignmentSubmissions AssignmentSubmission[] @relation("StudentSubmissions")
  
  // Communication
  sentMessages          Message[]          @relation("SentMessages")
  notifications         Notification[]     @relation("UserNotifications")
  
  // Audit
  auditLogs             AuditLog[]         @relation("UserAuditLogs")
  
  // Department assignment
  department            Department?        @relation("UserDepartment", fields: [departmentId], references: [id])
  departmentId          String?            @map("department_id")
  
  // Add department index
  @@index([departmentId], map: "idx_users_department")
}
```

## Performance Indexes

### Critical Performance Indexes

```sql
-- Student Progress Query Optimization
CREATE INDEX CONCURRENTLY idx_student_progress_instructor_risk 
ON student_progress (instructor_id, risk_score DESC, last_active_at DESC);

CREATE INDEX CONCURRENTLY idx_student_progress_overall_performance 
ON student_progress (overall_score DESC, completion_rate DESC);

-- Assignment Performance
CREATE INDEX CONCURRENTLY idx_assignment_submission_due_status 
ON assignment_submissions (assignment_id, status, created_at);

-- Analytics Query Optimization
CREATE INDEX CONCURRENTLY idx_analytics_daily_instructor_timerange 
ON analytics_daily (instructor_id, date DESC);

-- Progress Snapshots for Trending
CREATE INDEX CONCURRENTLY idx_progress_snapshot_student_timerange 
ON progress_snapshots (student_id, snapshot_date DESC);

-- Message and Notification Performance
CREATE INDEX CONCURRENTLY idx_message_recipient_status 
ON messages USING GIN ((recipients->'status'));

CREATE INDEX CONCURRENTLY idx_notification_user_unread 
ON notifications (user_id, created_at DESC) WHERE is_read = false;

-- Audit Log Performance
CREATE INDEX CONCURRENTLY idx_audit_log_user_timerange 
ON audit_logs (user_id, timestamp DESC);

-- Quiz and Voice Session Performance
CREATE INDEX CONCURRENTLY idx_quiz_session_user_category_date 
ON quiz_sessions (user_id, category, started_at DESC);

CREATE INDEX CONCURRENTLY idx_voice_practice_user_date 
ON voice_practice_sessions (user_id, created_at DESC);
```

### Composite Indexes for Complex Queries

```sql
-- Dashboard stats aggregation
CREATE INDEX CONCURRENTLY idx_dashboard_aggregation 
ON student_progress (instructor_id, last_active_at, risk_score, overall_score);

-- Assignment monitoring
CREATE INDEX CONCURRENTLY idx_assignment_monitoring 
ON assignments (instructor_id, status, due_date, created_at);

-- Student filtering and sorting
CREATE INDEX CONCURRENTLY idx_student_filtering 
ON student_progress (instructor_id, overall_score DESC, last_active_at DESC, risk_score);

-- Analytics time-series queries
CREATE INDEX CONCURRENTLY idx_analytics_timeseries 
ON analytics_daily (instructor_id, date) INCLUDE (total_students, active_students, average_score);
```

## Migration Script Template

```typescript
// Example migration for adding instructor dashboard tables
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateInstructorDashboard() {
  try {
    console.log('Starting instructor dashboard migration...');
    
    // 1. Create departments
    console.log('Creating departments...');
    const departments = await prisma.department.createMany({
      data: [
        { name: 'Metro Police Department', code: 'MPD' },
        { name: 'State Highway Patrol', code: 'SHP' },
        { name: 'County Sheriff', code: 'CSO' },
      ],
      skipDuplicates: true,
    });
    
    // 2. Initialize student progress records
    console.log('Initializing student progress records...');
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: { id: true },
    });
    
    const progressData = users.map(user => ({
      studentId: user.id,
      overallScore: 0,
      completionRate: 0,
      // ... other default values
    }));
    
    await prisma.studentProgress.createMany({
      data: progressData,
      skipDuplicates: true,
    });
    
    // 3. Create initial analytics snapshots
    console.log('Creating initial analytics snapshots...');
    await generateInitialAnalytics();
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function generateInitialAnalytics() {
  // Generate initial analytics data for the past 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Implementation for initial analytics generation
  // This would involve aggregating existing session data
}

// Run migration
migrateInstructorDashboard()
  .catch(console.error);
```

## Data Integrity Constraints

### Business Rule Constraints

```sql
-- Ensure students can't be assigned to instructors in different departments
ALTER TABLE student_progress 
ADD CONSTRAINT check_student_instructor_department 
CHECK (
  instructor_id IS NULL OR 
  EXISTS (
    SELECT 1 FROM instructor_profiles ip1, instructor_profiles ip2, users u
    WHERE ip1.user_id = instructor_id 
    AND ip2.user_id = u.id 
    AND u.id = student_id
    AND ip1.department_id = ip2.department_id
  )
);

-- Ensure assignment due dates are in the future when created
ALTER TABLE assignments 
ADD CONSTRAINT check_assignment_due_date 
CHECK (due_date > created_at);

-- Ensure progress percentages are valid
ALTER TABLE student_progress 
ADD CONSTRAINT check_progress_percentages 
CHECK (
  completion_rate >= 0 AND completion_rate <= 100 AND
  quiz_accuracy >= 0 AND quiz_accuracy <= 100 AND
  voice_accuracy >= 0 AND voice_accuracy <= 100
);
```

## Backup and Recovery Strategy

### Automated Backups
- **Daily full backups** of production database
- **Hourly incremental backups** during business hours
- **Point-in-time recovery** capability
- **Cross-region backup replication** for disaster recovery

### Data Retention Policies
- **Audit logs**: 7 years retention
- **Progress snapshots**: 2 years retention
- **System logs**: 90 days retention
- **Analytics data**: 3 years retention
- **Messages**: 1 year retention (configurable)

This comprehensive database migration plan provides the foundation for a scalable instructor dashboard that can handle the specified performance requirements while maintaining data integrity and supporting advanced analytics capabilities.