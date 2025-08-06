# Performance Queries - Instructor Dashboard Backend

## Query Optimization Strategy

The instructor dashboard requires high-performance queries to support 100+ concurrent instructors managing 1000+ students each. This document outlines optimized database queries, caching strategies, and performance monitoring approaches.

### Performance Targets
- **Dashboard Load**: < 2 seconds for complete dashboard
- **Student List**: < 1 second for 20 students with filters
- **Analytics**: < 3 seconds for complex time-series queries
- **Real-time Updates**: < 100ms for progress updates
- **Bulk Operations**: Handle 1000+ students efficiently

## Dashboard Statistics Queries

### 1. Core Dashboard Stats Query

```sql
-- Optimized dashboard statistics with single query
WITH instructor_students AS (
  SELECT sp.student_id, sp.overall_score, sp.completion_rate, 
         sp.last_active_at, sp.risk_score,
         u.created_at as student_joined_at
  FROM student_progress sp
  JOIN users u ON sp.student_id = u.id
  WHERE sp.instructor_id = $1
    AND u.is_active = true
),
date_ranges AS (
  SELECT 
    CURRENT_DATE as today,
    CURRENT_DATE - INTERVAL '7 days' as week_ago,
    CURRENT_DATE - INTERVAL '30 days' as month_ago
),
stats AS (
  SELECT 
    COUNT(*) as total_students,
    COUNT(*) FILTER (WHERE last_active_at >= today) as active_today,
    COUNT(*) FILTER (WHERE last_active_at >= week_ago) as active_week,
    ROUND(AVG(overall_score), 2) as average_progress,
    COUNT(*) FILTER (WHERE risk_score > 70) as at_risk_count,
    ROUND(AVG(completion_rate), 2) as completion_rate,
    COUNT(*) FILTER (WHERE overall_score >= 80) as top_performers,
    COUNT(*) FILTER (WHERE student_joined_at >= month_ago) as new_students
  FROM instructor_students, date_ranges
)
SELECT * FROM stats;
```

**Prisma Implementation:**
```typescript
async function getDashboardStats(instructorId: string) {
  const cacheKey = `dashboard:stats:${instructorId}`;
  
  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const stats = await prisma.$queryRaw`
    WITH instructor_students AS (
      SELECT sp.student_id, sp.overall_score, sp.completion_rate, 
             sp.last_active_at, sp.risk_score,
             u.created_at as student_joined_at
      FROM student_progress sp
      JOIN users u ON sp.student_id = u.id
      WHERE sp.instructor_id = ${instructorId}
        AND u.is_active = true
    )
    -- ... rest of query
  `;
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(stats));
  
  return stats;
}
```

### 2. Trend Data Query (Last 30 Days)

```sql
-- Optimized trend analysis using daily snapshots
SELECT 
  ps.snapshot_date,
  COUNT(DISTINCT ps.student_id) as active_students,
  ROUND(AVG(ps.overall_score), 2) as average_score,
  ROUND(AVG(ps.daily_accuracy), 2) as daily_accuracy,
  SUM(ps.sessions_completed) as total_sessions,
  SUM(ps.total_time_spent) as total_time
FROM progress_snapshots ps
JOIN student_progress sp ON ps.student_id = sp.student_id
WHERE sp.instructor_id = $1
  AND ps.snapshot_date >= CURRENT_DATE - INTERVAL '30 days'
  AND ps.snapshot_date <= CURRENT_DATE
GROUP BY ps.snapshot_date
ORDER BY ps.snapshot_date ASC;
```

**Optimized Prisma Query:**
```typescript
async function getTrendData(instructorId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return prisma.progressSnapshot.groupBy({
    by: ['snapshotDate'],
    where: {
      snapshotDate: {
        gte: startDate,
        lte: new Date(),
      },
      student: {
        studentProgress: {
          instructorId: instructorId,
        },
      },
    },
    _count: {
      studentId: true,
    },
    _avg: {
      overallScore: true,
      dailyAccuracy: true,
    },
    _sum: {
      sessionsCompleted: true,
      totalTimeSpent: true,
    },
    orderBy: {
      snapshotDate: 'asc',
    },
  });
}
```

## Student Management Queries

### 3. Optimized Student List with Filters

