'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStudentData } from '@/hooks/useStudentData'
import { StudentTable } from '@/components/instructor/StudentTable'
import { StudentFilter } from '@/components/instructor/StudentFilter'
import { StudentCard } from '@/components/instructor/StudentCard'
import { Student, StudentFilters, SortOptions, BulkActionResult } from '@/types/instructor'
import { toast } from 'react-hot-toast'

// Bulk action definitions
const BULK_ACTIONS = [
  { id: 'message', label: 'Send Message', icon: '✉️', color: 'blue' },
  { id: 'assign', label: 'Assign Practice', icon: '📝', color: 'green' },
  { id: 'updateStatus', label: 'Update Status', icon: '🔄', color: 'yellow' },
  { id: 'addTag', label: 'Add Tag', icon: '🏷️', color: 'purple' },
  { id: 'export', label: 'Export Data', icon: '📊', color: 'gray' },
]

// Export format options
const EXPORT_FORMATS = [
  { id: 'csv', label: 'CSV', icon: '📄' },
  { id: 'excel', label: 'Excel', icon: '📊' },
  { id: 'pdf', label: 'PDF', icon: '📋' },
]

interface BulkActionModalProps {
  isOpen: boolean
  onClose: () => void
  action: string
  selectedCount: number
  onExecute: (action: string, payload?: any) => Promise<void>
}

