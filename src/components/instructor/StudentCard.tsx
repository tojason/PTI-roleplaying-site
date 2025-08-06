'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Student, StudentCardProps, StudentStatus } from '@/types/instructor'

const statusColors: Record<StudentStatus, string> = {
  [StudentStatus.ACTIVE]: 'bg-green-100 text-green-800 border-green-200',
  [StudentStatus.AT_RISK]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [StudentStatus.INACTIVE]: 'bg-gray-100 text-gray-800 border-gray-200',
  [StudentStatus.COMPLETED]: 'bg-blue-100 text-blue-800 border-blue-200',
  [StudentStatus.SUSPENDED]: 'bg-red-100 text-red-800 border-red-200'
}

const statusDots: Record<StudentStatus, string> = {
  [StudentStatus.ACTIVE]: 'bg-green-400',
  [StudentStatus.AT_RISK]: 'bg-yellow-400',
  [StudentStatus.INACTIVE]: 'bg-gray-400',
  [StudentStatus.COMPLETED]: 'bg-blue-400',
  [StudentStatus.SUSPENDED]: 'bg-red-400'
}

const progressColors = {
  excellent: 'bg-green-500',
  good: 'bg-blue-500',
  satisfactory: 'bg-yellow-500',
  'needs-improvement': 'bg-orange-500',
  poor: 'bg-red-500'
}

