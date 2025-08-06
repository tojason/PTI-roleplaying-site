'use client';

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { InstructorUser } from '@/types/instructor';
import { InstructorNavbar } from './InstructorNavbar';
import { BottomNavigation } from './BottomNavigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
  children: ReactNode;
  user: InstructorUser;
  className?: string;
}

export function DashboardLayout({ children, user, className }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-student':
        router.push('/instructor/students/add');
        break;
      case 'create-assignment':
        router.push('/instructor/assignments/create');
        break;
      case 'send-message':
        router.push('/instructor/messages/compose');
        break;
      case 'generate-report':
        alert('Coming soon');
        break;
      default:
        break;
    }
    // Close sidebar on mobile after navigation
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <InstructorNavbar 
        user={user}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar for Desktop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-16 bottom-0 w-80 bg-white shadow-interactive z-50 lg:hidden overflow-y-auto"
          >
            <div className="p-6">
              {/* Quick Actions */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => handleQuickAction('add-student')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Add Student
                  </button>
                  <button 
                    onClick={() => handleQuickAction('create-assignment')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Create Assignment
                  </button>
                  <button 
                    onClick={() => handleQuickAction('send-message')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Send Message
                  </button>
                  <button 
                    onClick={() => handleQuickAction('generate-report')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Generate Report
                  </button>
                </div>
              </div>

              {/* Recent Students */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                  Recent Students
                </h3>
                <div className="space-y-2">
                  {/* Placeholder for recent students */}
                  <div className="text-sm text-gray-500">
                    Student list will appear here
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                  Settings
                </h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                    Dashboard Preferences
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                    Notification Settings
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="pt-16"> {/* Account for fixed navbar */}
        <main className={cn(
          'min-h-screen pb-20 lg:pb-6', // Account for bottom navigation on mobile
          className
        )}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <div className="lg:hidden">
        <BottomNavigation />
      </div>

      {/* Desktop Sidebar (Static) */}
      <div className="hidden lg:block fixed left-0 top-16 bottom-0 w-80 bg-white shadow-card border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          {/* Department Info */}
          <div className="mb-6 p-4 bg-primary-50 rounded-lg">
            <h3 className="text-sm font-semibold text-primary-900 mb-1">
              {user.department}
            </h3>
            <p className="text-xs text-primary-700">
              {user.rank && `${user.rank} • `}
              {user.yearsOfExperience ? `${user.yearsOfExperience} years experience` : 'Instructor'}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Today's Overview
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-900">24</div>
                <div className="text-xs text-gray-600">Active Students</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-900">3</div>
                <div className="text-xs text-gray-600">Alerts</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-900">85%</div>
                <div className="text-xs text-gray-600">Avg Score</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-900">12</div>
                <div className="text-xs text-gray-600">New Messages</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleQuickAction('add-student')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Student
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleQuickAction('create-assignment')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Create Assignment
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleQuickAction('send-message')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Message
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleQuickAction('generate-report')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Report
              </motion.button>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-success-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Johnson, M. completed Quiz</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-info-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">New student enrolled</p>
                    <p className="text-xs text-gray-500">15 minutes ago</p>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-warning-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Chen, L. needs attention</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Push for Desktop Sidebar */}
      <div className="hidden lg:block w-80 flex-shrink-0"></div>
    </div>
  );
}