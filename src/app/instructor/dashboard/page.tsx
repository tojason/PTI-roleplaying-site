'use client';

import { useEffect } from 'react';
import { useInstructorDashboardStore } from '@/store/instructorDashboardStore';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ClientSafeInstructorLayout } from '@/components/instructor/ClientSafeInstructorLayout';

// Mock data for dashboard widgets
const mockStats = {
  totalStudents: 28,
  activeStudents: 24,
  atRiskStudents: 3,
  completedStudents: 18,
  inactiveStudents: 2,
  newEnrollmentsThisMonth: 5,
  completionRate: 85,
  averageAccuracy: 78.3,
  totalTrainingHours: 1247,
  averageTrainingHoursPerStudent: 44.5,
  certificationRate: 92,
  retentionRate: 96,
  engagementScore: 87,
  trends: {
    completionTrend: 5.2,
    accuracyTrend: -2.1,
    engagementTrend: 8.7,
    enrollmentTrend: 15.3,
    retentionTrend: 2.4,
  },
  lastUpdated: new Date(),
};

const mockAlerts = [
  {
    id: '1',
    type: 'critical' as const,
    category: 'student_risk' as const,
    title: 'Student at Critical Risk',
    message: 'Chen, L. has scored below 50% on recent assessments',
    studentName: 'Chen, L.',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    isRead: false,
    isResolved: false,
    actionRequired: true,
  },
  {
    id: '2',
    type: 'high' as const,
    category: 'assignment_overdue' as const,
    title: 'Overdue Assignments',
    message: '5 students have assignments due yesterday',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    isRead: false,
    isResolved: false,
    actionRequired: true,
  },
  {
    id: '3',
    type: 'medium' as const,
    category: 'inactivity' as const,
    title: 'Student Inactivity',
    message: '3 students have not logged in for 5+ days',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    isRead: false,
    isResolved: false,
    actionRequired: false,
  },
];

const mockRecentActivity = [
  {
    id: '1',
    type: 'session_completed' as const,
    title: 'Quiz Completed',
    description: 'Johnson, M. completed 10-Codes Quiz',
    studentName: 'Johnson, M.',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    metadata: { score: 95, accuracy: 95 },
    severity: 'success' as const,
    isRead: true,
  },
  {
    id: '2',
    type: 'achievement_unlocked' as const,
    title: 'Achievement Unlocked',
    description: 'Rodriguez, A. earned Perfect Score badge',
    studentName: 'Rodriguez, A.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    metadata: { achievement: 'Perfect Score' },
    severity: 'success' as const,
    isRead: true,
  },
  {
    id: '3',
    type: 'module_completed' as const,
    title: 'Module Completed',
    description: 'Williams, K. finished Phonetic Alphabet module',
    studentName: 'Williams, K.',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    metadata: { module: 'Phonetic Alphabet', score: 87 },
    severity: 'info' as const,
    isRead: true,
  },
];

const mockActiveStudents = [
  { id: '1', name: 'Johnson, M.', activity: '10-Codes Quiz', progress: 85, timeElapsed: '12 min' },
  { id: '2', name: 'Rodriguez, A.', activity: 'Voice Practice', progress: 92, timeElapsed: '8 min' },
  { id: '3', name: 'Williams, K.', activity: 'Radio Protocol', progress: 78, timeElapsed: '25 min' },
  { id: '4', name: 'Brown, T.', activity: 'Mixed Review', progress: 67, timeElapsed: '15 min' },
];

const mockUpcomingTasks = [
  {
    id: '1',
    type: 'grade_assignment' as const,
    title: 'Grade Quiz Results',
    description: '12 students completed 10-Codes assessment',
    priority: 'high' as const,
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
    isCompleted: false,
  },
  {
    id: '2',
    type: 'review_progress' as const,
    title: 'Weekly Progress Review',
    description: 'Review student progress for weekly report',
    priority: 'medium' as const,
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    isCompleted: false,
  },
  {
    id: '3',
    type: 'contact_student' as const,
    title: 'Contact At-Risk Students',
    description: 'Reach out to 3 students showing decline',
    priority: 'high' as const,
    relatedStudentName: 'Chen, L.',
    isCompleted: false,
  },
];

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: number;
    period?: string;
  };
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
}