function getProgressCategory(accuracy: number): keyof typeof progressColors {
  if (accuracy >= 90) return 'excellent'
  if (accuracy >= 80) return 'good'
  if (accuracy >= 70) return 'satisfactory'
  if (accuracy >= 60) return 'needs-improvement'
  return 'poor'
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatLastActivity(lastActivity?: Date): string {
  if (!lastActivity) return 'Never'
  
  const now = new Date().getTime()
  const activityTime = new Date(lastActivity).getTime()
  const diff = now - activityTime
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (minutes < 5) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return new Date(lastActivity).toLocaleDateString()
}

export function StudentCard({ 
  student, 
  onViewProfile, 
  onSendMessage, 
  onAssignPractice,
  onToggleSelect,
  isSelected = false,
  compact = false,
  showQuickActions = true 
}: StudentCardProps) {
  const progressCategory = getProgressCategory(student.performance.overallAccuracy)
  
  if (compact) {
    return (
      <motion.div
        whileHover={{ y: -1 }}
        className={`bg-white rounded-lg border transition-all duration-200 group p-4 hover:shadow-md ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Left section - Avatar and info */}
          <div className="flex items-center space-x-4">
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(student.id)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            )}
            <div className="relative">
              {student.avatar ? (
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {getInitials(student.name)}
                  </span>
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusDots[student.status as StudentStatus]} rounded-full border-2 border-white`} />
            </div>
            
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-800 truncate">
                {student.name}
              </h3>
              <p className="text-sm text-slate-600 truncate">
                Badge #{student.badgeNumber} • {student.department}
              </p>
            </div>
          </div>
          
          {/* Middle section - Progress and metrics */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-800">
                {student.progress.overallCompletion}%
              </p>
              <p className="text-xs text-slate-600">Progress</p>
            </div>
            
            <div className="text-center">
              <p className="text-lg font-bold text-slate-800">
                {student.performance.overallAccuracy}%
              </p>
              <p className="text-xs text-slate-600">Accuracy</p>
            </div>
            
            <div className="text-center">
              <p className="text-lg font-bold text-slate-800">
                {student.performance.streak}
              </p>
              <p className="text-xs text-slate-600">Streak</p>
            </div>
          </div>
          
          {/* Right section - Status and actions */}
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[student.status as StudentStatus]}`}>
              {student.status === 'at-risk' ? 'At Risk' : student.status.charAt(0).toUpperCase() + student.status.slice(1)}
            </div>
            
            {showQuickActions && (
              <div className="flex space-x-1">
                <Link
                  href={`/instructor/students/${student.id}`}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  onClick={() => onViewProfile(student.id)}
                  title="View Profile"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </Link>
                
                <button
                  onClick={() => onSendMessage(student.id)}
                  className="p-2 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-lg transition-colors"
                  title="Send Message"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                
                {onAssignPractice && (
                  <button
                    onClick={() => onAssignPractice(student.id)}
                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                    title="Assign Practice"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Alert indicators for compact mode */}
        {student.status === 'at-risk' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 flex items-center space-x-2 text-yellow-700 bg-yellow-50 rounded-lg p-2"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-xs font-medium">
              {student.performance.overallAccuracy < 70 
                ? 'Low accuracy - needs attention'
                : 'Inactive for 7+ days'
              }
            </p>
          </motion.div>
        )}
      </motion.div>
    )
  }
  
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className={`bg-white rounded-lg border transition-all duration-200 group p-4 hover:shadow-md ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
    >
      {/* Header with avatar and status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(student.id)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mt-1"
            />
          )}
          {/* Avatar */}
          <div className="relative">
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={student.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {getInitials(student.name)}
                </span>
              </div>
            )}
            {/* Status indicator dot */}
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusDots[student.status as StudentStatus]} rounded-full border-2 border-white`} />
          </div>
          
          {/* Basic info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 truncate">
              {student.name}
            </h3>
            <p className="text-sm text-slate-600 truncate">
              Badge #{student.badgeNumber} • {student.department}
            </p>
            <p className="text-xs text-slate-500 truncate">
              Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {/* Status badge */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[student.status as StudentStatus]}`}>
          {student.status === 'at-risk' ? 'At Risk' : student.status.charAt(0).toUpperCase() + student.status.slice(1)}
        </div>
      </div>

      {/* Progress section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Overall Progress</span>
          <span className="text-sm font-semibold text-slate-800">
            {student.progress.overallCompletion}%
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <motion.div
            className={`h-2 rounded-full ${progressColors[progressCategory]}`}
            initial={{ width: 0 }}
            animate={{ width: `${student.progress.overallCompletion}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        
        {/* Performance metrics */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-slate-800">
              {student.performance.overallAccuracy}%
            </p>
            <p className="text-xs text-slate-600">Accuracy</p>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">
              {student.performance.streak}
            </p>
            <p className="text-xs text-slate-600">Streak</p>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">
              {Math.round(student.progress.timeSpent / 60)}h
            </p>
            <p className="text-xs text-slate-600">Time</p>
          </div>
        </div>
      </div>

      {/* Current module */}
      {student.progress.currentModule && (
        <div className="mb-4 p-2 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 font-medium">Currently studying:</p>
          <p className="text-sm text-blue-800 font-semibold">
            {student.progress.currentModule}
          </p>
        </div>
      )}

      {/* Last activity */}
      <div className="mb-4">
        <p className="text-xs text-slate-500">
          Last seen: {formatLastActivity(student.lastActivity)}
        </p>
      </div>

      {/* Quick actions */}
      {showQuickActions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { delay: 0.1 }
          }}
          className="flex space-x-2"
        >
          <Link
            href={`/instructor/students/${student.id}`}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors text-center"
            onClick={() => onViewProfile(student.id)}
          >
            View
          </Link>
          
          <button
            onClick={() => onSendMessage(student.id)}
            className="flex-1 bg-teal-100 hover:bg-teal-200 text-teal-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors"
          >
            Message
          </button>
          
          {onAssignPractice && (
            <button
              onClick={() => onAssignPractice(student.id)}
              className="flex items-center justify-center w-10 h-10 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
              title="Assign Practice"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
          )}
        </motion.div>
      )}

      {/* Alert indicators */}
      {student.status === 'at-risk' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex items-center space-x-2 text-yellow-700 bg-yellow-50 rounded-lg p-2"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-xs font-medium">
            {student.performance.overallAccuracy < 70 
              ? 'Low accuracy - needs attention'
              : 'Inactive for 7+ days'
            }
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}