```sql
-- High-performance student list with multiple filters and sorting
WITH filtered_students AS (
  SELECT 
    u.id, u.name, u.email, u.pid, u.department, u.avatar,
    sp.overall_score, sp.completion_rate, sp.last_active_at,
    sp.risk_score, sp.current_streak, sp.total_time_spent,
    -- Assignment stats subquery
    (
      SELECT json_build_object(
        'total', COUNT(*),
        'completed', COUNT(*) FILTER (WHERE asm.status = 'COMPLETED'),
        'overdue', COUNT(*) FILTER (WHERE asm.status = 'OVERDUE')
      )
      FROM assignment_submissions asm
      JOIN assignments a ON asm.assignment_id = a.id
      WHERE asm.student_id = u.id 
        AND a.instructor_id = $1
    ) as assignment_stats,
    -- Risk factors
    CASE 
      WHEN sp.risk_score > 80 THEN 'at-risk'
      WHEN sp.overall_score >= 85 THEN 'top-performer'
      WHEN sp.last_active_at < CURRENT_DATE - INTERVAL '7 days' THEN 'inactive'
      ELSE 'active'
    END as status,
    -- Search relevance score
    CASE 
      WHEN $4::text IS NULL THEN 1
      ELSE ts_rank(
        to_tsvector('english', u.name || ' ' || u.email || ' ' || u.pid),
        plainto_tsquery('english', $4)
      )
    END as search_rank
  FROM users u
  JOIN student_progress sp ON u.id = sp.student_id
  WHERE sp.instructor_id = $1
    AND u.is_active = true
    AND ($2 IS NULL OR 
      CASE $2
        WHEN 'active' THEN sp.last_active_at >= CURRENT_DATE - INTERVAL '7 days'
        WHEN 'at-risk' THEN sp.risk_score > 70
        WHEN 'top-performers' THEN sp.overall_score >= 85
        WHEN 'inactive' THEN sp.last_active_at < CURRENT_DATE - INTERVAL '7 days'
        ELSE true
      END
    )
    AND ($4 IS NULL OR 
      to_tsvector('english', u.name || ' ' || u.email || ' ' || u.pid) @@ 
      plainto_tsquery('english', $4)
    )
)
SELECT *,
  COUNT(*) OVER() as total_count
FROM filtered_students
ORDER BY 
  CASE $5 
    WHEN 'name' THEN name
    WHEN 'email' THEN email
    ELSE NULL
  END ASC,
  CASE $5
    WHEN 'progress' THEN overall_score
    WHEN 'last_active' THEN extract(epoch from last_active_at)
    WHEN 'risk' THEN risk_score
    ELSE search_rank
  END DESC
LIMIT $6 OFFSET $7;
```

