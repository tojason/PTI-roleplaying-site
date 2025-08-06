'use client';

import { useEffect } from 'react';
import { useInstructorDashboardStore } from '@/store/instructorDashboardStore';
import { motion } from 'framer-motion';
import { ClientSafeInstructorLayout } from '@/components/instructor/ClientSafeInstructorLayout';

export default function InstructorAnalyticsPage() {
  const { stats, fetchDashboardData, isLoading } = useInstructorDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const MetricCard = ({ title, value, unit, trend, trendValue, icon, color = 'primary' }: any) => {
    const colorClasses = {
      primary: 'border-primary-200 bg-primary-50',
      success: 'border-success-200 bg-success-50',
      warning: 'border-warning-200 bg-warning-50',
      info: 'border-info-200 bg-info-50',
    }[color];

    return (
      <div className={`p-6 rounded-lg border-2 ${colorClasses}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">
              {value}{unit && <span className="text-lg text-gray-600">{unit}</span>}
            </p>
            {trend && (
              <div className={`flex items-center mt-2 ${
                trend === 'up' ? 'text-success-600' : 
                trend === 'down' ? 'text-error-600' : 'text-gray-600'
              }`}>
                <span className="text-sm font-medium">
                  {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {Math.abs(trendValue || 0)}%
                </span>
                <span className="text-xs text-gray-500 ml-1">vs last month</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="p-3 rounded-full bg-white shadow-sm">
              <div className="w-6 h-6 text-gray-600">{icon}</div>
            </div>
          )}
        </div>
      </div>
    );
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">
              Comprehensive insights into student performance and training effectiveness.
            </p>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <MetricCard
                  title="Overall Completion Rate"
                  value={stats?.completionRate || 0}
                  unit="%"
                  trend={stats?.trends.completionTrend >= 0 ? 'up' : 'down'}
                  trendValue={stats?.trends.completionTrend}
                  color="success"
                  icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <MetricCard
                  title="Average Accuracy"
                  value={stats?.averageAccuracy || 0}
                  unit="%"
                  trend={stats?.trends.accuracyTrend >= 0 ? 'up' : 'down'}
                  trendValue={stats?.trends.accuracyTrend}
                  color="primary"
                  icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <MetricCard
                  title="Student Engagement"
                  value={stats?.engagementScore || 0}
                  unit="%"
                  trend={stats?.trends.engagementTrend >= 0 ? 'up' : 'down'}
                  trendValue={stats?.trends.engagementTrend}
                  color="info"
                  icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <MetricCard
                  title="Active Students"
                  value={stats?.activeStudents || 0}
                  trend={stats?.trends.enrollmentTrend >= 0 ? 'up' : 'down'}
                  trendValue={stats?.trends.enrollmentTrend}
                  color="success"
                  icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <MetricCard
                  title="Training Hours"
                  value={stats?.totalTrainingHours || 0}
                  unit="h"
                  color="primary"
                  icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <MetricCard
                  title="Retention Rate"
                  value={stats?.retentionRate || 0}
                  unit="%"
                  trend={stats?.trends.retentionTrend >= 0 ? 'up' : 'down'}
                  trendValue={stats?.trends.retentionTrend}
                  color="success"
                  icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
                />
              </motion.div>
            </div>

            {/* Additional Analytics Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Performance Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="bg-white rounded-lg shadow-card border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { category: '10-Codes', accuracy: 85, color: 'bg-blue-500' },
                    { category: 'Phonetic Alphabet', accuracy: 92, color: 'bg-green-500' },
                    { category: 'Radio Protocol', accuracy: 78, color: 'bg-yellow-500' },
                    { category: 'Voice Practice', accuracy: 74, color: 'bg-red-500' }
                  ].map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${item.accuracy}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-10 text-right">
                          {item.accuracy}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Risk Levels */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
                className="bg-white rounded-lg shadow-card border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Risk Distribution</h3>
                <div className="space-y-4">
                  {[
                    { level: 'High Risk', count: stats?.atRiskStudents || 0, color: 'bg-red-500', total: stats?.totalStudents || 1 },
                    { level: 'Medium Risk', count: Math.floor((stats?.totalStudents || 0) * 0.15), color: 'bg-yellow-500', total: stats?.totalStudents || 1 },
                    { level: 'Low Risk', count: Math.floor((stats?.totalStudents || 0) * 0.25), color: 'bg-blue-500', total: stats?.totalStudents || 1 },
                    { level: 'No Risk', count: (stats?.totalStudents || 0) - (stats?.atRiskStudents || 0) - Math.floor((stats?.totalStudents || 0) * 0.4), color: 'bg-green-500', total: stats?.totalStudents || 1 }
                  ].map((item) => (
                    <div key={item.level} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                        <span className="text-sm font-medium text-gray-700">{item.level}</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.count} ({Math.round((item.count / item.total) * 100)}%)
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Time-based Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.9 }}
              className="bg-white rounded-lg shadow-card border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { metric: 'New Enrollments', value: stats?.newEnrollmentsThisMonth || 0, change: stats?.trends.enrollmentTrend || 0 },
                  { metric: 'Completion Rate', value: `${stats?.completionRate || 0}%`, change: stats?.trends.completionTrend || 0 },
                  { metric: 'Average Accuracy', value: `${stats?.averageAccuracy || 0}%`, change: stats?.trends.accuracyTrend || 0 },
                  { metric: 'Engagement Score', value: `${stats?.engagementScore || 0}%`, change: stats?.trends.engagementTrend || 0 }
                ].map((trend, index) => (
                  <div key={trend.metric} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{trend.value}</div>
                    <div className="text-sm text-gray-600 mb-2">{trend.metric}</div>
                    <div className={`text-xs font-medium ${
                      trend.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trend.change >= 0 ? '↗' : '↘'} {Math.abs(trend.change).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </ClientSafeInstructorLayout>
  );
}