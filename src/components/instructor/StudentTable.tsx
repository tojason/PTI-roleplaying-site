'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Student, SortOptions } from '@/types/instructor'

interface StudentTableProps {
  students: Student[]
  selectedStudents: string[]
  onStudentSelect: (studentId: string) => void
  onBulkSelect: (studentIds: string[]) => void
  onSelectAll: () => void
  isAllSelected: boolean
  isPartiallySelected: boolean
  sortOptions: SortOptions
  onSort: (field: string, direction?: 'asc' | 'desc') => void
  onViewProfile: (studentId: string) => void
  onSendMessage: (studentId: string) => void
  onAssignPractice: (studentId: string) => void
}

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  'at-risk': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
  suspended: 'bg-red-100 text-red-800 border-red-200'
}

const statusDots = {
  active: 'bg-green-400',
  'at-risk': 'bg-yellow-400',
  inactive: 'bg-gray-400',
  completed: 'bg-blue-400',
  suspended: 'bg-red-400'
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

function getSortIcon(field: string, currentField: string, currentDirection: 'asc' | 'desc') {
  if (field !== currentField) {
    return (
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    )
  }
  
  if (currentDirection === 'asc') {
    return (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    )
  }
  
  return (
    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
    </svg>
  )
}

interface ActionMenuProps {
  student: Student
  onViewProfile: (studentId: string) => void
  onSendMessage: (studentId: string) => void
  onAssignPractice: (studentId: string) => void
  onClose: () => void
}

function ActionMenu({ student, onViewProfile, onSendMessage, onAssignPractice, onClose }: ActionMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute right-0 top-8 z-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-48"
    >
      <Link
        href={`/instructor/students/${student.id}`}
        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        onClick={() => {
          onViewProfile(student.id)
          onClose()
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>View Profile</span>
      </Link>
      
      <button
        onClick={() => {
          onSendMessage(student.id)
          onClose()
        }}
        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span>Send Message</span>
      </button>
      
      <button
        onClick={() => {
          onAssignPractice(student.id)
          onClose()
        }}
        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span>Assign Practice</span>
      </button>
      
      <div className="border-t border-gray-100 my-1"></div>
      
      <button
        onClick={() => {
          // Handle edit action
          onClose()
        }}
        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span>Edit Details</span>
      </button>
      
      <button
        onClick={() => {
          // Handle archive action
          onClose()
        }}
        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 4 4-4m6 5l-3 3-3-3" />
        </svg>
        <span>Archive Student</span>
      </button>
    </motion.div>
  )
}

export function StudentTable({
  students,
  selectedStudents,
  onStudentSelect,
  onBulkSelect,
  onSelectAll,
  isAllSelected,
  isPartiallySelected,
  sortOptions,
  onSort,
  onViewProfile,
  onSendMessage,
  onAssignPractice
}: StudentTableProps) {
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null)

  const handleSort = (field: string) => {
    onSort(field)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Mobile Card View */}
      <div className="block md:hidden">
        <div className="divide-y divide-gray-200">
          {students.map((student) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => onStudentSelect(student.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  
                  <div className="relative">
                    {student.avatar ? (
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {getInitials(student.name)}
                        </span>
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${statusDots[student.status]} rounded-full border-2 border-white`} />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">{student.name}</p>
                    <p className="text-sm text-gray-600 truncate">Badge #{student.badgeNumber}</p>
                  </div>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setActiveActionMenu(activeActionMenu === student.id ? null : student.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                  
                  <AnimatePresence>
                    {activeActionMenu === student.id && (
                      <ActionMenu
                        student={student}
                        onViewProfile={onViewProfile}
                        onSendMessage={onSendMessage}
                        onAssignPractice={onAssignPractice}
                        onClose={() => setActiveActionMenu(null)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{student.progress.overallCompletion}%</p>
                  <p className="text-xs text-gray-600">Progress</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{student.performance.overallAccuracy}%</p>
                  <p className="text-xs text-gray-600">Accuracy</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{student.performance.streak}</p>
                  <p className="text-xs text-gray-600">Streak</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[student.status]}`}>
                  {student.status === 'at-risk' ? 'At Risk' : student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                </div>
                <p className="text-xs text-gray-500">
                  {formatLastActivity(student.lastActivity)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = isPartiallySelected && !isAllSelected
                    }
                  }}
                  onChange={onSelectAll}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                >
                  <span>Student</span>
                  {getSortIcon('name', sortOptions.field, sortOptions.direction)}
                </button>
              </th>
              
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </span>
              </th>
              
              <th className="px-6 py-3 text-center">
                <button
                  onClick={() => handleSort('progress')}
                  className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors mx-auto"
                >
                  <span>Progress</span>
                  {getSortIcon('progress', sortOptions.field, sortOptions.direction)}
                </button>
              </th>
              
              <th className="px-6 py-3 text-center">
                <button
                  onClick={() => handleSort('accuracy')}
                  className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors mx-auto"
                >
                  <span>Accuracy</span>
                  {getSortIcon('accuracy', sortOptions.field, sortOptions.direction)}
                </button>
              </th>
              
              <th className="px-6 py-3 text-center">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Streak
                </span>
              </th>
              
              <th className="px-6 py-3 text-center">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </span>
              </th>
              
              <th className="px-6 py-3 text-center">
                <button
                  onClick={() => handleSort('lastActivity')}
                  className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors mx-auto"
                >
                  <span>Last Activity</span>
                  {getSortIcon('lastActivity', sortOptions.field, sortOptions.direction)}
                </button>
              </th>
              
              <th className="px-6 py-3 text-center">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student, index) => (
              <motion.tr
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => onStudentSelect(student.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative flex-shrink-0">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {getInitials(student.name)}
                          </span>
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${statusDots[student.status]} rounded-full border-2 border-white`} />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {student.name}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        Badge #{student.badgeNumber}
                      </p>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900">{student.department}</p>
                </td>
                
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-semibold text-gray-900">
                        {student.progress.overallCompletion}%
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${student.progress.overallCompletion}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 text-center">
                  <span className={`text-sm font-semibold ${
                    student.performance.overallAccuracy >= 90 ? 'text-green-600' :
                    student.performance.overallAccuracy >= 80 ? 'text-blue-600' :
                    student.performance.overallAccuracy >= 70 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {student.performance.overallAccuracy}%
                  </span>
                </td>
                
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-semibold text-gray-900">
                    {student.performance.streak}
                  </span>
                </td>
                
                <td className="px-6 py-4 text-center">
                  <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${statusColors[student.status]}`}>
                    {student.status === 'at-risk' ? 'At Risk' : student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                  </div>
                </td>
                
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-gray-600">
                    {formatLastActivity(student.lastActivity)}
                  </span>
                </td>
                
                <td className="px-6 py-4 text-center">
                  <div className="relative">
                    <button
                      onClick={() => setActiveActionMenu(activeActionMenu === student.id ? null : student.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    
                    <AnimatePresence>
                      {activeActionMenu === student.id && (
                        <ActionMenu
                          student={student}
                          onViewProfile={onViewProfile}
                          onSendMessage={onSendMessage}
                          onAssignPractice={onAssignPractice}
                          onClose={() => setActiveActionMenu(null)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {students.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
          <p className="text-gray-600">No students match your current criteria.</p>
        </div>
      )}

      {/* Click outside to close action menus */}
      {activeActionMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveActionMenu(null)}
        />
      )}
    </div>
  )
}