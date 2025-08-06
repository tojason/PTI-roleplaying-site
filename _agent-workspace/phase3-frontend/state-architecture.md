# State Architecture - Instructor Dashboard

## Overview
The instructor dashboard uses Zustand for state management, following the patterns established in the main Police Training App.

## Store Architecture

### 1. Instructor Store (Authentication)
```typescript
interface InstructorStore {
  // State
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
```

### 2. Dashboard Store (Data Management)
```typescript
interface DashboardStore {
  // State
  stats: DashboardStats;
  students: Student[];
  selectedStudents: string[];
  filters: StudentFilters;
  sortBy: SortOptions;
  view: 'grid' | 'list';
  isLoading: boolean;
  
  // Actions
  fetchDashboardData: () => Promise<void>;
  setSelectedStudents: (ids: string[]) => void;
  applyFilters: (filters: StudentFilters) => void;
  setSortBy: (sort: SortOptions) => void;
  setView: (view: 'grid' | 'list') => void;
  bulkUpdateStudents: (ids: string[], updates: any) => Promise<void>;
}
```

### 3. Analytics Store (Performance Data)
```typescript
interface AnalyticsStore {
  // State
  metrics: PerformanceMetrics;
  chartData: ChartData[];
  timeRange: TimeRange;
  compareMode: boolean;
  
  // Actions
  fetchMetrics: (timeRange: TimeRange) => Promise<void>;
  updateTimeRange: (range: TimeRange) => void;
  toggleCompareMode: () => void;
  exportData: (format: 'csv' | 'pdf') => Promise<void>;
}
```

## State Persistence

### Local Storage Integration
- User preferences (view mode, filters)
- Session tokens (secure storage)
- Dashboard layout preferences
- Recently viewed students

### Session Storage
- Temporary filter states
- Chart configurations
- Pending bulk operations

## Data Flow Patterns

### 1. Authentication Flow
```
Login Form → instructorStore.login() → API Call → Update State → Redirect
```

### 2. Dashboard Data Flow
```
Page Load → Check Auth → Fetch Data → Update Stores → Render Components
```

### 3. Real-time Updates
```
WebSocket Connection → Data Event → Update Relevant Store → UI Re-render
```

## Performance Strategies

### Selective Updates
- Use Zustand's shallow comparison
- Update only changed properties
- Avoid unnecessary re-renders

### Data Normalization
- Students stored by ID in a map
- References used in lists
- Efficient lookups and updates

### Caching Strategy
- SWR for API data caching
- 5-minute cache for dashboard stats
- 1-minute cache for student data
- Manual invalidation on updates

## Error Handling

### Store-Level Error States
```typescript
interface ErrorState {
  error: string | null;
  errorCode?: string;
  retry?: () => void;
}
```

### Error Recovery
- Automatic retry with exponential backoff
- User-friendly error messages
- Fallback to cached data when available
- Clear error actions in each store

## Integration with Components

### Hook Usage
```typescript
// In components
const { stats, isLoading } = useDashboardStore();
const { user } = useInstructorStore();
```

### Subscription Pattern
```typescript
// Subscribe to specific slices
const students = useDashboardStore((state) => state.students);
```

## Testing Considerations

### Store Testing
- Unit tests for each action
- Integration tests for data flow
- Mock API responses
- Test error scenarios

### State Isolation
- Reset stores between tests
- Use test-specific stores
- Avoid global state pollution