**Prisma Implementation with Caching:**
```typescript
interface StudentListQuery {
  instructorId: string;
  page?: number;
  limit?: number;
  search?: string;
  filter?: 'all' | 'active' | 'at-risk' | 'top-performers' | 'inactive';
  sortBy?: 'name' | 'progress' | 'lastActive' | 'risk';
  order?: 'asc' | 'desc';
}

async function getStudentList(query: StudentListQuery) {
  const { instructorId, page = 1, limit = 20, search, filter, sortBy = 'name', order = 'asc' } = query;
  
  // Generate cache key based on query parameters
  const cacheKey = `students:list:${Buffer.from(JSON.stringify(query)).toString('base64')}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const offset = (page - 1) * limit;
  
  // Build dynamic where clause
  const whereClause: any = {
    studentProgress: {
      instructorId: instructorId,
    },
    isActive: true,
  };
  
  // Add search condition
  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { pid: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  // Add filter conditions
  if (filter && filter !== 'all') {
    switch (filter) {
      case 'active':
        whereClause.studentProgress.lastActiveAt = {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        };
        break;
      case 'at-risk':
        whereClause.studentProgress.riskScore = { gt: 70 };
        break;
      case 'top-performers':
        whereClause.studentProgress.overallScore = { gte: 85 };
        break;
      case 'inactive':
        whereClause.studentProgress.lastActiveAt = {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        };
        break;
    }
  }
  
  // Build order by clause
  const orderBy: any = {};
  switch (sortBy) {
    case 'progress':
      orderBy.studentProgress = { overallScore: order };
      break;
    case 'lastActive':
      orderBy.studentProgress = { lastActiveAt: order };
      break;
    case 'risk':
      orderBy.studentProgress = { riskScore: order };
      break;
    default:
      orderBy.name = order;
  }
  
  const [students, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        pid: true,
        department: true,
        avatar: true,
        studentProgress: {
          select: {
            overallScore: true,
            completionRate: true,
            lastActiveAt: true,
            riskScore: true,
            currentStreak: true,
            totalTimeSpent: true,
            riskFactors: true,
          },
        },
        assignmentSubmissions: {
          select: {
            status: true,
          },
          where: {
            assignment: {
              instructorId: instructorId,
            },
          },
        },
      },
      orderBy,
      take: limit,
      skip: offset,
    }),
    prisma.user.count({ where: whereClause }),
  ]);
  
  const result = {
    students: students.map(student => ({
      ...student,
      progress: student.studentProgress,
      assignments: {
        total: student.assignmentSubmissions.length,
        completed: student.assignmentSubmissions.filter(s => s.status === 'COMPLETED').length,
        overdue: student.assignmentSubmissions.filter(s => s.status === 'OVERDUE').length,
      },
      status: getStudentStatus(student.studentProgress),
    })),
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page * limit < totalCount,
      hasPrevious: page > 1,
    },
  };
  
  // Cache for 1 minute
  await redis.setex(cacheKey, 60, JSON.stringify(result));
  
  return result;
}
```

### 4. Student Detail Query

```sql
-- Comprehensive student detail with all related data
WITH student_overview AS (
  SELECT 
    u.id, u.name, u.email, u.pid, u.department, u.rank, u.avatar,
    u.created_at, u.last_login_at,
    sp.overall_score, sp.completion_rate, sp.quiz_accuracy, sp.voice_accuracy,
    sp.current_streak, sp.longest_streak, sp.total_time_spent,
    sp.last_active_at, sp.risk_score, sp.risk_factors,
    sp.target_score, sp.target_date, sp.goal_achieved
  FROM users u
  JOIN student_progress sp ON u.id = sp.student_id
  WHERE u.id = $1 AND sp.instructor_id = $2
),
recent_sessions AS (
  SELECT 
    'quiz' as type, qs.id, qs.category, qs.score, qs.duration,
    qs.completed_at, qs.total_questions, qs.correct_answers
  FROM quiz_sessions qs
  WHERE qs.user_id = $1 AND qs.status = 'COMPLETED'
  ORDER BY qs.completed_at DESC
  LIMIT 10
  
  UNION ALL
  
  SELECT 
    'voice' as type, vps.id, vps.scenario_id::text as category, 
    vps.accuracy_score::float as score, vps.duration,
    vps.created_at as completed_at, 1 as total_questions, 
    CASE WHEN vps.accuracy_score >= 70 THEN 1 ELSE 0 END as correct_answers
  FROM voice_practice_sessions vps
  WHERE vps.user_id = $1 AND vps.status = 'COMPLETED'
  ORDER BY vps.created_at DESC
  LIMIT 10
),
assignments AS (
  SELECT 
    a.id, a.title, a.description, a.due_date, a.target_score,
    asm.status, asm.score, asm.completed_at, asm.attempt_number
  FROM assignments a
  LEFT JOIN assignment_submissions asm ON a.id = asm.assignment_id AND asm.student_id = $1
  WHERE a.instructor_id = $2
  ORDER BY a.created_at DESC
),
achievements AS (
  SELECT 
    ach.name, ach.title, ach.description, ach.icon, ach.badge_color,
    ua.unlocked_at
  FROM user_achievements ua
  JOIN achievements ach ON ua.achievement_id = ach.id
  WHERE ua.user_id = $1
  ORDER BY ua.unlocked_at DESC
)
SELECT 
  json_build_object(
    'student', (SELECT row_to_json(s) FROM student_overview s),
    'recentSessions', (SELECT json_agg(rs) FROM recent_sessions rs),
    'assignments', (SELECT json_agg(a) FROM assignments a),
    'achievements', (SELECT json_agg(ach) FROM achievements ach)
  ) as student_detail;
