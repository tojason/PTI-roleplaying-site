'use client';

import { useEffect } from 'react';
import { useInstructorDashboardStore } from '@/store/instructorDashboardStore';
import { motion } from 'framer-motion';
import { ClientSafeInstructorLayout } from '@/components/instructor/ClientSafeInstructorLayout';

export default function InstructorTasksPage() {
  const { alerts, fetchDashboardData, isLoading } = useInstructorDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Convert alerts to tasks
  const tasks = alerts.filter(alert => alert.actionRequired).map(alert => ({
    id: alert.id,
    title: alert.title,
    description: alert.message,
    priority: alert.type,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due tomorrow
    category: alert.category,
    studentName: alert.studentName,
    isCompleted: false
  }));

  // Add some sample tasks
  const sampleTasks = [
    {
      id: 'task-1',
      title: 'Review Weekly Progress Reports',
      description: 'Analyze student progress reports for the week and identify trends',
      priority: 'medium',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      category: 'administrative',
      isCompleted: false
    },
    {
      id: 'task-2', 
      title: 'Update Training Materials',
      description: 'Review and update 10-codes training materials based on new guidelines',
      priority: 'low',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      category: 'content',
      isCompleted: false
    },
    {
      id: 'task-3',
      title: 'Schedule Student Check-ins',
      description: 'Schedule one-on-one meetings with underperforming students',
      priority: 'high',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      category: 'student_support',
      isCompleted: false
    }
  ];

  const allTasks = [...tasks, ...sampleTasks];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'student_risk':
      case 'student_support':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      case 'assignment_overdue':
      case 'administrative':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'content':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Task Management</h1>
            <p className="text-gray-600">
              Stay organized with your instructor tasks and action items.
            </p>
          </motion.div>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { title: 'Total Tasks', count: allTasks.length, color: 'bg-blue-500' },
            { title: 'High Priority', count: allTasks.filter(t => t.priority === 'high' || t.priority === 'critical').length, color: 'bg-red-500' },
            { title: 'Due Today', count: allTasks.filter(t => formatDueDate(t.dueDate) === 'Due today').length, color: 'bg-orange-500' },
            { title: 'Completed', count: allTasks.filter(t => t.isCompleted).length, color: 'bg-green-500' }
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

        {/* Tasks List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : allTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-card border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No pending tasks at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-card border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Category Icon */}
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getCategoryIcon(task.category || 'default')}
                    </div>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                        <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority?.toUpperCase() || 'NORMAL'}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-3">{task.description}</p>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{formatDueDate(task.dueDate)}</span>
                        
                        {/* Student info would be shown if task type included it */}
                        
                        <span className="text-gray-400">•</span>
                        <span className="capitalize">{task.category?.replace('_', ' ') || 'General'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors">
                      Take Action
                    </button>
                    
                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
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