function StatCard({ title, value, trend, icon: Icon, variant = 'primary', onClick }: StatCardProps) {
  const variantStyles = {
    primary: 'border-primary-200 bg-primary-50',
    success: 'border-success-200 bg-success-50',
    warning: 'border-warning-200 bg-warning-50',
    danger: 'border-error-200 bg-error-50',
  } as const;

  const trendColor = trend?.direction === 'up' ? 'text-success-600' : 
                    trend?.direction === 'down' ? 'text-error-600' : 'text-gray-600';

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-6 rounded-lg border-2 ${variantStyles[variant]} cursor-pointer transition-all duration-200 hover:shadow-interactive`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 ${trendColor}`}>
              <span className="text-sm font-medium">
                {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'} {Math.abs(trend.value)}%
              </span>
              {trend.period && <span className="text-xs text-gray-500 ml-1">{trend.period}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-full bg-white shadow-sm">
            <Icon className="w-6 h-6 text-gray-600" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function QuickActionCard({ title, description, icon: Icon, onClick, color }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-card transition-all duration-200 text-left"
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>
    </motion.button>
  );
}

function InstructorDashboardContent() {
  const router = useRouter();
  const { stats, recentActivity, alerts, fetchDashboardData, isLoading, error } = useInstructorDashboardStore();

  useEffect(() => {
    // Fetch real dashboard data from API
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const priorityColors = {
    critical: 'border-l-error-500 bg-error-50',
    high: 'border-l-warning-500 bg-warning-50',
    medium: 'border-l-info-500 bg-info-50',
    low: 'border-l-gray-500 bg-gray-50',
    info: 'border-l-blue-500 bg-blue-50',
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:ml-80">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:ml-80">
      {/* Page Header */}
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Instructor Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with your students today.
          </p>
        </motion.div>
      </div>

      {/* 6-Widget Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Widget 1: Alert Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="md:col-span-2 lg:col-span-1"
        >
          <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Critical Alerts</h2>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-error-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-error-600 font-medium">{alerts.length}</span>
              </div>
            </div>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${priorityColors[alert.type]} cursor-pointer hover:shadow-sm transition-shadow`}
                  onClick={() => router.push('/instructor/students')}
                >
                  <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(alert.timestamp)}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push('/instructor/alerts')}
              className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All Alerts →
            </button>
          </div>
        </motion.div>

        {/* Widget 2: Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <QuickActionCard
                title="Add Student"
                description="Enroll new student"
                icon={({ className }: { className?: string }) => (
                  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
                color="bg-primary-600"
                onClick={() => router.push('/instructor/students/add')}
              />
              <QuickActionCard
                title="Send Message"
                description="Broadcast or individual"
                icon={({ className }: { className?: string }) => (
                  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
                color="bg-success-600"
                onClick={() => router.push('/instructor/messages/compose')}
              />
              <QuickActionCard
                title="Create Assignment"
                description="New quiz or practice"
                icon={({ className }: { className?: string }) => (
                  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                )}
                color="bg-info-600"
                onClick={() => router.push('/instructor/assignments/create')}
              />
            </div>
          </div>
        </motion.div>

        {/* Widget 3: Active Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Active Students</h2>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-success-600 font-medium">{Math.min(4, recentActivity.length)}</span>
              </div>
            </div>
            <div className="space-y-3">
              {(recentActivity.filter(a => a.type === 'session_completed').slice(0, 4).map((activity, index) => ({
                id: activity.studentId || `temp_${index}`,
                name: activity.studentName || 'Unknown Student',
                activity: activity.description.split(' ').slice(2, 4).join(' ') || 'Practice',
                progress: activity.metadata?.accuracy || Math.floor(Math.random() * 100),
                timeElapsed: formatTimeAgo(activity.timestamp)
              }))).map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/instructor/students/${student.id}`)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-600">{student.activity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{student.progress}%</p>
                    <p className="text-xs text-gray-500">{student.timeElapsed}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push('/instructor/students')}
              className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All Students →
            </button>
          </div>
        </motion.div>

        {/* Widget 4: Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.severity === 'success' ? 'bg-success-500' :
                    activity.severity === 'info' ? 'bg-info-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push('/instructor/activity')}
              className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All Activity →
            </button>
          </div>
        </motion.div>

        {/* Widget 5: Performance Snapshot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Snapshot</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats?.completionRate || 0}%</div>
                <div className="text-xs text-gray-600">Completion Rate</div>
                <div className={`text-xs mt-1 ${
                  (stats?.trends.completionTrend || 0) >= 0 ? 'text-success-600' : 'text-error-600'
                }`}>
                  {(stats?.trends.completionTrend || 0) >= 0 ? '↗' : '↘'} {Math.abs(stats?.trends.completionTrend || 0)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats?.averageAccuracy || 0}%</div>
                <div className="text-xs text-gray-600">Avg Accuracy</div>
                <div className={`text-xs mt-1 ${
                  (stats?.trends.accuracyTrend || 0) >= 0 ? 'text-success-600' : 'text-error-600'
                }`}>
                  {(stats?.trends.accuracyTrend || 0) >= 0 ? '↗' : '↘'} {Math.abs(stats?.trends.accuracyTrend || 0)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats?.activeStudents || 0}</div>
                <div className="text-xs text-gray-600">Active Students</div>
                <div className="text-xs text-info-600 mt-1">→ {stats?.totalStudents || 0} total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats?.certificationRate || 0}%</div>
                <div className="text-xs text-gray-600">Certification</div>
                <div className={`text-xs mt-1 ${
                  (stats?.trends.retentionTrend || 0) >= 0 ? 'text-success-600' : 'text-error-600'
                }`}>
                  {(stats?.trends.retentionTrend || 0) >= 0 ? '↗' : '↘'} {Math.abs(stats?.trends.retentionTrend || 0)}%
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push('/instructor/analytics')}
              className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View Analytics →
            </button>
          </div>
        </motion.div>

        {/* Widget 6: Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h2>
            <div className="space-y-3">
              {mockUpcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-sm transition-shadow ${
                    task.priority === 'high' ? 'border-l-error-500 bg-error-50' :
                    task.priority === 'medium' ? 'border-l-warning-500 bg-warning-50' :
                    'border-l-info-500 bg-info-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                      {task.dueDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {task.dueDate.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'high' ? 'bg-error-100 text-error-800' :
                      task.priority === 'medium' ? 'bg-warning-100 text-warning-800' :
                      'bg-info-100 text-info-800'
                    }`}>
                      {task.priority}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push('/instructor/tasks')}
              className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Manage All Tasks →
            </button>
          </div>
        </motion.div>
      </div>

      {/* Footer with last updated time */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.8 }}
        className="text-center text-sm text-gray-500"
      >
        Last updated: {new Date().toLocaleString()}
      </motion.div>
    </div>
  );
}

export default function InstructorDashboardPage() {
  return (
    <ClientSafeInstructorLayout>
      <InstructorDashboardContent />
    </ClientSafeInstructorLayout>
  );
}