```

## Analytics Queries

### 5. Performance Analytics Query

```sql
-- Comprehensive performance analytics with time grouping
WITH date_series AS (
  SELECT generate_series(
    date_trunc($3, $1::timestamp),
    date_trunc($3, $2::timestamp),
    ('1 ' || $3)::interval
  )::date as period_date
),
aggregated_data AS (
  SELECT 
    date_trunc($3, ps.snapshot_date)::date as period,
    COUNT(DISTINCT ps.student_id) as active_students,
    AVG(ps.overall_score) as avg_score,
    AVG(ps.daily_accuracy) as avg_accuracy,
    SUM(ps.sessions_completed) as total_sessions,
    SUM(ps.total_time_spent) as total_time,
    AVG(ps.avg_session_length) as avg_session_length
  FROM progress_snapshots ps
  JOIN student_progress sp ON ps.student_id = sp.student_id
  WHERE sp.instructor_id = $4
    AND ps.snapshot_date BETWEEN $1 AND $2
  GROUP BY date_trunc($3, ps.snapshot_date)
),
module_performance AS (
  SELECT 
    qs.category,
    COUNT(*) as total_sessions,
    AVG(qs.score) as avg_score,
    AVG(qs.duration) as avg_duration,
    COUNT(*) FILTER (WHERE qs.score >= 70) as passing_sessions
  FROM quiz_sessions qs
  JOIN student_progress sp ON qs.user_id = sp.student_id
  WHERE sp.instructor_id = $4
    AND qs.completed_at BETWEEN $1 AND $2
    AND qs.status = 'COMPLETED'
  GROUP BY qs.category
),
difficulty_analysis AS (
  SELECT 
    qs.difficulty,
    qs.category,
    COUNT(*) as attempts,
    AVG(qs.score) as avg_score,
    STDDEV(qs.score) as score_stddev
  FROM quiz_sessions qs
  JOIN student_progress sp ON qs.user_id = sp.student_id
  WHERE sp.instructor_id = $4
    AND qs.completed_at BETWEEN $1 AND $2
    AND qs.status = 'COMPLETED'
  GROUP BY qs.difficulty, qs.category
)
SELECT 
  json_build_object(
    'timeSeries', (
      SELECT json_agg(
        json_build_object(
          'date', ds.period_date,
          'activeStudents', COALESCE(ad.active_students, 0),
          'averageScore', COALESCE(ROUND(ad.avg_score, 2), 0),
          'totalSessions', COALESCE(ad.total_sessions, 0),
          'totalTime', COALESCE(ad.total_time, 0)
        ) ORDER BY ds.period_date
      )
      FROM date_series ds
      LEFT JOIN aggregated_data ad ON ds.period_date = ad.period
    ),
    'moduleBreakdown', (
      SELECT json_agg(
        json_build_object(
          'module', mp.category,
          'totalSessions', mp.total_sessions,
          'averageScore', ROUND(mp.avg_score, 2),
          'averageDuration', ROUND(mp.avg_duration, 2),
          'passRate', ROUND((mp.passing_sessions::float / mp.total_sessions * 100), 2)
        )
      )
      FROM module_performance mp
    ),
    'difficultyAnalysis', (
      SELECT json_agg(
        json_build_object(
          'difficulty', da.difficulty,
          'category', da.category,
          'attempts', da.attempts,
          'averageScore', ROUND(da.avg_score, 2),
          'scoreVariability', ROUND(da.score_stddev, 2)
        )
      )
      FROM difficulty_analysis da
    )
  ) as analytics_data;
```

**Prisma Implementation with Advanced Caching:**
```typescript
async function getPerformanceAnalytics(
  instructorId: string,
  startDate: Date,
  endDate: Date,
  groupBy: 'day' | 'week' | 'month'
) {
  const cacheKey = `analytics:performance:${instructorId}:${startDate.toISOString()}:${endDate.toISOString()}:${groupBy}`;
  
  // Check cache first (15-minute TTL for analytics)
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Execute complex query
  const result = await prisma.$queryRaw`
    -- Complex analytics query here
  `;
  
  // Cache for 15 minutes
  await redis.setex(cacheKey, 900, JSON.stringify(result));
  
  return result;
}
```

### 6. Real-time Progress Update Query

```sql
-- Optimized real-time progress update
WITH updated_progress AS (
  UPDATE student_progress 
  SET 
    overall_score = (
      SELECT AVG(
        CASE 
          WHEN category = 'quiz' THEN (correct_answers::float / total_questions * 100)
          ELSE average_accuracy
        END
      )
      FROM progress 
      WHERE user_id = $1
    ),
    quiz_accuracy = (
      SELECT AVG(score)
      FROM quiz_sessions
      WHERE user_id = $1 AND status = 'COMPLETED'
      AND completed_at >= CURRENT_DATE - INTERVAL '30 days'
    ),
    voice_accuracy = (
      SELECT AVG(accuracy_score)
      FROM voice_practice_sessions
      WHERE user_id = $1 AND status = 'COMPLETED'
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    ),
    last_active_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
  WHERE student_id = $1
  RETURNING *
)
SELECT 
  up.*,
  u.name, u.email
