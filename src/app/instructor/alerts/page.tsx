'use client';

import { useEffect } from 'react';
import { useInstructorDashboardStore } from '@/store/instructorDashboardStore';
import { motion } from 'framer-motion';
import { ClientSafeInstructorLayout } from '@/components/instructor/ClientSafeInstructorLayout';

export default function InstructorAlertsPage() {
  const { alerts, fetchDashboardData, markAlertAsRead, dismissAlert, isLoading } = useInstructorDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const priorityColors = {
    critical: 'border-l-error-500 bg-error-50',
    high: 'border-l-warning-500 bg-warning-50', 
    medium: 'border-l-info-500 bg-info-50',
    low: 'border-l-gray-500 bg-gray-50',
  } as const;

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Alert Center</h1>
            <p className="text-gray-600">
              Monitor critical alerts and take action on student performance issues.
            </p>
          </motion.div>
        </div>

        {/* Alert Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { title: 'Critical', count: alerts.filter(a => a.type === 'critical').length, color: 'bg-red-500' },
            { title: 'High Priority', count: alerts.filter(a => a.type === 'high').length, color: 'bg-orange-500' },
            { title: 'Medium', count: alerts.filter(a => a.type === 'medium').length, color: 'bg-yellow-500' },
            { title: 'Total Active', count: alerts.length, color: 'bg-blue-500' }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-card border border-gray-200 p-4"
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full ${stat.color} mr-3`}></div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
                  <div className="text-sm text-gray-600">{stat.title}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Alerts List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-card border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-600">No active alerts at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`bg-white rounded-lg shadow-card border-l-4 ${priorityColors[alert.type]} p-6`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                      <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                        alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.type === 'high' ? 'bg-orange-100 text-orange-800' :
                        alert.type === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {alert.type.toUpperCase()}
                      </span>
                      {!alert.isRead && (
                        <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-2">{alert.message}</p>
                    
                    {alert.studentName && (
                      <p className="text-sm text-gray-600 mb-2">
                        Student: <span className="font-medium">{alert.studentName}</span>
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(alert.timestamp)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {alert.actionRequired && (
                      <button className="px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors">
                        Take Action
                      </button>
                    )}
                    
                    {!alert.isRead && (
                      <button
                        onClick={() => markAlertAsRead(alert.id)}
                        className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                    
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </ClientSafeInstructorLayout>
  );
}