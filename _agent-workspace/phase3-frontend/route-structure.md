# Route Structure - Instructor Dashboard

## Route Hierarchy

```
/instructor
├── /login                 # Instructor login page
├── /register              # Instructor registration
├── /dashboard             # Main dashboard (protected)
├── /students              # Student list view (protected)
│   └── /[id]             # Individual student profile
├── /analytics             # Analytics dashboard (protected)
│   ├── /overview         # High-level metrics
│   ├── /performance      # Detailed performance
│   └── /trends           # Historical trends
├── /assignments           # Assignment management (protected)
│   ├── /create           # Create new assignment
│   └── /[id]/edit        # Edit assignment
├── /reports               # Report generation (protected)
│   ├── /generate         # Create new report
│   └── /history          # Past reports
├── /messages              # Communication center (protected)
│   ├── /inbox            # Received messages
│   └── /compose          # Send message
└── /settings              # Instructor settings (protected)
    ├── /profile          # Profile management
    ├── /preferences      # Dashboard preferences
    └── /notifications    # Notification settings
```

## Route Protection

### Middleware Configuration
```typescript
// middleware.ts
export const config = {
  matcher: [
    '/instructor/dashboard/:path*',
    '/instructor/students/:path*',
    '/instructor/analytics/:path*',
    '/instructor/assignments/:path*',
    '/instructor/reports/:path*',
    '/instructor/messages/:path*',
    '/instructor/settings/:path*'
  ]
};
```

### Role-Based Access
- **INSTRUCTOR**: Access to all student data for assigned classes
- **ADMIN**: Access to all students and instructors
- **SUPER_ADMIN**: Full system access including configuration

## Page Components

### Public Routes

#### `/instructor/login`
- No authentication required
- Redirects to dashboard if already logged in
- Department code verification
- Remember me functionality

#### `/instructor/register`
- Multi-step registration process
- Email verification required
- Department approval workflow
- Automatic role assignment

### Protected Routes

#### `/instructor/dashboard`
- 6-widget grid layout
- Real-time statistics
- Quick actions panel
- Recent activity feed
- Mobile-responsive design

#### `/instructor/students`
- Paginated student list
- Advanced filtering options
- Bulk action capabilities
- Export functionality
- Search with autocomplete

#### `/instructor/students/[id]`
- Comprehensive student profile
- Progress tracking charts
- Practice history timeline
- Assignment status
- Communication history
- Performance predictions

## Dynamic Routes

### Student Profile Route
```typescript
// app/instructor/students/[id]/page.tsx
export default function StudentProfile({ params }: { params: { id: string } }) {
  // Fetch and display student data
}
```

### Assignment Edit Route
```typescript
// app/instructor/assignments/[id]/edit/page.tsx
export default function EditAssignment({ params }: { params: { id: string } }) {
  // Load and edit assignment
}
```

## Route Navigation

### Programmatic Navigation
```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/instructor/dashboard');
```

### Link Components
```typescript
import Link from 'next/link';

<Link href="/instructor/students">View Students</Link>
```

## Loading States

### Page-Level Loading
```typescript
// app/instructor/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />;
}
```

### Error Boundaries
```typescript
// app/instructor/dashboard/error.tsx
export default function Error({ error, reset }: ErrorProps) {
  return <ErrorBoundary error={error} retry={reset} />;
}
```

## Route Metadata

### SEO Optimization
```typescript
export const metadata: Metadata = {
  title: 'Instructor Dashboard | Police Training App',
  description: 'Monitor student progress and manage training',
};
```

## Mobile Navigation

### Bottom Navigation Routes
- Dashboard (home icon)
- Students (people icon)
- Analytics (chart icon)
- Messages (mail icon)
- More (menu icon)

## Route Performance

### Prefetching Strategy
- Prefetch dashboard on login success
- Prefetch student profiles on hover
- Lazy load analytics components
- Code split by route

### Caching Policy
- Static routes cached for 1 hour
- Dynamic routes cached for 5 minutes
- User-specific data not cached
- Manual cache invalidation available