FROM updated_progress up
JOIN users u ON up.student_id = u.id;
```

**Optimized Prisma Implementation:**
```typescript
async function updateStudentProgress(studentId: string) {
  // Use transaction for consistency
  return prisma.$transaction(async (tx) => {
    // 1. Calculate new metrics
    const [quizStats, voiceStats, overallStats] = await Promise.all([
      tx.quizSession.aggregate({
        where: {
          userId: studentId,
          status: 'COMPLETED',
          completedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        },
        _avg: { score: true },
        _count: true,
      }),
      tx.voicePracticeSession.aggregate({
        where: {
          userId: studentId,
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        },
        _avg: { accuracyScore: true },
        _count: true,
      }),
      tx.progress.aggregate({
        where: { userId: studentId },
        _avg: { averageAccuracy: true },
      }),
    ]);
    
    // 2. Update student progress
    const updated = await tx.studentProgress.update({
      where: { studentId },
      data: {
        overallScore: overallStats._avg.averageAccuracy || 0,
        quizAccuracy: quizStats._avg.score || 0,
        voiceAccuracy: voiceStats._avg.accuracyScore || 0,
        lastActiveAt: new Date(),
      },
      include: {
        student: {
          select: { name: true, email: true },
        },
      },
    });
    
    // 3. Invalidate related caches
    const instructorId = updated.instructorId;
    if (instructorId) {
      await Promise.all([
        redis.del(`dashboard:stats:${instructorId}`),
        redis.del(`students:list:*`), // Invalidate all student list caches
      ]);
    }
    
    return updated;
  });
}
```

## Bulk Operations

### 7. Bulk Student Assignment Query

```sql
-- Efficient bulk assignment creation
WITH assignment_data AS (
  SELECT 
    $1::uuid as assignment_id,
    unnest($2::uuid[]) as student_id,
    CURRENT_TIMESTAMP as created_at
),
inserted_submissions AS (
  INSERT INTO assignment_submissions (assignment_id, student_id, status, created_at)
  SELECT assignment_id, student_id, 'NOT_STARTED', created_at
  FROM assignment_data
  ON CONFLICT (assignment_id, student_id, attempt_number) DO NOTHING
  RETURNING *
)
SELECT 
  COUNT(*) as assigned_count,
  array_agg(student_id) as assigned_students
FROM inserted_submissions;
```

### 8. Bulk Message Send Query

```sql
-- Optimized bulk message sending with recipient tracking
WITH message_insert AS (
  INSERT INTO messages (
    sender_id, subject, content, category, priority,
    recipients, delivery_method, status, created_at
  )
  VALUES (
    $1, $2, $3, $4, $5,
    $6::json, $7::text[], 'SENT', CURRENT_TIMESTAMP
  )
  RETURNING id, recipients
),
notification_data AS (
  SELECT 
    mi.id as message_id,
    (json_array_elements(mi.recipients)->>'id')::uuid as user_id,
    'MESSAGE_RECEIVED' as type,
    $2 as title,
    substring($3, 1, 100) as message
  FROM message_insert mi
)
INSERT INTO notifications (user_id, type, title, message, metadata, created_at)
SELECT 
  user_id, type, title, message,
  json_build_object('messageId', message_id),
  CURRENT_TIMESTAMP