function BulkActionModal({ isOpen, onClose, action, selectedCount, onExecute }: BulkActionModalProps) {
  const [payload, setPayload] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleExecute = async () => {
    setIsLoading(true)
    try {
      await onExecute(action, payload)
      onClose()
      setPayload({})
    } catch (error) {
      console.error('Bulk action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderActionForm = () => {
    switch (action) {
      case 'message':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={payload.subject || ''}
                onChange={(e) => setPayload({ ...payload, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Message subject"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={payload.message || ''}
                onChange={(e) => setPayload({ ...payload, message: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your message to students..."
              />
            </div>
          </div>
        )

      case 'updateStatus':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status
            </label>
            <select
              value={payload.status || ''}
              onChange={(e) => setPayload({ ...payload, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select status...</option>
              <option value="active">Active</option>
              <option value="at-risk">At Risk</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        )

      case 'addTag':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag Name
            </label>
            <input
              type="text"
              value={payload.tag || ''}
              onChange={(e) => setPayload({ ...payload, tag: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tag name"
            />
          </div>
        )

      case 'export':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {EXPORT_FORMATS.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setPayload({ ...payload, format: format.id })}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    payload.format === format.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-lg mb-1">{format.icon}</div>
                  <div className="text-sm font-medium">{format.label}</div>
                </button>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {BULK_ACTIONS.find(a => a.id === action)?.label}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          This action will be applied to {selectedCount} selected student{selectedCount !== 1 ? 's' : ''}.
        </p>

        {renderActionForm()}

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExecute}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Execute'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function StudentsPage() {
  const {
    students,
    selectedStudents,
    filters,
    sortBy,
    view,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalStudents,
    filteredStudentCount,
    isAllSelected,
    isPartiallySelected,
    hasFiltersApplied,
    
    // Operations
    loadStudents,
    searchStudents,
    updateFilters,
    clearFilters,
    updateSort,
    setView,
    selectStudent,
    selectAllStudents,
    selectMultipleStudents,
    clearSelection,
    performBulkAction,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    clearError,
  } = useStudentData()

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [bulkActionModal, setBulkActionModal] = useState<{
    isOpen: boolean
    action: string
  }>({ isOpen: false, action: '' })

  // Load initial data
  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      searchStudents(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, searchStudents])

  // View actions
  const handleViewProfile = (studentId: string) => {
    // Navigation is handled by Link component
  }

  const handleSendMessage = (studentId: string) => {
    // Handle individual message
    selectMultipleStudents([studentId])
    setBulkActionModal({ isOpen: true, action: 'message' })
  }

  const handleAssignPractice = (studentId: string) => {
    // Handle individual assignment
    selectMultipleStudents([studentId])
    setBulkActionModal({ isOpen: true, action: 'assign' })
  }

  // Bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedStudents.length === 0) {
      toast.error('Please select students first')
      return
    }
    setBulkActionModal({ isOpen: true, action })
  }

  const executeBulkAction = async (action: string, payload?: any): Promise<void> => {
    try {
      const result: BulkActionResult = await performBulkAction(action, payload)
      
      if (result.success) {
        toast.success(`Action completed successfully for ${result.successCount} students`)
        if (result.failureCount > 0) {
          toast.error(`Failed for ${result.failureCount} students`)
        }
        clearSelection()
      } else {
        toast.error('Bulk action failed')
      }
    } catch (error) {
      toast.error('Failed to execute bulk action')
    }
  }

  // Pagination info
  const startIndex = (currentPage - 1) * 20 + 1
  const endIndex = Math.min(currentPage * 20, totalStudents)

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Students</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              clearError()
              loadStudents()
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
              <p className="text-gray-600 mt-1">
                Manage and monitor student progress across all training modules
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-3">
              <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'list'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setView('grid')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'grid'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search students by name, badge number, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters || hasFiltersApplied
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
                <span>Filters</span>
                {hasFiltersApplied && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </button>

              {/* Clear Filters */}
              {hasFiltersApplied && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex-shrink-0"
              >
                <StudentFilter
                  filters={filters}
                  onFiltersChange={updateFilters}
                  onClearFilters={clearFilters}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Selection and Bulk Actions Bar */}
            <AnimatePresence>
              {selectedStudents.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-blue-700">
                        {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                      </span>
                      <button
                        onClick={clearSelection}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                      >
                        Clear selection
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      {BULK_ACTIONS.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleBulkAction(action.id)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            action.color === 'blue' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                            action.color === 'green' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                            action.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                            action.color === 'purple' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                            'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span className="mr-1">{action.icon}</span>
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                Showing {startIndex}-{endIndex} of {totalStudents} students
                {filteredStudentCount !== totalStudents && (
                  <span className="ml-1">
                    ({filteredStudentCount} filtered)
                  </span>
                )}
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={`${sortBy.field}-${sortBy.direction}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-')
                    updateSort(field as 'name' | 'progress' | 'accuracy' | 'lastActivity' | 'enrollmentDate', direction as 'asc' | 'desc')
                  }}
                  className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="progress-desc">Progress (High-Low)</option>
                  <option value="progress-asc">Progress (Low-High)</option>
                  <option value="accuracy-desc">Accuracy (High-Low)</option>
                  <option value="accuracy-asc">Accuracy (Low-High)</option>
                  <option value="lastActivity-desc">Recent Activity</option>
                  <option value="enrollmentDate-desc">Recently Enrolled</option>
                </select>
              </div>
            </div>

            {/* Student List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                <p className="text-gray-600 mb-4">
                  {hasFiltersApplied
                    ? 'No students match your current filters. Try adjusting your search criteria.'
                    : 'No students have been enrolled yet.'}
                </p>
                {hasFiltersApplied && (
                  <button
                    onClick={clearFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : view === 'list' ? (
              <StudentTable
                students={students}
                selectedStudents={selectedStudents.map(s => s.id)}
                onStudentSelect={selectStudent}
                onBulkSelect={selectMultipleStudents}
                onSelectAll={selectAllStudents}
                isAllSelected={isAllSelected}
                isPartiallySelected={isPartiallySelected}
                sortOptions={sortBy}
                onSort={(field: string, direction?: 'asc' | 'desc') => 
                  updateSort(field as 'name' | 'progress' | 'accuracy' | 'lastActivity' | 'enrollmentDate', direction)
                }
                onViewProfile={handleViewProfile}
                onSendMessage={handleSendMessage}
                onAssignPractice={handleAssignPractice}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {students.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    onViewProfile={handleViewProfile}
                    onSendMessage={handleSendMessage}
                    onAssignPractice={handleAssignPractice}
                    onToggleSelect={selectStudent}
                    isSelected={selectedStudents.some(s => s.id === student.id)}
                    compact={false}
                    showQuickActions={true}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + Math.max(1, currentPage - 2)
                    if (pageNum > totalPages) return null
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          pageNum === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Modal */}
      <BulkActionModal
        isOpen={bulkActionModal.isOpen}
        onClose={() => setBulkActionModal({ isOpen: false, action: '' })}
        action={bulkActionModal.action}
        selectedCount={selectedStudents.length}
        onExecute={executeBulkAction}
      />
    </div>
  )
}