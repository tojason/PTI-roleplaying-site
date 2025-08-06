# API Integration Plan - Instructor Dashboard

## API Architecture Overview

The instructor dashboard integrates with the backend through RESTful APIs, using Next.js API routes as the backend layer.

## Authentication APIs

### POST `/api/instructor/auth/login`
```typescript
interface LoginRequest {
  email: string;
  password: string;
  departmentCode: string;
}

interface LoginResponse {
  user: InstructorUser;
  token: string;
  refreshToken: string;
}
```

### POST `/api/instructor/auth/register`
```typescript
interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  departmentCode: string;
  role: 'INSTRUCTOR' | 'ADMIN';
}
```

### POST `/api/instructor/auth/refresh`
- Refresh authentication token
- Uses refresh token from cookies

### POST `/api/instructor/auth/logout`
- Invalidate session
- Clear cookies

## Dashboard APIs

### GET `/api/instructor/dashboard/stats`
```typescript
interface DashboardStatsResponse {
  totalStudents: number;
  activeToday: number;
  averageProgress: number;
  atRiskCount: number;
  trends: {
    students: TrendData;
    progress: TrendData;
    engagement: TrendData;
  };
}
```

### GET `/api/instructor/dashboard/recent-activity`
```typescript
interface RecentActivityResponse {
  activities: Activity[];
  pagination: PaginationMeta;
}
```

## Student Management APIs

### GET `/api/instructor/students`
Query Parameters:
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `search`: string
- `filter`: 'all' | 'active' | 'at-risk'
- `sortBy`: 'name' | 'progress' | 'lastActive'
- `order`: 'asc' | 'desc'

### GET `/api/instructor/students/:id`
```typescript
interface StudentDetailResponse {
  student: Student;
  progress: ProgressData;
  assignments: Assignment[];
  practiceHistory: PracticeSession[];
}
```

### POST `/api/instructor/students/bulk-action`
```typescript
interface BulkActionRequest {
  studentIds: string[];
  action: 'message' | 'assign' | 'updateStatus';
  payload: any;
}
```

### PUT `/api/instructor/students/:id`
- Update individual student data
- Modify goals and targets

## Analytics APIs

### GET `/api/instructor/analytics/performance`
Query Parameters:
- `timeRange`: '7d' | '30d' | '90d' | 'custom'
- `startDate`: ISO date string
- `endDate`: ISO date string
- `groupBy`: 'day' | 'week' | 'month'

### GET `/api/instructor/analytics/module-breakdown`
```typescript
interface ModuleBreakdownResponse {
  modules: {
    name: string;
    completionRate: number;
    averageScore: number;
    timeSpent: number;
  }[];
}
```

### GET `/api/instructor/analytics/trends`
- Historical performance trends
- Predictive analytics
- Comparison data

## Assignment APIs

### POST `/api/instructor/assignments`
```typescript
interface CreateAssignmentRequest {
  title: string;
  description: string;
  modules: string[];
  targetScore: number;
  dueDate: string;
  studentIds: string[];
}
```

### GET `/api/instructor/assignments`
- List all assignments
- Filter by status
- Include completion stats

### PUT `/api/instructor/assignments/:id`
- Update assignment details
- Modify due dates
- Change requirements

## Communication APIs

### POST `/api/instructor/messages/send`
```typescript
interface SendMessageRequest {
  recipientIds: string[];
  subject: string;
  content: string;
  priority: 'normal' | 'high';
}
```

### GET `/api/instructor/messages`
- Inbox with pagination
- Sent messages
- Draft support

## Report Generation APIs

### POST `/api/instructor/reports/generate`
```typescript
interface GenerateReportRequest {
  type: 'progress' | 'performance' | 'compliance';
  format: 'pdf' | 'csv' | 'excel';
  timeRange: TimeRange;
  studentIds?: string[];
  includeCharts: boolean;
}
```

### GET `/api/instructor/reports/history`
- List generated reports
- Download links
- Regeneration options

## WebSocket Integration

### Real-time Events
```typescript
// Connection
const socket = io('/instructor', {
  auth: { token: authToken }
});

// Events
socket.on('student:progress', (data) => {
  // Update student progress in real-time
});

socket.on('alert:at-risk', (data) => {
  // Show at-risk student notification
});
```

## Error Handling

### Standard Error Response
```typescript
interface APIError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  statusCode: number;
}
```

### Common Error Codes
- `AUTH_REQUIRED`: Authentication needed
- `PERMISSION_DENIED`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `RATE_LIMITED`: Too many requests

## API Client Configuration

### Axios Instance
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/instructor',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh
    }
    return Promise.reject(error);
  }
);
```

## Rate Limiting

- Default: 100 requests per minute
- Analytics: 30 requests per minute
- Report generation: 10 requests per hour
- Bulk operations: 20 requests per hour

## Caching Strategy

### Client-Side Caching
- SWR for data fetching
- 5-minute cache for dashboard stats
- 1-minute cache for student lists
- Invalidate on mutations

### Server-Side Caching
- Redis for session management
- Query result caching
- CDN for static assets