FROM notification_data;
```

## Caching Strategies

### Redis Caching Implementation

```typescript
class CacheManager {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }
  
  // Cache keys with TTL
  private cacheConfigs = {
    'dashboard:stats': { ttl: 300 }, // 5 minutes
    'students:list': { ttl: 60 }, // 1 minute
    'analytics:performance': { ttl: 900 }, // 15 minutes
    'student:detail': { ttl: 180 }, // 3 minutes
    'assignments:list': { ttl: 300 }, // 5 minutes
  };
  
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  async set(key: string, value: any, customTTL?: number): Promise<void> {
    try {
      const config = this.getCacheConfig(key);
      const ttl = customTTL || config.ttl;
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
  
  private getCacheConfig(key: string) {
    const prefix = key.split(':')[0] + ':' + key.split(':')[1];
    return this.cacheConfigs[prefix] || { ttl: 300 };
  }
}

// Usage in API routes
const cache = new CacheManager();

export async function getCachedDashboardStats(instructorId: string) {
  const cacheKey = `dashboard:stats:${instructorId}`;
  
  let stats = await cache.get(cacheKey);
  if (!stats) {
    stats = await getDashboardStats(instructorId);
    await cache.set(cacheKey, stats);
  }
  
  return stats;
}
```

### Database Query Optimization

```sql
-- Create materialized view for instructor dashboard
CREATE MATERIALIZED VIEW instructor_dashboard_summary AS
SELECT 
  sp.instructor_id,
  COUNT(*) as total_students,
  COUNT(*) FILTER (WHERE sp.last_active_at >= CURRENT_DATE - INTERVAL '1 day') as active_today,
  COUNT(*) FILTER (WHERE sp.last_active_at >= CURRENT_DATE - INTERVAL '7 days') as active_week,
  ROUND(AVG(sp.overall_score), 2) as average_score,
  COUNT(*) FILTER (WHERE sp.risk_score > 70) as at_risk_count,
  ROUND(AVG(sp.completion_rate), 2) as completion_rate,
  MAX(sp.updated_at) as last_updated
FROM student_progress sp
JOIN users u ON sp.student_id = u.id
WHERE u.is_active = true
GROUP BY sp.instructor_id;

-- Create unique index for fast lookups
CREATE UNIQUE INDEX idx_instructor_dashboard_summary_instructor 
ON instructor_dashboard_summary (instructor_id);

-- Refresh materialized view every 5 minutes
-- This would be done via a cron job or background task
```

### Background Jobs for Heavy Queries

```typescript
// Bull queue for background processing
import Bull from 'bull';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);
const analyticsQueue = new Bull('analytics processing', {
  redis: { port: 6379, host: 'localhost' },
});

// Process analytics generation in background
analyticsQueue.process('generate-report', async (job) => {
  const { instructorId, reportType, timeRange } = job.data;
  
  try {
    // Generate complex report
    const report = await generateComplexReport(reportType, instructorId, timeRange);
    
    // Store result in cache
    await cache.set(`report:${job.id}`, report, 3600); // 1 hour
    
    // Notify completion via WebSocket
    io.to(`instructor:${instructorId}`).emit('report:ready', {
      reportId: job.id,
      downloadUrl: `/api/reports/${job.id}/download`,
    });
    
    return report;
  } catch (error) {
    console.error('Report generation failed:', error);
    throw error;
  }
});

// API endpoint to trigger background job
export async function generateReport(req: NextRequest) {
  const { instructorId, reportType, timeRange } = await req.json();
  
  const job = await analyticsQueue.add('generate-report', {
    instructorId,
    reportType,
    timeRange,
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 10000,
    },
  });
  
  return NextResponse.json({
    reportId: job.id,
    status: 'processing',
    estimatedCompletion: Date.now() + 30000, // 30 seconds
  });
}
```

## Performance Monitoring

### Query Performance Tracking

```typescript
// Query performance middleware
export function withQueryTracking<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    
    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;
      
      // Log slow queries
      if (duration > 1000) {
        console.warn(`Slow query detected: ${queryName} took ${duration}ms`);
      }
      
      // Store performance metrics
      await redis.lpush('query:performance', JSON.stringify({
        query: queryName,
        duration,
        timestamp: new Date().toISOString(),
      }));
      
      // Keep only last 1000 entries
      await redis.ltrim('query:performance', 0, 999);
      
      resolve(result);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`Query failed: ${queryName} after ${duration}ms`, error);
      
      // Log error
      await redis.lpush('query:errors', JSON.stringify({
        query: queryName,
        error: error.message,
        duration,
        timestamp: new Date().toISOString(),
      }));
      
      reject(error);
    }
  });
}

// Usage
export async function getDashboardStatsWithTracking(instructorId: string) {
  return withQueryTracking('getDashboardStats', () => 
    getDashboardStats(instructorId)
  );
}
```

### Database Connection Pooling

```typescript
// Optimized Prisma client configuration
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

// Log slow queries
prisma.$on('query', (e) => {
  if (e.duration > 1000) {
    console.log(`Slow Query: ${e.duration}ms - ${e.query}`);
  }
});

// Connection pool optimization for high concurrency
// Add to DATABASE_URL:
// ?connection_limit=20&pool_timeout=20&socket_timeout=60
```

This comprehensive performance optimization strategy ensures the instructor dashboard can handle the specified load requirements while maintaining sub-second response times for most operations.