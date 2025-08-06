'use client';

import { useState, useRef, useEffect } from 'react';
import { InstructorUser } from '@/types/instructor';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface InstructorNavbarProps {
  user: InstructorUser;
  onMenuToggle: () => void;
  sidebarOpen: boolean;
}

export function InstructorNavbar({ user, onMenuToggle, sidebarOpen }: InstructorNavbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount] = useState(3); // Mock notification count
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    console.log('🎯 Sign out button clicked');
    try {
      await signOut({ 
        callbackUrl: '/instructor/login',
        redirect: true 
      });
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  const handleSwitchToStudent = () => {
    console.log('🎯 Switch to student view button clicked');
    try {
      router.push('/dashboard');
      console.log('✅ Navigation to student dashboard initiated');
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
  };

  const handleQuickAssignment = () => {
    router.push('/instructor/assignments/create');
  };

  const handleAddStudent = () => {
    router.push('/instructor/students/add');
  };

  // Generate initials from user name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and title */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-label="Toggle menu"
            >
              <motion.div
                animate={sidebarOpen ? { rotate: 90 } : { rotate: 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.div>
            </motion.button>

            {/* Logo and title */}
            <Link href="/instructor/dashboard" className="flex items-center ml-2 lg:ml-0">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
                    Police Training Instructor
                  </h1>
                  <h1 className="text-lg font-semibold text-gray-900 sm:hidden">
                    PTI
                  </h1>
                </div>
              </div>
            </Link>
          </div>

          {/* Right side - Quick actions and user menu */}
          <div className="flex items-center space-x-3">
            {/* Quick actions (desktop only) */}
            <div className="hidden md:flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleQuickAssignment}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                title="Quick Assignment"
                aria-label="Create a new assignment"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddStudent}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                title="Add Student"
                aria-label="Add a new student"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </motion.button>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 relative"
                aria-label="View notifications"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notificationCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-xs text-white font-bold">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  </motion.div>
                )}
              </motion.button>

              {/* Notifications dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-modal border border-gray-200 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {/* Mock notifications */}
                      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-error-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">Student at risk</p>
                            <p className="text-xs text-gray-500">Chen, L. has scored below 60% on recent assessments</p>
                            <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-success-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">Assignment completed</p>
                            <p className="text-xs text-gray-500">Johnson, M. completed 10-Codes Quiz with 95% accuracy</p>
                            <p className="text-xs text-gray-400 mt-1">15 minutes ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-info-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">New message</p>
                            <p className="text-xs text-gray-500">Rodriguez, A. sent you a message about voice practice</p>
                            <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100">
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User profile menu */}
            <div className="relative" ref={profileMenuRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="User menu"
              >
                {/* User avatar */}
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-white">
                      {getInitials(user.name)}
                    </span>
                  )}
                </div>
                
                {/* User info (desktop only) */}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role.toLowerCase()}
                  </p>
                </div>

                {/* Dropdown arrow */}
                <motion.svg
                  animate={showProfileMenu ? { rotate: 180 } : { rotate: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-4 h-4 text-gray-400 hidden sm:block"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </motion.button>

              {/* Profile dropdown menu */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-modal border border-gray-200 py-2 z-50"
                  >
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.department}</p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        href="/instructor/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                      
                      <Link
                        href="/instructor/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </Link>

                      <button
                        onClick={(e) => {
                          console.log('🎯 Switch to Student View button clicked - event triggered');
                          e.preventDefault();
                          setShowProfileMenu(false);
                          handleSwitchToStudent();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Switch to Student View
                      </button>
                    </div>

                    {/* Sign out */}
                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={(e) => {
                          console.log('🎯 Sign out button clicked - event triggered');
                          e.preventDefault();
                          setShowProfileMenu(false);
                          handleSignOut();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-error-600 hover:bg-error-50"
                      >
                        <svg className="w-4 h-4 mr-3 text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}