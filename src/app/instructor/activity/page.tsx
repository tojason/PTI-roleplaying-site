'use client';

import { useEffect } from 'react';
import { useInstructorDashboardStore } from '@/store/instructorDashboardStore';
import { motion } from 'framer-motion';
import { ClientSafeInstructorLayout } from '@/components/instructor/ClientSafeInstructorLayout';

export default function InstructorActivityPage() {
  const { recentActivity, fetchDashboardData, isLoading } = useInstructorDashboardStore();

  useEffect(() => {
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'session_completed':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'achievement_unlocked':
        return (
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
        );
      case 'module_completed':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <ClientSafeInstructorLayout>
      <div className="p-4 sm:p-6 lg:ml-80">
        {/* Header */}
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Recent Activity</h1>
            <p className="text-gray-600">
              Monitor student progress and achievements in real-time.
            </p>
          </motion.div>
        </div>

        {/* Activity Feed */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg shadow-card border border-gray-200 p-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="bg-white rounded-lg shadow-card border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
            <p className="text-gray-600">Student activity will appear here as they complete training modules.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-card border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  {getActivityIcon(activity.type)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {activity.title}
                        </h3>
                        <p className="text-gray-700 mb-2">
                          {activity.description}
                        </p>
                        
                        {/* Student info */}
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">
                                {activity.studentName?.split(' ').map(n => n[0]).join('') || '?'}
                              </span>
                            </div>
                            <span className="font-medium">{activity.studentName || 'Unknown Student'}</span>
                          </div>
                          
                          <span className="text-gray-400">•</span>
                          <span>{formatTimeAgo(activity.timestamp)}</span>
                        </div>

                        {/* Metadata */}
                        {activity.metadata && (
                          <div className="flex items-center space-x-4 text-sm">
                            {activity.metadata.score !== undefined && (
                              <div className="flex items-center space-x-1">
                                <span className="text-gray-600">Score:</span>
                                <span className={`font-medium ${getSeverityColor(activity.severity)}`}>
                                  {activity.metadata.score}%
                                </span>
                              </div>
                            )}
                            
                            {activity.metadata.accuracy !== undefined && (
                              <div className="flex items-center space-x-1">
                                <span className="text-gray-600">Accuracy:</span>
                                <span className={`font-medium ${getSeverityColor(activity.severity)}`}>
                                  {activity.metadata.accuracy}%
                                </span>
                              </div>
                            )}
                            
                            {activity.metadata.module && (
                              <div className="flex items-center space-x-1">
                                <span className="text-gray-600">Module:</span>
                                <span className="font-medium text-gray-900">
                                  {activity.metadata.module}
                                </span>
                              </div>
                            )}
                            
                            {activity.metadata.achievement && (
                              <div className="flex items-center space-x-1">
                                <span className="text-gray-600">Achievement:</span>
                                <span className="font-medium text-yellow-600">
                                  {activity.metadata.achievement}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Severity indicator */}
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activity.severity === 'success' ? 'bg-green-100 text-green-800' :
                        activity.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        activity.severity === 'info' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.severity === 'success' ? 'Excellent' :
                         activity.severity === 'warning' ? 'Needs Review' :
                         activity.severity === 'info' ? 'Complete' : 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load more button (placeholder) */}
        {recentActivity.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Load More Activity
            </button>
          </div>
        )}
      </div>
    </ClientSafeInstructorLayout>
  );
}